import Image from 'next/image';
import { notFound } from 'next/navigation';
import ArticleActions from '@/components/article/ArticleActions';
import TextResizer from '@/components/article/TextResizer';
import StoryCard from '@/components/ui/StoryCard';
import styles from './Article.module.css';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { EDITORIAL_DISCLAIMER_PARAGRAPHS } from '@/lib/editorialDisclaimer';
import { cache } from 'react';
import { Metadata } from 'next';

interface ArticlePageProps {
    params: Promise<{ slug: string }>;
}

export const revalidate = 300;

const getPostBySlug = cache(async (slug: string) => {
    return await db.query.posts.findFirst({
        where: eq(dbPosts.slug, slug),
    });
});

function getCleanDescription(htmlContent: string): string {
    if (!htmlContent) return '';
    // Strip HTML tags
    const cleanText = htmlContent.replace(/<[^>]*>/g, '');
    // Strip markdown indicators
    const cleanMd = cleanText.replace(/[*#_~`\[\]()\-+]/g, '');
    // Limit to 155 chars
    return cleanMd.slice(0, 155).trim() + (cleanMd.length > 155 ? '...' : '');
}

function formatCategoryName(category: string): string {
    if (!category) return 'Maine News';
    if (category.toLowerCase() === 'local') return 'Maine News';
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
    const { slug } = await params;

    let dbPost = null;
    try {
        dbPost = await getPostBySlug(slug);
    } catch (error) {
        console.error('Database connection failed in metadata generation:', error);
    }

    if (dbPost) {
        const cleanDesc = getCleanDescription(dbPost.content) || 
            `Read the latest news update from Maine News Now: ${dbPost.title}`;
        return {
            title: dbPost.title,
            description: cleanDesc,
            alternates: {
                canonical: `/article/${slug}`,
            },
            openGraph: {
                title: dbPost.title,
                description: cleanDesc,
                images: dbPost.image ? [dbPost.image] : ['https://www.mainenewsnow.com/og-image.jpg'],
                type: 'article',
                url: `https://www.mainenewsnow.com/article/${slug}`,
                authors: [dbPost.author],
                publishedTime: dbPost.publishedDate.toISOString(),
            },
            twitter: {
                card: 'summary_large_image',
                title: dbPost.title,
                description: cleanDesc,
                images: dbPost.image ? [dbPost.image] : ['https://www.mainenewsnow.com/og-image.jpg'],
            }
        };
    }

    return {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { slug } = await params;

    // 1. Try fetching from Database (with error handling)
    let dbPost = null;
    try {
        dbPost = await getPostBySlug(slug);
    } catch (error) {
        console.error('Database query failed, falling back to Keystatic:', error);
    }

    if (dbPost) {
        const isEditorial = dbPost.category === 'editorial';
        const cleanDesc = getCleanDescription(dbPost.content);
        
        // Structured Data NewsArticle schema
        const authorType = dbPost.author && dbPost.author.toLowerCase() !== 'staff' && dbPost.author.toLowerCase() !== 'maine news now' ? 'Person' : 'Organization';
        const articleSchema = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": dbPost.title,
          "description": cleanDesc || dbPost.title,
          "image": dbPost.image ? [dbPost.image] : ['https://www.mainenewsnow.com/og-image.jpg'],
          "datePublished": dbPost.publishedDate.toISOString(),
          "dateModified": dbPost.publishedDate.toISOString(),
          "author": {
            "@type": authorType,
            "name": dbPost.author
          },
          "publisher": {
            "@type": "NewsMediaOrganization",
            "name": "Maine News Now",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.mainenewsnow.com/logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://www.mainenewsnow.com/article/${slug}`
          }
        };

        // Fetch Related Stories (3 posts in same category, excluding current one)
        let relatedPosts: any[] = [];
        try {
            const dbRelated = await db.query.posts.findMany({
                where: and(
                    eq(dbPosts.category, dbPost.category),
                    ne(dbPosts.slug, slug)
                ),
                limit: 3,
                orderBy: [desc(dbPosts.publishedDate)],
            });
            relatedPosts = dbRelated.map(post => ({
                title: post.title,
                slug: post.slug,
                image: post.image || undefined,
                category: post.category,
                isNational: post.isNational || false,
                publishedDate: post.publishedDate.toISOString(),
            }));
        } catch (error) {
            console.error('Failed to query related stories:', error);
        }

        const formattedPubDate = new Date(dbPost.publishedDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        return (
            <article className={styles.articleContainer}>
                {/* Embed JSON-LD news article schema */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
                />

                <header className={styles.header}>
                    <h1 className={styles.headline}>{dbPost.title}</h1>
                    <div className={styles.metadata}>
                        <div className={styles.metadataItem}>
                            <strong>Published:</strong> <span className={styles.timestamp}>{formattedPubDate}</span>
                        </div>
                        <span className={styles.metadataDivider}>|</span>
                        <div className={styles.metadataItem}>
                            <strong>Updated:</strong> <span className={styles.timestamp}>{formattedPubDate}</span>
                        </div>
                        <span className={styles.metadataDivider}>|</span>
                        <div className={styles.metadataItem}>
                            <strong>Category:</strong> <span className={styles.timestamp}>{formatCategoryName(dbPost.category)}</span>
                        </div>
                        <span className={styles.metadataDivider}>|</span>
                        <div className={styles.metadataItem}>
                            <strong>Author/Source:</strong> <span className={styles.author}>{dbPost.author}</span>
                        </div>
                        {dbPost.sourceUrl && (
                            <>
                                <span className={styles.metadataDivider}>|</span>
                                <div className={styles.metadataItem}>
                                    <strong>Source:</strong> <a href={dbPost.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--color-accent)' }}>Original Article</a>
                                </div>
                            </>
                        )}
                    </div>
                </header>

                <figure className={styles.imageWrapper}>
                    <Image
                        src={dbPost.image || '/maine-news-now.png'}
                        alt={dbPost.title}
                        fill
                        className={styles.image}
                        priority
                    />
                </figure>

                <div className={styles.centerContent}>
                    <TextResizer />
                </div>

                <div className={styles.body} data-article-body>
                    <div dangerouslySetInnerHTML={{ __html: dbPost.content }} />
                </div>

                {isEditorial && (
                    <aside className={styles.editorialDisclaimer}>
                        <h2 className={styles.editorialDisclaimerTitle}>Editorial Disclaimer</h2>
                        {EDITORIAL_DISCLAIMER_PARAGRAPHS.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </aside>
                )}

                {/* Related Stories Section */}
                {relatedPosts.length > 0 && (
                    <section className={styles.relatedSection}>
                        <h2 className={styles.relatedTitle}>Related Stories</h2>
                        <div className={styles.relatedGrid}>
                            {relatedPosts.map(post => (
                                <StoryCard
                                    key={post.slug}
                                    title={post.title}
                                    image={post.image}
                                    slug={post.slug}
                                    category={post.category}
                                    isNational={post.isNational}
                                    publishedDate={post.publishedDate}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <ArticleActions
                    title={dbPost.title}
                    url={`https://www.mainenewsnow.com/article/${slug}`}
                />
            </article>
        );
    }

    notFound();
}
