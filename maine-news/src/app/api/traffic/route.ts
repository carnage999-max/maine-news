import { NextResponse } from 'next/server';
import { getTrafficReport } from '@/lib/traffic';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const report = await getTrafficReport(60);
        return NextResponse.json(report);
    } catch (error) {
        console.error('Failed to fetch traffic report:', error);
        return NextResponse.json({ error: 'Failed to fetch traffic report' }, { status: 500 });
    }
}
