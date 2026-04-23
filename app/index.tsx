import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function SplashScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) {
      return undefined;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || error) {
      return undefined;
    }

    const timer = setTimeout(() => {
      try {
        const { hasCompletedOnboarding } = useAuthStore.getState();
        if (!hasCompletedOnboarding) {
          router.replace('/(onboarding)/tutorial');
        } else {
          router.replace('/(tabs)/home');
        }
      } catch (navError) {
        console.error('Navigation error:', navError);
        setError('Navigation failed');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [hydrated, error, router]);

  if (error) {
    return (
      <View
        style={styles.container}
        accessibilityLabel="Startup error"
        testID="splash-error"
      >
        <Text style={styles.logo}>⚠️</Text>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.welcome}>{error}</Text>
        <Text style={styles.subtitle}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      accessibilityLabel="FocusMind loading"
      testID="splash-loading"
    >
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🧠</Text>
      </View>
      <Text style={styles.title}>FocusMind</Text>
      <Text style={styles.welcome}>Welcome! 👋</Text>
      <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 10,
  },
});
