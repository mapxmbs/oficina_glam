import { Tabs } from 'expo-router';
import { Droplet, MapPin } from 'lucide-react-native';
import { Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrilhoIcon, ChavesIcon, PneuIcon } from '../../components/icons';
import { getIconColor } from '../../src/theme/icon-colors';
import { colors } from '../../src/theme/colors';

const { width: w } = Dimensions.get('window');
const isNarrow = w < 360;
const iconSize = Platform.OS === 'ios' ? (isNarrow ? 20 : 22) : (isNarrow ? 18 : 20);
const iconSizeFocused = Platform.OS === 'ios' ? (isNarrow ? 22 : 24) : (isNarrow ? 20 : 22);
const tabBarContentHeight = Platform.OS === 'ios' ? (isNarrow ? 48 : 52) : (isNarrow ? 46 : 50);
const tabBarPaddingTop = isNarrow ? 6 : 8;
const tabBarMarginH = isNarrow ? 24 : 32;
const tabBarRadius = 28;

const tabIconColor = (focused: boolean) => getIconColor(focused ? 'primary' : 'muted');

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 20 : 12);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.iconPrimary,
        tabBarInactiveTintColor: colors.iconMuted,
        tabBarStyle: {
          position: 'absolute',
          left: tabBarMarginH,
          right: tabBarMarginH,
          bottom: bottomInset + 8,
          height: tabBarContentHeight + tabBarPaddingTop,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopWidth: 0,
          borderRadius: tabBarRadius,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 12,
          paddingTop: tabBarPaddingTop,
          paddingBottom: 0,
        },
        tabBarItemStyle: { paddingVertical: isNarrow ? 4 : 6 },
      }}
    >
      <Tabs.Screen name="vehicle" options={{ title: 'Meu Carro', tabBarIcon: ({ focused }) => <PneuIcon size={iconSize} color={tabIconColor(focused)} /> }} />
      <Tabs.Screen name="fuel" options={{ title: 'Combustível', tabBarIcon: ({ focused }) => <Droplet size={iconSize} color={tabIconColor(focused)} strokeWidth={2} /> }} />
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ focused }) => <BrilhoIcon size={focused ? iconSizeFocused : iconSize} color={tabIconColor(focused)} /> }} />
      <Tabs.Screen name="maintenance" options={{ title: 'Histórico', tabBarIcon: ({ focused }) => <ChavesIcon size={iconSize} color={tabIconColor(focused)} /> }} />
      <Tabs.Screen name="workshops" options={{ title: 'Oficinas', tabBarIcon: ({ focused }) => <MapPin size={iconSize} color={tabIconColor(focused)} strokeWidth={2} /> }} />
    </Tabs>
  );
}
