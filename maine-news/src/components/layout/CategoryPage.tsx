import Link from 'next/link';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import StoryCard from '@/components/ui/StoryCard';
import styles from './CategoryPage.module.css';

const RELATED_CATEGORIES = [
  { label: 'Maine News', href: '/maine-news' },
  { label: 'Weather', href: '/maine-weather' },
  { label: 'Politics', href: '/maine-politics' },
  { label: 'Crime', href: '/maine-crime' },
  { label: 'Sports', href: '/maine-sports' },
  { label: 'Business', href: '/maine-business' },
  { label: 'Opinion', href: '/maine-opinion' },
];

interface CategoryPageProps {
  categoryKey: string;
  h1: string;
  intro: string;
}

export default async function CategoryPage({ categoryKey, h1, intro }: CategoryPageProps) {
    let posts: any[] = [];
    try {
        const authoredPosts = await db.query.posts.findMany({
            where: eq(dbPosts.category, categoryKey),
            orderBy: [desc(dbPosts.publishedDate)],
            columns: {
                title: true,
                slug: true,
                image: true,
                category: true,
                isNational: true,
                publishedDate: true,
            }
        });

        posts = authoredPosts.map(post => ({
            title: post.title,
            slug: post.slug,
            image: post.image || undefined,
            category: post.category,
            isNational: post.isNational || false,
            publishedDate: post.publishedDate.toISOString(),
        }));
    } catch (error) {
        console.error(`Failed to fetch posts for category ${categoryKey}:`, error);
    }

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{h1}</h1>
                <p className={styles.intro}>{intro}</p>
            </header>

            {/* Related Categories Navigation */}
            <div className={styles.navRow}>
                <span className={styles.navLabel}>Explore Sections:</span>
                <div className={styles.navLinks}>
                    {RELATED_CATEGORIES.map(cat => (
                        <Link key={cat.href} href={cat.href} className={styles.navLink}>
                            {cat.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Grid of posts */}
            <div className={styles.grid}>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <StoryCard
                            key={post.slug}
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
                        <p>No stories published in this category yet.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
