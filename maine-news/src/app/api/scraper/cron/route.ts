import { NextResponse } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { runScraper } from '../route';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { enqueuePendingSummaries } from '@/lib/se7en';
import { alertDeveloper } from '@/lib/alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function enqueueUnsummarizedPosts() {
    const pending = await db
        .select({ id: posts.id, content: posts.content, createdAt: posts.createdAt })
        .from(posts)
        .where(and(eq(posts.isOriginal, false), isNull(posts.summary), isNull(posts.summaryJobId)))
        .limit(100);

    if (pending.length === 0) {
        return { attempted: 0, enqueued: 0, systemicError: null as string | null };
    }

    const { results, systemicError } = await enqueuePendingSummaries(
        pending.map((post) => ({
            id: post.id,
            updatedAt: post.createdAt.toISOString(),
            body: post.content,
        })),
        3
    );

    let enqueued = 0;
    for (const result of results) {
        if (!result.jobId) continue;
        await db.update(posts).set({ summaryJobId: result.jobId }).where(eq(posts.id, result.id));
        enqueued++;
    }

    if (systemicError) {
        await alertDeveloper(
            'se7en AI summarization is broken',
            `The cron's AI enqueue pass hit a config/auth-level error and aborted early:\n\n${systemicError}\n\nAttempted: ${pending.length}, enqueued before stopping: ${enqueued}.`
        );
    }

    return { attempted: pending.length, enqueued, systemicError };
}

// This endpoint is called by a Coolify scheduled task
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const authKey = searchParams.get('key');
    const authHeader = request.headers.get('authorization');

    // Allow Vercel CRON_SECRET or manual SCRAPER_API_KEY
    const isAuthorized =
        (authHeader === `Bearer ${process.env.CRON_SECRET}`) ||
        (authKey === process.env.SCRAPER_API_KEY);

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        console.log(`[CRON] Starting direct scraper execution...`);

        // Execute scraper logic directly as a function
        // This avoids 401/Network errors associated with Vercel Deployment Protection
        const result = await runScraper({
            save: true,
            includeNational: true
        });

        console.log(`[CRON] Scraper finished: ${result.count} stories found, ${result.saved} saved`);

        console.log('[CRON] Enqueuing AI summary jobs...');
        let enqueueResult: Awaited<ReturnType<typeof enqueueUnsummarizedPosts>> | { error: string };
        try {
            enqueueResult = await enqueueUnsummarizedPosts();
            console.log(`[CRON] Enqueue finished: ${enqueueResult.enqueued}/${enqueueResult.attempted} posts enqueued`);
        } catch (error) {
            const details = error instanceof Error ? error.message : 'Unknown error';
            console.error('[CRON] Summary enqueue pass failed:', error);
            await alertDeveloper('se7en AI enqueue pass crashed', `The enqueue step threw an unhandled error:\n\n${details}`);
            enqueueResult = { error: details };
        }

        return NextResponse.json({
            source: 'direct_execution',
            ...result,
            summaryEnqueue: enqueueResult,
        });

    } catch (error) {
        console.error('[CRON] Direct Scraper execution failed:', error);
        return NextResponse.json({
            error: 'Cron execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
