import { View, Text, StyleSheet } from 'react-native';
import { Fire } from 'phosphor-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface StreakBadgeProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ count, size = 'md' }: StreakBadgeProps) {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 28;
      default: return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 12;
      case 'md': return 14;
      case 'lg': return 18;
      default: return 14;
    }
  };

  return (
    <View style={styles.container}>
      <Fire size={getSize()} color={theme.colors.warning} weight="fill" />
      <Text style={[styles.count, { color: theme.colors.warning, fontSize: getFontSize() }]}>
        {count}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  count: {
    fontWeight: '700',
  },
});
