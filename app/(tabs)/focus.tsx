import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '../../store/useFocusStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { Timer, Brain, Lightning, Moon, Coffee, Play } from 'phosphor-react-native';

type SessionType = 'pomodoro' | 'deepWork' | 'quickBurst' | 'windDown';

interface SessionOption {
  type: SessionType;
  title: string;
  description: string;
  icon: typeof Timer;
  durations: number[];
  defaultDuration: number;
}

const sessionOptions: SessionOption[] = [
  {
    type: 'pomodoro',
    title: 'Pomodoro',
    description: '25 min focus + 5 min break',
    icon: Timer,
    durations: [25, 50],
    defaultDuration: 25,
  },
  {
    type: 'deepWork',
    title: 'Deep Work',
    description: 'Uninterrupted focus session',
    icon: Brain,
    durations: [60, 90, 120],
    defaultDuration: 60,
  },
  {
    type: 'quickBurst',
    title: 'Quick Burst',
    description: 'Short focused sprint',
    icon: Lightning,
    durations: [5, 10, 15],
    defaultDuration: 10,
  },
  {
    type: 'windDown',
    title: 'Wind Down',
    description: 'End of day reflection',
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
  const [selectedDuration, setSelectedDuration] = useState(
    sessionOptions.find(s => s.type === defaultSessionType)?.defaultDuration || 25
  );

  const currentOption = sessionOptions.find(s => s.type === selectedType) || sessionOptions[0];

  const handleStartSession = () => {
    const name = sessionName.trim() || 'Focus Session';
    startSession(name, selectedDuration, selectedType);
    router.push('/session/active');
  };

  const SessionTypeCard = ({ option }: { option: SessionOption }) => {
    const Icon = option.icon;
    const isSelected = selectedType === option.type;

    return (
      <TouchableOpacity
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
          {option.title}
        </Text>
        <Text style={[styles.typeDesc, { color: theme.colors.textSecondary }]}>
          {option.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('focus.startSession')}
        </Text>
      </View>

      {/* Session Type Selection */}
      <View style={styles.typeGrid}>
        {sessionOptions.map(option => (
          <SessionTypeCard key={option.type} option={option} />
        ))}
      </View>

      {/* Duration Selection */}
      <Card style={styles.durationCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Duration
        </Text>
        <View style={styles.durationRow}>
          {currentOption.durations.map(duration => (
            <TouchableOpacity
              key={duration}
              onPress={() => setSelectedDuration(duration)}
              style={[
                styles.durationButton,
                {
                  backgroundColor: selectedDuration === duration ? theme.colors.primary : theme.colors.background,
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

      {/* Start Button */}
      <View style={styles.startSection}>
        <Button
          title="Start Session"
          onPress={handleStartSession}
          size="lg"
          style={styles.startButton}
        />
        <Text style={[styles.durationDisplay, { color: theme.colors.textSecondary }]}>
          {selectedDuration} minutes of focused work
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
  },
  startButton: {
    width: '100%',
  },
  durationDisplay: {
    marginTop: 12,
    fontSize: 14,
  },
});
