import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '../constants/theme';

const { height } = Dimensions.get('window');

export default function Onboarding() {
    const router = useRouter();

    const handleGetStarted = async () => {
        await AsyncStorage.setItem('has_onboarded', 'true');
        router.replace('/(tabs)');
    };

    return (
        <LinearGradient colors={['#0d0f12', '#070809', '#060708']} style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoPanel}>
                    <Image
                        source={require('../assets/header-mobile.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                    <Text style={styles.kicker}>Maine’s trusted local news source</Text>
                    <Text style={styles.headline}>Breaking news, weather, politics, video, and local coverage in one newsroom.</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.84}>
                    <Text style={styles.buttonText}>Enter The Newsroom</Text>
                    <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.vLabel}>Mobile Edition</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'space-between',
    },
    content: {
        marginTop: height * 0.16,
        alignItems: 'center',
    },
    logoPanel: {
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: spacing.xl,
        alignItems: 'center',
    },
    logoImage: {
        width: 250,
        height: 86,
        marginBottom: spacing.lg,
    },
    kicker: {
        color: colors.accent,
        fontFamily: 'Oswald_500Medium',
        fontSize: 12,
        letterSpacing: 1.2,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
    },
    headline: {
        color: colors.text,
        fontFamily: 'Inter_400Regular',
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
    },
    footer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.xl,
        paddingVertical: 16,
        borderRadius: radius.md,
        gap: 8,
    },
    buttonText: {
        fontFamily: 'Oswald_700Bold',
        fontSize: 18,
        color: '#fff',
    },
    vLabel: {
        marginTop: spacing.lg,
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: colors.textDim,
        letterSpacing: 0.4,
    },
});
