import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronUp } from 'lucide-react-native';
import SponsorBanner from '../../components/common/SponsorBanner';
import StoryDisplayToggle, { type StoryDisplayMode } from '../../components/common/StoryDisplayToggle';
import StoryFeatureCard from '../../components/common/StoryFeatureCard';
import StoryGridCard from '../../components/common/StoryGridCard';
import usePersistedStoryDisplayMode from '../../components/common/usePersistedStoryDisplayMode';
import HeadlineRow from '../../components/home/HeadlineRow';
import { colors, radius, spacing } from '../../constants/theme';
import { fetchPosts, filterByCategory, type Post } from '../../services/api';

function formatRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(past);
}

export default function CategoryScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [displayMode, setDisplayMode] = usePersistedStoryDisplayMode(
        `story-display-category-${typeof id === 'string' ? id : 'all'}`
    );
    const flatListRef = React.useRef<FlatList>(null);

    const categoryName = useMemo(
        () => (typeof id === 'string' ? id.replace(/-/g, ' ') : 'section'),
        [id]
    );

    const loadPosts = async () => {
        try {
            const allPosts = await fetchPosts();
            const filtered = filterByCategory(allPosts, typeof id === 'string' ? id : 'all');
            setPosts(filtered);
        } catch (error) {
            console.error('Error loading category posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadPosts();
    }, [id]);

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
                    title: categoryName.toUpperCase(),
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <FlatList
                ref={flatListRef}
                data={posts}
                keyExtractor={(item) => item.slug}
                onScroll={(event) => setShowScrollTop(event.nativeEvent.contentOffset.y > 420)}
                scrollEventThrottle={16}
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadPosts(); }} tintColor={colors.accent} />}
                ListHeaderComponent={
                    <View style={styles.heroPanel}>
                        <Text style={styles.kicker}>Section feed</Text>
                        <Text style={styles.title}>{categoryName}</Text>
                        <Text style={styles.subtitle}>
                            Latest reporting, updates, and headlines from the {categoryName} desk.
                        </Text>
                        <StoryDisplayToggle mode={displayMode} onChange={setDisplayMode} />
                        <SponsorBanner compact />
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
                key={`category-${displayMode}`}
                columnWrapperStyle={displayMode === 'standard' ? styles.gridRow : undefined}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>No stories found in this section yet.</Text>
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
    kicker: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 6,
    },
    title: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 30,
        textTransform: 'capitalize',
    },
    subtitle: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        lineHeight: 22,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
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
