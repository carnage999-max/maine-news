import { NextResponse } from 'next/server';

export const revalidate = 300;

export async function GET() {
    const apiKey = process.env.TOMTOM_API_KEY;

    if (!apiKey) {
        return new NextResponse('TomTom API key is not configured.', { status: 503 });
    }

    const width = 1600;
    const height = 980;

    const mapUrl = new URL('https://api.tomtom.com/map/1/staticimage');
    mapUrl.searchParams.set('key', apiKey);
    mapUrl.searchParams.set('center', '-68.97,45.25');
    mapUrl.searchParams.set('zoom', '6');
    mapUrl.searchParams.set('width', String(width));
    mapUrl.searchParams.set('height', String(height));
    mapUrl.searchParams.set('format', 'png');
    mapUrl.searchParams.set('layer', 'basic');
    mapUrl.searchParams.set('style', 'main');
    mapUrl.searchParams.set('language', 'en-US');
    mapUrl.searchParams.set('view', 'Unified');

    const response = await fetch(mapUrl.toString(), {
        next: { revalidate },
    });

    if (!response.ok) {
        return new NextResponse('Unable to load traffic map.', { status: 502 });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': response.headers.get('content-type') || 'image/png',
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
    });
}
