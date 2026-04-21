import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { useEffect, useCallback } from 'react';
import { RemiState, remiStateConfigs, remiEyeConfigs, getRandomPun } from './RemiStates';
import { useTheme } from '../../theme/ThemeProvider';

interface RemiProps {
  state: RemiState;
  size?: number;
  onStateChange?: (state: RemiState) => void;
}

// Animated values for body transformations
const scale = useSharedValue(1);
const translateY = useSharedValue(0);
const rotate = useSharedValue(0);

// Animated values for eyes
const leftEyeScaleY = useSharedValue(1);
const rightEyeScaleY = useSharedValue(1);
const leftEyeTranslateX = useSharedValue(0);
const rightEyeTranslateX = useSharedValue(0);

// Sleep Z's animation
const z1TranslateY = useSharedValue(0);
const z1Opacity = useSharedValue(0);
const z2TranslateY = useSharedValue(0);
const z2Opacity = useSharedValue(0);

export function Remi({ state, size = 120, onStateChange }: RemiProps) {
  const { theme } = useTheme();

  const updateAnimation = useCallback(() => {
    const config = remiStateConfigs[state];
    const eyeConfig = remiEyeConfigs[state];

    // Body animations with spring physics
    scale.value = withSpring(config.scale, {
      damping: config.damping,
      stiffness: config.stiffness,
    });

    translateY.value = withSpring(config.translateY, {
      damping: config.damping,
      stiffness: config.stiffness,
    });

    rotate.value = withSpring(config.rotate, {
      damping: config.damping,
      stiffness: config.stiffness,
    });

    // Eye animations
    leftEyeScaleY.value = withSpring(eyeConfig.leftScaleY, {
      damping: 10,
      stiffness: 150,
    });
    rightEyeScaleY.value = withSpring(eyeConfig.rightScaleY, {
      damping: 10,
      stiffness: 150,
    });
    leftEyeTranslateX.value = withSpring(eyeConfig.leftTranslateX);
    rightEyeTranslateX.value = withSpring(eyeConfig.rightTranslateX);

    // Sleep animation for sleeping state
    if (state === 'sleeping') {
      z1TranslateY.value = withRepeat(
        withSequence(
          withDelay(0, withSpring(-30)),
          withDelay(1000, withSpring(-60))
        ),
        -1,
        false
      );
      z1Opacity.value = withRepeat(
        withSequence(
          withDelay(0, withSpring(1)),
          withDelay(1000, withSpring(0))
        ),
        -1,
        false
      );

      z2TranslateY.value = withRepeat(
        withSequence(
          withDelay(500, withSpring(-30)),
          withDelay(1500, withSpring(-60))
        ),
        -1,
        false
      );
      z2Opacity.value = withRepeat(
        withSequence(
          withDelay(500, withSpring(1)),
          withDelay(1500, withSpring(0))
        ),
        -1,
        false
      );
    } else {
      z1Opacity.value = 0;
      z2Opacity.value = 0;
    }

    // Idle breathing animation
    if (state === 'idle') {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.02, { damping: 10, stiffness: 100 }),
          withSpring(0.98, { damping: 10, stiffness: 100 })
        ),
        -1,
        true
      );
      translateY.value = withRepeat(
        withSequence(
          withSpring(-3, { damping: 10, stiffness: 100 }),
          withSpring(3, { damping: 10, stiffness: 100 })
        ),
        -1,
        true
      );
    }
  }, [state]);

  useEffect(() => {
    updateAnimation();
  }, [updateAnimation]);

  // Animated styles
  const bodyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const leftEyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: leftEyeScaleY.value },
      { translateX: leftEyeTranslateX.value },
    ],
  }));

  const rightEyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: rightEyeScaleY.value },
      { translateX: rightEyeTranslateX.value },
    ],
  }));

  const z1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: z1TranslateY.value }],
    opacity: z1Opacity.value,
  }));

  const z2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: z2TranslateY.value }],
    opacity: z2Opacity.value,
  }));

  // Render eye expression based on state
  const renderEyeExpression = () => {
    const eyeConfig = remiEyeConfigs[state];
    
    if (eyeConfig.expression === 'star') {
      return (
        <>
          {/* Star eyes for happy/celebrating */}
          <Animated.View style={[styles.starEye, leftEyeAnimatedStyle, { left: size * 0.25 }]}>
            <View style={[styles.star, { width: size * 0.15, height: size * 0.15, backgroundColor: theme.colors.primary }]} />
          </Animated.View>
          <Animated.View style={[styles.starEye, rightEyeAnimatedStyle, { right: size * 0.25 }]}>
            <View style={[styles.star, { width: size * 0.15, height: size * 0.15, backgroundColor: theme.colors.primary }]} />
          </Animated.View>
        </>
      );
    }

    if (eyeConfig.expression === 'tear' && state === 'streak_broken') {
      return (
        <>
          {/* Sad eyes with tear */}
          <Animated.View style={[styles.eye, leftEyeAnimatedStyle, { left: size * 0.25, backgroundColor: theme.colors.text }]} />
          <Animated.View style={[styles.eye, rightEyeAnimatedStyle, { right: size * 0.25, backgroundColor: theme.colors.text }]} />
          <View style={[styles.tear, { right: size * 0.2, top: size * 0.45, backgroundColor: theme.colors.accent }]} />
        </>
      );
    }

    // Normal eyes
    return (
      <>
        <Animated.View 
          style={[
            styles.eye, 
            leftEyeAnimatedStyle, 
            { 
              left: size * 0.25, 
              backgroundColor: eyeConfig.expression === 'closed' ? 'transparent' : theme.colors.text 
            } 
          ]} 
        />
        <Animated.View 
          style={[
            styles.eye, 
            rightEyeAnimatedStyle, 
            { 
              right: size * 0.25, 
              backgroundColor: eyeConfig.expression === 'closed' ? 'transparent' : theme.colors.text 
            } 
          ]} 
        />
      </>
    );
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Glow effect */}
      <View 
        style={[
          styles.glow, 
          { 
            width: size * 1.2, 
            height: size * 1.2,
            backgroundColor: theme.colors.primary + '20',
          } 
        ]} 
      />

      {/* Main body */}
      <Animated.View 
        style={[
          styles.body, 
          bodyAnimatedStyle, 
          { 
            width: size, 
            height: size * 0.85,
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.primary,
          } 
        ]} 
      >
        {/* Eyes */}
        {renderEyeExpression()}

        {/* Blush spots */}
        <View style={[styles.blush, { left: size * 0.15, backgroundColor: theme.colors.primary + '40' }]} />
        <View style={[styles.blush, { right: size * 0.15, backgroundColor: theme.colors.primary + '40' }]} />
      </Animated.View>

      {/* Sleeping Z's */}
      {state === 'sleeping' && (
        <>
          <Animated.Text style={[styles.sleepZ, z1AnimatedStyle, { right: size * 0.1, top: 0 }]}>
            Z
          </Animated.Text>
          <Animated.Text style={[styles.sleepZ, z2AnimatedStyle, { right: size * 0.2, top: size * 0.1 }]}>
            z
          </Animated.Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  body: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  eye: {
    position: 'absolute',
    width: 12,
    height: 16,
    borderRadius: 6,
    top: '35%',
  },
  starEye: {
    position: 'absolute',
    top: '35%',
  },
  star: {
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  tear: {
    position: 'absolute',
    width: 6,
    height: 10,
    borderRadius: 3,
  },
  blush: {
    position: 'absolute',
    width: 20,
    height: 12,
    borderRadius: 6,
    bottom: '25%',
    opacity: 0.6,
  },
  sleepZ: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#888',
  },
});

export { RemiState, getRandomPun };
