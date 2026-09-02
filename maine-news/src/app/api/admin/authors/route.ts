import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { authors } from '@/db/schema';
import { auth } from '@/auth';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

async function fileToDataUrl(file: File) {
    if (!file.type.startsWith('image/')) {
        throw new Error('Only image uploads are allowed');
    }

    if (file.size > MAX_IMAGE_SIZE) {
        throw new Error('Image must be 2MB or smaller');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const allAuthors = await db.query.authors.findMany({
            orderBy: [desc(authors.createdAt)],
        });

        return NextResponse.json(allAuthors);
    } catch (error) {
        console.error('Failed to fetch authors:', error);
        return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const name = String(formData.get('name') || '').trim();
        const role = String(formData.get('role') || 'Reporter').trim();
        const bio = String(formData.get('bio') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const contactInfo = String(formData.get('contactInfo') || '').trim();
        const moreInfoUrl = String(formData.get('moreInfoUrl') || '').trim();
        const imageFile = formData.get('image') as File | null;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        let avatar: string | null = null;
        if (imageFile && imageFile.size > 0) {
            avatar = await fileToDataUrl(imageFile);
        }

        const [newAuthor] = await db.insert(authors).values({
            name,
            role: role || 'Reporter',
            avatar,
            bio: bio || null,
            email: email || null,
            contactInfo: contactInfo || null,
            moreInfoUrl: moreInfoUrl || null,
        }).returning();

        return NextResponse.json(newAuthor);
    } catch (error) {
        console.error('Failed to create author:', error);
        const message = error instanceof Error ? error.message : 'Failed to create author';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
