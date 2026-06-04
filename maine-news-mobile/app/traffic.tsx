import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { MapPinned, TriangleAlert } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { fetchTrafficReport, type TrafficReport } from '../services/api';

function formatDelay(delaySeconds?: number) {
    if (!delaySeconds) {
        return 'No major delay reported';
    }

    const minutes = Math.max(1, Math.round(delaySeconds / 60));
    return `${minutes} min delay`;
}

export default function TrafficScreen() {
    const [report, setReport] = useState<TrafficReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTraffic = async () => {
        try {
            const data = await fetchTrafficReport();
            setReport(data);
        } catch (error) {
            console.error('Failed to load traffic screen:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadTraffic();
    }, []);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Maine Traffic',
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                }}
            />

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadTraffic(); }} tintColor={colors.accent} />}
                >
                    <View style={styles.hero}>
                        <Text style={styles.kicker}>Live Maine traffic</Text>
                        <Text style={styles.title}>Statewide Road Desk</Text>
                        <Text style={styles.subtitle}>
                            {report?.note || 'Live incident coverage across Maine corridors.'}
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{report?.incidents?.length || 0}</Text>
                            <Text style={styles.statLabel}>Active Alerts</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{report?.regions?.length || 0}</Text>
                            <Text style={styles.statLabel}>Regions</Text>
                        </View>
                    </View>

                    <View style={styles.mapCard}>
                        <MapPinned size={18} color={colors.accent} />
                        <Text style={styles.mapTitle}>Statewide map is available on the web traffic desk.</Text>
                        <Text style={styles.mapText}>This mobile screen focuses on the latest live incident summaries.</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Latest Incidents</Text>
                        {report?.incidents?.length ? (
                            report.incidents.slice(0, 10).map((incident) => (
                                <TouchableOpacity key={incident.id} activeOpacity={0.84} style={styles.incidentCard}>
                                    <View style={styles.incidentHeader}>
                                        <Text style={styles.incidentCategory}>{incident.category}</Text>
                                        <Text style={styles.incidentRegion}>{incident.regionLabel}</Text>
                                    </View>
                                    <Text style={styles.incidentTitle}>{incident.description}</Text>
                                    <Text style={styles.incidentMeta}>
                                        {formatDelay(incident.delaySeconds)}
                                        {incident.roadNumbers.length ? ` • ${incident.roadNumbers.join(', ')}` : ''}
                                    </Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.emptyCard}>
                                <TriangleAlert size={18} color={colors.textDim} />
                                <Text style={styles.emptyText}>No live traffic alerts right now.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    hero: {
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
        fontSize: 30,
    },
    subtitle: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        lineHeight: 22,
        marginTop: spacing.sm,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    statCard: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
    },
    statValue: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 28,
    },
    statLabel: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: 4,
    },
    mapCard: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: spacing.md,
        gap: 6,
    },
    mapTitle: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 14,
    },
    mapText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        lineHeight: 18,
    },
    section: {
        marginTop: spacing.xl,
    },
    sectionTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 24,
        marginBottom: spacing.md,
    },
    incidentCard: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    incidentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    incidentCategory: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 0.7,
    },
    incidentRegion: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
    },
    incidentTitle: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        lineHeight: 22,
    },
    incidentMeta: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: 8,
    },
    emptyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
    },
    emptyText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
    },
});
