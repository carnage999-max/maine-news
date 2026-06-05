import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronUp, Search as SearchIcon } from 'lucide-react-native';
import StoryDisplayToggle, { type StoryDisplayMode } from '../components/common/StoryDisplayToggle';
import StoryFeatureCard from '../components/common/StoryFeatureCard';
import StoryGridCard from '../components/common/StoryGridCard';
import HeadlineRow from '../components/home/HeadlineRow';
import usePersistedStoryDisplayMode from '../components/common/usePersistedStoryDisplayMode';
import { colors, radius, spacing } from '../constants/theme';
import { fetchPosts, searchPosts, type Post } from '../services/api';

function formatRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(past);
}

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [displayMode, setDisplayMode] = usePersistedStoryDisplayMode('story-display-search');
    const flatListRef = React.useRef<FlatList>(null);
    const scrollOffsetRef = React.useRef(0);
    const previousDisplayModeRef = React.useRef<StoryDisplayMode>(displayMode);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchPosts();
                setAllPosts(data);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        }
        void load();
    }, []);

    useEffect(() => {
        setFilteredPosts(query.trim() ? searchPosts(allPosts, query) : []);
    }, [query, allPosts]);

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

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Search',
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <View style={styles.heroPanel}>
                <Text style={styles.kicker}>Search the newsroom</Text>
                <Text style={styles.title}>Find Stories Fast</Text>
                <Text style={styles.subtitle}>Search headlines, authors, or topics across Maine News Now.</Text>
                <StoryDisplayToggle mode={displayMode} onChange={setDisplayMode} />
            </View>

            <View style={styles.searchBar}>
                <SearchIcon size={18} color={colors.textDim} />
                <TextInput
                    style={styles.input}
                    placeholder="Search stories, topics, or authors..."
                    placeholderTextColor={colors.textDim}
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                    selectionColor={colors.accent}
                />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.accent} />
                </View>
            ) : (
                <>
                    <FlatList
                        ref={flatListRef}
                        data={filteredPosts}
                        keyExtractor={(item) => item.slug}
                        onScroll={(event) => {
                            const offsetY = event.nativeEvent.contentOffset.y;
                            scrollOffsetRef.current = offsetY;
                            setShowScrollTop(offsetY > 420);
                        }}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.list}
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
                        key={`search-${displayMode}`}
                        columnWrapperStyle={displayMode === 'standard' ? styles.gridRow : undefined}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyText}>
                                    {query.trim() ? `No results for "${query}"` : 'Type to start searching the newsroom.'}
                                </Text>
                            </View>
                        }
                    />
                    {showScrollTop ? (
                        <TouchableOpacity style={styles.scrollTopButton} onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
                            <ChevronUp size={22} color={colors.text} />
                        </TouchableOpacity>
                    ) : null}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    heroPanel: {
        margin: spacing.md,
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
    title: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 28 },
    subtitle: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        lineHeight: 22,
        marginTop: spacing.sm,
        marginBottom: spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundElevated,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        minHeight: 54,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        marginLeft: spacing.sm,
    },
    list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
    gridRow: {
        gap: spacing.sm,
    },
    gridItemWrap: {
        flex: 1,
        marginBottom: spacing.sm,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { padding: spacing.xxl, alignItems: 'center' },
    emptyText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
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
