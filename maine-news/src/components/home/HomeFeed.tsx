'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionList from '@/components/home/SectionList';
import ScrollToTop from '@/components/ui/ScrollToTop';
import {
    ArrowUpDown,
    Building2,
    ChevronRight,
    CirclePlay,
    CloudSun,
    Facebook,
    Flame,
    Instagram,
    Landmark,
    Map,
    Radio,
    Shield,
    TriangleAlert,
    X,
    Youtube,
} from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatDate';
import styles from './HomeFeed.module.css';

interface Post {
    id: string;
    title: string;
    slug: string;
    image?: string;
    category: string;
    isNational: boolean;
    publishedDate: string;
    author: string;
    isOriginal?: boolean;
}

interface WeatherSnapshot {
    location: string;
    temperature?: number;
    temperatureUnit?: string;
    condition: string;
    alertsCount: number;
    outlook: Array<{
        name: string;
        shortForecast: string;
        temperature?: number;
        temperatureUnit?: string;
    }>;
}

interface HomeFeedProps {
    initialPosts: Post[];
    weather: WeatherSnapshot | null;
}

const CATEGORIES = [
    { id: 'all', label: 'News' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'exclusives', label: 'Exclusives' },
    { id: 'top-stories', label: 'Top Stories' },
    { id: 'local', label: 'Local' },
    { id: 'national', label: 'National' },
    { id: 'politics', label: 'Politics' },
    { id: 'sports', label: 'Sports' },
    { id: 'health', label: 'Health' },
    { id: 'weather', label: 'Weather' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'business', label: 'Business' },
    { id: 'crime', label: 'Crime' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'obituaries', label: 'Obituaries' },
];

const QUICK_LINKS = [
    { href: '/weather', label: 'Weather', icon: CloudSun },
    { href: '/latest', label: 'Live feed', icon: Radio },
    { href: '/sections', label: 'Sections', icon: Map },
    { href: '/the-maine-minute', label: 'Watch', icon: CirclePlay },
    { href: '/maine-politics', label: 'Politics', icon: Landmark },
    { href: '/maine-crime', label: 'Crime', icon: Shield },
    { href: '/maine-business', label: 'Business', icon: Building2 },
    { href: '/submit', label: 'Tips', icon: TriangleAlert },
];

function formatDisplayDate(dateString: string) {
    const parsed = new Date(dateString);

    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
}

export default function HomeFeed({ initialPosts, weather }: HomeFeedProps) {
    const latestEditorial = initialPosts.find(post => post.category === 'editorial');
    const topStories = initialPosts.filter(post => post.category !== 'obituaries');

    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [visibleCount, setVisibleCount] = useState(15);
    const [showFilters, setShowFilters] = useState(false);
    const [showEditorialAlert, setShowEditorialAlert] = useState(() => {
        if (typeof window === 'undefined') return false;

        const editorial = initialPosts.find(post => post.category === 'editorial');
        if (!editorial) return false;

        const publishedAt = new Date(editorial.publishedDate).getTime();
        const lastSeen = Number(window.localStorage.getItem('editorialAlertSeenAt') || 0);

        return !Number.isNaN(publishedAt) && publishedAt > lastSeen;
    });

    const leadStory = topStories[0];
    const breakingNews = topStories.slice(1, 6);
    const liveFeed = topStories.slice(0, 4);
    const politicsSpotlight = topStories.find(post => post.category === 'politics') || topStories[2];

    const trafficAlerts = (() => {
        const matches = topStories.filter(post =>
            /(road|route|traffic|crash|turnpike|bridge|interstate|construction|i-)/i.test(post.title)
        );

        if (matches.length >= 3) {
            return matches.slice(0, 3);
        }

        return topStories.slice(6, 9);
    })();

    const filteredPosts = initialPosts.filter(post => {
        if (activeCategory === 'all') {
            return post.category !== 'obituaries';
        }

        if (activeCategory === 'exclusives') {
            return post.isOriginal === true;
        }

        if (activeCategory === 'local') {
            return post.isNational === false;
        }

        if (activeCategory === 'national') {
            return post.isNational === true;
        }

        return post.category === activeCategory;
    });

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        const dateA = new Date(a.publishedDate).getTime();
        const dateB = new Date(b.publishedDate).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    const visiblePosts = sortedPosts.slice(0, visibleCount);

    return (
        <div className={styles.feedContainer}>
            <section className={styles.trendingStrip}>
                <div className={styles.trendingHeader}>
                    <Flame size={14} />
                    <span>Trending</span>
                </div>
                <div className={styles.trendingItems}>
                    {topStories.slice(0, 5).map((story) => (
                        <Link key={story.id} href={`/article/${story.slug}`} className={styles.trendingLink}>
                            {story.title}
                        </Link>
                    ))}
                </div>
                <div className={styles.socialLinks}>
                    <a href="https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                        <Facebook size={15} />
                    </a>
                    <a href="https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                        <Instagram size={15} />
                    </a>
                    <a href="https://x.com/MaineNews_Now" target="_blank" rel="noopener noreferrer" aria-label="X">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill="currentColor" />
                        </svg>
                    </a>
                    <a href="https://www.youtube.com/@MaineNewsToday" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <Youtube size={15} />
                    </a>
                </div>
            </section>

            {showEditorialAlert && latestEditorial && (
                <div className={styles.editorialAlert} role="status">
                    <div className={styles.editorialAlertBody}>
                        <span className={styles.editorialAlertKicker}>New editorial</span>
                        <Link href={`/article/${latestEditorial.slug}`} className={styles.editorialAlertTitle}>
                            {latestEditorial.title}
                        </Link>
                        <span className={styles.editorialAlertMeta}>
                            Published {new Date(latestEditorial.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    <button
                        type="button"
                        className={styles.editorialAlertClose}
                        onClick={() => {
                            const publishedAt = new Date(latestEditorial.publishedDate).getTime();
                            window.localStorage.setItem('editorialAlertSeenAt', String(publishedAt || Date.now()));
                            setShowEditorialAlert(false);
                        }}
                        aria-label="Dismiss editorial alert"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {leadStory && (
                <section className={styles.leadGrid}>
                    <Link href={`/article/${leadStory.slug}`} className={styles.leadStory}>
                        <div className={styles.leadMedia}>
                            <Image
                                src={leadStory.image || '/hero-fallback.jpeg'}
                                alt={leadStory.title}
                                fill
                                className={styles.leadImage}
                                priority
                                sizes="(max-width: 959px) 100vw, 70vw"
                            />
                            <div className={styles.leadOverlay} />
                        </div>
                        <div className={styles.leadContent}>
                            <span className={styles.storyBadge}>Top story</span>
                            <h1 className={styles.leadTitle}>{leadStory.title}</h1>
                            <p className={styles.leadSummary}>
                                Maine communities are watching this story closely as the latest developments continue to unfold across the state.
                            </p>
                            <div className={styles.leadMeta}>
                                <span>{formatDisplayDate(leadStory.publishedDate)}</span>
                                <span className={styles.metaDot} />
                                <span>{formatTimeAgo(leadStory.publishedDate)}</span>
                            </div>
                        </div>
                    </Link>

                    <aside className={styles.breakingPanel}>
                        <div className={styles.panelHeader}>
                            <div className={styles.panelTitle}>
                                <span className={styles.breakingDot} />
                                <h2>Breaking news</h2>
                            </div>
                            <Link href="/latest" className={styles.panelLink}>
                                View all <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className={styles.breakingList}>
                            {breakingNews.map((story) => (
                                <Link key={story.id} href={`/article/${story.slug}`} className={styles.breakingItem}>
                                    <span className={styles.breakingTime}>{formatTimeAgo(story.publishedDate)}</span>
                                    <span className={styles.breakingText}>{story.title}</span>
                                </Link>
                            ))}
                        </div>
                    </aside>
                </section>
            )}

            <section className={styles.quickLinks}>
                {QUICK_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className={styles.quickLinkCard}>
                        <link.icon size={18} />
                        <span>{link.label}</span>
                    </Link>
                ))}
            </section>

            <section className={styles.utilityDeck}>
                <article className={styles.utilityCard}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <CloudSun size={16} />
                            <h2>Weather center</h2>
                        </div>
                        <Link href="/weather" className={styles.panelLink}>
                            Forecast <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.weatherSummary}>
                        <div>
                            <p className={styles.weatherLocation}>{weather?.location || 'Bangor, Maine'}</p>
                            <div className={styles.weatherTempRow}>
                                <span className={styles.weatherTemp}>
                                    {weather?.temperature ? `${weather.temperature}${weather.temperatureUnit || 'F'}` : 'Now'}
                                </span>
                                <span className={styles.weatherCondition}>{weather?.condition || 'Forecast unavailable'}</span>
                            </div>
                        </div>
                        <CloudSun size={46} className={styles.weatherIcon} />
                    </div>
                    <div className={styles.weatherOutlook}>
                        {(weather?.outlook || []).slice(0, 4).map((day) => (
                            <div key={day.name} className={styles.weatherDay}>
                                <span>{day.name.slice(0, 3)}</span>
                                <strong>{day.temperature ? `${day.temperature}${day.temperatureUnit || ''}` : '--'}</strong>
                            </div>
                        ))}
                    </div>
                    <div className={styles.weatherFooter}>
                        <span>{weather?.alertsCount ? `${weather.alertsCount} active alerts statewide` : 'Quiet statewide outlook'}</span>
                    </div>
                </article>

                <article className={styles.utilityCard}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <Radio size={16} />
                            <h2>Live Maine feed</h2>
                        </div>
                        <Link href="/latest" className={styles.panelLink}>
                            View all <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.storyList}>
                        {liveFeed.map((story) => (
                            <Link key={story.id} href={`/article/${story.slug}`} className={styles.storyListItem}>
                                <span className={styles.storyListTime}>{formatTimeAgo(story.publishedDate)}</span>
                                <span className={styles.storyListText}>{story.title}</span>
                            </Link>
                        ))}
                    </div>
                </article>

                <article className={styles.utilityCard}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <TriangleAlert size={16} />
                            <h2>Traffic alerts</h2>
                        </div>
                        <Link href="/sections" className={styles.panelLink}>
                            Sections <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className={styles.storyList}>
                        {trafficAlerts.map((story) => (
                            <Link key={story.id} href={`/article/${story.slug}`} className={styles.storyListItem}>
                                <span className={styles.storyListTime}>{story.category}</span>
                                <span className={styles.storyListText}>{story.title}</span>
                            </Link>
                        ))}
                    </div>
                </article>

                {politicsSpotlight && (
                    <Link href={`/article/${politicsSpotlight.slug}`} className={`${styles.utilityCard} ${styles.spotlightCard}`}>
                        <div className={styles.panelHeader}>
                            <div className={styles.panelTitle}>
                                <Landmark size={16} />
                                <h2>Maine politics</h2>
                            </div>
                            <span className={styles.panelLink}>
                                Story <ChevronRight size={14} />
                            </span>
                        </div>
                        <div className={styles.spotlightMedia}>
                            <Image
                                src={politicsSpotlight.image || '/hero-fallback.jpeg'}
                                alt={politicsSpotlight.title}
                                fill
                                className={styles.spotlightImage}
                                sizes="(max-width: 959px) 100vw, 25vw"
                            />
                        </div>
                        <div className={styles.spotlightBody}>
                            <h3>{politicsSpotlight.title}</h3>
                            <span>{formatTimeAgo(politicsSpotlight.publishedDate)}</span>
                        </div>
                    </Link>
                )}
            </section>

            <div className={styles.stickyNav}>
                <div className={styles.categoryTabs}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setVisibleCount(15);
                            }}
                            className={`${styles.tabButton} ${activeCategory === cat.id ? styles.activeTab : ''} ${cat.id === 'editorial' ? styles.editorialTab : ''} ${activeCategory === cat.id && cat.id === 'editorial' ? styles.editorialTabActive : ''}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className={styles.controlsBar}>
                    <div className={styles.activeFilters}>
                        <span className={styles.filterSource}>Top headlines</span>
                        <span className={styles.filterCount}>{sortedPosts.length} stories across Maine</span>
                    </div>

                    <div className={styles.actions}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={styles.actionButton}
                        >
                            <Map size={16} />
                            <span>Filter</span>
                        </button>
                        <button
                            onClick={() => setSortBy(prev => prev === 'newest' ? 'oldest' : 'newest')}
                            className={styles.actionButton}
                        >
                            <ArrowUpDown size={16} />
                            <span>{sortBy === 'newest' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {showFilters && (
                <div className={styles.filterDrawer}>
                    <div className={styles.drawerHeader}>
                        <h3>Select category</h3>
                        <button onClick={() => setShowFilters(false)} aria-label="Close filters">
                            <X size={20} />
                        </button>
                    </div>
                    <div className={styles.chipGrid}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setVisibleCount(15);
                                    setShowFilters(false);
                                }}
                                className={`${styles.filterChip} ${activeCategory === cat.id ? styles.activeChip : ''} ${cat.id === 'editorial' ? styles.editorialChip : ''} ${activeCategory === cat.id && cat.id === 'editorial' ? styles.editorialChipActive : ''}`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.headlineStack}>
                <SectionList
                    title={activeCategory === 'all' ? 'Latest headlines' : `${CATEGORIES.find(c => c.id === activeCategory)?.label} headlines`}
                    stories={visiblePosts}
                />

                {visibleCount < sortedPosts.length && (
                    <div className={styles.loadMoreWrapper}>
                        <button
                            onClick={() => setVisibleCount(prev => prev + 15)}
                            className={styles.loadMoreButton}
                        >
                            Load More Stories
                        </button>
                    </div>
                )}
            </div>

            <ScrollToTop />
        </div>
    );
}
