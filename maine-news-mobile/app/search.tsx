import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronUp, Search as SearchIcon } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { fetchPosts, searchPosts, type Post } from '../services/api';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);
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
                        onScroll={(event) => setShowScrollTop(event.nativeEvent.contentOffset.y > 420)}
                        scrollEventThrottle={16}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.resultCard} onPress={() => router.push(`/article/${item.slug}`)}>
                                <Text style={styles.resultCategory}>{item.category.toUpperCase()}</Text>
                                <Text style={styles.resultTitle}>{item.title}</Text>
                                <Text style={styles.resultMeta}>{item.author}</Text>
                            </TouchableOpacity>
                        )}
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
    resultCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    resultCategory: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 4,
    },
    resultTitle: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 17,
        lineHeight: 23,
    },
    resultMeta: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: 8,
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
