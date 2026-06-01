import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const author = await db.query.authors.findFirst({
            where: eq(authors.id, id),
        });

        if (!author) {
            return NextResponse.json({ error: 'Author not found' }, { status: 404 });
        }

        return NextResponse.json(author);
    } catch (error) {
        console.error('Failed to fetch author:', error);
        return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const formData = await request.formData();
        const name = String(formData.get('name') || '').trim();
        const role = String(formData.get('role') || 'Reporter').trim();
        const bio = String(formData.get('bio') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const contactInfo = String(formData.get('contactInfo') || '').trim();
        const existingAvatar = String(formData.get('existingAvatar') || '').trim();
        const removeAvatar = String(formData.get('removeAvatar') || '') === 'true';
        const imageFile = formData.get('image') as File | null;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        let avatar = removeAvatar ? null : (existingAvatar || null);
        if (imageFile && imageFile.size > 0) {
            avatar = await fileToDataUrl(imageFile);
        }

        const [updatedAuthor] = await db.update(authors)
            .set({
                name,
                role: role || 'Reporter',
                avatar,
                bio: bio || null,
                email: email || null,
                contactInfo: contactInfo || null,
            })
            .where(eq(authors.id, id))
            .returning();

        return NextResponse.json(updatedAuthor);
    } catch (error) {
        console.error('Failed to update author:', error);
        const message = error instanceof Error ? error.message : 'Failed to update author';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        await db.delete(authors).where(eq(authors.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete author:', error);
        return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
    }
}
