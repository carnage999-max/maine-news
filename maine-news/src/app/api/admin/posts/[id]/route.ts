import { and, eq, ne } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { posts } from '@/db/schema';

export const dynamic = 'force-dynamic';

function getHeadlineSettings(isHeadlineValue: unknown, headlineUntilValue: unknown) {
    const isHeadline = isHeadlineValue === true || isHeadlineValue === 'true';
    const rawHeadlineUntil = typeof headlineUntilValue === 'string' ? headlineUntilValue : '';

    if (!isHeadline) {
        return { isHeadline: false, headlineUntil: null };
    }

    const headlineUntil = new Date(rawHeadlineUntil);
    if (!rawHeadlineUntil || Number.isNaN(headlineUntil.getTime()) || headlineUntil <= new Date()) {
        throw new Error('Choose a future expiry time for the homepage headline.');
    }

    return { isHeadline: true, headlineUntil };
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const post = await db.query.posts.findFirst({
            where: eq(posts.id, id),
        });

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Failed to fetch post:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        await db.delete(posts).where(eq(posts.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete post:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const body = await request.json();

        const headlineSettings = getHeadlineSettings(body.isHeadline, body.headlineUntil);

        if (headlineSettings.isHeadline) {
            await db.update(posts)
                .set({ isHeadline: false, headlineUntil: null })
                .where(and(eq(posts.isHeadline, true), ne(posts.id, id)));
        }

        const updateData = {
            title: body.title,
            slug: body.slug,
            author: body.author || 'Staff',
            category: body.category || 'local',
            content: body.content,
            image: body.image ?? null,
            publishedDate: body.publishedDate ? new Date(body.publishedDate) : undefined,
            ...headlineSettings,
        };

        const updatedPost = await db.update(posts)
            .set(updateData)
            .where(eq(posts.id, id))
            .returning();

        return NextResponse.json(updatedPost[0]);
    } catch (error) {
        console.error('Failed to update post:', error);
        const message = error instanceof Error ? error.message : 'Failed to update post';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
