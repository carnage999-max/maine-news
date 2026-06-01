import { Fragment } from 'react';
import StoryCard from '@/components/ui/StoryCard';
import styles from './SectionList.module.css';

interface Story {
    id: string;
    title: string;
    image?: string;
    slug: string;
    publishedDate: string;
    category?: string;
    isNational?: boolean;
}

interface SectionProps {
    title: string;
    stories: Story[];
}

export default function SectionList({ title, stories }: SectionProps) {
    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                <div className={styles.divider} />
            </div>
            <div className={styles.grid}>
                {stories.map((story, index) => (
                    <Fragment key={story.id}>
                        <StoryCard
                            title={story.title}
                            image={story.image}
                            slug={story.slug}
                            publishedDate={story.publishedDate}
                            category={story.category}
                            isNational={story.isNational}
                        />
                        {index === 3 ? (
                            <div
                                className={styles.inlineSponsorSlot}
                                data-custom-ad-slot="home-feed-inline"
                                data-custom-ad-format="inline"
                                aria-label="Featured partner placement"
                            />
                        ) : null}
                    </Fragment>
                ))}
            </div>
        </section>
    );
}
