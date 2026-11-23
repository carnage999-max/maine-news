import HomeFeed from '@/components/home/HomeFeed';
import { Metadata } from 'next';
import { db } from '@/db';
import { authors, posts as dbPosts } from '@/db/schema';
import { desc, sql } from 'drizzle-orm';
import { getMaineDateString, getWeatherReport } from '@/lib/weather';
import { getTrafficReport } from '@/lib/traffic';

export const metadata: Metadata = {
  title: 'Maine News Now | Local Maine News, Weather, Politics & Breaking Stories',
  description: 'Maine News Now delivers local Maine news, weather, politics, crime, sports, business, opinion, and breaking stories across Maine.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function Home() {
  const activeHeadline = await db.query.posts.findFirst({
    where: sql`${dbPosts.isHeadline} and ${dbPosts.headlineUntil} > now()`,
    orderBy: [desc(dbPosts.publishedDate)],
    columns: { id: true },
  });

  const authoredPosts = await db.query.posts.findMany({
    // An active homepage headline is always returned first. Once its expiry
    // passes, its normal publication date controls its placement again.
    orderBy: [
      sql`case when ${dbPosts.isHeadline} and ${dbPosts.headlineUntil} > now() then 0 else 1 end`,
      desc(dbPosts.publishedDate),
    ],
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
      isHeadline: true,
      headlineUntil: true,
    },
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
    isOriginal: post.isOriginal,
    isHeadline: post.isHeadline,
    headlineUntil: post.headlineUntil?.toISOString() ?? null,
    isActiveHeadline: post.id === activeHeadline?.id,
  }));

  const newsroomProfiles = await db.query.authors.findMany({
    orderBy: [desc(authors.createdAt)],
    columns: {
      id: true,
      name: true,
      role: true,
      avatar: true,
      bio: true,
      email: true,
      contactInfo: true,
    },
  });

  let weather = null;
  let traffic = null;

  try {
    const report = await getWeatherReport(getMaineDateString(), 1800);
    const primaryRegion = report.regions.find(region => region.id === 'central') || report.regions[0];

    if (primaryRegion) {
      weather = {
        location: primaryRegion.location,
        temperature: primaryRegion.today?.temperature,
        temperatureUnit: primaryRegion.today?.temperatureUnit,
        condition: primaryRegion.today?.shortForecast || 'Forecast unavailable',
        outlook: primaryRegion.outlook.slice(0, 4),
        alertsCount: report.alerts.length,
      };
    }
  } catch (error) {
    console.error('Failed to load homepage weather summary:', error);
  }

  try {
    traffic = await getTrafficReport(60);
  } catch (error) {
    console.error('Failed to load homepage traffic summary:', error);
  }

  return (
    <div>
      <HomeFeed
        initialPosts={formattedPosts}
        weather={weather}
        traffic={traffic}
        authors={newsroomProfiles}
      />
    </div>
  );
}
