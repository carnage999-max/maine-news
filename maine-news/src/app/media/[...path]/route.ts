import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getMediaRoot } from '@/lib/mediaStorage';

const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf',
};

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: segments } = await params;

    if (!segments?.length || segments.some((segment) => segment === '..' || segment === '.')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    const mediaRoot = path.resolve(getMediaRoot());
    const filePath = path.resolve(mediaRoot, ...segments);

    if (!filePath.startsWith(mediaRoot + path.sep) && filePath !== mediaRoot) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    try {
        const fileStat = await stat(filePath);
        if (!fileStat.isFile()) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const buffer = await readFile(filePath);
        const extension = path.extname(filePath).toLowerCase();
        const contentType = contentTypes[extension] || 'application/octet-stream';

        return new NextResponse(new Uint8Array(buffer), {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
