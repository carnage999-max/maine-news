import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LayoutGrid, Rows3, Square } from 'lucide-react-native';
import { colors, radius, spacing } from '../../constants/theme';

export type StoryDisplayMode = 'list' | 'standard' | 'large';

interface StoryDisplayToggleProps {
    mode: StoryDisplayMode;
    onChange: (mode: StoryDisplayMode) => void;
}

const OPTIONS: Array<{ mode: StoryDisplayMode; label: string; icon: typeof Rows3 }> = [
    { mode: 'list', label: 'List', icon: Rows3 },
    { mode: 'standard', label: 'Standard', icon: LayoutGrid },
    { mode: 'large', label: 'Large', icon: Square },
];

export default function StoryDisplayToggle({ mode, onChange }: StoryDisplayToggleProps) {
    return (
        <View style={styles.wrap}>
            <Text style={styles.label}>Card size</Text>
            <View style={styles.row}>
                {OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.mode}
                        style={[styles.button, mode === option.mode && styles.buttonActive]}
                        onPress={() => onChange(option.mode)}
                        activeOpacity={0.86}
                    >
                        <option.icon size={15} color={mode === option.mode ? colors.text : colors.textDim} />
                        <Text style={[styles.buttonText, mode === option.mode && styles.buttonTextActive]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    label: {
        color: colors.textDim,
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    button: {
        flex: 1,
        minHeight: 42,
        borderWidth: 1,
        borderColor: colors.borderDim,
        borderRadius: radius.pill,
        backgroundColor: colors.cardBg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    buttonActive: {
        backgroundColor: colors.accentSoft,
        borderColor: 'rgba(239, 43, 45, 0.4)',
    },
    buttonText: {
        color: colors.textDim,
        fontFamily: 'Inter_600SemiBold',
        fontSize: 12,
    },
    buttonTextActive: {
        color: colors.text,
    },
});
