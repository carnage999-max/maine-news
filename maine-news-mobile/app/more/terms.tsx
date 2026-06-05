import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { colors, radius, spacing } from '../../constants/theme';

export default function TermsScreen() {
    const [refreshing, setRefreshing] = useState(false);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); requestAnimationFrame(() => setRefreshing(false)); }} tintColor={colors.accent} />}
        >
            <Stack.Screen
                options={{
                    title: 'Terms of Service',
                    headerStyle: { backgroundColor: colors.backgroundElevated },
                    headerTintColor: colors.text,
                    headerTitleStyle: { fontFamily: 'Oswald_700Bold', color: colors.text },
                }}
            />

            <View style={styles.heroPanel}>
                <Text style={styles.kicker}>Legal & policy</Text>
                <Text style={styles.title}>Terms of Service</Text>
                <Text style={styles.date}>Last updated: June 4, 2026</Text>
            </View>

            <View style={styles.panel}>
                <Section
                    title="Use of Service"
                    body="By using Maine News Now, you agree to use our content and services lawfully and in a way that does not disrupt the platform or other users."
                />
                <Section
                    title="Content & Availability"
                    body="We work to keep coverage, video, weather, and alerts current, but we do not guarantee uninterrupted availability or error-free operation at all times."
                />
                <Section
                    title="User Conduct"
                    body="You may not misuse the service, attempt unauthorized access, submit harmful content, or interfere with our systems or newsroom operations."
                />
                <Section
                    title="Intellectual Property"
                    body="All branding, editorial presentation, and original content remain the property of Maine News Now or its licensors unless otherwise stated."
                />
                <Section
                    title="Contact"
                    body="For service questions or policy concerns, use the public contact channels listed on mainenewsnow.com."
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
