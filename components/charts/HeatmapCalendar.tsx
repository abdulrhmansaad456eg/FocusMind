import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import type { FocusSession } from '../../store/useFocusStore';

interface HeatmapCalendarProps {
  sessions: FocusSession[];
  testID?: string;
}

/** Last 35 days, 7 columns × 5 rows — intensity = minutes focused that day. */
export function HeatmapCalendar({ sessions, testID }: HeatmapCalendarProps) {
  const { theme } = useTheme();

  const { cells, max } = useMemo(() => {
    const byDay: Record<string, number> = {};
    for (const s of sessions) {
      const key = new Date(s.date).toDateString();
      byDay[key] = (byDay[key] ?? 0) + s.duration;
    }
    const days: { key: string; minutes: number }[] = [];
    const today = new Date();
    for (let i = 34; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days.push({ key, minutes: byDay[key] ?? 0 });
    }
    const max = Math.max(1, ...days.map((d) => d.minutes));
    return { cells: days, max };
  }, [sessions]);

  return (
    <View style={styles.grid} testID={testID}>
      {cells.map((cell) => {
        const level = cell.minutes <= 0 ? 0 : Math.min(4, Math.ceil((cell.minutes / max) * 4));
        const bg =
          level === 0
            ? theme.colors.border
            : [theme.colors.success + '33', theme.colors.success + '55', theme.colors.success + '88', theme.colors.success][
                level - 1
              ];
        return (
          <View
            key={cell.key}
            style={[styles.cell, { backgroundColor: bg }]}
            accessibilityLabel={`${cell.key} ${cell.minutes} minutes`}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'flex-start',
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
});
