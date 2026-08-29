import { NextResponse } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { runScraper } from '../route';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { summarizePosts } from '@/lib/se7en';
import { alertDeveloper } from '@/lib/alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function summarizeUnsummarizedPosts() {
    const pending = await db
        .select({ id: posts.id, content: posts.content, createdAt: posts.createdAt })
        .from(posts)
        .where(and(eq(posts.isOriginal, false), isNull(posts.summary)))
        .limit(100);

    if (pending.length === 0) {
        return { attempted: 0, summarized: 0, systemicError: null as string | null };
    }

    const { results, systemicError } = await summarizePosts(
        pending.map((post) => ({
            id: post.id,
            updatedAt: post.createdAt.toISOString(),
            body: post.content,
        })),
        3
    );

    let summarized = 0;
    for (const result of results) {
        if (!result.summary) continue;
        await db.update(posts).set({ summary: result.summary }).where(eq(posts.id, result.id));
        summarized++;
    }

    if (systemicError) {
        await alertDeveloper(
            'se7en AI summarization is broken',
            `The cron's AI summarization pass hit a config/auth-level error and aborted early:\n\n${systemicError}\n\nAttempted: ${pending.length}, summarized before stopping: ${summarized}.`
        );
    }

    return { attempted: pending.length, summarized, systemicError };
}

// This endpoint is called by Vercel Cron daily
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

        console.log('[CRON] Starting AI summarization pass...');
        let summaryResult: Awaited<ReturnType<typeof summarizeUnsummarizedPosts>> | { error: string };
        try {
            summaryResult = await summarizeUnsummarizedPosts();
            console.log(`[CRON] Summarization finished: ${summaryResult.summarized}/${summaryResult.attempted} posts summarized`);
        } catch (error) {
            const details = error instanceof Error ? error.message : 'Unknown error';
            console.error('[CRON] Summarization pass failed:', error);
            await alertDeveloper('se7en AI summarization pass crashed', `The summarization step threw an unhandled error:\n\n${details}`);
            summaryResult = { error: details };
        }

        return NextResponse.json({
            source: 'direct_execution',
            ...result,
            summarization: summaryResult,
        });

    } catch (error) {
        console.error('[CRON] Direct Scraper execution failed:', error);
        return NextResponse.json({
            error: 'Cron execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
