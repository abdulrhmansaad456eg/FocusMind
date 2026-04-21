import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { RemiState, getRandomPun } from './RemiStates';
import { X } from 'phosphor-react-native';

interface RemiDialogueProps {
  state: RemiState;
  customMessage?: string;
  showPun?: boolean;
  onClose?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function RemiDialogue({
  state,
  customMessage,
  showPun = true,
  onClose,
  position = 'top',
}: RemiDialogueProps) {
  const { theme } = useTheme();
  const [message, setMessage] = useState(customMessage || '');
  const [hasShownPun, setHasShownPun] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    opacity.value = withSpring(1, { damping: 12, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 12, stiffness: 150 });

    // Set message with pun (only one per interaction)
    if (showPun && !hasShownPun && !customMessage) {
      setMessage(getRandomPun(state));
      setHasShownPun(true);
    } else if (customMessage) {
      setMessage(customMessage);
    }
  }, [state, customMessage, showPun]);

  const handleClose = () => {
    // Exit animation
    scale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 200 }),
      withSpring(0, { damping: 15, stiffness: 200 })
    );
    opacity.value = withSpring(0);
    
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  const getPositionStyle = (): ViewStyle => {
    switch (position) {
      case 'top':
        return { bottom: 140, marginBottom: 12 };
      case 'bottom':
        return { top: 140, marginTop: 12 };
      case 'left':
        return { right: 200, marginRight: 12 };
      case 'right':
        return { left: 200, marginLeft: 12 };
      default:
        return { bottom: 140, marginBottom: 12 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        animatedStyle,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.primary,
        },
      ]}
    >
      {/* Speech bubble tail */}
      <View
        style={[
          styles.tail,
          position === 'top' && styles.tailBottom,
          position === 'bottom' && styles.tailTop,
          position === 'left' && styles.tailRight,
          position === 'right' && styles.tailLeft,
          { borderTopColor: theme.colors.surface },
        ]}
      />

      {/* Close button */}
      {onClose && (
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Message */}
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    minWidth: 200,
    maxWidth: 280,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
  },
  tail: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  tailBottom: {
    bottom: -10,
    left: '50%',
    marginLeft: -8,
    transform: [{ rotate: '180deg' }],
  },
  tailTop: {
    top: -10,
    left: '50%',
    marginLeft: -8,
  },
  tailRight: {
    right: -10,
    top: '50%',
    marginTop: -8,
    transform: [{ rotate: '-90deg' }],
  },
  tailLeft: {
    left: -10,
    top: '50%',
    marginTop: -8,
    transform: [{ rotate: '90deg' }],
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 20,
  },
});
