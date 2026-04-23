import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../theme/ThemeProvider';
import { I18nProvider } from '../i18n/I18nProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { subscribeFirebaseAuth } from '../services/firebaseAuthSync';
import { useAuthStore } from '../store/useAuthStore';

export default function RootLayout() {
  useEffect(() => {
    return subscribeFirebaseAuth((user) => useAuthStore.setState({ user }));
  }, []);

  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="session" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
