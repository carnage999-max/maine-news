'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionList from '@/components/home/SectionList';
import NewsroomSection from '@/components/home/NewsroomSection';
import type { NewsroomProfile } from '@/components/newsroom/NewsroomProfiles';
import CountyMapPanel from '@/components/home/CountyMapPanel';
import ScrollToTop from '@/components/ui/ScrollToTop';
import StoryCard from '@/components/ui/StoryCard';
import {
    ArrowUpDown,
    Building2,
    CirclePlay,
    ChevronLeft,
    ChevronRight,
    CloudSun,
    Facebook,
    Flame,
    Instagram,
    Landmark,
    Map,
    MapPinned,
    Radio,
    ScrollText,
    Shield,
    TriangleAlert,
    X,
    Youtube,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TrafficReport } from '@/lib/traffic';
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
    traffic: TrafficReport | null;
    authors: NewsroomProfile[];
}

interface TrafficPreviewItem {
    id: string;
    category: string;
    title: string;
    regionLabel: string;
    roadLabel?: string;
}

interface QuickLinkIconItem {
    href: string;
    label: string;
    icon: LucideIcon;
    iconClassName: string;
    large?: boolean;
    highlightClassName?: string;
}

interface QuickLinkImageItem {
    href: string;
    label: string;
    imageSrc: string;
    imageAlt: string;
    imageOnly?: boolean;
    large?: boolean;
    highlightClassName?: string;
    icon?: never;
    iconClassName?: never;
}

type QuickLinkItem = QuickLinkIconItem | QuickLinkImageItem;

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

const QUICK_LINK_TOP: QuickLinkIconItem[] = [
    { href: '/weather', label: 'Weather', icon: CloudSun, iconClassName: styles.iconWeather },
    { href: '/latest', label: 'Live feed', icon: Radio, iconClassName: styles.iconLiveFeed },
    { href: '/traffic', label: 'Traffic', icon: Map, iconClassName: styles.iconTraffic },
    { href: '/the-maine-minute', label: 'Watch', icon: CirclePlay, iconClassName: styles.iconWatch },
];

const QUICK_LINK_MIDDLE: QuickLinkItem[] = [
    { href: '/the-maine-minute', label: 'Maine Minute', imageSrc: '/maine-minutes.png', imageAlt: 'The Maine Minute', imageOnly: true },
    { href: '/editorial', label: 'Editorial', icon: ScrollText, iconClassName: styles.iconEditorial, highlightClassName: styles.quickLinkEditorial },
];

const QUICK_LINK_BOTTOM: QuickLinkIconItem[] = [
    { href: '/maine-politics', label: 'Politics', icon: Landmark, iconClassName: styles.iconPolitics },
    { href: '/maine-crime', label: 'Crime', icon: Shield, iconClassName: styles.iconCrime },
    { href: '/maine-business', label: 'Business', icon: Building2, iconClassName: styles.iconBusiness },
    { href: '/submit', label: 'Tips', icon: TriangleAlert, iconClassName: styles.iconTips },
];

const TICKER_SPEEDS = {
    slow: { primary: '56s', secondary: '64s' },
    normal: { primary: '42s', secondary: '48s' },
    fast: { primary: '30s', secondary: '36s' },
} as const;

type TickerSpeed = keyof typeof TICKER_SPEEDS;

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

export default function HomeFeed({ initialPosts, weather, traffic, authors }: HomeFeedProps) {
    const latestEditorial = initialPosts.find(post => post.category === 'editorial');
    const topStories = initialPosts.filter(post => post.category !== 'obituaries');
    const heroStories = topStories.slice(0, 7);

    const [activeCategory, setActiveCategory] = useState('all');
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [trendingIndex, setTrendingIndex] = useState(0);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [visibleCount, setVisibleCount] = useState(15);
    const [mobileVisibleCount, setMobileVisibleCount] = useState(6);
    const [showCountyMapModal, setShowCountyMapModal] = useState(false);
    const [tickerSpeed, setTickerSpeed] = useState<TickerSpeed>(() => {
        if (typeof window === 'undefined') return 'normal';
        const savedSpeed = window.localStorage.getItem('mobileTickerSpeed');
        return savedSpeed === 'slow' || savedSpeed === 'normal' || savedSpeed === 'fast' ? savedSpeed : 'normal';
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showEditorialAlert, setShowEditorialAlert] = useState(() => {
        if (typeof window === 'undefined') return false;

        const editorial = initialPosts.find(post => post.category === 'editorial');
        if (!editorial) return false;

        const publishedAt = new Date(editorial.publishedDate).getTime();
        const lastSeen = Number(window.localStorage.getItem('editorialAlertSeenAt') || 0);

        return !Number.isNaN(publishedAt) && publishedAt > lastSeen;
    });

    const leadStory = heroStories[currentHeroIndex] || topStories[0];
    const breakingNews = topStories.slice(1, 6);
    const liveFeed = topStories.slice(0, 4);
    const politicsStories = topStories.filter(post => post.category === 'politics');
    const politicsSpotlight = politicsStories[0] || topStories[2];
    const politicsSecondary = politicsStories.slice(1, 3);

    useEffect(() => {
        window.localStorage.setItem('mobileTickerSpeed', tickerSpeed);
    }, [tickerSpeed]);

    useEffect(() => {
        if (!showCountyMapModal) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowCountyMapModal(false);
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [showCountyMapModal]);

    useEffect(() => {
        if (heroStories.length <= 1) return;

        const timer = window.setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % heroStories.length);
        }, 5500);

        return () => window.clearInterval(timer);
    }, [heroStories.length]);

    useEffect(() => {
        if (topStories.length <= 1) return;

        const timer = window.setInterval(() => {
            setTrendingIndex((prev) => (prev + 1) % topStories.length);
        }, 4200);

        return () => window.clearInterval(timer);
    }, [topStories.length]);

    const rotatingTrendingStories = Array.from({ length: Math.min(5, topStories.length) }, (_, index) => (
        topStories[(trendingIndex + index) % topStories.length]
    )).filter(Boolean);

    const trafficAlerts: TrafficPreviewItem[] = (() => {
        if (traffic?.incidents?.length) {
            return traffic.incidents.slice(0, 4).map((incident) => ({
                id: incident.id,
                category: incident.category,
                title: incident.to ? `${incident.description} near ${incident.to}` : incident.description,
                regionLabel: incident.regionLabel,
                roadLabel: incident.roadNumbers.join(', '),
            }));
        }

        const matches = topStories.filter(post =>
            /(road|route|traffic|crash|turnpike|bridge|interstate|construction|i-)/i.test(post.title)
        );

        if (matches.length >= 4) {
            return matches.slice(0, 4).map((post) => ({
                id: post.id,
                category: post.category,
                title: post.title,
                regionLabel: 'Maine roads',
            }));
        }

        return topStories.slice(6, 10).map((post) => ({
            id: post.id,
            category: post.category,
            title: post.title,
            regionLabel: 'Maine roads',
        }));
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
    const tickerSpeedStyles = {
        '--mobile-marquee-duration': TICKER_SPEEDS[tickerSpeed].primary,
        '--mobile-marquee-duration-alt': TICKER_SPEEDS[tickerSpeed].secondary,
    } as CSSProperties;

    return (
        <div className={styles.feedContainer} style={tickerSpeedStyles}>
            <div
                className={styles.mobileTopSponsorSlot}
                data-custom-ad-slot="home-header-left"
                data-custom-ad-format="micro"
                aria-label="Featured partner placement"
            />

            <section className={styles.trendingStrip}>
                <div className={styles.trendingHeader}>
                    <Flame size={14} />
                    <span>Trending</span>
                </div>
                <div className={styles.trendingItems}>
                    {rotatingTrendingStories.map((story) => (
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

            <section className={styles.mobileMarqueeBlock}>
                <div className={styles.mobileMarqueeRow}>
                    <span className={styles.mobileMarqueeLabel}>Trending</span>
                    <div className={styles.mobileMarqueeViewport}>
                        <div className={`${styles.mobileMarqueeTrack} ${styles.mobileMarqueeTrackAlt}`}>
                            {[...topStories.slice(0, 6), ...topStories.slice(0, 6)].map((story, index) => (
                                <Link
                                    key={`${story.id}-trending-${index}`}
                                    href={`/article/${story.slug}`}
                                    className={styles.mobileMarqueeItem}
                                >
                                    {story.title}
                                </Link>
                            ))}
                        </div>
                    </div>
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
                        <button
                            type="button"
                            className={`${styles.heroControl} ${styles.heroControlPrev}`}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setCurrentHeroIndex((prev) => (prev - 1 + heroStories.length) % heroStories.length);
                            }}
                            aria-label="Previous spotlight story"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            className={`${styles.heroControl} ${styles.heroControlNext}`}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setCurrentHeroIndex((prev) => (prev + 1) % heroStories.length);
                            }}
                            aria-label="Next spotlight story"
                        >
                            <ChevronRight size={20} />
                        </button>
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
                            {heroStories.length > 1 && (
                                <div className={styles.heroPagination}>
                                    {heroStories.map((story, index) => (
                                        <button
                                            key={story.id}
                                            type="button"
                                            className={`${styles.heroPaginationDot} ${index === currentHeroIndex ? styles.heroPaginationDotActive : ''}`}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                setCurrentHeroIndex(index);
                                            }}
                                            aria-label={`Show spotlight story ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Link>

                    <aside className={styles.desktopRail}>
                        <CountyMapPanel />

                        <div className={styles.breakingPanel}>
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
                        </div>
                    </aside>
                </section>
            )}

            <div
                className={styles.mobilePostHeroSponsorSlot}
                data-custom-ad-slot="home-header-right"
                data-custom-ad-format="micro"
                aria-label="Featured partner placement"
            />

            <section className={styles.quickLinks}>
                <div className={styles.quickLinkRow}>
                    {QUICK_LINK_TOP.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.quickLinkCard}>
                            <link.icon size={18} className={link.iconClassName} />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>
                <div className={styles.quickLinkFeatureRow}>
                    {QUICK_LINK_MIDDLE.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={
                                'imageOnly' in link && link.imageOnly
                                    ? styles.quickLinkImageOnly
                                    : `${styles.quickLinkCard} ${styles.quickLinkCardCompact} ${link.highlightClassName || ''}`
                            }
                        >
                            {'imageSrc' in link ? (
                                <Image
                                    src={link.imageSrc}
                                    alt={link.imageAlt}
                                    width={'imageOnly' in link && link.imageOnly ? 170 : 112}
                                    height={'imageOnly' in link && link.imageOnly ? 70 : 28}
                                    className={'imageOnly' in link && link.imageOnly ? styles.quickLinkFeatureImage : styles.quickLinkBrandImage}
                                />
                            ) : (
                                <link.icon size={18} className={link.iconClassName} />
                            )}
                            {(!('imageOnly' in link) || !link.imageOnly) && <span>{link.label}</span>}
                        </Link>
                    ))}
                    <button
                        type="button"
                        className={`${styles.quickLinkCard} ${styles.quickLinkCardCompact} ${styles.quickLinkCounties}`}
                        onClick={() => setShowCountyMapModal(true)}
                    >
                        <MapPinned size={18} className={styles.iconCounties} />
                        <span>Counties</span>
                    </button>
                </div>
                <div className={styles.quickLinkRow}>
                    {QUICK_LINK_BOTTOM.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.quickLinkCard}>
                            <link.icon size={18} className={link.iconClassName} />
                            <span>{link.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {showCountyMapModal && (
                <div
                    className={styles.countyModalOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="county-map-modal-title"
                    onClick={() => setShowCountyMapModal(false)}
                >
                    <div className={styles.countyModalDialog} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.countyModalHeader}>
                            <div>
                                <span className={styles.countyModalEyebrow}>Local coverage</span>
                                <h2 id="county-map-modal-title">Maine county map</h2>
                            </div>
                            <button
                                type="button"
                                className={styles.countyModalClose}
                                aria-label="Close county map"
                                onClick={() => setShowCountyMapModal(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <CountyMapPanel />
                    </div>
                </div>
            )}

            <div
                className={styles.featuredSponsorSlot}
                data-custom-ad-slot="home-featured"
                data-custom-ad-format="featured"
                aria-label="Featured partner placement"
            />

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
                    <div className={styles.weatherDetailRow}>
                        <div className={styles.weatherDetailPill}>
                            <span>Alerts</span>
                            <strong>{weather?.alertsCount || 0}</strong>
                        </div>
                        <div className={styles.weatherDetailPill}>
                            <span>Outlook</span>
                            <strong>{weather?.outlook?.[0]?.shortForecast || 'Quiet skies'}</strong>
                        </div>
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

                <Link href="/traffic" className={`${styles.utilityCard} ${styles.trafficCard}`}>
                    <div className={styles.panelHeader}>
                        <div className={styles.panelTitle}>
                            <TriangleAlert size={16} />
                            <h2>Traffic alerts</h2>
                        </div>
                        <span className={styles.panelLink}>
                            Live detail <ChevronRight size={14} />
                        </span>
                    </div>
                    <div className={styles.storyList}>
                        {trafficAlerts.map((story) => (
                            <div key={story.id} className={styles.storyListItem}>
                                <span className={styles.storyListTime}>{story.regionLabel}</span>
                                <span className={styles.storyListText}>
                                    {story.title}
                                    {story.roadLabel ? ` (${story.roadLabel})` : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.cardSummaryRow}>
                        <div className={styles.summaryMetric}>
                            <span>Live incidents</span>
                            <strong>{traffic?.incidents?.length || trafficAlerts.length}</strong>
                        </div>
                        <div className={styles.summaryMetric}>
                            <span>Coverage</span>
                            <strong>{traffic?.regions?.length || 5} regions</strong>
                        </div>
                    </div>
                    <div className={styles.trafficNote}>{traffic?.note || 'Tap through for the live statewide traffic desk and map.'}</div>
                </Link>

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
                        {politicsSecondary.length > 0 && (
                            <div className={styles.spotlightList}>
                                {politicsSecondary.map((story) => (
                                    <div key={story.id} className={styles.spotlightListItem}>
                                        <strong>{story.title}</strong>
                                        <span>{formatTimeAgo(story.publishedDate)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                setMobileVisibleCount(6);
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

            <section className={styles.mobileLatestSection}>
                <div className={styles.mobileMarqueeRow}>
                    <span className={styles.mobileMarqueeLabel}>Breaking</span>
                    <div className={styles.mobileMarqueeViewport}>
                        <div className={styles.mobileMarqueeTrack}>
                            {[...breakingNews, ...breakingNews].map((story, index) => (
                                <Link
                                    key={`${story.id}-breaking-${index}`}
                                    href={`/article/${story.slug}`}
                                    className={styles.mobileMarqueeItem}
                                >
                                    {story.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.tickerControlRow}>
                    <span className={styles.tickerControlLabel}>Ticker speed</span>
                    <div className={styles.tickerControlGroup} role="group" aria-label="Ticker speed">
                        {(['slow', 'normal', 'fast'] as TickerSpeed[]).map((speed) => (
                            <button
                                key={speed}
                                type="button"
                                className={`${styles.tickerControlButton} ${tickerSpeed === speed ? styles.tickerControlButtonActive : ''}`}
                                onClick={() => setTickerSpeed(speed)}
                            >
                                {speed}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.mobileLatestHeader}>
                    <h2>Latest headlines</h2>
                    <Link href="/latest" className={styles.mobileLatestLink}>View all</Link>
                </div>
                <div className={styles.mobileLatestList}>
                    {visiblePosts.slice(0, mobileVisibleCount).map((story, index) => (
                        <div key={`mobile-${story.id}`}>
                            <StoryCard
                                title={story.title}
                                image={story.image}
                                slug={story.slug}
                                publishedDate={story.publishedDate}
                                category={story.category}
                                isNational={story.isNational}
                                compact
                            />
                            {index === 2 ? (
                                <div
                                    className={styles.mobileInlineSponsorSlot}
                                    data-custom-ad-slot="home-feed-inline"
                                    data-custom-ad-format="inline"
                                    aria-label="Featured partner placement"
                                />
                            ) : null}
                        </div>
                    ))}
                </div>
                {mobileVisibleCount < visiblePosts.length && (
                    <div className={styles.mobileLoadMoreWrapper}>
                        <button
                            type="button"
                            className={styles.loadMoreButton}
                            onClick={() => setMobileVisibleCount((prev) => prev + 6)}
                        >
                            Load More Stories
                        </button>
                    </div>
                )}
            </section>

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
                                    setMobileVisibleCount(6);
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

            <NewsroomSection profiles={authors} />

            <ScrollToTop />
        </div>
    );
}
