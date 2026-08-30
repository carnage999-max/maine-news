import { NextResponse } from 'next/server';
import { and, eq, inArray, isNull, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { checkSummaryJobs } from '@/lib/se7en';
import { alertDeveloper } from '@/lib/alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Lightweight companion to the scraper cron: checks on summary jobs the scraper
// already enqueued, without blocking on how long se7en AI takes to actually run
// inference. Meant to be hit frequently (every 2-5 minutes) by a separate
// Coolify scheduled task.
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const authKey = searchParams.get('key');
    const authHeader = request.headers.get('authorization');

    const isAuthorized =
        (authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
        (authKey === process.env.SCRAPER_API_KEY);

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const pending = await db
            .select({ id: posts.id, summaryJobId: posts.summaryJobId })
            .from(posts)
            .where(and(isNull(posts.summary), isNotNull(posts.summaryJobId)))
            .limit(100);

        if (pending.length === 0) {
            return NextResponse.json({ checked: 0, completed: 0, failed: 0, stillPending: 0 });
        }

        const jobIds = pending.map((post) => post.summaryJobId!);
        const { jobs, missingJobIds, systemicError } = await checkSummaryJobs(jobIds);

        if (systemicError) {
            await alertDeveloper(
                'se7en AI summarization is broken',
                `The summary poll pass hit a config/auth-level error:\n\n${systemicError}`
            );
            return NextResponse.json({ error: systemicError }, { status: 502 });
        }

        const jobIdToPostId = new Map(pending.map((post) => [post.summaryJobId!, post.id]));

        let completed = 0;
        let failed = 0;

        for (const job of jobs) {
            const postId = jobIdToPostId.get(job.job_id);
            if (!postId) continue;

            if (job.status === 'complete') {
                await db.update(posts)
                    .set({ summary: job.response?.trim() || null, summaryJobId: null })
                    .where(eq(posts.id, postId));
                completed++;
            } else if (job.status === 'failed') {
                // Clear the job id so the next scraper cron pass re-enqueues it.
                await db.update(posts).set({ summaryJobId: null }).where(eq(posts.id, postId));
                console.error(`[SE7EN] Job ${job.job_id} failed for post ${postId}: ${job.error}`);
                failed++;
            }
            // queued/running/streaming: leave as-is, checked again next poll.
        }

        if (missingJobIds.length > 0) {
            const missingPostIds = missingJobIds
                .map((jobId) => jobIdToPostId.get(jobId))
                .filter((id): id is string => Boolean(id));

            if (missingPostIds.length > 0) {
                await db.update(posts).set({ summaryJobId: null }).where(inArray(posts.id, missingPostIds));
                failed += missingPostIds.length;
            }
        }

        const stillPending = pending.length - completed - failed;

        return NextResponse.json({ checked: pending.length, completed, failed, stillPending });
    } catch (error) {
        console.error('[SE7EN] Poll-summaries pass failed:', error);
        return NextResponse.json({
            error: 'Poll-summaries execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
