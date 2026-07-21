import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const contentTypeExtensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'application/pdf': '.pdf',
};

function getMediaRoot() {
    return process.env.MEDIA_ROOT || path.join(process.cwd(), 'public', 'media');
}

function getMediaUrl() {
    const mediaUrl = process.env.MEDIA_URL || '/media/';
    return mediaUrl.endsWith('/') ? mediaUrl : `${mediaUrl}/`;
}

function sanitizeSegment(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function sanitizeFolder(folder: string) {
    const segments = folder
        .split(/[\\/]+/)
        .map(sanitizeSegment)
        .filter(Boolean);

    return segments.length > 0 ? segments.join('/') : 'submissions';
}

function getExtension(_fileName: string, contentType: string) {
    const normalizedContentType = contentType.toLowerCase().split(';')[0].trim();
    return contentTypeExtensions[normalizedContentType] || '.bin';
}

export async function uploadToLocalMedia(file: Buffer, fileName: string, contentType: string, folder = 'submissions') {
    const safeFolder = sanitizeFolder(folder);
    const extension = getExtension(fileName, contentType);
    const storedName = `${Date.now()}-${randomUUID()}${extension}`;
    const mediaRoot = getMediaRoot();
    const destinationDir = path.join(mediaRoot, safeFolder);

    await mkdir(destinationDir, { recursive: true });
    await writeFile(path.join(destinationDir, storedName), file);

    return `${getMediaUrl()}${safeFolder}/${storedName}`;
}
