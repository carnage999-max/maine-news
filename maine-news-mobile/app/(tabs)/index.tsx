import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CircleAlert, CloudSun, Landmark, Map, MapPinned, Radio, ScrollText, Search, Shield, TriangleAlert, Tv2, Building2, Menu, ChevronUp, ChevronRight, X } from 'lucide-react-native';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeadlineRow from '../../components/home/HeadlineRow';
import NewsTicker from '../../components/home/NewsTicker';
import StoryDisplayToggle, { type StoryDisplayMode } from '../../components/common/StoryDisplayToggle';
import StoryFeatureCard from '../../components/common/StoryFeatureCard';
import StoryGridCard from '../../components/common/StoryGridCard';
import usePersistedStoryDisplayMode from '../../components/common/usePersistedStoryDisplayMode';
import { colors, fontSize, radius, spacing } from '../../constants/theme';
import {
    API_BASE_URL,
    fetchCountyMap,
    fetchLotterySummary,
    fetchNewsroomProfiles,
    fetchPosts,
    fetchTrafficReport,
    fetchWeatherReport,
    getImageUrl,
    type CountyFeatureCollection,
    type LotterySummary,
    type NewsroomProfile,
    type Post,
    type TrafficReport,
    type WeatherReport,
} from '../../services/api';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 438;
const HERO_SLIDE_WIDTH = width - spacing.md * 2;
const COUNTY_MAP_WIDTH = 320;
const COUNTY_MAP_HEIGHT = 420;
const TICKER_STORAGE_KEY = 'mobileTickerSpeed';

type TickerSpeed = 'slow' | 'normal' | 'fast';

const LATEST_FILTERS = ['latest', 'maine', 'crime', 'politics', 'business', 'health', 'editorial'] as const;

const QUICK_TOP = [
    { label: 'Weather', icon: CloudSun, color: colors.highlight, route: '/weather' },
    { label: 'Live feed', icon: Radio, color: colors.accent, route: '/search' },
    { label: 'Traffic', icon: Map, color: colors.info, route: '/traffic' },
    { label: 'Watch', icon: Tv2, color: colors.blue, route: '/video-hub' },
];

const QUICK_BOTTOM = [
    { label: 'Politics', icon: Landmark, color: colors.highlight, route: '/category/politics' },
    { label: 'Crime', icon: Shield, color: colors.accent, route: '/category/crime' },
    { label: 'Business', icon: Building2, color: colors.success, route: '/category/business' },
    { label: 'Tips', icon: TriangleAlert, color: colors.warning, route: '/tips' },
];

function formatCompactDate() {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: '2-digit',
    }).format(new Date());
}

function formatRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now.getTime() - past.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
        const diffInMinutes = Math.max(1, Math.floor(diffInMs / (1000 * 60)));
        return `${diffInMinutes} min ago`;
    }
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(past);
}

function getLatestSectionPosts(posts: Post[], activeFilter: string) {
    if (activeFilter === 'latest') {
        return posts;
    }

    if (activeFilter === 'maine') {
        return posts.filter((post) => !post.isNational);
    }

    return posts.filter((post) => (post.category || '').toLowerCase() === activeFilter);
}

function getWeatherSnapshot(weather: WeatherReport | null) {
    if (!weather?.regions?.length) {
        return null;
    }

    return weather.regions.find((region) => region.id === 'statewide' && region.status === 'ok')
        || weather.regions.find((region) => region.status === 'ok')
        || weather.regions[0];
}

function getLotteryLine(lottery: LotterySummary | null) {
    if (!lottery) {
        return 'Lottery pending';
    }

    const orderedDraws = [
        ['Double Play', lottery.doublePlay],
        ['Lotto America', lottery.lottoAmerica],
        ['Lucky for Life', lottery.luckyForLife],
        ['Powerball', lottery.powerball],
        ['Mega Millions', lottery.megamillions],
        ['Megabucks', lottery.megabucks],
        ['Gimme 5', lottery.gimme5],
        ['Pick 4', lottery.pick4],
        ['Pick 3', lottery.pick3],
    ] as const;

    const availableDraw = orderedDraws.find(([, draw]) => draw?.numbers?.length);
    if (!availableDraw) {
        return 'Lottery pending';
    }

    const [label, draw] = availableDraw;
    const joinedNumbers = draw!.numbers.join(' ');
    return draw!.extra
        ? `${label} ${joinedNumbers} ${draw!.extra}`
        : `${label} ${joinedNumbers}`;
}

function hasUsableHeroImage(post: Post) {
    if (!post.image) {
        return false;
    }

    return !post.image.includes('hero-fallback');
}

const COUNTY_SLUGS: Record<string, string> = {
    aroostook: 'aroostook',
    washington: 'washington',
    penobscot: 'penobscot',
    hancock: 'hancock',
    piscataquis: 'piscataquis',
    somerset: 'somerset',
    franklin: 'franklin',
    oxford: 'oxford',
    androscoggin: 'androscoggin',
    kennebec: 'kennebec',
    waldo: 'waldo',
    knox: 'knox',
    lincoln: 'lincoln',
    sagadahoc: 'sagadahoc',
    cumberland: 'cumberland',
    york: 'york',
};

function getCountySlug(name?: string) {
    if (!name) return null;
    return COUNTY_SLUGS[name.trim().toLowerCase()] || null;
}

function flattenCoordinates(feature: any) {
    if (feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates.flat(1) as number[][];
    }
    return feature.geometry.coordinates.flat(2) as number[][];
}

function buildCountyPaths(collection: CountyFeatureCollection, widthValue: number, heightValue: number) {
    const allPoints = collection.features.flatMap(flattenCoordinates);
    const longitudes = allPoints.map((point) => point[0]);
    const latitudes = allPoints.map((point) => point[1]);

    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const lonSpan = maxLon - minLon || 1;
    const latSpan = maxLat - minLat || 1;

    const padding = 12;
    const usableWidth = widthValue - padding * 2;
    const usableHeight = heightValue - padding * 2;

    const scalePoint = ([lon, lat]: number[]) => {
        const x = padding + ((lon - minLon) / lonSpan) * usableWidth;
        const y = padding + (1 - (lat - minLat) / latSpan) * usableHeight;
        return [x, y] as const;
    };

    return collection.features.map((feature) => {
        const polygons = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates as number[][][]]
            : (feature.geometry.coordinates as number[][][][]);

        const path = polygons.map((polygon) => polygon.map((ring) => {
            return ring.map((point, index) => {
                const [x, y] = scalePoint(point);
                return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
            }).join(' ') + ' Z';
        }).join(' ')).join(' ');

        return {
            path,
            name: feature.properties.county || 'County',
            slug: getCountySlug(feature.properties.county),
        };
    });
}

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList<Post>>(null);
    const heroScrollRef = useRef<ScrollView>(null);
    const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scrollOffsetRef = useRef(0);

    const [posts, setPosts] = useState<Post[]>([]);
    const [traffic, setTraffic] = useState<TrafficReport | null>(null);
    const [weather, setWeather] = useState<WeatherReport | null>(null);
    const [lottery, setLottery] = useState<LotterySummary | null>(null);
    const [profiles, setProfiles] = useState<NewsroomProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [latestFilter, setLatestFilter] = useState<(typeof LATEST_FILTERS)[number]>('latest');
    const [mobileVisibleCount, setMobileVisibleCount] = useState(6);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [tickerSpeed, setTickerSpeed] = useState<TickerSpeed>('normal');
    const [headlineMode, setHeadlineMode] = usePersistedStoryDisplayMode('story-display-home');
    const [countyMap, setCountyMap] = useState<CountyFeatureCollection | null>(null);
    const [countyMapLoading, setCountyMapLoading] = useState(false);
    const [showCountyModal, setShowCountyModal] = useState(false);
    const previousHeadlineModeRef = useRef<StoryDisplayMode>(headlineMode);

    useEffect(() => {
        AsyncStorage.getItem(TICKER_STORAGE_KEY).then((saved) => {
            if (saved === 'slow' || saved === 'normal' || saved === 'fast') {
                setTickerSpeed(saved);
            }
        }).catch(() => undefined);
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(TICKER_STORAGE_KEY, tickerSpeed).catch(() => undefined);
    }, [tickerSpeed]);

    useEffect(() => {
        if (previousHeadlineModeRef.current === headlineMode) {
            return;
        }

        previousHeadlineModeRef.current = headlineMode;
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToOffset({
                offset: scrollOffsetRef.current,
                animated: false,
            });
        });
    }, [headlineMode]);

    const loadHome = async () => {
        try {
            const [postData, weatherData, lotteryData, trafficData, profileData] = await Promise.all([
                fetchPosts(),
                fetchWeatherReport(),
                fetchLotterySummary(),
                fetchTrafficReport(),
                fetchNewsroomProfiles(),
            ]);

            setPosts(postData);
            setWeather(weatherData);
            setLottery(lotteryData);
            setTraffic(trafficData);
            setProfiles(profileData);
        } catch (error) {
            console.error('Failed to load mobile home:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadHome();
    }, []);

    const heroStories = useMemo(() => {
        const withRealImages = posts.filter(hasUsableHeroImage);
        const source = withRealImages.length >= 3 ? withRealImages : posts;
        return source.slice(0, 7);
    }, [posts]);
    const weatherSnapshot = useMemo(() => getWeatherSnapshot(weather), [weather]);
    const trendingItems = useMemo(() => posts.slice(0, 10).map((post) => post.title), [posts]);
    const breakingItems = useMemo(() => posts.slice(0, 8).map((post) => post.title), [posts]);
    const latestFeedSource = useMemo(() => {
        if (posts.length <= 1) {
            return posts;
        }
        return posts.slice(1);
    }, [posts]);
    const latestHeadlines = useMemo(() => {
        const filtered = getLatestSectionPosts(latestFeedSource, latestFilter);
        if (filtered.length) {
            return filtered;
        }
        return latestFeedSource.length ? latestFeedSource : posts;
    }, [latestFeedSource, latestFilter, posts]);
    const countyPaths = useMemo(() => {
        if (!countyMap) return [];
        return buildCountyPaths(countyMap, COUNTY_MAP_WIDTH, COUNTY_MAP_HEIGHT);
    }, [countyMap]);

    useEffect(() => {
        if (heroStories.length <= 1) {
            return;
        }

        heroTimerRef.current = setInterval(() => {
            setHeroIndex((prev) => {
                const next = (prev + 1) % heroStories.length;
                heroScrollRef.current?.scrollTo({ x: next * HERO_SLIDE_WIDTH, animated: true });
                return next;
            });
        }, 6000);

        return () => {
            if (heroTimerRef.current) {
                clearInterval(heroTimerRef.current);
            }
        };
    }, [heroStories.length]);

    const onRefresh = () => {
        setRefreshing(true);
        void loadHome();
    };

    const openCountyModal = async () => {
        setShowCountyModal(true);
        if (countyMap || countyMapLoading) {
            return;
        }

        setCountyMapLoading(true);
        try {
            const data = await fetchCountyMap();
            setCountyMap(data);
        } catch (error) {
            console.error('Failed to load county map for quick action modal:', error);
        } finally {
            setCountyMapLoading(false);
        }
    };

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollOffsetRef.current = offsetY;
        setShowScrollTop(offsetY > 520);
    };

    const renderTopStrip = () => (
        <View style={[styles.topStrip, { paddingTop: insets.top + 4 }]}>
            <Text style={styles.topStripText}>{formatCompactDate()}</Text>
            <Text style={styles.topStripDivider}>•</Text>
            <Text style={styles.topStripTemp}>
                {weatherSnapshot?.today?.temperature !== undefined
                    ? `${weatherSnapshot.today.temperature}${weatherSnapshot.today.temperatureUnit || ''}`
                    : 'Maine'}
            </Text>
            <Text style={styles.topStripDivider}>•</Text>
            <Text style={styles.topStripLottery} numberOfLines={1}>
                {getLotteryLine(lottery)}
            </Text>
        </View>
    );

    const renderHeaderBand = () => (
        <View style={styles.headerBand}>
            <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/sections')}>
                <Menu size={22} color={colors.text} />
            </TouchableOpacity>
            <Image
                source={require('../../assets/header-mobile.png')}
                style={styles.headerLogo}
                resizeMode="contain"
            />
            <TouchableOpacity style={styles.headerIconButton} onPress={() => router.push('/search')}>
                <Search size={21} color={colors.text} />
            </TouchableOpacity>
        </View>
    );

    const renderHero = () => {
        if (!heroStories.length) {
            return null;
        }

        return (
            <View style={styles.heroWrap}>
                <ScrollView
                    ref={heroScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.heroScroller}
                    onMomentumScrollEnd={(event) => {
                        const newIndex = Math.round(event.nativeEvent.contentOffset.x / HERO_SLIDE_WIDTH);
                        setHeroIndex(newIndex);
                    }}
                >
                    {heroStories.map((post) => (
                        <TouchableOpacity
                            key={post.slug}
                            activeOpacity={0.92}
                            style={styles.heroSlide}
                            onPress={() => router.push(`/article/${post.slug}`)}
                        >
                            <Image
                                source={getImageUrl(post.image) ? { uri: getImageUrl(post.image)! } : require('../../assets/hero-fallback.jpeg')}
                                style={styles.heroImage}
                                resizeMode="cover"
                            />
                            <LinearGradient
                                colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.36)', 'rgba(0,0,0,0.96)']}
                                style={StyleSheet.absoluteFill}
                            />
                            <LinearGradient
                                colors={['rgba(239,43,45,0.03)', 'rgba(6,7,8,0)', 'rgba(6,7,8,0.5)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                            <View style={styles.heroContent}>
                                <View style={styles.topStoryChip}>
                                    <Text style={styles.topStoryChipText}>TOP STORY</Text>
                                </View>
                                <Text style={styles.heroTitle}>{post.title}</Text>
                                <Text style={styles.heroSummary} numberOfLines={3}>
                                    {post.excerpt || 'Maine communities are following this story closely as the latest developments continue to unfold.'}
                                </Text>
                                <Text style={styles.heroMeta}>
                                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(post.publishedDate))}
                                    {'  •  '}
                                    {formatRelativeTime(post.publishedDate)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={styles.heroDots}>
                    {heroStories.map((story, index) => (
                        <TouchableOpacity
                            key={story.slug}
                            onPress={() => {
                                setHeroIndex(index);
                                heroScrollRef.current?.scrollTo({ x: index * HERO_SLIDE_WIDTH, animated: true });
                            }}
                            style={[styles.heroDot, index === heroIndex && styles.heroDotActive]}
                        />
                    ))}
                </View>
            </View>
        );
    };

    const renderQuickLinks = () => (
        <View style={styles.quickLinksSection}>
            <View style={styles.quickGridRow}>
                {QUICK_TOP.map((item) => (
                    <TouchableOpacity key={item.label} style={styles.quickCard} onPress={() => router.push(item.route as any)}>
                        <item.icon size={22} color={item.color} />
                        <Text style={styles.quickCardLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.quickMiddleRow}>
                <TouchableOpacity style={styles.minuteImageWrap} onPress={() => router.push('/maine-minute')}>
                    <Image
                        source={{ uri: `${API_BASE_URL}/maine-minutes.png` }}
                        style={styles.minuteImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <View style={styles.quickMiddleActions}>
                    <TouchableOpacity style={[styles.quickCard, styles.quickCardCompact]} onPress={() => router.push('/category/editorial')}>
                        <ScrollText size={22} color={colors.purple} />
                        <Text style={styles.quickCardLabelCompact}>Editorial</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.quickCard, styles.quickCardCompact]} onPress={() => void openCountyModal()}>
                        <MapPinned size={22} color={colors.info} />
                        <Text style={styles.quickCardLabelCompact}>Counties</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.quickGridRow}>
                {QUICK_BOTTOM.map((item) => (
                    <TouchableOpacity key={item.label} style={styles.quickCard} onPress={() => router.push(item.route as any)}>
                        <item.icon size={22} color={item.color} />
                        <Text style={styles.quickCardLabel}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderTickerSpeedControls = () => (
        <View style={styles.tickerSpeedRow}>
            <View>
                <Text style={styles.tickerSpeedEyebrow}>Ticker controls</Text>
            </View>
            <View style={styles.tickerSpeedButtons}>
                {(['slow', 'normal', 'fast'] as const).map((speedOption) => (
                    <TouchableOpacity
                        key={speedOption}
                        style={[
                            styles.tickerSpeedButton,
                            tickerSpeed === speedOption && styles.tickerSpeedButtonActive,
                        ]}
                        onPress={() => setTickerSpeed(speedOption)}
                    >
                        <Text
                            style={[
                                styles.tickerSpeedButtonText,
                                tickerSpeed === speedOption && styles.tickerSpeedButtonTextActive,
                            ]}
                        >
                            {speedOption.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderNewsroomPreview = () => {
        if (!profiles.length) {
            return null;
        }

        return (
            <View style={styles.newsroomPanel}>
                <View style={styles.sectionHead}>
                    <View>
                        <Text style={styles.sectionKicker}>Meet the newsroom</Text>
                        <Text style={styles.sectionTitle}>Reporters & Contributors</Text>
                    </View>
                </View>
                {profiles.slice(0, 2).map((profile) => (
                    <View key={profile.id} style={styles.profileRow}>
                        {profile.avatar ? (
                            <Image source={{ uri: profile.avatar }} style={styles.profileAvatar} />
                        ) : (
                            <View style={[styles.profileAvatar, styles.profileAvatarFallback]}>
                                <Text style={styles.profileAvatarFallbackText}>{profile.name.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={styles.profileContent}>
                            <Text style={styles.profileName}>{profile.name}</Text>
                            <Text style={styles.profileRole}>{profile.role}</Text>
                            {profile.bio ? (
                                <Text style={styles.profileBio} numberOfLines={2}>
                                    {profile.bio}
                                </Text>
                            ) : null}
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    const latestVisible = latestHeadlines.slice(0, mobileVisibleCount);

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading Maine News Now...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <FlatList
                ref={flatListRef}
                data={latestVisible}
                keyExtractor={(item) => item.slug}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={(
                    <>
                        {renderTopStrip()}
                        {renderHeaderBand()}
                        <View style={styles.headerTickerZone}>
                            <NewsTicker label="TRENDING" items={trendingItems} speed={tickerSpeed} compact />
                        </View>
                        {renderHero()}
                        {renderQuickLinks()}
                        <View style={styles.latestSection}>
                            <View style={styles.breakingPanel}>
                                <View style={styles.breakingPanelHead}>
                                    <View>
                                        <Text style={styles.breakingKicker}>Live Desk</Text>
                                        <Text style={styles.breakingTitle}>Breaking News</Text>
                                    </View>
                                </View>
                                <NewsTicker label="BREAKING" items={breakingItems} speed={tickerSpeed} compact />
                                {renderTickerSpeedControls()}
                            </View>
                            <View style={styles.sectionHead}>
                                <Text style={styles.sectionTitle}>Latest Headlines</Text>
                                <TouchableOpacity onPress={() => router.push('/sections')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
                            <StoryDisplayToggle mode={headlineMode} onChange={setHeadlineMode} />
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                                {LATEST_FILTERS.map((filter) => (
                                    <TouchableOpacity
                                        key={filter}
                                        style={[styles.filterChip, latestFilter === filter && styles.filterChipActive]}
                                        onPress={() => {
                                            setLatestFilter(filter);
                                            setMobileVisibleCount(6);
                                        }}
                                    >
                                        <Text style={[styles.filterChipText, latestFilter === filter && styles.filterChipTextActive]}>
                                            {filter === 'editorial' ? 'Editorial' : filter}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </>
                )}
                renderItem={({ item }) => (
                    <View style={headlineMode === 'standard' ? styles.gridItemWrap : undefined}>
                        {headlineMode === 'list' ? (
                            <HeadlineRow
                                post={item}
                                timeLabel={formatRelativeTime(item.publishedDate)}
                                onPress={() => router.push(`/article/${item.slug}`)}
                            />
                        ) : headlineMode === 'standard' ? (
                            <StoryGridCard
                                post={item}
                                timeLabel={formatRelativeTime(item.publishedDate)}
                                onPress={() => router.push(`/article/${item.slug}`)}
                            />
                        ) : (
                            <StoryFeatureCard
                                post={item}
                                timeLabel={formatRelativeTime(item.publishedDate)}
                                onPress={() => router.push(`/article/${item.slug}`)}
                            />
                        )}
                    </View>
                )}
                numColumns={headlineMode === 'standard' ? 2 : 1}
                key={`home-${headlineMode}`}
                columnWrapperStyle={headlineMode === 'standard' ? styles.gridRow : undefined}
                ListFooterComponent={(
                    <>
                        {latestVisible.length < latestHeadlines.length ? (
                            <TouchableOpacity
                                style={styles.loadMoreButton}
                                onPress={() => setMobileVisibleCount((count) => count + 6)}
                            >
                                <Text style={styles.loadMoreText}>Load More Stories</Text>
                                <ChevronRight size={18} color={colors.text} />
                            </TouchableOpacity>
                        ) : null}
                        {renderNewsroomPreview()}

                        <View style={styles.footerPanel}>
                            <Text style={styles.footerTitle}>MAINE NEWS NOW</Text>
                            <Text style={styles.footerTagline}>Maine’s trusted local news source.</Text>
                            {traffic?.note ? <Text style={styles.footerNote}>{traffic.note}</Text> : null}
                        </View>
                    </>
                )}
                ListEmptyComponent={(
                    <View style={styles.emptyWrap}>
                        <CircleAlert size={20} color={colors.textDim} />
                        <Text style={styles.emptyText}>No headlines available right now.</Text>
                    </View>
                )}
            />

            {showScrollTop ? (
                <TouchableOpacity style={styles.scrollTopButton} onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
                    <ChevronUp size={22} color={colors.text} />
                </TouchableOpacity>
            ) : null}

            <Modal
                visible={showCountyModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowCountyModal(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalKicker}>Local Coverage</Text>
                                <Text style={styles.modalTitle}>Maine County Map</Text>
                            </View>
                            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCountyModal(false)}>
                                <X size={18} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalCopy}>Tap a county to open local coverage for that area.</Text>

                        {countyMapLoading ? (
                            <View style={styles.modalLoadingWrap}>
                                <ActivityIndicator color={colors.accent} />
                            </View>
                        ) : countyPaths.length ? (
                            <View style={styles.modalMapWrap}>
                                <Svg width="100%" height="100%" viewBox={`0 0 ${COUNTY_MAP_WIDTH} ${COUNTY_MAP_HEIGHT}`}>
                                    <G>
                                        {countyPaths.map((county) => (
                                            <Path
                                                key={county.slug || county.name}
                                                d={county.path}
                                                fill="#1f8b24"
                                                stroke="rgba(12,14,16,0.96)"
                                                strokeWidth={1.4}
                                                onPress={() => {
                                                    if (!county.slug) return;
                                                    setShowCountyModal(false);
                                                    router.push(`/county/${county.slug}` as any);
                                                }}
                                            />
                                        ))}
                                    </G>
                                </Svg>
                            </View>
                        ) : (
                            <View style={styles.modalLoadingWrap}>
                                <Text style={styles.modalEmptyText}>County map unavailable right now.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingWrap: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: fontSize.md,
    },
    listContent: {
        paddingBottom: 120,
    },
    topStrip: {
        minHeight: 34,
        paddingHorizontal: spacing.md,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#08090a',
    },
    topStripText: {
        color: colors.textMuted,
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
    },
    topStripDivider: {
        color: colors.textFaint,
        marginHorizontal: 8,
    },
    topStripTemp: {
        color: colors.highlight,
        fontSize: 11,
        fontFamily: 'Inter_600SemiBold',
    },
    topStripLottery: {
        color: colors.textMuted,
        flex: 1,
        fontSize: 11,
        fontFamily: 'Inter_400Regular',
    },
    headerBand: {
        height: 66,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
        backgroundColor: colors.backgroundElevated,
    },
    headerIconButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLogo: {
        width: 146,
        height: 42,
    },
    headerTickerZone: {
        paddingHorizontal: spacing.md,
        paddingTop: 12,
        backgroundColor: colors.background,
    },
    heroWrap: {
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        height: HERO_HEIGHT,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.backgroundPanel,
    },
    heroScroller: {
        height: HERO_HEIGHT,
    },
    heroSlide: {
        width: width - spacing.md * 2,
        height: HERO_HEIGHT,
        overflow: 'hidden',
    },
    heroImage: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    heroContent: {
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 22,
    },
    topStoryChip: {
        alignSelf: 'flex-start',
        backgroundColor: colors.accent,
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 9,
        marginBottom: spacing.md,
    },
    topStoryChipText: {
        color: '#fff',
        fontFamily: 'Oswald_700Bold',
        fontSize: 13,
        letterSpacing: 0.8,
    },
    heroTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 28,
        lineHeight: 34,
        textTransform: 'none',
        textShadowColor: 'rgba(0,0,0,0.55)',
        textShadowRadius: 12,
        marginBottom: spacing.sm,
    },
    heroSummary: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        lineHeight: 25,
        marginBottom: spacing.md,
    },
    heroMeta: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
    },
    heroDots: {
        position: 'absolute',
        bottom: 16,
        left: 18,
        flexDirection: 'row',
        gap: 7,
    },
    heroDot: {
        width: 7,
        height: 7,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.28)',
    },
    heroDotActive: {
        width: 24,
        backgroundColor: colors.accent,
    },
    quickLinksSection: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.lg,
        gap: spacing.md,
    },
    quickGridRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    quickMiddleRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'stretch',
        height: 104,
    },
    quickMiddleActions: {
        flex: 1,
        flexDirection: 'column',
        gap: spacing.sm,
    },
    quickCard: {
        flex: 1,
        minHeight: 74,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        gap: 8,
    },
    quickCardLarge: {
        minHeight: 104,
        height: 104,
    },
    quickCardCompact: {
        minHeight: 48,
        height: 48,
        flex: 1,
        paddingVertical: spacing.sm,
        gap: 4,
    },
    quickCardLabel: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
    },
    quickCardLabelLarge: {
        color: colors.text,
        fontFamily: 'Oswald_500Medium',
        fontSize: 18,
        letterSpacing: 0.4,
    },
    quickCardLabelCompact: {
        color: colors.text,
        fontFamily: 'Oswald_500Medium',
        fontSize: 13,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    minuteImageWrap: {
        flex: 1.2,
        minHeight: 104,
        height: 104,
        borderRadius: radius.lg,
        overflow: 'hidden',
    },
    minuteImage: {
        width: '100%',
        height: '100%',
        borderRadius: radius.lg,
    },
    latestSection: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.xl,
    },
    breakingPanel: {
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        marginBottom: spacing.lg,
    },
    breakingPanelHead: {
        marginBottom: spacing.md,
    },
    breakingKicker: {
        color: colors.textDim,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    breakingTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
    },
    tickerSpeedRow: {
        marginTop: spacing.md,
        marginBottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    tickerSpeedEyebrow: {
        color: colors.textFaint,
        fontFamily: 'Oswald_500Medium',
        fontSize: 13,
        letterSpacing: 1,
        marginBottom: 2,
    },
    tickerSpeedLabel: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
    },
    tickerSpeedButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    tickerSpeedButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: colors.borderDim,
    },
    tickerSpeedButtonActive: {
        backgroundColor: colors.accentSoft,
        borderColor: 'rgba(239,43,45,0.45)',
    },
    tickerSpeedButtonText: {
        color: colors.textDim,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 11,
    },
    tickerSpeedButtonTextActive: {
        color: colors.text,
    },
    sectionHead: {
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    sectionKicker: {
        color: colors.textDim,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 26,
        letterSpacing: 0.3,
    },
    viewAllText: {
        color: colors.textMuted,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
    },
    filterRow: {
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    gridRow: {
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    gridItemWrap: {
        flex: 1,
        marginBottom: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: colors.borderDim,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    filterChipText: {
        color: colors.textMuted,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        textTransform: 'capitalize',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    loadMoreButton: {
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundElevated,
        paddingVertical: 14,
    },
    loadMoreText: {
        color: colors.text,
        fontFamily: 'Oswald_500Medium',
        fontSize: 16,
    },
    newsroomPanel: {
        marginHorizontal: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
    },
    profileRow: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.md2,
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
    },
    profileAvatar: {
        width: 58,
        height: 58,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundSoft,
    },
    profileAvatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileAvatarFallbackText: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 22,
    },
    profileContent: {
        flex: 1,
    },
    profileName: {
        color: colors.text,
        fontFamily: 'Oswald_500Medium',
        fontSize: 20,
    },
    profileRole: {
        color: colors.accent,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        marginTop: 2,
        marginBottom: 4,
    },
    profileBio: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 20,
    },
    footerPanel: {
        marginHorizontal: spacing.md,
        marginTop: spacing.xl,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        alignItems: 'center',
    },
    footerTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
        letterSpacing: 0.6,
    },
    footerTagline: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        marginTop: 4,
    },
    footerNote: {
        marginTop: spacing.md,
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        textAlign: 'center',
    },
    emptyWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.sm,
    },
    emptyText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
    },
    scrollTopButton: {
        position: 'absolute',
        right: spacing.lg,
        bottom: spacing.xl,
        width: 46,
        height: 46,
        borderRadius: radius.pill,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 6,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(6,7,8,0.84)',
        justifyContent: 'center',
        padding: spacing.md,
    },
    modalSheet: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    modalKicker: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    modalTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 25,
    },
    modalCloseButton: {
        width: 38,
        height: 38,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCopy: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    modalMapWrap: {
        width: '100%',
        aspectRatio: COUNTY_MAP_WIDTH / COUNTY_MAP_HEIGHT,
        borderWidth: 1,
        borderColor: colors.borderDim,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
    },
    modalLoadingWrap: {
        minHeight: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalEmptyText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
    },
});
