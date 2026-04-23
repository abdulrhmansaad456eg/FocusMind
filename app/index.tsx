import { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

// FocusMind Animated Splash Screen
// Black/White theme with animated letters and Remi mascot

const FOCUSMIND_LETTERS = ['F', 'O', 'C', 'U', 'S', 'M', 'I', 'N', 'D'];
const { width } = Dimensions.get('window');

function AnimatedLetter({
  letter,
  index,
  onComplete,
}: {
  letter: string;
  index: number;
  onComplete?: () => void;
}) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-15);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const delay = index * 100;

    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    rotate.value = withDelay(
      delay,
      withSequence(
        withTiming(10, { duration: 200 }),
        withTiming(0, { duration: 300 })
      )
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(1, { duration: 200 })
      )
    );

    if (index === FOCUSMIND_LETTERS.length - 1 && onComplete) {
      setTimeout(onComplete, delay + 800);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.letter, animatedStyle]}>
      {letter}
    </Animated.Text>
  );
}

function RemiMascot({ onBlink }: { onBlink?: () => void }) {
  const eyeScaleY = useSharedValue(1);
  const bodyScale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withDelay(1200, withTiming(1, { duration: 500 }));

    // Gentle breathing animation
    bodyScale.value = withDelay(
      1500,
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      )
    );

    // Blink after letters finish
    const blinkTimeout = setTimeout(() => {
      eyeScaleY.value = withSequence(
        withTiming(0.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      onBlink?.();
    }, 2000);

    return () => clearTimeout(blinkTimeout);
  }, []);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bodyScale.value }],
    opacity: opacity.value,
  }));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeScaleY.value }],
  }));

  return (
    <Animated.View style={[styles.remiContainer, bodyStyle]}>
      {/* Remi Body - Soft cloud/blob shape */}
      <View style={styles.remiBody}>
        {/* Left Eye */}
        <Animated.View style={[styles.remiEye, eyeStyle]} />
        {/* Right Eye */}
        <Animated.View style={[styles.remiEye, styles.remiEyeRight, eyeStyle]} />
      </View>
    </Animated.View>
  );
}

export default function SplashScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());
  const [lettersComplete, setLettersComplete] = useState(false);
  const [remiBlinked, setRemiBlinked] = useState(false);

  useEffect(() => {
    if (hydrated) {
      return undefined;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [hydrated]);

  // Navigate after animation completes
  useEffect(() => {
    if (!hydrated || error || !lettersComplete || !remiBlinked) {
      return undefined;
    }

    const timer = setTimeout(() => {
      try {
        const { user, hasCompletedOnboarding } = useAuthStore.getState();
        if (!user) {
          // Not logged in - go to auth
          router.replace('/(auth)/login');
        } else if (!hasCompletedOnboarding) {
          // Logged in but new user - go to tutorial
          router.replace('/(onboarding)/tutorial');
        } else {
          // Logged in and onboarded - go home
          router.replace('/(tabs)/home');
        }
      } catch (navError) {
        console.error('Navigation error:', navError);
        setError('Navigation failed');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [hydrated, error, lettersComplete, remiBlinked, router]);

  if (error) {
    return (
      <View style={styles.container} accessibilityLabel="Startup error" testID="splash-error">
        <View style={styles.errorIcon}>
          <View style={styles.errorDot} />
        </View>
        <Animated.Text style={styles.errorTitle}>Oops!</Animated.Text>
        <Animated.Text style={styles.errorText}>{error}</Animated.Text>
        <Animated.Text style={styles.errorSubtitle}>Please restart the app</Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityLabel="FocusMind loading" testID="splash-loading">
      {/* Animated FocusMind Letters */}
      <View style={styles.lettersContainer}>
        {FOCUSMIND_LETTERS.map((letter, index) => (
          <AnimatedLetter
            key={index}
            letter={letter}
            index={index}
            onComplete={
              index === FOCUSMIND_LETTERS.length - 1
                ? () => setLettersComplete(true)
                : undefined
            }
          />
        ))}
      </View>

      {/* Remi Mascot */}
      <RemiMascot onBlink={() => setRemiBlinked(true)} />

      {/* Loading indicator */}
      {lettersComplete && (
        <Animated.View
          style={[
            styles.loadingBar,
            { opacity: remiBlinked ? 1 : 0 },
          ]}
        >
          <View style={styles.loadingTrack}>
            <Animated.View style={styles.loadingFill} />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lettersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  letter: {
    fontSize: width > 400 ? 42 : 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  // Remi Styles
  remiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  remiBody: {
    width: 80,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  remiEye: {
    position: 'absolute',
    width: 12,
    height: 16,
    borderRadius: 6,
    backgroundColor: '#000000',
    left: 22,
    top: 25,
  },
  remiEyeRight: {
    left: 46,
  },
  // Loading Bar
  loadingBar: {
    position: 'absolute',
    bottom: 100,
    width: 200,
    height: 2,
  },
  loadingTrack: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  loadingFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  // Error Styles
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
