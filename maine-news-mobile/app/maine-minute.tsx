import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, radius, spacing } from '../constants/theme';
import {
    fetchMaineMinuteReport,
    type MaineMinuteLotteryEntry,
    type MaineMinuteReport,
} from '../services/api';

function formatDateLabel(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatGameLabel(game: string) {
    return game
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function LotteryCard({ entry }: { entry: MaineMinuteLotteryEntry }) {
    return (
        <View style={styles.lotteryCard}>
            <Text style={styles.lotteryGame}>{formatGameLabel(entry.game)}</Text>
            <View style={styles.lotteryNumbers}>
                {entry.numbers.map((num, index) => (
                    <View key={`${entry.game}-${index}`} style={styles.lotteryBall}>
                        <Text style={styles.lotteryBallText}>{num}</Text>
                    </View>
                ))}
                {entry.extra ? (
                    <View style={[styles.lotteryBall, styles.lotteryBallExtra]}>
                        <Text style={styles.lotteryBallText}>{entry.extra}</Text>
                    </View>
                ) : null}
            </View>
            {entry.jackpot ? <Text style={styles.lotteryJackpot}>{entry.jackpot}</Text> : null}
        </View>
    );
}

export default function MaineMinuteScreen() {
    const router = useRouter();
    const [report, setReport] = useState<MaineMinuteReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReport = async () => {
        try {
            const nextReport = await fetchMaineMinuteReport();
            setReport(nextReport);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadReport();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={styles.loadingText}>Loading The Maine Minute...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'The Maine Minute',
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            void loadReport();
                        }}
                        tintColor={colors.accent}
                    />
                }
            >
                <View style={styles.heroPanel}>
                    <Text style={styles.kicker}>The Maine Minute</Text>
                    <Text style={styles.title}>
                        {report ? `The Maine Minute — ${formatDateLabel(report.date)}` : 'The Maine Minute'}
                    </Text>
                    <Text style={styles.subhead}>
                        {report?.subhead || 'Everything that matters in Maine. One minute.'}
                    </Text>
                    {report?.timestamp ? <Text style={styles.meta}>Data timestamp: {report.timestamp}</Text> : null}
                </View>

                {!report ? (
                    <View style={styles.emptyPanel}>
                        <Text style={styles.emptyText}>The Maine Minute is unavailable right now.</Text>
                    </View>
                ) : (
                    <>
                        {report.sections.map((section) => (
                            <View key={section.title} style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionSummary}>{section.summary}</Text>
                                {section.links.length ? (
                                    <View style={styles.linksWrap}>
                                        {section.links.map((link) => (
                                            <TouchableOpacity
                                                key={`${section.title}-${link.slug}`}
                                                style={styles.linkPill}
                                                onPress={() => router.push(link.slug.startsWith('/') ? link.slug as any : `/article/${link.slug}`)}
                                            >
                                                <Text style={styles.linkPillText}>{link.title}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        ))}

                        {report.lottery.length ? (
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Lottery</Text>
                                <View style={styles.lotteryGrid}>
                                    {report.lottery.map((entry) => (
                                        <LotteryCard key={entry.game} entry={entry} />
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        {report.readMore.length ? (
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Read Full Coverage</Text>
                                <View style={styles.linksWrap}>
                                    {report.readMore.map((link) => (
                                        <TouchableOpacity
                                            key={link.slug}
                                            style={styles.linkPill}
                                            onPress={() => router.push(`/article/${link.slug}`)}
                                        >
                                            <Text style={styles.linkPillText}>{link.title}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : null}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingWrap: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
        gap: spacing.md,
    },
    heroPanel: {
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
        fontSize: 28,
        lineHeight: 34,
    },
    subhead: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 23,
        marginTop: spacing.sm,
    },
    meta: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: spacing.md,
    },
    emptyPanel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.xl,
    },
    emptyText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
    },
    sectionCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.lg,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
        marginBottom: spacing.sm,
    },
    sectionSummary: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 24,
    },
    linksWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    linkPill: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.pill,
        backgroundColor: colors.cardBg,
        paddingHorizontal: 12,
        paddingVertical: 9,
    },
    linkPillText: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
        maxWidth: 260,
    },
    lotteryGrid: {
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    lotteryCard: {
        borderWidth: 1,
        borderColor: colors.borderDim,
        borderRadius: radius.md,
        backgroundColor: colors.cardBg,
        padding: spacing.md,
    },
    lotteryGame: {
        color: colors.highlight,
        fontFamily: 'Oswald_500Medium',
        fontSize: 14,
        marginBottom: spacing.sm,
    },
    lotteryNumbers: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    lotteryBall: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.backgroundSoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lotteryBallExtra: {
        backgroundColor: colors.accent,
    },
    lotteryBallText: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
    },
    lotteryJackpot: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: spacing.sm,
    },
});
