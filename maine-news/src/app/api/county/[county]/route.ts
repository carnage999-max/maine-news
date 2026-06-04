import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { getCountyBySlug, matchesCounty } from '@/lib/maineCounties';
import { stripContent } from '@/lib/maineMinute';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

type Params = {
    params: Promise<{ county: string }>;
};

export async function GET(_request: Request, { params }: Params) {
    const { county } = await params;
    const countyConfig = getCountyBySlug(county);

    if (!countyConfig) {
        return NextResponse.json({ error: 'County not found' }, { status: 404 });
    }

    try {
        const authoredPosts = await db.query.posts.findMany({
            orderBy: [desc(posts.publishedDate)],
            columns: {
                id: true,
                title: true,
                slug: true,
                image: true,
                category: true,
                isNational: true,
                publishedDate: true,
                author: true,
                content: true,
                sourceUrl: true,
            },
            limit: 180,
        });

        const localPosts = authoredPosts
            .filter((post) => !post.isNational)
            .filter((post) => {
                const haystack = `${post.title}\n${stripContent(post.content)}\n${post.sourceUrl || ''}`;
                return matchesCounty(haystack, countyConfig);
            })
            .map((post) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                image: post.image || undefined,
                category: post.category,
                isNational: post.isNational,
                publishedDate: post.publishedDate.toISOString(),
                author: post.author,
            }));

        return NextResponse.json({
            county: {
                slug: countyConfig.slug,
                name: countyConfig.name,
            },
            posts: localPosts,
        });
    } catch (error) {
        console.error('Failed to fetch county posts:', error);
        return NextResponse.json({ error: 'Failed to fetch county posts' }, { status: 500 });
    }
}
