import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { useFocusStore } from '../../store/useFocusStore';
import { useStreakStore } from '../../store/useStreakStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StreakBadge } from '../../components/ui/StreakBadge';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { changeLanguage } from '../../i18n/I18nProvider';
import { supportedLanguages } from '../../i18n';
import { themes } from '../../theme/themes';
import { User, Globe, Palette, SignOut, CaretRight, Bell, Vibrate, SpeakerHigh } from 'phosphor-react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { theme, themeName, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { totalCoins, getTotalFocusHours } = useFocusStore();
  const { currentStreak, longestStreak } = useStreakStore();
  const { 
    hapticsEnabled, 
    soundEffectsEnabled, 
    streakWarningsEnabled,
    toggleHaptics, 
    toggleSoundEffects,
    toggleStreakWarnings 
  } = useSettingsStore();

  const totalHours = getTotalFocusHours();

  const handleLanguageChange = async () => {
    const currentIndex = supportedLanguages.findIndex(l => l.code === i18n.language);
    const nextIndex = (currentIndex + 1) % supportedLanguages.length;
    await changeLanguage(supportedLanguages[nextIndex].code);
  };

  const handleThemeChange = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(themeName);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const ToggleRow = ({ 
    icon: Icon, 
    label, 
    value,
    onToggle 
  }: { 
    icon: typeof User; 
    label: string; 
    value: boolean;
    onToggle: () => void;
  }) => (
    <TouchableOpacity onPress={onToggle}>
      <Card style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Icon size={24} color={value ? theme.colors.primary : theme.colors.textMuted} />
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {label}
          </Text>
        </View>
        <View style={[styles.toggle, { backgroundColor: value ? theme.colors.primary : theme.colors.border }]}>
          <View style={[styles.toggleDot, { 
            backgroundColor: '#fff',
            transform: [{ translateX: value ? 20 : 0 }] 
          }]} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    value, 
    onPress 
  }: { 
    icon: typeof User; 
    label: string; 
    value: string; 
    onPress?: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Icon size={24} color={theme.colors.primary} />
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {label}
          </Text>
        </View>
        <View style={styles.settingRight}>
          <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
            {value}
          </Text>
          {onPress && <CaretRight size={20} color={theme.colors.textMuted} />}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('tabs.profile')}
        </Text>
      </View>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: user?.avatarColor || theme.colors.primary }]}>
          <User size={40} color="#fff" weight="bold" />
        </View>
        <Text style={[styles.username, { color: theme.colors.text }]}>
          {user?.username || 'Guest'}
        </Text>
        <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
          {user?.email || 'Not logged in'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <StreakBadge count={currentStreak} />
          </View>
          <View style={styles.statItem}>
            <CoinDisplay amount={totalCoins} />
          </View>
        </View>
      </Card>

      {/* Stats Summary */}
      <View style={styles.summaryRow}>
        <Card style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {totalHours}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Total Hours
          </Text>
        </Card>
        <Card style={[styles.summaryCard, { flex: 1 }]}>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
            {longestStreak}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Best Streak
          </Text>
        </Card>
      </View>

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('settings.title')}
      </Text>

      <SettingRow
        icon={Globe}
        label={t('settings.language')}
        value={supportedLanguages.find(l => l.code === i18n.language)?.name || 'English'}
        onPress={handleLanguageChange}
      />

      <SettingRow
        icon={Palette}
        label={t('settings.theme')}
        value={theme.name}
        onPress={handleThemeChange}
      />

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Notifications & Feedback
      </Text>

      <ToggleRow
        icon={Vibrate}
        label={t('settings.haptics')}
        value={hapticsEnabled}
        onToggle={toggleHaptics}
      />

      <ToggleRow
        icon={SpeakerHigh}
        label={t('settings.soundEffects')}
        value={soundEffectsEnabled}
        onToggle={toggleSoundEffects}
      />

      <ToggleRow
        icon={Bell}
        label={t('settings.notifications')}
        value={streakWarningsEnabled}
        onToggle={toggleStreakWarnings}
      />

      {/* Logout */}
      <View style={styles.logoutSection}>
        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="outline"
        />
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
  profileCard: {
    marginHorizontal: 16,
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  summaryCard: {
    alignItems: 'center',
    padding: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
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
  settingRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  logoutSection: {
    padding: 16,
    marginTop: 8,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
