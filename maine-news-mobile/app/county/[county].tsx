import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronUp } from 'lucide-react-native';
import StoryDisplayToggle, { type StoryDisplayMode } from '../../components/common/StoryDisplayToggle';
import StoryFeatureCard from '../../components/common/StoryFeatureCard';
import StoryGridCard from '../../components/common/StoryGridCard';
import usePersistedStoryDisplayMode from '../../components/common/usePersistedStoryDisplayMode';
import HeadlineRow from '../../components/home/HeadlineRow';
import { colors, radius, spacing } from '../../constants/theme';
import { fetchCountyFeed, type CountyFeedResponse } from '../../services/api';

function formatRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(past);
}

export default function CountyFeedScreen() {
    const { county } = useLocalSearchParams();
    const router = useRouter();
    const [feed, setFeed] = useState<CountyFeedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);
    const scrollOffsetRef = React.useRef(0);

    const countySlug = typeof county === 'string' ? county : '';
    const [displayMode, setDisplayMode] = usePersistedStoryDisplayMode(
        `story-display-county-${countySlug || 'default'}`
    );
    const previousDisplayModeRef = React.useRef<StoryDisplayMode>(displayMode);

    const loadFeed = async () => {
        try {
            const data = await fetchCountyFeed(countySlug);
            setFeed(data);
        } catch (error) {
            console.error('Failed to load county feed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (countySlug) {
            void loadFeed();
        }
    }, [countySlug]);

    useEffect(() => {
        if (previousDisplayModeRef.current === displayMode) {
            return;
        }

        previousDisplayModeRef.current = displayMode;
        requestAnimationFrame(() => {
            flatListRef.current?.scrollToOffset({
                offset: scrollOffsetRef.current,
                animated: false,
            });
        });
    }, [displayMode]);

    if (loading) {
        return (
            <View style={styles.centerWrap}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: feed?.county.name ? `${feed.county.name} County` : 'County News',
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <FlatList
                ref={flatListRef}
                data={feed?.posts || []}
                keyExtractor={(item) => item.slug}
                onScroll={(event) => {
                    const offsetY = event.nativeEvent.contentOffset.y;
                    scrollOffsetRef.current = offsetY;
                    setShowScrollTop(offsetY > 420);
                }}
                scrollEventThrottle={16}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadFeed(); }} tintColor={colors.accent} />}
                ListHeaderComponent={
                    <View style={styles.heroPanel}>
                        <Text style={styles.kicker}>Local county news</Text>
                        <Text style={styles.title}>{feed?.county.name || 'County'} County</Text>
                        <Text style={styles.subtitle}>
                            Latest stories matched to this county and nearby communities across Maine.
                        </Text>
                        <TouchableOpacity style={styles.switchButton} onPress={() => router.push('/local')}>
                            <Text style={styles.switchButtonText}>Switch County</Text>
                        </TouchableOpacity>
                        <StoryDisplayToggle mode={displayMode} onChange={setDisplayMode} />
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={displayMode === 'standard' ? styles.gridItemWrap : undefined}>
                        {displayMode === 'list' ? (
                            <HeadlineRow
                                post={item}
                                timeLabel={formatRelativeTime(item.publishedDate)}
                                onPress={() => router.push(`/article/${item.slug}`)}
                            />
                        ) : displayMode === 'standard' ? (
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
                numColumns={displayMode === 'standard' ? 2 : 1}
                key={`county-${displayMode}`}
                columnWrapperStyle={displayMode === 'standard' ? styles.gridRow : undefined}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>No recent stories matched to this county yet.</Text>
                    </View>
                }
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
    container: { flex: 1, backgroundColor: colors.background },
    centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    heroPanel: {
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.xl,
    },
    kicker: { color: colors.accent, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1, marginBottom: 6 },
    title: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 30 },
    subtitle: { color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
    switchButton: {
        alignSelf: 'flex-start',
        marginTop: spacing.md,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    switchButtonText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    gridRow: {
        gap: spacing.sm,
    },
    gridItemWrap: {
        flex: 1,
        marginBottom: spacing.sm,
    },
    emptyWrap: { paddingVertical: spacing.xl, alignItems: 'center' },
    emptyText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 14 },
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
        elevation: 5,
    },
});
