const SE7EN_AI_BASE_URL = process.env.SE7EN_AI_URL || 'https://ai.se7eninc.com';
const PROJECT_ID = 'maine-news';
const TASK_VERSION = 'summary-v1';

interface Se7enEnqueueResponse {
    job_id: string;
    status: 'queued' | 'running' | 'complete' | 'failed';
    status_url: string;
    response?: string;
}

interface Se7enJobStatus {
    job_id: string;
    status: 'queued' | 'running' | 'streaming' | 'complete' | 'failed';
    response?: string;
    error?: string;
}

type ConfigurableOutcome<T> =
    | { ok: true; data: T }
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

function missingApiKeyError(): { reason: string } | null {
    const apiKey = process.env.SE7EN_AI_API_KEY;
    if (!apiKey) {
        return { reason: 'SE7EN_AI_API_KEY is not set' };
    }
    return null;
}

async function enqueueSummary(postId: string, postUpdatedAt: string, body: string): Promise<ConfigurableOutcome<Se7enEnqueueResponse>> {
    const missingKey = missingApiKeyError();
    if (missingKey) return { ok: false, configError: true, reason: missingKey.reason };
    const apiKey = process.env.SE7EN_AI_API_KEY!;

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

    return { ok: true, data: await res.json() };
}

export interface PendingSummaryInput {
    id: string;
    updatedAt: string;
    body: string;
}

export interface EnqueueResult {
    id: string;
    jobId: string | null;
}

export interface EnqueueBatchResult {
    results: EnqueueResult[];
    /** Set when a config/auth-level problem was detected (e.g. missing or invalid API key) — worth alerting a human, not just logging. */
    systemicError: string | null;
}

/**
 * Enqueues a summary job per post and records the job id — does NOT wait for completion.
 * A separate lightweight poller checks on outstanding jobs later, so this stays fast
 * regardless of how long the se7en AI worker takes to actually run inference.
 */
export async function enqueuePendingSummaries(items: PendingSummaryInput[], concurrency = 3): Promise<EnqueueBatchResult> {
    const results: EnqueueResult[] = [];
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
                results.push({ id: item.id, jobId: null });
                continue;
            }

            results.push({ id: item.id, jobId: enqueued.data.job_id });
        }
    }

    await Promise.all(Array.from({ length: concurrency }, () => worker()));
    return { results, systemicError };
}

export interface JobCheckResult {
    jobs: Se7enJobStatus[];
    missingJobIds: string[];
    systemicError: string | null;
}

/** Batch-checks up to 100 job ids at once via se7en AI's /api/infer/jobs?ids=... endpoint. */
export async function checkSummaryJobs(jobIds: string[]): Promise<JobCheckResult> {
    if (jobIds.length === 0) {
        return { jobs: [], missingJobIds: [], systemicError: null };
    }

    const missingKey = missingApiKeyError();
    if (missingKey) {
        return { jobs: [], missingJobIds: [], systemicError: missingKey.reason };
    }
    const apiKey = process.env.SE7EN_AI_API_KEY!;

    const res = await fetchWithRetry(`${SE7EN_AI_BASE_URL}/api/infer/jobs?ids=${jobIds.join(',')}`, {
        headers: { 'x-api-key': apiKey },
    });

    if (!res) {
        return { jobs: [], missingJobIds: [], systemicError: 'Network error reaching se7en AI' };
    }

    if (res.status === 401 || res.status === 403) {
        return { jobs: [], missingJobIds: [], systemicError: `se7en AI rejected the API key (HTTP ${res.status})` };
    }

    if (!res.ok) {
        console.error(`[SE7EN] Job status check failed with HTTP ${res.status}`);
        return { jobs: [], missingJobIds: [], systemicError: null };
    }

    const data: { jobs: Se7enJobStatus[]; missing_job_ids: string[] } = await res.json();
    return { jobs: data.jobs, missingJobIds: data.missing_job_ids, systemicError: null };
}
