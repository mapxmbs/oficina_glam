import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

const FONT_LOAD_TIMEOUT_MS = 6000;

export default function RootLayout() {
  const [showLogo, setShowLogo] = useState(true);
  const [forceReady, setForceReady] = useState(false);
  const [loaded, error] = useFonts({
    Inter_400Regular: require('../assets/fonts/Inter_400Regular.ttf'),
    Inter_500Medium: require('../assets/fonts/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../assets/fonts/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../assets/fonts/Inter_700Bold.ttf'),
    LoveloBlack: require('../assets/fonts/LOVELOBL.otf'),
    MontserratAlternates_500Medium: require('../assets/fonts/MontserratAlternates-Medium.ttf'),
  });

  const isReady = loaded || error || forceReady;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
      const t = setTimeout(() => setShowLogo(false), 1000);
      return () => clearTimeout(t);
    }
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  if (showLogo && isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <Image source={require('../assets/brand/symbol.png')} style={{ width: 120, height: 120, resizeMode: 'contain' }} accessibilityLabel="Oficina Glam" />
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <Image source={require('../assets/brand/symbol.png')} style={{ width: 120, height: 120, resizeMode: 'contain' }} accessibilityLabel="Oficina Glam" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
