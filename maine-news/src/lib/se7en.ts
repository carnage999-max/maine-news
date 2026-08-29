const SE7EN_AI_BASE_URL = 'https://ai.se7eninc.com';
const PROJECT_ID = 'maine-news';
const TASK_VERSION = 'summary-v1';

interface Se7enJobResponse {
    job_id: string;
    status: 'queued' | 'running' | 'complete' | 'failed';
    status_url: string;
    response?: string;
    error?: string;
}

type EnqueueOutcome =
    | { ok: true; job: Se7enJobResponse }
    | { ok: false; configError: true; reason: string }
    | { ok: false; configError: false; reason: string };

async function fetchWithRetry(url: string, init: RequestInit, retries = 3): Promise<Response | null> {
    let attempt = 0;
    while (true) {
        try {
            const res = await fetch(url, init);
            if (res.ok || res.status === 202) return res;

            const shouldRetry = [429, 500, 502].includes(res.status);
            attempt++;
            if (!shouldRetry || attempt > retries) return res;
        } catch (error) {
            attempt++;
            if (attempt > retries) {
                console.error(`[SE7EN] Request failed after ${retries} retries:`, error);
                return null;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
    }
}

async function enqueueSummary(postId: string, postUpdatedAt: string, body: string): Promise<EnqueueOutcome> {
    const apiKey = process.env.SE7EN_AI_API_KEY;
    if (!apiKey) {
        return { ok: false, configError: true, reason: 'SE7EN_AI_API_KEY is not set' };
    }

    const idempotencyKey = `${PROJECT_ID}:${postId}:${postUpdatedAt}:${TASK_VERSION}`;

    const res = await fetchWithRetry(`${SE7EN_AI_BASE_URL}/api/infer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({
            async: true,
            model: 'phi3:mini',
            idempotency_key: idempotencyKey,
            prompt:
                'You are a news writer for Maine News Now. Below is a wire story from another outlet. ' +
                'First, identify the underlying facts: who, what, when, where, why, and any direct quotes worth keeping. ' +
                'Then, using only those facts (not the source article\'s wording or structure), write a full-length, ' +
                'original, unbiased news article covering the story in your own words and organization. ' +
                'Do not follow the source\'s paragraph order or phrasing. Write it to be genuinely enjoyable to read, ' +
                'at a length appropriate to the story (do not artificially shorten it). ' +
                'Return only the finished article text, no preamble.\n\n' +
                `SOURCE STORY:\n${body}`,
        }),
    });

    if (!res) {
        return { ok: false, configError: false, reason: 'Network error reaching se7en AI' };
    }

    if (res.status === 401 || res.status === 403) {
        return { ok: false, configError: true, reason: `se7en AI rejected the API key (HTTP ${res.status})` };
    }

    if (!res.ok && res.status !== 202) {
        return { ok: false, configError: false, reason: `Enqueue failed with HTTP ${res.status}` };
    }

    return { ok: true, job: await res.json() };
}

async function pollSummaryJob(statusUrl: string, timeoutMs = 60_000, intervalMs = 2000): Promise<Se7enJobResponse | null> {
    const apiKey = process.env.SE7EN_AI_API_KEY;
    if (!apiKey) return null;

    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const res = await fetchWithRetry(statusUrl, {
            headers: { 'x-api-key': apiKey },
        });

        if (res?.ok) {
            const job: Se7enJobResponse = await res.json();
            if (job.status === 'complete' || job.status === 'failed') {
                return job;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    console.error(`[SE7EN] Poll timed out for ${statusUrl}`);
    return null;
}

export interface SummarizeInput {
    id: string;
    updatedAt: string;
    body: string;
}

export interface SummarizeResult {
    id: string;
    summary: string | null;
}

export interface SummarizeBatchResult {
    results: SummarizeResult[];
    /** Set when a config/auth-level problem was detected (e.g. missing or invalid API key) — worth alerting a human, not just logging. */
    systemicError: string | null;
}

export async function summarizePosts(items: SummarizeInput[], concurrency = 3): Promise<SummarizeBatchResult> {
    const results: SummarizeResult[] = [];
    let cursor = 0;
    let systemicError: string | null = null;

    async function worker() {
        while (cursor < items.length && !systemicError) {
            const item = items[cursor++];

            const enqueued = await enqueueSummary(item.id, item.updatedAt, item.body);
            if (!enqueued.ok) {
                if (enqueued.configError) {
                    systemicError = enqueued.reason;
                    return; // stop this worker; no point burning through the rest of the batch on a broken key
                }
                console.error(`[SE7EN] Enqueue failed for post ${item.id}: ${enqueued.reason}`);
                results.push({ id: item.id, summary: null });
                continue;
            }

            let job = enqueued.job;
            if (job.status !== 'complete') {
                const polled = await pollSummaryJob(job.status_url);
                if (!polled || polled.status !== 'complete') {
                    console.error(`[SE7EN] Summary failed or timed out for post ${item.id}`);
                    results.push({ id: item.id, summary: null });
                    continue;
                }
                job = polled;
            }

            results.push({ id: item.id, summary: job.response?.trim() || null });
        }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    return { results, systemicError };
}
