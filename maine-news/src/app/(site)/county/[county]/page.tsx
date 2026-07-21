import Link from 'next/link';
import { notFound } from 'next/navigation';
import { desc } from 'drizzle-orm';
import StoryCard from '@/components/ui/StoryCard';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { getCountyBySlug, MAINE_COUNTIES, matchesCounty } from '@/lib/maineCounties';
import { stripContent } from '@/lib/maineMinute';
import styles from '@/components/county/CountyFeed.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function generateMetadata(
    { params }: { params: Promise<{ county: string }> }
) {
    const { county } = await params;
    const countyConfig = getCountyBySlug(county);

    if (!countyConfig) {
        return {
            title: 'County News | Maine News Now',
        };
    }

    return {
        title: `${countyConfig.name} County News | Maine News Now`,
        description: `Latest local news and updates for ${countyConfig.name} County, Maine.`,
    };
}

export default async function CountyPage(
    { params }: { params: Promise<{ county: string }> }
) {
    const { county } = await params;
    const countyConfig = getCountyBySlug(county);

    if (!countyConfig) {
        notFound();
    }

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
        }));

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>Local county news</span>
                    <h1>{countyConfig.name} County</h1>
                </div>
                <p>
                    Latest stories matched to {countyConfig.name} County and nearby communities. Use the county lineup to jump to a different local area.
                </p>
                <div className={styles.countyNav}>
                    {MAINE_COUNTIES.map((item) => (
                        <Link
                            key={item.slug}
                            href={`/county/${item.slug}`}
                            className={`${styles.countyChip} ${item.slug === countyConfig.slug ? styles.countyChipActive : ''}`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </header>

            <div className={styles.grid}>
                {localPosts.length ? (
                    localPosts.map((post) => (
                        <StoryCard
                            key={post.id}
                            title={post.title}
                            image={post.image}
                            slug={post.slug}
                            category={post.category}
                            isNational={post.isNational}
                            publishedDate={post.publishedDate}
                        />
                    ))
                ) : (
                    <div className={styles.empty}>
                        No recent stories matched to {countyConfig.name} County yet.
                    </div>
                )}
            </div>
        </main>
    );
}
