import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock3 } from 'lucide-react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { getImageUrl, type Post } from '../../services/api';

interface StoryGridCardProps {
    post: Post;
    timeLabel: string;
    onPress: () => void;
}

export default function StoryGridCard({ post, timeLabel, onPress }: StoryGridCardProps) {
    const imageUrl = getImageUrl(post.image);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.86}>
            <Image
                source={imageUrl ? { uri: imageUrl } : require('../../assets/hero-fallback.jpeg')}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.category} numberOfLines={1}>
                    {(post.category || 'news').toUpperCase()}
                </Text>
                <Text style={styles.title} numberOfLines={3}>
                    {post.title}
                </Text>
                <View style={styles.meta}>
                    <Clock3 size={11} color={colors.textDim} />
                    <Text style={styles.metaText}>{timeLabel}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
        backgroundColor: colors.backgroundElevated,
    },
    image: {
        width: '100%',
        height: 116,
        backgroundColor: colors.backgroundSoft,
    },
    content: {
        padding: spacing.md2,
    },
    category: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 11,
        letterSpacing: 0.8,
        marginBottom: 6,
    },
    title: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
        lineHeight: 21,
        minHeight: 63,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 8,
    },
    metaText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
    },
});
