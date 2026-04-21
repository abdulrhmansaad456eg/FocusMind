import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '../../store/useFocusStore';
import { useStreakStore } from '../../store/useStreakStore';
import { Card } from '../../components/ui/Card';
import { StreakBadge } from '../../components/ui/StreakBadge';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { Clock, TrendUp, Calendar, Star } from 'phosphor-react-native';

export default function Stats() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { sessions, totalCoins, getTotalFocusHours } = useFocusStore();
  const { currentStreak, longestStreak } = useStreakStore();

  const totalHours = getTotalFocusHours();
  const totalSessions = sessions.length;
  
  // Calculate average rating
  const ratedSessions = sessions.filter(s => s.rating > 0);
  const avgRating = ratedSessions.length > 0
    ? (ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length).toFixed(1)
    : '0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('stats.weeklySummary')}
        </Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Clock size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {totalHours}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            {t('stats.totalHours')}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Star size={24} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {avgRating}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Avg Rating
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <Calendar size={24} color={theme.colors.success} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {totalSessions}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Total Sessions
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <TrendUp size={24} color={theme.colors.accent} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {currentStreak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            {t('stats.currentStreak')}
          </Text>
        </Card>
      </View>

      {/* Streak Section */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Streak Stats
      </Text>
      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.colors.primary }]}>
              {currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
              Current Streak
            </Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.colors.accent }]}>
              {longestStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
              {t('stats.longestStreak')}
            </Text>
          </View>
        </View>
      </Card>

      {/* Recent History */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Recent Sessions
      </Text>
      {sessions.slice(0, 5).map((session) => (
        <Card key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <View>
              <Text style={[styles.sessionName, { color: theme.colors.text }]}>
                {session.name}
              </Text>
              <Text style={[styles.sessionDate, { color: theme.colors.textSecondary }]}>
                {new Date(session.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.sessionMeta}>
              <Text style={[styles.sessionDuration, { color: theme.colors.textSecondary }]}>
                {session.duration}m
              </Text>
              {session.rating > 0 && (
                <Text style={[styles.sessionRating, { color: theme.colors.warning }]}>
                  {'⭐'.repeat(session.rating)}
                </Text>
              )}
            </View>
          </View>
        </Card>
      ))}

      {sessions.length === 0 && (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sessions yet. Start your first focus session!
          </Text>
        </Card>
      )}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 28,
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
    marginTop: 24,
  },
  streakCard: {
    marginHorizontal: 16,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  streakItem: {
    alignItems: 'center',
    flex: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#333',
    marginVertical: 8,
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
  sessionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  sessionMeta: {
    alignItems: 'flex-end',
  },
  sessionDuration: {
    fontSize: 14,
  },
  sessionRating: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
