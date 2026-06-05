import React, { useState } from 'react';
import { Image, Linking, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, FileText, Mail, MoreHorizontal, Shield, Share2, Facebook, Instagram, Youtube } from 'lucide-react-native';
import { Svg, Path } from 'react-native-svg';
import { colors, radius, spacing } from '../../constants/theme';

const XIcon = ({ color }: { color: string }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" fill={color} />
    </Svg>
);

export default function MoreScreen() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Stay informed with Maine News Now. Follow breaking local coverage, weather, editorial, and alerts.',
                url: 'https://mainenewsnow.com',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const MenuItem = ({ icon: Icon, title, onPress, color = colors.text }: any) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuItemLeft}>
                <Icon size={20} color={color} />
                <Text style={styles.menuItemTitle}>{title}</Text>
            </View>
            <ChevronRight size={18} color={colors.textDim} />
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); requestAnimationFrame(() => setRefreshing(false)); }} tintColor={colors.accent} />}
        >
            <View style={styles.heroPanel}>
                <MoreHorizontal size={30} color={colors.accent} />
                <Text style={styles.heroTitle}>More From The Newsroom</Text>
                <Text style={styles.heroText}>Community links, support, legal pages, and how to stay connected with Maine News Now.</Text>
            </View>

            <View style={styles.menuPanel}>
                <Text style={styles.panelTitle}>Community & Support</Text>
                <MenuItem icon={Share2} title="Share App" onPress={handleShare} color={colors.accent} />
                <MenuItem icon={Mail} title="Report Issue" onPress={() => Linking.openURL('mailto:jamesezekiel039@gmail.com?subject=REPORT ISSUE TO DEVELOPER')} />
            </View>

            <View style={styles.menuPanel}>
                <Text style={styles.panelTitle}>Legal & Policy</Text>
                <MenuItem icon={Shield} title="Privacy Policy" onPress={() => router.push('/more/privacy')} />
                <MenuItem icon={FileText} title="Terms of Service" onPress={() => router.push('/more/terms')} />
            </View>

            <View style={styles.socialPanel}>
                <Text style={styles.panelTitle}>Follow The Newsroom</Text>
                <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.facebook.com/share/1DWXu7JBHo/?mibextid=wwXIfr')}>
                        <Facebook size={24} color="#9ec5ff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.instagram.com/maine_news_today?igsh=NXo3OHJzMmRwbXRq&utm_source=qr')}>
                        <Instagram size={24} color="#ff92bb" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://x.com/MaineNews_Now')}>
                        <XIcon color={colors.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.youtube.com/@MaineNewsToday')}>
                        <Youtube size={24} color="#ff8686" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://www.mylibertysocial.com/app/pages/200')}>
                        <Image source={require('../../assets/liberty-social.png')} style={styles.libertyIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerTitle}>MAINE NEWS NOW</Text>
                <Text style={styles.footerText}>Maine’s trusted local news source.</Text>
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
    heroTitle: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 28,
        marginTop: spacing.sm,
    },
    heroText: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        lineHeight: 22,
        marginTop: spacing.sm,
    },
    menuPanel: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        overflow: 'hidden',
    },
    panelTitle: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderDim,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    menuItemTitle: { color: colors.text, fontFamily: 'Inter_400Regular', fontSize: 16 },
    socialPanel: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        paddingBottom: spacing.md,
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
    },
    socialIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderDim,
    },
    libertyIcon: { width: 24, height: 24 },
    footer: { paddingVertical: spacing.xl, alignItems: 'center' },
    footerTitle: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 22 },
    footerText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
});
