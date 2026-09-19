import { NextResponse } from 'next/server';
import Markdoc from '@markdoc/markdoc';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function looksLikeHtml(content: string) {
    return /<\/?[a-z][\s\S]*>/i.test(content);
}

// Mobile clients render content as plain HTML only (no Markdoc AST walker),
// so non-HTML (Markdoc/markdown-flavored) content is rendered to HTML here.
function toHtml(content: string) {
    if (looksLikeHtml(content)) return content;
    const ast = Markdoc.parse(content);
    const transformed = Markdoc.transform(ast);
    return Markdoc.renderers.html(transformed);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Priority: Database
            const dbPost = await db.query.posts.findFirst({
                where: (posts, { eq }) => eq(posts.slug, slug),
            });

            if (dbPost) {
                const displayContent = !dbPost.isOriginal && dbPost.summary ? dbPost.summary : dbPost.content;
                return NextResponse.json({
                    ...dbPost,
                    content: toHtml(displayContent),
                    publishedDate: dbPost.publishedDate.toISOString(),
                    createdAt: dbPost.createdAt.toISOString(),
                });
            }

            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Fetch all for list/search
        const authoredPosts = await db.query.posts.findMany({
            orderBy: [desc(dbPosts.publishedDate)],
            columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
                category: true,
                isNational: true,
                publishedDate: true,
                author: true,
                isOriginal: true,
            }
        });

        const formattedPosts = authoredPosts.map(post => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            image: post.image || undefined,
            category: post.category,
            isNational: post.isNational || false,
            publishedDate: post.publishedDate.toISOString(),
            author: post.author,
            isOriginal: post.isOriginal
        }));

        return NextResponse.json({ posts: formattedPosts });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}
