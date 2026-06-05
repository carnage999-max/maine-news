import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface SponsorBannerProps {
    compact?: boolean;
}

export default function SponsorBanner({ compact = false }: SponsorBannerProps) {
    return (
        <TouchableOpacity
            style={[styles.banner, compact && styles.bannerCompact]}
            activeOpacity={0.88}
            onPress={() => Linking.openURL('https://mainenewsnow.com/advertise')}
        >
            <View style={styles.copy}>
                <Text style={styles.kicker}>Sponsored Placement</Text>
                <Text style={styles.title}>Advertise Here</Text>
                <Text style={styles.body} numberOfLines={compact ? 2 : 3}>
                    Reach readers across Maine with premium placements in the app and on the website.
                </Text>
            </View>
            <View style={[styles.badge, compact && styles.badgeCompact]}>
                <Text style={styles.badgeText}>AD</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
    },
    bannerCompact: {
        paddingVertical: spacing.md2,
    },
    copy: {
        flex: 1,
    },
    kicker: {
        color: colors.highlight,
        fontFamily: 'Oswald_500Medium',
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 20,
        marginBottom: 6,
    },
    body: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        lineHeight: 19,
    },
    badge: {
        width: 72,
        height: 72,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.borderStrong,
        backgroundColor: colors.cardBg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeCompact: {
        width: 60,
        height: 60,
    },
    badgeText: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 22,
        letterSpacing: 1.2,
    },
});
