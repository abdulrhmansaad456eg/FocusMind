import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useFocusStore } from '../../store/useFocusStore';
import { useStreakStore } from '../../store/useStreakStore';
import { Card } from '../../components/ui/Card';
import { StreakBadge } from '../../components/ui/StreakBadge';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { Target, Clock, TrendUp } from 'phosphor-react-native';
import { Remi, RemiState } from '../../components/remi';
import { useHaptics } from '../../hooks/useHaptics';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { totalCoins, getTodaySessions, getTotalFocusHours } = useFocusStore();
  const { currentStreak } = useStreakStore();
  const { impact } = useHaptics();

  const todaySessions = getTodaySessions();
  const totalHours = getTotalFocusHours();
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Determine Remi state based on user's activity
  const getRemiState = (): RemiState => {
    if (todaySessions.length === 0) {
      return 'encouraging'; // Encourage to start first session
    } else if (currentStreak >= 7) {
      return 'celebrating'; // Celebrating long streak
    } else if (todaySessions.length >= 3) {
      return 'happy'; // Productive day
    }
    return 'idle';
  };

  const handleStartFocus = () => {
    void impact();
    router.push('/focus');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
            Good to see you,
          </Text>
          <Text style={[styles.username, { color: theme.colors.text }]}>
            {user?.username || 'Guest'}
          </Text>
        </View>
        <View style={styles.headerBadges}>
          <CoinDisplay amount={totalCoins} />
          <StreakBadge count={currentStreak} />
        </View>
      </View>

      {/* Remi Companion */}
      <View style={styles.remiSection}>
        <Remi state={getRemiState()} size={100} />
      </View>

      {/* Quick Start Card */}
      <Card style={styles.quickStartCard}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {t('focus.startSession')}
        </Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          Ready to focus? Choose a session type to begin.
        </Text>
        <Button
          title="Start Focusing"
          onPress={handleStartFocus}
          size="lg"
        />
      </Card>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Card style={[styles.statCard, { flex: 1 }]}>
          <Clock size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {todayMinutes}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Minutes Today
          </Text>
        </Card>
        <Card style={[styles.statCard, { flex: 1 }]}>
          <TrendUp size={24} color={theme.colors.success} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {totalHours}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Hours
          </Text>
        </Card>
      </View>

      {/* Recent Sessions */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Today's Sessions
      </Text>
      {todaySessions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Target size={48} color={theme.colors.textMuted} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sessions yet today. Start your first focus session!
          </Text>
        </Card>
      ) : (
        todaySessions.map((session) => (
          <Card key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionRow}>
              <View>
                <Text style={[styles.sessionName, { color: theme.colors.text }]}>
                  {session.name}
                </Text>
                <Text style={[styles.sessionDuration, { color: theme.colors.textSecondary }]}>
                  {session.duration} minutes
                </Text>
              </View>
              <CoinDisplay amount={session.coinsEarned} size="sm" />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingTop: 48,
  },
  greeting: {
    fontSize: 14,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  remiSection: {
    alignItems: 'center',
    marginVertical: 8,
  },
  quickStartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyCard: {
    marginHorizontal: 16,
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  sessionCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDuration: {
    fontSize: 12,
    marginTop: 2,
  },
});
