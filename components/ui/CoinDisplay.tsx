import { View, Text, StyleSheet } from 'react-native';
import { Coin } from 'phosphor-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface CoinDisplayProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export function CoinDisplay({ amount, size = 'md' }: CoinDisplayProps) {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
      default: return 20;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 20;
      default: return 16;
    }
  };

  return (
    <View style={styles.container}>
      <Coin size={getSize()} color={theme.colors.warning} weight="fill" />
      <Text style={[styles.amount, { color: theme.colors.warning, fontSize: getFontSize() }]}>
        {amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontWeight: '700',
  },
});
