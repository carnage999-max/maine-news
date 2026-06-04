import { Tabs, useRouter } from 'expo-router';
import { Home, LayoutGrid, TriangleAlert, Tv, MoreHorizontal, Search } from 'lucide-react-native';
import { TouchableOpacity, Image, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textDim,
                tabBarStyle: {
                    backgroundColor: colors.backgroundElevated,
                    borderTopColor: colors.border,
                    height: 64 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                    paddingTop: 8,
                },
                headerStyle: {
                    backgroundColor: colors.backgroundElevated,
                    borderBottomColor: colors.border,
                    borderBottomWidth: 1,
                },
                headerTitleStyle: {
                    fontFamily: 'Oswald_700Bold',
                    color: colors.text,
                },
                headerTitleAlign: 'center',
                tabBarLabelStyle: {
                    fontFamily: 'Inter_400Regular',
                    fontSize: 10,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    headerShown: false,
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="sections"
                options={{
                    title: 'Sections',
                    tabBarIcon: ({ color }) => <LayoutGrid size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="tips"
                options={{
                    title: 'Tips',
                    tabBarIcon: ({ color }) => <TriangleAlert size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="video-hub"
                options={{
                    title: 'Watch',
                    tabBarIcon: ({ color }) => <Tv size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'More',
                    tabBarIcon: ({ color }) => <MoreHorizontal size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
