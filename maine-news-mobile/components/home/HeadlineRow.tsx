import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock3 } from 'lucide-react-native';
import { colors, radius, spacing } from '../../constants/theme';
import { getImageUrl, type Post } from '../../services/api';

interface HeadlineRowProps {
    post: Post;
    timeLabel: string;
    onPress: () => void;
}

export default function HeadlineRow({ post, timeLabel, onPress }: HeadlineRowProps) {
    const imageUrl = getImageUrl(post.image);

    return (
        <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.84}>
            <Image
                source={imageUrl ? { uri: imageUrl } : require('../../assets/hero-fallback.jpeg')}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={styles.category}>{post.category.toUpperCase()}</Text>
                <Text style={styles.title} numberOfLines={2}>
                    {post.title}
                </Text>
                <View style={styles.meta}>
                    <Clock3 size={12} color={colors.textDim} />
                    <Text style={styles.metaText}>{timeLabel}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
    },
    image: {
        width: 92,
        height: 66,
        borderRadius: radius.sm,
        backgroundColor: colors.backgroundSoft,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    category: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 11,
        letterSpacing: 0.8,
    },
    title: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 17,
        lineHeight: 22,
        marginTop: 2,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
    },
    metaText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
    },
});
