import { View, Text, StyleSheet, TouchableOpacity, AppState, type AppStateStatus } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '../../store/useFocusStore';
import { useRouter } from 'expo-router';
import { Pause, Play, X, Check } from 'phosphor-react-native';
import { useTimer } from '../../hooks/useTimer';
import { AmbientMixer } from '../../components/focus/AmbientMixer';
import { Remi, RemiState } from '../../components/remi';

export default function ActiveSession() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const [remiVisible, setRemiVisible] = useState(false);
  const [remiState, setRemiState] = useState<RemiState>('idle');
  const [backgroundWarn, setBackgroundWarn] = useState(false);

  const {
    currentSession,
    isActive,
    timeRemaining,
    pauseSession,
    resumeSession,
    cancelSession,
  } = useFocusStore();

  useTimer(Boolean(currentSession) && isActive);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (
        appState.current === 'active' &&
        (next === 'inactive' || next === 'background') &&
        currentSession &&
        isActive
      ) {
        setBackgroundWarn(true);
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [currentSession, isActive]);

  useEffect(() => {
    if (timeRemaining === 0 && currentSession) {
      router.replace('/session/complete');
    }
  }, [timeRemaining, currentSession, router]);

  const handleCancel = () => {
    cancelSession();
    router.back();
  };

  const handleComplete = () => {
    router.replace('/session/complete');
  };

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
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        testID="active-no-session"
      >
        <Text style={[styles.text, { color: theme.colors.text }]}>{t('focus.noActiveSession')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID="active-session">
      <AmbientMixer mode="playback" selectedIds={currentSession.ambientIds ?? []} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleCancel}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          testID="active-close"
        >
          <X size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {backgroundWarn && (
        <View style={[styles.banner, { backgroundColor: theme.colors.warning + '33' }]}>
          <Text style={[styles.bannerText, { color: theme.colors.text }]}>{t('focus.backgroundHint')}</Text>
        </View>
      )}

      <Text style={[styles.sessionName, { color: theme.colors.textSecondary }]}>{currentSession.name}</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setRemiVisible((v) => !v);
          setRemiState(isActive ? 'idle' : 'encouraging');
        }}
        accessibilityRole="button"
        accessibilityLabel={t('focus.tapForRemi')}
        testID="active-timer-area"
        style={styles.timerContainer}
      >
        <Text style={[styles.timer, { color: theme.colors.text }]}>{formatTime(timeRemaining)}</Text>
      </TouchableOpacity>

      {remiVisible && (
        <View style={styles.remiCorner} testID="active-remi">
          <Remi state={remiState} size={88} />
        </View>
      )}

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

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isActive ? pauseSession : resumeSession}
          style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={isActive ? t('focus.sessionActive') : t('focus.sessionPaused')}
          testID="active-play-pause"
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
          accessibilityRole="button"
          accessibilityLabel={t('common.done')}
          testID="active-complete"
        >
          <Check size={32} color="#fff" weight="bold" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.hint, { color: theme.colors.textMuted }]}>
        {isActive ? t('focus.sessionActive') : t('focus.sessionPaused')}
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
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  remiCorner: {
    position: 'absolute',
    bottom: 140,
    right: 24,
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
  banner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
  },
  bannerText: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
  },
});
