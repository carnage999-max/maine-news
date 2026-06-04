import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { colors, radius, spacing } from '../../constants/theme';

export default function PrivacyScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Stack.Screen
                options={{
                    title: 'Privacy Policy',
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <View style={styles.heroPanel}>
                <Text style={styles.kicker}>Legal & policy</Text>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.date}>Last updated: June 4, 2026</Text>
            </View>

            <View style={styles.panel}>
                <Section
                    title="Introduction"
                    body="This policy explains how Maine News Now collects, uses, shares, and protects information across our site, mobile app, and related services."
                />
                <Section
                    title="Information We Collect"
                    body="We may collect information you provide directly, limited technical/device data, and usage analytics needed to operate, secure, and improve our services."
                />
                <Section
                    title="How We Use Information"
                    body="We use data to deliver content, improve performance, prevent abuse, communicate with users, and support newsroom and service operations."
                />
                <Section
                    title="Sharing"
                    body="We do not sell personal data. Information may be shared with service providers or legal authorities when necessary to operate the service or comply with law."
                />
                <Section
                    title="Contact"
                    body="For privacy questions, contact the Maine News Now team through the contact details published on mainenewsnow.com."
                />
            </View>
        </ScrollView>
    );
}

function Section({ title, body }: { title: string; body: string }) {
    return (
        <View style={styles.section}>
            <Text style={styles.heading}>{title}</Text>
            <Text style={styles.text}>{body}</Text>
        </View>
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
        marginBottom: spacing.md,
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
    date: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginTop: spacing.sm,
    },
    panel: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    heading: {
        color: colors.text,
        fontFamily: 'Oswald_700Bold',
        fontSize: 20,
        marginBottom: spacing.sm,
    },
    text: {
        color: colors.textMuted,
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        lineHeight: 24,
    },
});
