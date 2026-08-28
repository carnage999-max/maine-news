import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
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
import { ChevronUp, Play, Share2, Tv2, X } from 'lucide-react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { colors, radius, spacing } from '../../constants/theme';
import { fetchVideos, type Video } from '../../services/api';

export default function VideoHub() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('ALL');
    const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const flatListRef = React.useRef<FlatList>(null);

    const loadVideos = async () => {
        try {
            const data = await fetchVideos();
            setVideos(data);
        } catch (error) {
            console.error('Error loading videos:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadVideos();
    }, []);

    const playVideo = async (item: Video) => {
        const { status } = await getTrackingPermissionsAsync();
        if (status === 'undetermined') {
            await requestTrackingPermissionsAsync();
        }
        setPlayingVideo(item);
    };

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const filteredVideos = useMemo(() => {
        if (activeTab === 'ALL') return videos;
        if (activeTab === 'LATEST') return [...videos].sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
        if (activeTab === 'POPULAR') return [...videos].sort((a, b) => Number.parseInt(b.views) - Number.parseInt(a.views));
        return videos.filter((video) => /series|special|maine/i.test(video.category));
    }, [activeTab, videos]);

    const renderVideoItem = ({ item }: { item: Video }) => {
        const thumbUrl = item.thumbnail || (getYoutubeId(item.videoUrl) ? `https://img.youtube.com/vi/${getYoutubeId(item.videoUrl)}/hqdefault.jpg` : null);

        return (
            <TouchableOpacity style={styles.videoCard} activeOpacity={0.88} onPress={() => void playVideo(item)}>
                <View style={styles.thumbnailContainer}>
                    {thumbUrl ? (
                        <Image source={{ uri: thumbUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                    ) : null}
                    <View style={styles.thumbnailOverlay}>
                        <Play size={34} color="#fff" fill="#fff" />
                    </View>
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{item.duration}</Text>
                    </View>
                </View>

                <View style={styles.videoInfo}>
                    <View style={styles.videoHeader}>
                        <Text style={styles.videoCategory}>{item.category.toUpperCase()}</Text>
                        <Text style={styles.viewCount}>{item.views} views</Text>
                    </View>
                    <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
                    <TouchableOpacity style={styles.shareRow}>
                        <Share2 size={16} color={colors.textDim} />
                        <Text style={styles.shareText}>Share</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={filteredVideos}
                keyExtractor={(item) => item.id}
                onScroll={(event) => setShowScrollTop(event.nativeEvent.contentOffset.y > 420)}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadVideos(); }} tintColor={colors.accent} />}
                ListHeaderComponent={
                    <>
                        <View style={styles.heroPanel}>
                            <Text style={styles.heroKicker}>Watch the newsroom</Text>
                            <Text style={styles.heroTitle}>Video Hub</Text>
                            <Text style={styles.heroText}>Latest video coverage, featured broadcasts, and Maine Minute updates from the newsroom.</Text>
                        </View>

                        <View style={styles.tabRail}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRailContent}>
                                {['ALL', 'LATEST', 'POPULAR', 'SERIES'].map((tab) => (
                                    <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                                        <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.featuredHeader}>
                            <Tv2 size={18} color={colors.accent} />
                            <Text style={styles.featuredLabel}>Featured Broadcasts</Text>
                        </View>
                    </>
                }
                renderItem={renderVideoItem}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No videos found right now.</Text>
                        </View>
                    ) : (
                        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
                    )
                }
            />

            {showScrollTop ? (
                <TouchableOpacity style={styles.scrollTopButton} onPress={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}>
                    <ChevronUp size={22} color={colors.text} />
                </TouchableOpacity>
            ) : null}

            <Modal visible={playingVideo !== null} animationType="slide" transparent={false} onRequestClose={() => setPlayingVideo(null)}>
                <View style={styles.playerContainer}>
                    <View style={styles.playerHeader}>
                        <TouchableOpacity onPress={() => setPlayingVideo(null)} style={styles.closeButton}>
                            <X size={22} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.playerTitle} numberOfLines={1}>{playingVideo?.title}</Text>
                    </View>

                    <View style={styles.videoWrapper}>
                        {playingVideo && getYoutubeId(playingVideo.videoUrl) ? (
                            <YoutubePlayer height={220} play videoId={getYoutubeId(playingVideo.videoUrl)!} />
                        ) : (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Video format not supported in-app.</Text>
                            </View>
                        )}
                    </View>

                    <ScrollView style={styles.playerInfo}>
                        <Text style={styles.playerCategory}>{playingVideo?.category.toUpperCase()}</Text>
                        <Text style={styles.playerMainTitle}>{playingVideo?.title}</Text>
                        <Text style={styles.playerViews}>{playingVideo?.views} views • {playingVideo?.publishedDate}</Text>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
    heroPanel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.xl,
        marginBottom: spacing.md,
    },
    heroKicker: { color: colors.accent, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1, marginBottom: 6 },
    heroTitle: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 30 },
    heroText: { color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
    tabRail: { marginBottom: spacing.md },
    tabRailContent: { gap: spacing.sm },
    tab: {
        paddingHorizontal: spacing.md,
        paddingVertical: 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.borderDim,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginRight: spacing.sm,
    },
    tabActive: {
        backgroundColor: colors.accentSoft,
        borderColor: 'rgba(239,43,45,0.4)',
    },
    tabText: { color: colors.textDim, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
    tabTextActive: { color: colors.text },
    featuredHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
    featuredLabel: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 22 },
    videoCard: {
        marginBottom: spacing.lg,
        backgroundColor: colors.backgroundElevated,
        borderRadius: radius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    thumbnailContainer: {
        width: '100%',
        height: 210,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    thumbnailOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.28)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(6,7,8,0.82)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    durationText: { color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' },
    videoInfo: { padding: spacing.md },
    videoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    videoCategory: { fontFamily: 'Oswald_500Medium', fontSize: 11, color: colors.accent, letterSpacing: 1 },
    viewCount: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textDim },
    videoTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 18, color: colors.text, lineHeight: 24, marginBottom: spacing.md },
    shareRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    shareText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 12 },
    playerContainer: { flex: 1, backgroundColor: '#000' },
    playerHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 16, paddingHorizontal: spacing.md, backgroundColor: '#000' },
    closeButton: { padding: 8, marginRight: 8 },
    playerTitle: { flex: 1, color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
    videoWrapper: { backgroundColor: '#000', justifyContent: 'center' },
    playerInfo: { flex: 1, padding: spacing.xl, backgroundColor: colors.backgroundElevated },
    playerCategory: { fontFamily: 'Oswald_500Medium', fontSize: 12, color: colors.accent, letterSpacing: 1, marginBottom: 8 },
    playerMainTitle: { fontFamily: 'Oswald_700Bold', fontSize: 24, color: colors.text, lineHeight: 31, marginBottom: 12 },
    playerViews: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textDim },
    errorContainer: { height: 200, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#fff', fontFamily: 'Inter_400Regular' },
    emptyContainer: { padding: spacing.xxl, alignItems: 'center' },
    emptyText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textDim },
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
