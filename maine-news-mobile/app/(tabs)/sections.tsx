import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronRight, CloudSun, Landmark, LayoutGrid, MapPinned, ScrollText, Shield, TriangleAlert, Tv2 } from 'lucide-react-native';
import { colors, radius, spacing } from '../../constants/theme';

const PRIMARY_SECTIONS = [
    { label: 'Politics', icon: Landmark, color: colors.highlight },
    { label: 'Crime', icon: Shield, color: colors.accent },
    { label: 'Business', icon: Building2, color: colors.success },
    { label: 'Weather', icon: CloudSun, color: colors.info },
];

const ALL_SECTIONS = [
    'Exclusives',
    'Top Stories',
    'Local',
    'Politics',
    'Crime',
    'Business',
    'Health',
    'Editorial',
    'Sports',
    'Weather',
    'Entertainment',
    'National',
];

export default function SectionsScreen() {
    const router = useRouter();

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.heroPanel}>
                <Text style={styles.heroKicker}>Newsroom navigation</Text>
                <Text style={styles.heroTitle}>Browse Every Section</Text>
                <Text style={styles.heroText}>
                    Jump straight into the beats that matter most across Maine, from politics and crime to weather, business, and editorial coverage.
                </Text>
            </View>

            <View style={styles.primaryGrid}>
                {PRIMARY_SECTIONS.map((item) => (
                    <TouchableOpacity
                        key={item.label}
                        style={styles.primaryCard}
                        activeOpacity={0.84}
                        onPress={() => router.push(`/category/${item.label.toLowerCase()}` as any)}
                    >
                        <item.icon size={22} color={item.color} />
                        <Text style={styles.primaryCardText}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.featureCard} activeOpacity={0.84} onPress={() => router.push('/maine-minute')}>
                <View style={styles.featureCardLeft}>
                    <Tv2 size={22} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.featureCardTitle}>The Maine Minute</Text>
                        <Text style={styles.featureCardText}>Open the daily Maine Minute digest and catch up quickly.</Text>
                    </View>
                </View>
                <ChevronRight size={20} color={colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard} activeOpacity={0.84} onPress={() => router.push('/category/editorial')}>
                <View style={styles.featureCardLeft}>
                    <ScrollText size={22} color={colors.purple} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.featureCardTitle}>Editorial & Opinion</Text>
                        <Text style={styles.featureCardText}>Go directly to commentary, letters, and editorials.</Text>
                    </View>
                </View>
                <ChevronRight size={20} color={colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard} activeOpacity={0.84} onPress={() => router.push('/local')}>
                <View style={styles.featureCardLeft}>
                    <MapPinned size={22} color={colors.accent} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.featureCardTitle}>Local Coverage By County</Text>
                        <Text style={styles.featureCardText}>Use the Maine county map to jump into your local area feed.</Text>
                    </View>
                </View>
                <ChevronRight size={20} color={colors.textDim} />
            </TouchableOpacity>

            <View style={styles.sectionHead}>
                <LayoutGrid size={18} color={colors.accent} />
                <Text style={styles.sectionHeadText}>All Sections</Text>
            </View>

            <View style={styles.listPanel}>
                {ALL_SECTIONS.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={styles.listItem}
                        activeOpacity={0.78}
                        onPress={() => router.push(`/category/${cat.toLowerCase().replace(/\s+/g, '-')}` as any)}
                    >
                        <Text style={styles.listItemText}>{cat}</Text>
                        <ChevronRight size={18} color={colors.textDim} />
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.tipCard} activeOpacity={0.84} onPress={() => router.push('/tips')}>
                <TriangleAlert size={18} color={colors.text} />
                <Text style={styles.tipCardText}>Send a News Tip</Text>
            </TouchableOpacity>
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
    heroKicker: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 6,
    },
    heroTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 30,
    },
    heroText: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        lineHeight: 22,
        marginTop: spacing.sm,
    },
    primaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
    primaryCard: {
        width: '48%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: spacing.md,
        gap: 12,
    },
    primaryCardText: {
        color: colors.text,
        fontFamily: 'Oswald_500Medium',
        fontSize: 18,
    },
    featureCard: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    featureCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
        paddingRight: spacing.sm,
    },
    featureCardTitle: {
        color: colors.text,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 15,
    },
    featureCardText: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        lineHeight: 18,
        marginTop: 2,
    },
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: spacing.xl,
        marginBottom: spacing.md,
    },
    sectionHeadText: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 22,
    },
    listPanel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderDim,
    },
    listItemText: {
        color: colors.text,
        fontFamily: 'Oswald_500Medium',
        fontSize: 18,
    },
    tipCard: {
        marginTop: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.accent,
        paddingVertical: 14,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    tipCardText: {
        color: '#fff',
        fontFamily: 'Oswald_700Bold',
        fontSize: 16,
    },
});
