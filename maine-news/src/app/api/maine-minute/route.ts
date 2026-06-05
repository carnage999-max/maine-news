import { NextResponse } from 'next/server';
import { buildMaineMinuteReport } from '@/lib/maineMinuteReport';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || undefined;
        const report = await buildMaineMinuteReport(date);
        return NextResponse.json(report);
    } catch (error) {
        console.error('Failed to build Maine Minute report:', error);
        return NextResponse.json({ error: 'Failed to build Maine Minute report' }, { status: 500 });
    }
}
