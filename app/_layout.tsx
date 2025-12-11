import { COLORS } from '@/constants/colors';
import { Stack } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';

// i18n imports
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { initI18n } from '../i18n';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    NotoNastaliqUrdu: require('../assets/fonts/Noto-Nastaliq-Urdu-Font-Family/Noto Nastaliq Urdu Regular - [UrduFonts.com].ttf'),
  });

  useEffect(() => {
    const setup = async () => {
      await initI18n(); // initialize translations
      setReady(true);
    };
    setup();
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [ready, fontsLoaded, fontError]);

  if (!ready || !fontsLoaded && !fontError) {
    return null;
  }


  return (
    <I18nextProvider i18n={i18n}>
      <View style={{ flex: 1, backgroundColor: COLORS.bgPrimary }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bgPrimary },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'none' }} />
          <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
        </Stack>
        <Toast />
      </View>
    </I18nextProvider>
  );
}
