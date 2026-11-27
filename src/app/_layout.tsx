import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ToastProvider } from '@/components/ui/app-toast';
import { AuthProvider } from '@/features/auth/session';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <ToastProvider>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen name="coach" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="forgot-password"
              options={{ animation: 'fade', presentation: 'transparentModal' }}
            />
            <Stack.Screen name="register" />
            <Stack.Screen name="join-coach" />
            <Stack.Screen name="verify-email" />
            <Stack.Screen name="verify-mobile" />
            <Stack.Screen name="setup-coach-profile" />
            <Stack.Screen name="coaches" />
            <Stack.Screen name="classes" />
            <Stack.Screen name="tournaments" />
            <Stack.Screen name="puzzles" />
            <Stack.Screen name="refill" />
            <Stack.Screen name="refer" />
            <Stack.Screen name="hall-of-fame" />
            <Stack.Screen name="support" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="notifications" />
          </Stack>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
