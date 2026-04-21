import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useFocusStore } from '../../store/useFocusStore';
import { useRouter } from 'expo-router';
import { Pause, Play, X, Check } from 'phosphor-react-native';

export default function ActiveSession() {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    currentSession,
    isActive,
    timeRemaining,
    pauseSession,
    resumeSession,
    cancelSession,
    completeSession,
    tick,
  } = useFocusStore();

  // Timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);

  // Auto-complete when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && currentSession) {
      router.replace('/session/complete');
    }
  }, [timeRemaining, currentSession]);

  // Handle cancel
  const handleCancel = () => {
    cancelSession();
    router.back();
  };

  // Handle manual complete
  const handleComplete = () => {
    router.replace('/session/complete');
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = currentSession
    ? ((currentSession.duration * 60 - timeRemaining) / (currentSession.duration * 60)) * 100
    : 0;

  if (!currentSession) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.text, { color: theme.colors.text }]}>No active session</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <X size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Session Name */}
      <Text style={[styles.sessionName, { color: theme.colors.textSecondary }]}>
        {currentSession.name}
      </Text>

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timer, { color: theme.colors.text }]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { 
              backgroundColor: theme.colors.primary,
              width: `${progress}%`,
            },
          ]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isActive ? pauseSession : resumeSession}
          style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
        >
          {isActive ? (
            <Pause size={32} color="#fff" weight="fill" />
          ) : (
            <Play size={32} color="#fff" weight="fill" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleComplete}
          style={[styles.completeButton, { backgroundColor: theme.colors.success }]}
        >
          <Check size={32} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
        {isActive ? 'Session in progress' : 'Session paused'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  sessionName: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 72,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 24,
    marginBottom: 48,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: 14,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 48,
  },
});
