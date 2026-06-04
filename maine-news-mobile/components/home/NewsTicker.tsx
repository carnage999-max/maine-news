import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

interface NewsTickerProps {
    items: string[];
    label: string;
    speed?: 'slow' | 'normal' | 'fast';
    compact?: boolean;
}

const SPEED_MULTIPLIER = {
    slow: 58,
    normal: 42,
    fast: 30,
} as const;

export default function NewsTicker({ items, label, speed = 'normal', compact = false }: NewsTickerProps) {
    const translateX = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);

    const tickerItems = useMemo(
        () => (items.length ? items : ['No updates right now']),
        [items]
    );

    useEffect(() => {
        if (contentWidth <= 0) {
            return;
        }

        translateX.setValue(0);

        const animation = Animated.loop(
            Animated.timing(translateX, {
                toValue: -contentWidth,
                duration: contentWidth * SPEED_MULTIPLIER[speed],
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        animation.start();
        return () => animation.stop();
    }, [contentWidth, speed, tickerItems, translateX]);

    return (
        <View style={[styles.container, compact && styles.containerCompact]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.trackViewport}>
                <Animated.View
                    style={[
                        styles.track,
                        {
                            transform: [{ translateX }],
                            width: contentWidth ? contentWidth * 2 : 3200,
                        },
                    ]}
                >
                    {[0, 1].map((dupIndex) => (
                        <View
                            key={dupIndex}
                            style={styles.trackPart}
                            onLayout={(event) => {
                                if (dupIndex === 0) {
                                    const widthValue = event.nativeEvent.layout.width;
                                    if (widthValue > 0 && Math.abs(widthValue - contentWidth) > 1) {
                                        setContentWidth(widthValue);
                                    }
                                }
                            }}
                        >
                            {tickerItems.map((item, index) => (
                                <View key={`${dupIndex}-${index}`} style={styles.itemWrap}>
                                    <Text numberOfLines={1} style={styles.itemText}>
                                        {item}
                                    </Text>
                                    <Text style={styles.separator}>•</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: 'rgba(18, 20, 24, 0.96)',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        overflow: 'hidden',
    },
    containerCompact: {
        paddingVertical: 10,
    },
    label: {
        color: colors.accent,
        fontFamily: 'Oswald_700Bold',
        fontSize: 12,
        letterSpacing: 1.1,
        marginRight: spacing.md,
    },
    trackViewport: {
        flex: 1,
        overflow: 'hidden',
    },
    track: {
        flexDirection: 'row',
    },
    trackPart: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 26,
    },
    itemText: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
    },
    separator: {
        marginLeft: 12,
        color: colors.textFaint,
    },
});
