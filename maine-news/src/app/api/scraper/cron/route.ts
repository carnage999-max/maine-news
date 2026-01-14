import { NextResponse } from 'next/server';

// This endpoint is called by Vercel Cron daily
export async function GET(request: Request) {
    // Verify this is a Vercel Cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Call the main scraper endpoint with save=true
        const scraperUrl = new URL('/api/scraper', request.url);
        scraperUrl.searchParams.set('key', process.env.SCRAPER_API_KEY || '');
        scraperUrl.searchParams.set('save', 'true');

        const response = await fetch(scraperUrl.toString());
        const data = await response.json();

        console.log(`[CRON] Scraper ran: ${data.count} stories found, ${data.saved} saved`);

        return NextResponse.json({
            success: true,
            message: 'Scraper executed successfully',
            ...data
        });

    } catch (error) {
        console.error('[CRON] Scraper failed:', error);
        return NextResponse.json({
            error: 'Cron execution failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
