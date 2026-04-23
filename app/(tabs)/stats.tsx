import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '../../store/useFocusStore';
import { useStreakStore } from '../../store/useStreakStore';
import { useAchievementStore, ACHIEVEMENT_IDS, type AchievementId } from '../../store/useAchievementStore';
import { Card } from '../../components/ui/Card';
import { StreakBadge } from '../../components/ui/StreakBadge';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { Clock, TrendUp, Calendar, Star } from 'phosphor-react-native';
import { HeatmapCalendar } from '../../components/charts/HeatmapCalendar';
import { FocusBarChart } from '../../components/charts/FocusBarChart';

const achievementTitleKey: Record<AchievementId, string> = {
  firstFocus: 'achievements.firstFocus',
  nightOwl: 'achievements.nightOwl',
  earlyBird: 'achievements.earlyBird',
  ironMind: 'achievements.ironMind',
  monkMode: 'achievements.monkMode',
  silentGiant: 'achievements.silentGiant',
  linguist: 'achievements.linguist',
  completionist: 'achievements.completionist',
};

export default function Stats() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { sessions, totalCoins, getTotalFocusHours } = useFocusStore();
  const { currentStreak, longestStreak } = useStreakStore();
  const { isUnlocked } = useAchievementStore();

  const totalHours = getTotalFocusHours();
  const totalSessions = sessions.length;

  const ratedSessions = sessions.filter((s) => s.rating > 0);
  const avgRating =
    ratedSessions.length > 0
      ? (ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length).toFixed(1)
      : '0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} testID="stats-screen">
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('stats.pageTitle')}</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Clock size={24} color={theme.colors.primary} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalHours}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('stats.totalHours')}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Star size={24} color={theme.colors.warning} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{avgRating}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{t('stats.avgRating')}</Text>
        </Card>

        <Card style={styles.statCard}>
          <Calendar size={24} color={theme.colors.success} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalSessions}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            {t('stats.totalSessions')}
          </Text>
        </Card>

        <Card style={styles.statCard}>
          <TrendUp size={24} color={theme.colors.accent} />
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{currentStreak}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            {t('stats.currentStreak')}
          </Text>
        </Card>
      </View>

      <View style={styles.inlineBadges}>
        <CoinDisplay amount={totalCoins} />
        <StreakBadge count={currentStreak} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stats.weeklyMinutes')}</Text>
      <Card style={styles.chartCard}>
        <FocusBarChart sessions={sessions} testID="stats-bar-chart" />
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stats.focusHeatmap')}</Text>
      <Card style={styles.chartCard}>
        <HeatmapCalendar sessions={sessions} testID="stats-heatmap" />
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stats.streakStats')}</Text>
      <Card style={styles.streakCard}>
        <View style={styles.streakRow}>
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.colors.primary }]}>{currentStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
              {t('stats.currentStreakLabel')}
            </Text>
          </View>
          <View style={[styles.streakDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.streakItem}>
            <Text style={[styles.streakValue, { color: theme.colors.accent }]}>{longestStreak}</Text>
            <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
              {t('stats.longestStreak')}
            </Text>
          </View>
        </View>
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stats.achievementsSection')}</Text>
      <Card style={styles.achievementsCard}>
        {ACHIEVEMENT_IDS.map((id) => {
          const unlocked = isUnlocked(id);
          return (
            <View key={id} style={styles.achievementRow}>
              <Text style={[styles.achievementTitle, { color: theme.colors.text }]}>
                {t(achievementTitleKey[id])}
              </Text>
              <Text
                style={[
                  styles.achievementState,
                  { color: unlocked ? theme.colors.success : theme.colors.textMuted },
                ]}
              >
                {unlocked ? t('stats.unlocked') : t('stats.locked')}
              </Text>
            </View>
          );
        })}
      </Card>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('stats.recentSessions')}</Text>
      {sessions.slice(0, 5).map((session) => (
        <Card key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionRow}>
            <View>
              <Text style={[styles.sessionName, { color: theme.colors.text }]}>{session.name}</Text>
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
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t('stats.emptyHint')}</Text>
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
  inlineBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 24,
  },
  chartCard: {
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    marginVertical: 8,
  },
  achievementsCard: {
    marginHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  achievementState: {
    fontSize: 13,
    fontWeight: '600',
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
