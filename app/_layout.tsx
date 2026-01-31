import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { colors } from '../src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showLogo, setShowLogo] = useState(true);
  const [loaded, error] = useFonts({
    'LoveloBlack': require('../assets/fonts/LOVELOBL.otf'),
    'MontserratAlternates-Medium': require('../assets/fonts/MontserratAlternates-Medium.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      const t = setTimeout(() => setShowLogo(false), 1200);
      return () => clearTimeout(t);
    }
  }, [loaded, error]);

  if (showLogo && (loaded || error)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <Image source={require('../assets/brand/logo.png')} style={{ width: 220, height: 88, resizeMode: 'contain' }} accessibilityLabel="Oficina Glam" />
      </View>
    );
  }

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <Image source={require('../assets/brand/logo.png')} style={{ width: 220, height: 88, resizeMode: 'contain' }} accessibilityLabel="Oficina Glam" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
