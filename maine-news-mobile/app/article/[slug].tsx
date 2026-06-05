import { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Share,
    Image,
    RefreshControl
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { fetchPostBySlug, fetchPosts, getImageUrl, type Post } from '../../services/api';
import { colors, typography, spacing, fontSize, radius } from '../../constants/theme';
import { Share2, Volume2, Type, Facebook, Instagram, Youtube, Clock3, ChevronRight } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Linking } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const FONT_SIZES = {
    S: 16,
    M: 20,
    L: 24,
};

const XIcon = ({ color }: { color: string }) => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill={color} />
    </Svg>
);

const EDITORIAL_DISCLAIMER_SHORT =
    "This editorial reflects the author's opinions and commentary on matters of public concern. Statements are expressions of opinion, not assertions of fact, and are protected under the First Amendment.";

export default function ArticleDetail() {
    const router = useRouter();
    const { slug } = useLocalSearchParams();
    const [post, setPost] = useState<any>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const speakingRef = useRef(false);
    const [sizeKey, setSizeKey] = useState<'S' | 'M' | 'L'>('M');

    // Proper Markdoc Node Renderer for React Native
    const renderNode = (node: any, index: number): React.ReactNode => {
        if (!node) return null;

        if (typeof node === 'string') {
            return <Text key={index} style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>{node}</Text>;
        }

        const { type, children, attributes } = node;

        const isInline = (n: any) =>
            typeof n === 'string' ||
            ['text', 'strong', 'em', 'link', 's', 'code'].includes(n.type);

        const renderInlineChildren = (childs: any[]) => {
            if (!childs) return null;
            return childs.map((child, i) => {
                if (!child) return null;
                if (typeof child === 'string') return child;
                if (child.type === 'text') return child.attributes?.content || (typeof child.children?.[0] === 'string' ? child.children[0] : '');

                // Handle nested inline formatting
                const nestedStyle: any = {};
                if (child.type === 'strong') nestedStyle.fontFamily = 'Inter_600SemiBold';
                if (child.type === 'em') nestedStyle.fontStyle = 'italic';
                if (child.type === 'link') nestedStyle.color = colors.accent;

                return (
                    <Text key={i} style={nestedStyle}>
                        {child.children ? renderInlineChildren(child.children) : (child.attributes?.content || '')}
                    </Text>
                );
            });
        };

        switch (type) {
            case 'document':
                return children?.map((child: any, i: number) => renderNode(child, i));

            case 'text':
                return (
                    <Text key={index} style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>
                        {attributes?.content || (children ? renderInlineChildren(children) : '')}
                    </Text>
                );

            case 'paragraph':
                // Check if paragraph contains any block-level children (like images)
                const hasBlock = children?.some((c: any) => !isInline(c));

                if (!hasBlock) {
                    return (
                        <View key={index} style={styles.paragraphContainer}>
                            <Text style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>
                                {renderInlineChildren(children)}
                            </Text>
                        </View>
                    );
                }

                // If it has blocks, group consecutive inline nodes
                const segments: React.ReactNode[] = [];
                let currentInlines: any[] = [];

                children?.forEach((child: any, i: number) => {
                    if (isInline(child)) {
                        currentInlines.push(child);
                    } else {
                        if (currentInlines.length > 0) {
                            segments.push(
                                <Text key={`inline-${i}`} style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>
                                    {renderInlineChildren(currentInlines)}
                                </Text>
                            );
                            currentInlines = [];
                        }
                        segments.push(renderNode(child, i));
                    }
                });

                if (currentInlines.length > 0) {
                    segments.push(
                        <Text key="inline-last" style={[styles.paragraph, { fontSize: FONT_SIZES[sizeKey] }]}>
                            {renderInlineChildren(currentInlines)}
                        </Text>
                    );
                }

                return (
                    <View key={index} style={styles.paragraphContainer}>
                        {segments}
                    </View>
                );

            case 'heading':
                const level = attributes?.level || 1;
                return (
                    <Text key={index} style={[styles.heading, level === 1 && styles.h1, level === 2 && styles.h2]}>
                        {renderInlineChildren(children)}
                    </Text>
                );

            case 'image':
                const imageUrl = getImageUrl(attributes?.src);
                return (
                    <View key={index} style={styles.imageContainer}>
                        {imageUrl ? (
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.inlineImage}
                                resizeMode="cover"
                            />
                        ) : null}
                        {(attributes?.alt || attributes?.title) ? (
                            <Text style={styles.imageCaption}>{attributes?.alt || attributes?.title}</Text>
                        ) : null}
                    </View>
                );

            case 'list':
                return (
                    <View key={index} style={styles.list}>
                        {children?.map((child: any, i: number) => renderNode(child, i))}
                    </View>
                );

            case 'item':
                return (
                    <View key={index} style={styles.listItem}>
                        <Text style={[styles.bullet, { fontSize: FONT_SIZES[sizeKey] }]}>• </Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.listItemText, { fontSize: FONT_SIZES[sizeKey] }]}>
                                {renderInlineChildren(children)}
                            </Text>
                        </View>
                    </View>
                );

            default:
                if (children) {
                    return children.map((child: any, i: number) => renderNode(child, i));
                }
                return null;
        }
    };

    const loadArticle = async () => {
        if (typeof slug !== 'string') {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        const [data, allPosts] = await Promise.all([
            fetchPostBySlug(slug),
            fetchPosts(),
        ]);

        setPost(data);

        if (data) {
            const related = allPosts
                .filter((candidate) => candidate.slug !== slug)
                .filter((candidate) => {
                    const candidateCategory = (candidate.category || '').toLowerCase();
                    const currentCategory = (data.category || '').toLowerCase();
                    if (candidateCategory && currentCategory && candidateCategory === currentCategory) {
                        return true;
                    }
                    return candidate.isNational === data.isNational;
                })
                .slice(0, 4);

            setRelatedPosts(related);
        } else {
            setRelatedPosts([]);
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        void loadArticle();
    }, [slug]);

    const toggleTextSize = () => {
        const sequence: ('S' | 'M' | 'L')[] = ['S', 'M', 'L'];
        const nextIndex = (sequence.indexOf(sizeKey) + 1) % sequence.length;
        setSizeKey(sequence[nextIndex]);
    };

    const handleShare = async () => {
        try {
            const shareUrl = `https://mainenewsnow.com/article/${slug}`;
            await Share.share({
                title: post.title,
                message: `${post.title}\n\nRead more at: ${shareUrl}`,
                url: shareUrl,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const renderSocialBar = () => {
        return (
            <View style={styles.socialBar}>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr')}>
                    <Facebook size={20} color="#1877F2" fill="#1877F2" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr')}>
                    <Instagram size={20} color="#E4405F" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://x.com/MaineNews_Now')}>
                    <XIcon color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.mylibertysocial.com/app/pages/200')}>
                    <Image source={require('../../assets/liberty-social.png')} style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.youtube.com/@MaineNewsToday')}>
                    <Youtube size={20} color="#FF0000" />
                </TouchableOpacity>
            </View>
        );
    };
    const toggleSpeech = async () => {
        if (isSpeaking) {
            speakingRef.current = false;
            Speech.stop();
            setIsSpeaking(false);
        } else {
            const extractText = (node: any): string => {
                if (!node) return '';
                if (typeof node === 'string') return node;
                if (node.attributes?.content) return node.attributes.content;
                if (node.children) return node.children.map(extractText).join(' ');
                return '';
            };

            const fullText = `${post.title}. By ${post.author}. ${extractText(post.content)}`;

            // Chunking logic to avoid 4000 char limit
            const chunks: string[] = [];
            const maxLength = 3500;

            let currentIdx = 0;
            while (currentIdx < fullText.length) {
                let chunk = fullText.substring(currentIdx, currentIdx + maxLength);

                // Try to find a good breaking point (period, exclamation, question mark)
                if (currentIdx + maxLength < fullText.length) {
                    const lastSentenceEnd = Math.max(
                        chunk.lastIndexOf('. '),
                        chunk.lastIndexOf('! '),
                        chunk.lastIndexOf('? ')
                    );

                    if (lastSentenceEnd > maxLength * 0.5) {
                        chunk = chunk.substring(0, lastSentenceEnd + 1);
                    }
                }

                chunks.push(chunk.trim());
                currentIdx += chunk.length;
            }

            speakingRef.current = true;
            setIsSpeaking(true);

            for (const chunk of chunks) {
                if (!speakingRef.current) break;

                await new Promise((resolve) => {
                    Speech.speak(chunk, {
                        onDone: () => resolve(null),
                        onStopped: () => resolve(null),
                        onError: (error) => {
                            console.error('Speech error:', error);
                            resolve(null);
                        }
                    });
                });
            }

            setIsSpeaking(false);
            speakingRef.current = false;
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (!post) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Article not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                title: '',
                headerStyle: { backgroundColor: colors.backgroundElevated },
                headerTintColor: colors.text,
                headerBackButtonDisplayMode: 'minimal',
                headerRight: () => (
                    <View style={styles.headerActions}>
                        <TouchableOpacity onPress={toggleTextSize} style={styles.headerIcon}>
                            <Type size={24} color={colors.text} />
                            <Text style={styles.sizeIndicator}>{sizeKey}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleSpeech} style={styles.headerIcon}>
                            <Volume2 size={24} color={isSpeaking ? colors.accent : colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={styles.headerIcon}>
                            <Share2 size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                )
            }} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadArticle(); }} tintColor={colors.accent} />}
            >
                <View style={styles.header}>
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{post.category.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.title}>{post.title}</Text>
                    <View style={styles.meta}>
                        <Text style={styles.author}>By {post.author}</Text>
                        <Text style={styles.separator}>///</Text>
                        <Text style={styles.date}>{new Date(post.publishedDate).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric'
                        })}</Text>
                    </View>
                </View>

                <View style={styles.heroImageWrap}>
                    <Image
                        source={getImageUrl(post.image) ? { uri: getImageUrl(post.image)! } : require('../../assets/hero-fallback.jpeg')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    />
                </View>

                <View style={styles.content}>
                    {renderNode(post.content, 0)}
                </View>

                {post.category === 'editorial' && (
                    <View style={styles.disclaimer}>
                        <Text style={styles.disclaimerText}>{EDITORIAL_DISCLAIMER_SHORT}</Text>
                    </View>
                )}

                {renderSocialBar()}

                {relatedPosts.length ? (
                    <View style={styles.relatedSection}>
                        <View style={styles.relatedHead}>
                            <View>
                                <Text style={styles.relatedKicker}>More Coverage</Text>
                                <Text style={styles.relatedTitle}>Related Posts</Text>
                            </View>
                        </View>
                        {relatedPosts.map((relatedPost) => {
                            const relatedImage = getImageUrl(relatedPost.image);
                            return (
                                <TouchableOpacity
                                    key={relatedPost.slug}
                                    style={styles.relatedRow}
                                    activeOpacity={0.86}
                                    onPress={() => router.push(`/article/${relatedPost.slug}`)}
                                >
                                    <Image
                                        source={relatedImage ? { uri: relatedImage } : require('../../assets/hero-fallback.jpeg')}
                                        style={styles.relatedImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.relatedContent}>
                                        <Text style={styles.relatedCategory}>
                                            {(relatedPost.category || 'news').toUpperCase()}
                                        </Text>
                                        <Text style={styles.relatedRowTitle} numberOfLines={2}>
                                            {relatedPost.title}
                                        </Text>
                                        <View style={styles.relatedMeta}>
                                            <Clock3 size={12} color={colors.textDim} />
                                            <Text style={styles.relatedMetaText}>
                                                {new Date(relatedPost.publishedDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                    <ChevronRight size={18} color={colors.textFaint} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : null}

                <View style={styles.footer}>
                    <Text style={styles.footerBranding}>MAINE NEWS NOW</Text>
                    <Text style={styles.footerTagline}>Unbiased. Unafraid. Unfiltered.</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    header: {
        margin: spacing.md,
        marginBottom: spacing.lg,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
    },
    heroImageWrap: {
        marginHorizontal: spacing.md,
        overflow: 'hidden',
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    heroImage: {
        width: '100%',
        height: 250,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginRight: 8,
    },
    headerIcon: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    sizeIndicator: {
        fontSize: 10,
        color: colors.accent,
        fontWeight: 'bold',
        marginLeft: -4,
        marginTop: 8,
    },
    categoryBadge: {
        backgroundColor: colors.accent,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: spacing.md,
    },
    categoryText: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 10,
        color: '#fff',
    },
    title: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 32,
        color: colors.text,
        lineHeight: 38,
        marginBottom: spacing.md,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    author: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        color: colors.text,
    },
    separator: {
        color: colors.accent,
        marginHorizontal: 10,
        fontSize: 12,
    },
    date: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
    },
    content: {
        marginTop: spacing.lg,
        marginHorizontal: spacing.md,
        padding: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
    },
    paragraphContainer: {
        marginBottom: spacing.lg,
    },
    paragraph: {
        fontFamily: 'Inter_400Regular',
        color: colors.text, // Better contrast like web
        lineHeight: 30, // Taller line height for premium feel
    },
    socialBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xl,
        gap: 30,
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
        marginHorizontal: spacing.md,
    },
    socialIcon: {
        padding: 8,
    },
    heading: {
        fontFamily: 'Oswald_700Bold',
        color: colors.text,
        marginTop: spacing.xl,
        marginBottom: spacing.md,
        letterSpacing: -0.5,
    },
    imageContainer: {
        marginVertical: spacing.xl,
        marginHorizontal: -spacing.lg,
        backgroundColor: '#000',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    inlineImage: {
        width: width,
        height: 280,
        backgroundColor: colors.borderDim,
    },
    imageCaption: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.textDim,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.lg,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    h1: { fontSize: 30, lineHeight: 36 },
    h2: { fontSize: 26, lineHeight: 32 },
    list: {
        marginBottom: spacing.lg,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        paddingLeft: spacing.md,
    },
    bullet: {
        color: colors.accent,
    },
    listItemText: {
        fontFamily: 'Inter_400Regular',
        color: colors.text,
        flex: 1,
    },
    disclaimer: {
        marginHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
    },
    disclaimerText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: colors.textDim,
        lineHeight: 16,
    },
    relatedSection: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
    },
    relatedHead: {
        marginBottom: spacing.md,
    },
    relatedKicker: {
        color: colors.textDim,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
    },
    relatedTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
    },
    relatedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
    },
    relatedImage: {
        width: 88,
        height: 68,
        borderRadius: radius.sm,
        backgroundColor: colors.backgroundSoft,
    },
    relatedContent: {
        flex: 1,
    },
    relatedCategory: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 11,
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    relatedRowTitle: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        lineHeight: 21,
    },
    relatedMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
    },
    relatedMetaText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
    },
    footer: {
        marginTop: spacing.xl,
        padding: spacing.xl,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
        marginHorizontal: spacing.md,
    },
    footerBranding: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 20,
        color: colors.text,
        letterSpacing: 1,
    },
    footerTagline: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: colors.accent,
        marginTop: 4,
    },
    errorText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
    }
});
