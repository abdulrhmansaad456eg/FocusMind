import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { FocusSession } from '../../store/useFocusStore';

interface FocusBarChartProps {
  sessions: FocusSession[];
  testID?: string;
}

const LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Minutes focused per calendar day for the last 7 days. */
export function FocusBarChart({ sessions, testID }: FocusBarChartProps) {
  const { theme } = useTheme();

  const bars = useMemo(() => {
    const days: { label: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      let minutes = 0;
      for (const s of sessions) {
        if (new Date(s.date).toDateString() === key) {
          minutes += s.duration;
        }
      }
      days.push({ label: LABELS[d.getDay()], minutes });
    }
    const max = Math.max(1, ...days.map((x) => x.minutes));
    return days.map((b) => ({
      ...b,
      fillHeight: Math.max(4, Math.round((b.minutes / max) * 72)),
    }));
  }, [sessions]);

  return (
    <View style={styles.row} testID={testID}>
      {bars.map((b, idx) => (
        <View key={`day-${idx}`} style={styles.barWrap}>
          <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.barFill,
                {
                  height: b.fillHeight,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
    paddingTop: 8,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600',
  },
});
