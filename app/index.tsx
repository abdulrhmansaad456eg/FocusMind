import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useAuthStore } from '../store/useAuthStore';

export default function SplashScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Auto-login as guest
    setUser({
      id: 'guest',
      email: 'guest@focusmind.app',
      username: 'Guest',
      avatarColor: '#3b82f6',
    });

    // Show welcome text after animation
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, 800);

    // Navigate to home
    const navTimer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 2500);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Animated Logo Circle */}
      <MotiView
        from={{ scale: 0, rotate: '0deg' }}
        animate={{ scale: 1, rotate: '360deg' }}
        transition={{ type: 'spring', duration: 1500 }}
        style={styles.logoContainer}
      >
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 500, duration: 800 }}
        >
          <Text style={styles.logo}>🧠</Text>
        </MotiView>
      </MotiView>

      {/* App Name */}
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 600, type: 'timing', duration: 800 }}
      >
        <Text style={styles.title}>FocusMind</Text>
      </MotiView>

      {/* Welcome Message */}
      {showWelcome && (
        <MotiView
          from={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={styles.welcomeContainer}
        >
          <Text style={styles.welcome}>Welcome! 👋</Text>
          <Text style={styles.subtitle}>Ready to focus?</Text>
        </MotiView>
      )}

      {/* Animated dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <MotiView
            key={i}
            from={{ opacity: 0.3, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{
              loop: true,
              delay: i * 200,
              type: 'timing',
              duration: 600,
            }}
            style={styles.dot}
          />
        ))}
      </View>
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
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: '#60a5fa',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
});
