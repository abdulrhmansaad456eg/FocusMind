import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function SplashScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Auto-login as guest
    setUser({
      id: 'guest',
      email: 'guest@focusmind.app',
      username: 'Guest',
      avatarColor: '#3b82f6',
    });

    // Navigate to home after 2 seconds
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
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
});
