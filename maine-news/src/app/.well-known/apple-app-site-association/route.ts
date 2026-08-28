import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getAppIDs() {
    const raw = process.env.APPLE_APP_SITE_ASSOCIATION_APP_IDS;
    if (raw) {
        return raw.split(',').map((value) => value.trim()).filter(Boolean);
    }

    return ['X666JJUSW5.com.themainenewsnow.ios'];
}

export async function GET() {
    const body = {
        applinks: {
            apps: [],
            details: [
                {
                    appIDs: getAppIDs(),
                    components: [
                        { '/': '/article/*' },
                        { '/': '/category/*' },
                        { '/': '/county/*' },
                        { '/': '/the-maine-minute' },
                        { '/': '/weather' },
                        { '/': '/traffic' },
                        { '/': '/search' },
                    ],
                },
            ],
        },
    };

    return NextResponse.json(body, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
