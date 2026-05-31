import { MetadataRoute } from 'next';
import { db } from '@/db';
import { posts as dbPosts } from '@/db/schema';
import { desc } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mainenewsnow.com';
  
  // 1. Static Pages
  const staticPages = [
    { url: `${SITE_URL}`, lastModified: new Date() },
    { url: `${SITE_URL}/about`, lastModified: new Date() },
    { url: `${SITE_URL}/contact`, lastModified: new Date() },
    { url: `${SITE_URL}/editorial-policy`, lastModified: new Date() },
    { url: `${SITE_URL}/privacy-policy`, lastModified: new Date() },
    { url: `${SITE_URL}/advertise`, lastModified: new Date() },
    { url: `${SITE_URL}/terms`, lastModified: new Date() },
    { url: `${SITE_URL}/search`, lastModified: new Date() },
  ];

  // 2. Category Pages
  const categories = [
    'maine-news',
    'maine-weather',
    'maine-politics',
    'maine-crime',
    'maine-sports',
    'maine-business',
    'maine-opinion'
  ];
  const categoryPages = categories.map(cat => ({
    url: `${SITE_URL}/${cat}`,
    lastModified: new Date(),
  }));

  // 3. Dynamic Article Pages
  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const posts = await db.query.posts.findMany({
      orderBy: [desc(dbPosts.publishedDate)],
      columns: {
        slug: true,
        publishedDate: true,
      }
    });
    
    articlePages = posts.map(post => ({
      url: `${SITE_URL}/article/${post.slug}`,
      lastModified: new Date(post.publishedDate),
    }));
  } catch (error) {
    console.error('Sitemap post fetch failed:', error);
  }

  return [...staticPages, ...categoryPages, ...articlePages];
}
