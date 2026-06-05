import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Svg, { G, Path } from 'react-native-svg';
import { MapPinned } from 'lucide-react-native';
import { colors, radius, spacing } from '../constants/theme';
import { fetchCountyMap, type CountyFeature, type CountyFeatureCollection } from '../services/api';

const COUNTY_SLUGS: Record<string, string> = {
    aroostook: 'aroostook',
    washington: 'washington',
    penobscot: 'penobscot',
    hancock: 'hancock',
    piscataquis: 'piscataquis',
    somerset: 'somerset',
    franklin: 'franklin',
    oxford: 'oxford',
    androscoggin: 'androscoggin',
    kennebec: 'kennebec',
    waldo: 'waldo',
    knox: 'knox',
    lincoln: 'lincoln',
    sagadahoc: 'sagadahoc',
    cumberland: 'cumberland',
    york: 'york',
};

function getCountySlug(name?: string) {
    if (!name) return null;
    return COUNTY_SLUGS[name.trim().toLowerCase()] || null;
}

function flattenCoordinates(feature: CountyFeature) {
    if (feature.geometry.type === 'Polygon') {
        return feature.geometry.coordinates.flat(1) as number[][];
    }
    return feature.geometry.coordinates.flat(2) as number[][];
}

function buildCountyPaths(collection: CountyFeatureCollection, width: number, height: number) {
    const allPoints = collection.features.flatMap(flattenCoordinates);
    const longitudes = allPoints.map((point) => point[0]);
    const latitudes = allPoints.map((point) => point[1]);

    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const lonSpan = maxLon - minLon || 1;
    const latSpan = maxLat - minLat || 1;

    const padding = 12;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;

    const scalePoint = ([lon, lat]: number[]) => {
        const x = padding + ((lon - minLon) / lonSpan) * usableWidth;
        const y = padding + (1 - (lat - minLat) / latSpan) * usableHeight;
        return [x, y] as const;
    };

    return collection.features.map((feature) => {
        const polygons = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates as number[][][]]
            : (feature.geometry.coordinates as number[][][][]);

        const path = polygons.map((polygon) => polygon.map((ring) => {
            return ring.map((point, index) => {
                const [x, y] = scalePoint(point);
                return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
            }).join(' ') + ' Z';
        }).join(' ')).join(' ');

        return {
            path,
            name: feature.properties.county || 'County',
            slug: getCountySlug(feature.properties.county),
        };
    });
}

export default function LocalCoverageScreen() {
    const router = useRouter();
    const [map, setMap] = useState<CountyFeatureCollection | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState<string | null>(null);

    const loadMap = async () => {
        try {
            const data = await fetchCountyMap();
            setMap(data);
        } catch (error) {
            console.error('Failed to load county map:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        void loadMap();
    }, []);

    const countyPaths = useMemo(() => {
        if (!map) return [];
        return buildCountyPaths(map, 320, 420);
    }, [map]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadMap(); }} tintColor={colors.accent} />}
        >
            <Stack.Screen
                options={{
                    title: 'Local Coverage',
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <View style={styles.heroPanel}>
                <Text style={styles.kicker}>County local desk</Text>
                <Text style={styles.title}>Pick Your County</Text>
                <Text style={styles.subtitle}>
                    Tap a county on the Maine map to jump into local headlines matched to that area.
                </Text>
            </View>

            <View style={styles.mapPanel}>
                <View style={styles.mapHeader}>
                    <MapPinned size={18} color={colors.accent} />
                    <Text style={styles.mapTitle}>Maine County Map</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator color={colors.accent} />
                    </View>
                ) : countyPaths.length ? (
                    <View style={styles.mapWrap}>
                        <Svg width="100%" height={420} viewBox="0 0 320 420">
                            <G>
                                {countyPaths.map((county) => (
                                    <Path
                                        key={county.slug || county.name}
                                        d={county.path}
                                        fill={selectedCounty === county.slug ? colors.accent : '#1f8b24'}
                                        stroke="rgba(12,14,16,0.96)"
                                        strokeWidth={1.4}
                                        onPress={() => {
                                            if (!county.slug) return;
                                            setSelectedCounty(county.slug);
                                            router.push(`/county/${county.slug}` as any);
                                        }}
                                    />
                                ))}
                            </G>
                        </Svg>
                    </View>
                ) : (
                    <View style={styles.loadingWrap}>
                        <Text style={styles.emptyText}>County map unavailable right now.</Text>
                    </View>
                )}

                <Text style={styles.mapHint}>If the map is busy, you can also choose from the county list below.</Text>
            </View>

            <View style={styles.listPanel}>
                {countyPaths.map((county) => (
                    <TouchableOpacity
                        key={`chip-${county.slug || county.name}`}
                        style={[
                            styles.countyChip,
                            selectedCounty === county.slug && styles.countyChipActive,
                        ]}
                        onPress={() => {
                            if (!county.slug) return;
                            setSelectedCounty(county.slug);
                            router.push(`/county/${county.slug}` as any);
                        }}
                    >
                        <Text
                            style={[
                                styles.countyChipText,
                                selectedCounty === county.slug && styles.countyChipTextActive,
                            ]}
                        >
                            {county.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },
    heroPanel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.xl,
    },
    kicker: { color: colors.accent, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1, marginBottom: 6 },
    title: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 30 },
    subtitle: { color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 22, marginTop: spacing.sm },
    mapPanel: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
    },
    mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
    mapTitle: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 22 },
    mapWrap: {
        borderWidth: 1,
        borderColor: colors.borderDim,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
    },
    mapHint: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: spacing.sm },
    loadingWrap: { minHeight: 220, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 13 },
    listPanel: {
        marginTop: spacing.md,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    countyChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.backgroundElevated,
    },
    countyChipActive: {
        backgroundColor: colors.accentSoft,
        borderColor: 'rgba(239,43,45,0.45)',
    },
    countyChipText: {
        color: colors.textMuted,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
    },
    countyChipTextActive: {
        color: colors.text,
    },
});
