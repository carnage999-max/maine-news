import Hero from '@/components/home/Hero';
import LiveTicker from '@/components/home/LiveTicker';
import SectionList from '@/components/home/SectionList';
import { reader } from '@/lib/reader';

export default async function Home() {
  const posts = await reader.collections.posts.all();

  // Transform posts to match expected format
  const formattedPosts = posts.map(post => ({
    id: post.slug,
    title: post.entry.title,
    slug: post.slug,
    image: post.entry.image || undefined,
    category: post.entry.category,
    publishedDate: post.entry.publishedDate
  }));

  // Sort by date (descending)
  formattedPosts.sort((a, b) => {
    const dateA = new Date(a.publishedDate || '').getTime();
    const dateB = new Date(b.publishedDate || '').getTime();
    return dateB - dateA;
  });

  // Get recent headlines for ticker (top 5 most recent)
  const tickerHeadlines = formattedPosts.slice(0, 5).map(post => post.title);

  // Separate by category
  const localStories = formattedPosts.filter(p => p.category === 'local');
  const politicsStories = formattedPosts.filter(p => p.category === 'politics');
  const opinionStories = formattedPosts.filter(p => p.category === 'opinion');
  const healthStories = formattedPosts.filter(p => p.category === 'health');

  return (
    <>
      <Hero />

      <LiveTicker headlines={tickerHeadlines} />

      <div className="content-stack">
        {formattedPosts.length > 0 && (
          <SectionList
            title="Latest News"
            stories={formattedPosts}
          />
        )}
        {localStories.length > 0 && (
          <SectionList
            title="Local"
            stories={localStories}
          />
        )}
        {politicsStories.length > 0 && (
          <SectionList
            title="Politics"
            stories={politicsStories}
          />
        )}
        {healthStories.length > 0 && (
          <SectionList
            title="Health"
            stories={healthStories}
          />
        )}
        {opinionStories.length > 0 && (
          <SectionList
            title="Opinion"
            stories={opinionStories}
          />
        )}
      </div>
    </>
  );
}
