import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CheckCircle2, Send, ShieldCheck, X } from 'lucide-react-native';
import { API_BASE_URL } from '../../services/api';
import { colors, radius, spacing } from '../../constants/theme';

const MAX_ATTACHMENTS = 5;

export default function TipsScreen() {
    const [headline, setHeadline] = useState('');
    const [details, setDetails] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [attachments, setAttachments] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handlePickMedia = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Needed', 'Allow photo library access to attach images or video to your tip.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsMultipleSelection: true,
            selectionLimit: MAX_ATTACHMENTS - attachments.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            setAttachments((prev) => [...prev, ...result.assets].slice(0, MAX_ATTACHMENTS));
        }
    };

    const handleRemoveAttachment = (uri: string) => {
        setAttachments((prev) => prev.filter((asset) => asset.uri !== uri));
    };

    const handleSubmit = async () => {
        if (!headline || !details) {
            Alert.alert('Missing Information', 'Please provide a headline and some details for your tip.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('headline', headline);
            formData.append('details', details);
            formData.append('isAnonymous', String(isAnonymous));

            attachments.forEach((asset, index) => {
                const extension = asset.uri.split('.').pop() || (asset.type === 'video' ? 'mp4' : 'jpg');
                const name = asset.fileName || `attachment-${index}.${extension}`;
                const type = asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg');

                formData.append(`file-${index}`, {
                    uri: asset.uri,
                    name,
                    type,
                } as unknown as Blob);
            });

            const response = await axios.post(`${API_BASE_URL}/api/tips`, formData);
            if (response.data.success) {
                setSubmitted(true);
            } else {
                throw new Error(response.data.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Tip submission error:', error);
            Alert.alert('Submission Failed', 'Could not send your tip right now. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <View style={styles.successWrap}>
                <CheckCircle2 size={72} color={colors.accent} />
                <Text style={styles.successTitle}>Tip Received</Text>
                <Text style={styles.successText}>
                    Thank you. Our editors will review this submission as quickly as possible.
                </Text>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => { setSubmitted(false); setHeadline(''); setDetails(''); setAttachments([]); }}>
                    <Text style={styles.secondaryButtonText}>Send Another Tip</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); requestAnimationFrame(() => setRefreshing(false)); }} tintColor={colors.accent} />}
            >
                <View style={styles.heroPanel}>
                    <Text style={styles.kicker}>Secure newsroom intake</Text>
                    <Text style={styles.title}>Send A News Tip</Text>
                    <Text style={styles.subtitle}>Share details, locations, photos, or observations with the newsroom.</Text>
                </View>

                <View style={styles.formPanel}>
                    <Text style={styles.label}>Headline</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="What happened?"
                        placeholderTextColor={colors.textDim}
                        value={headline}
                        onChangeText={setHeadline}
                        selectionColor={colors.accent}
                    />

                    <Text style={styles.label}>Details</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Tell us what happened, where, and who was involved..."
                        placeholderTextColor={colors.textDim}
                        value={details}
                        onChangeText={setDetails}
                        multiline
                        numberOfLines={8}
                        selectionColor={colors.accent}
                    />

                    <TouchableOpacity style={styles.anonRow} onPress={() => setIsAnonymous(!isAnonymous)} activeOpacity={0.8}>
                        <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                            {isAnonymous ? <Text style={styles.checkmark}>✓</Text> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.anonTitle}>Remain Anonymous</Text>
                            <Text style={styles.anonText}>Your identity can stay hidden from the newsroom record.</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.uploadPanel}
                        onPress={handlePickMedia}
                        activeOpacity={0.8}
                        disabled={attachments.length >= MAX_ATTACHMENTS}
                    >
                        <Camera size={22} color={colors.textMuted} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.uploadTitle}>Attach Photos or Video</Text>
                            <Text style={styles.uploadText}>
                                {attachments.length >= MAX_ATTACHMENTS
                                    ? `Maximum ${MAX_ATTACHMENTS} attachments reached.`
                                    : `Tap to choose from your photo library (up to ${MAX_ATTACHMENTS}).`}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {attachments.length > 0 && (
                        <View style={styles.attachmentRow}>
                            {attachments.map((asset) => (
                                <View key={asset.uri} style={styles.attachmentThumb}>
                                    <Image source={{ uri: asset.uri }} style={styles.attachmentImage} />
                                    <TouchableOpacity
                                        style={styles.attachmentRemove}
                                        onPress={() => handleRemoveAttachment(asset.uri)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <X size={12} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.securityRow}>
                        <ShieldCheck size={16} color={colors.accent} />
                        <Text style={styles.securityText}>Secure submission route</Text>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <>
                            <Text style={styles.submitButtonText}>Submit Tip</Text>
                            <Send size={18} color="#fff" />
                        </>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    formPanel: {
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: colors.backgroundElevated,
        padding: spacing.md,
    },
    label: { color: colors.textMuted, fontFamily: 'Oswald_500Medium', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: spacing.md,
        color: colors.text,
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
    },
    textArea: { minHeight: 150, textAlignVertical: 'top' },
    anonRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginTop: spacing.lg },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
    checkboxActive: { backgroundColor: colors.accent },
    checkmark: { color: '#fff', fontFamily: 'Inter_600SemiBold' },
    anonTitle: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    anonText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
    uploadPanel: {
        marginTop: spacing.lg,
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderDim,
        borderStyle: 'dashed',
        borderRadius: radius.md,
        padding: spacing.md,
    },
    uploadTitle: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
    uploadText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 2 },
    attachmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    attachmentThumb: { width: 64, height: 64, borderRadius: radius.md, overflow: 'hidden', position: 'relative' },
    attachmentImage: { width: '100%', height: '100%' },
    attachmentRemove: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    securityRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.lg },
    securityText: { color: colors.textDim, fontFamily: 'Inter_400Regular', fontSize: 12 },
    submitButton: {
        marginTop: spacing.xl,
        borderRadius: radius.md,
        backgroundColor: colors.accent,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    submitButtonText: { color: '#fff', fontFamily: 'Oswald_700Bold', fontSize: 18 },
    successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, backgroundColor: colors.background },
    successTitle: { color: colors.text, fontFamily: 'Oswald_700Bold', fontSize: 30, marginTop: spacing.lg },
    successText: { color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 15, lineHeight: 24, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
    secondaryButton: { paddingHorizontal: spacing.md, paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
    secondaryButtonText: { color: colors.text, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
