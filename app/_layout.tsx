import React, { useEffect, useCallback, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native'; // StyleSheet mantido para compatibilidade futura
import { AppSplash } from '@/components/splash/AppSplash';
import { LoadingGif } from '@/components/ui/LoadingGif';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/fredoka/useFonts';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import 'react-native-url-polyfill/auto';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return <LoadingGif size={150} fullScreen backgroundColor="transparent" />;
  }

  return <>{children}</>;
}

function StatusBarWrapper() {
  const { isDark } = useTheme();
  return (
    <StatusBar style={isDark ? 'light' : 'dark'} />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
  });

  const [splashDone, setSplashDone] = useState(false);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <StatusBarWrapper />
            <AuthProvider>
              <AuthGate>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(app)" />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </AuthGate>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>

        {/* Splash customizada — sempre visível por pelo menos 2 s */}
        {!splashDone && <AppSplash onDone={() => setSplashDone(true)} />}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
