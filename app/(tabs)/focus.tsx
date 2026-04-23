import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '../../store/useFocusStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { Timer, Brain, Lightning, Moon } from 'phosphor-react-native';
import { AmbientMixer } from '../../components/focus/AmbientMixer';

type SessionType = 'pomodoro' | 'deepWork' | 'quickBurst' | 'windDown';

interface SessionOption {
  type: SessionType;
  titleKey: string;
  descKey: string;
  icon: typeof Timer;
  durations: number[];
  defaultDuration: number;
}

const sessionOptions: SessionOption[] = [
  {
    type: 'pomodoro',
    titleKey: 'focus.pomodoro',
    descKey: 'focus.pomodoroHelp',
    icon: Timer,
    durations: [25, 50],
    defaultDuration: 25,
  },
  {
    type: 'deepWork',
    titleKey: 'focus.deepWork',
    descKey: 'focus.deepWorkHelp',
    icon: Brain,
    durations: [60, 90, 120],
    defaultDuration: 60,
  },
  {
    type: 'quickBurst',
    titleKey: 'focus.quickBurst',
    descKey: 'focus.quickBurstHelp',
    icon: Lightning,
    durations: [5, 10, 15],
    defaultDuration: 10,
  },
  {
    type: 'windDown',
    titleKey: 'focus.windDown',
    descKey: 'focus.windDownHelp',
    icon: Moon,
    durations: [10, 15, 20],
    defaultDuration: 10,
  },
];

export default function Focus() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { startSession } = useFocusStore();
  const { defaultSessionType } = useSettingsStore();

  const [selectedType, setSelectedType] = useState<SessionType>(defaultSessionType);
  const [sessionName, setSessionName] = useState('');
  const [ambientIds, setAmbientIds] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(
    sessionOptions.find((s) => s.type === defaultSessionType)?.defaultDuration || 25,
  );

  const currentOption = sessionOptions.find((s) => s.type === selectedType) || sessionOptions[0];

  const handleStartSession = () => {
    const name = sessionName.trim() || t('focus.startSession');
    startSession(name, selectedDuration, selectedType, ambientIds);
    router.push('/session/active');
  };

  const SessionTypeCard = ({ option }: { option: SessionOption }) => {
    const Icon = option.icon;
    const isSelected = selectedType === option.type;

    return (
      <TouchableOpacity
        testID={`session-type-${option.type}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        onPress={() => {
          setSelectedType(option.type);
          setSelectedDuration(option.defaultDuration);
        }}
        style={[
          styles.typeCard,
          {
            backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <Icon
          size={32}
          color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
          weight={isSelected ? 'fill' : 'regular'}
        />
        <Text style={[styles.typeTitle, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>
          {t(option.titleKey)}
        </Text>
        <Text style={[styles.typeDesc, { color: theme.colors.textSecondary }]}>{t(option.descKey)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="focus-screen"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('focus.startSession')}</Text>
      </View>

      <Card style={styles.nameCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('focus.sessionName')}</Text>
        <TextInput
          value={sessionName}
          onChangeText={setSessionName}
          placeholder={t('focus.sessionName')}
          placeholderTextColor={theme.colors.textSecondary}
          style={[
            styles.nameInput,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
          testID="focus-session-name-input"
          accessibilityLabel={t('focus.sessionName')}
        />
      </Card>

      <View style={styles.typeGrid}>
        {sessionOptions.map((option) => (
          <SessionTypeCard key={option.type} option={option} />
        ))}
      </View>

      <Card style={styles.durationCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('focus.duration')}</Text>
        <View style={styles.durationRow}>
          {currentOption.durations.map((duration) => (
            <TouchableOpacity
              key={duration}
              testID={`focus-duration-${duration}`}
              onPress={() => setSelectedDuration(duration)}
              style={[
                styles.durationButton,
                {
                  backgroundColor:
                    selectedDuration === duration ? theme.colors.primary : theme.colors.background,
                },
              ]}
            >
              <Text
                style={[
                  styles.durationText,
                  { color: selectedDuration === duration ? '#ffffff' : theme.colors.text },
                ]}
              >
                {duration}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <AmbientMixer mode="select" selectedIds={ambientIds} onChange={setAmbientIds} testID="focus-ambient" />

      <View style={styles.startSection}>
        <Button
          title={t('focus.startSessionCta')}
          onPress={handleStartSession}
          size="lg"
          style={styles.startButton}
          testID="focus-start-button"
        />
        <Text style={[styles.durationDisplay, { color: theme.colors.textSecondary }]}>
          {t('focus.minutesOfFocus', { count: selectedDuration })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  nameCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  typeCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  typeDesc: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  durationCard: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  durationText: {
    fontWeight: '600',
  },
  startSection: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  startButton: {
    width: '100%',
  },
  durationDisplay: {
    marginTop: 12,
    fontSize: 14,
  },
});
