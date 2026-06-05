import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../../constants/theme';
import { getImageUrl, type Post } from '../../services/api';

interface StoryFeatureCardProps {
    post: Post;
    timeLabel: string;
    onPress: () => void;
}

export default function StoryFeatureCard({ post, timeLabel, onPress }: StoryFeatureCardProps) {
    const imageUrl = getImageUrl(post.image);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
            <Image
                source={imageUrl ? { uri: imageUrl } : require('../../assets/hero-fallback.jpeg')}
                style={styles.image}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.32)', 'rgba(0,0,0,0.92)']}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                <View style={styles.chip}>
                    <Text style={styles.chipText}>{(post.category || 'news').toUpperCase()}</Text>
                </View>
                <Text style={styles.title}>{post.title}</Text>
                <Text style={styles.meta}>{timeLabel}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        overflow: 'hidden',
        backgroundColor: colors.backgroundElevated,
        minHeight: 238,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: spacing.lg,
    },
    chip: {
        alignSelf: 'flex-start',
        backgroundColor: colors.accent,
        borderRadius: radius.sm,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginBottom: spacing.md,
    },
    chipText: {
        color: '#fff',
        fontFamily: 'Oswald_700Bold',
        fontSize: 11,
        letterSpacing: 0.8,
    },
    title: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 26,
        lineHeight: 31,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowRadius: 10,
    },
    meta: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: spacing.sm,
    },
});
