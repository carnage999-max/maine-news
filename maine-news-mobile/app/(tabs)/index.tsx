import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CircleAlert, CloudSun, Landmark, Map, Radio, ScrollText, Search, Shield, TriangleAlert, Tv2, Building2, Menu, ChevronUp, ChevronRight } from 'lucide-react-native';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeadlineRow from '../../components/home/HeadlineRow';
import NewsTicker from '../../components/home/NewsTicker';
import { colors, fontSize, radius, spacing } from '../../constants/theme';
import {
    API_BASE_URL,
    fetchLotterySummary,
    fetchNewsroomProfiles,
    fetchPosts,
    fetchTrafficReport,
    fetchWeatherReport,
    getImageUrl,
    type LotterySummary,
    type NewsroomProfile,
    type Post,
    type TrafficReport,
    type WeatherReport,
} from '../../services/api';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 438;
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

    return posts.filter((post) => post.category.toLowerCase() === activeFilter);
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
    const powerball = lottery?.powerball;
    if (!powerball?.numbers?.length) {
        return 'Powerball pending';
    }

    const joinedNumbers = powerball.numbers.join(' ');
    return powerball.extra
        ? `Powerball ${joinedNumbers} ${powerball.extra}`
        : `Powerball ${joinedNumbers}`;
}

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList<Post>>(null);
    const heroScrollRef = useRef<ScrollView>(null);
    const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const heroStories = useMemo(() => posts.slice(0, 7), [posts]);
    const topStory = heroStories[heroIndex] || posts[0];
    const weatherSnapshot = useMemo(() => getWeatherSnapshot(weather), [weather]);
    const trendingItems = useMemo(() => posts.slice(0, 10).map((post) => post.title), [posts]);
    const breakingItems = useMemo(() => {
        const incidentLabels = traffic?.incidents?.slice(0, 4).map((incident) => incident.description) || [];
        if (incidentLabels.length) {
            return incidentLabels;
        }
        return posts.slice(0, 8).map((post) => post.title);
    }, [posts, traffic]);
    const latestHeadlines = useMemo(() => getLatestSectionPosts(posts.slice(1), latestFilter), [posts, latestFilter]);

    useEffect(() => {
        if (heroStories.length <= 1) {
            return;
        }

        heroTimerRef.current = setInterval(() => {
            setHeroIndex((prev) => {
                const next = (prev + 1) % heroStories.length;
                heroScrollRef.current?.scrollTo({ x: next * width, animated: true });
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

    const handleScroll = (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
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
                source={require('../../assets/maine-news-now.png')}
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
                    onMomentumScrollEnd={(event) => {
                        const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                        setHeroIndex(newIndex);
                    }}
                    onScrollBeginDrag={() => {
                        if (heroTimerRef.current) {
                            clearInterval(heroTimerRef.current);
                        }
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
                                heroScrollRef.current?.scrollTo({ x: index * width, animated: true });
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
                <TouchableOpacity style={styles.minuteImageWrap} onPress={() => router.push('/video-hub')}>
                    <Image
                        source={{ uri: `${API_BASE_URL}/maine-minutes.png` }}
                        style={styles.minuteImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.quickCard, styles.quickCardLarge]} onPress={() => router.push('/category/editorial')}>
                    <ScrollText size={26} color={colors.purple} />
                    <Text style={styles.quickCardLabelLarge}>Editorial</Text>
                </TouchableOpacity>
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
            <Text style={styles.tickerSpeedLabel}>Ticker Speed</Text>
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
                            <NewsTicker label="BREAKING" items={breakingItems} speed={tickerSpeed} compact />
                            {renderTickerSpeedControls()}
                            <View style={styles.sectionHead}>
                                <Text style={styles.sectionTitle}>Latest Headlines</Text>
                                <TouchableOpacity onPress={() => router.push('/sections')}>
                                    <Text style={styles.viewAllText}>View All</Text>
                                </TouchableOpacity>
                            </View>
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
                                            {filter}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </>
                )}
                renderItem={({ item }) => (
                    <HeadlineRow
                        post={item}
                        timeLabel={formatRelativeTime(item.publishedDate)}
                        onPress={() => router.push(`/article/${item.slug}`)}
                    />
                )}
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
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.backgroundPanel,
    },
    heroSlide: {
        width: width - spacing.md * 2,
        height: HERO_HEIGHT,
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
    minuteImageWrap: {
        flex: 1.2,
        minHeight: 104,
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
    tickerSpeedRow: {
        marginTop: spacing.md,
        marginBottom: spacing.md2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
});
