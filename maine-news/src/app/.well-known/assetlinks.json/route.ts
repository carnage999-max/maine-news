import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getStatements() {
    const raw = process.env.ANDROID_ASSETLINKS_JSON;
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (error) {
            console.error('Invalid ANDROID_ASSETLINKS_JSON:', error);
        }
    }

    return [
        {
            relation: ['delegate_permission/common.handle_all_urls'],
            target: {
                namespace: 'android_app',
                package_name: 'com.mainenewstoday.app',
                sha256_cert_fingerprints: ['8A:E9:CD:54:97:B5:A2:DA:EB:B5:2B:33:FA:70:A6:2E:48:A6:A6:98:10:F1:CD:4D:AD:4F:F5:BF:78:0C:6F:DB'],
            },
        },
    ];
}

export async function GET() {
    return NextResponse.json(getStatements(), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
