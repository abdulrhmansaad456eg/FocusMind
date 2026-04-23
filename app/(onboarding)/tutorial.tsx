import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { themes } from '../../theme/themes';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/I18nProvider';
import { supportedLanguages } from '../../i18n';
import { useAuthStore } from '../../store/useAuthStore';
import { useAchievementStore } from '../../store/useAchievementStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft, Target, Flame, Coins, Palette, Bell } from 'phosphor-react-native';
import { Remi, RemiState, RemiDialogue } from '../../components/remi';

const TOTAL_STEPS = 6;

export default function Tutorial() {
  const { theme, themeName, setTheme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { setOnboardingComplete } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [firstGoal, setFirstGoal] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [remiState, setRemiState] = useState<RemiState>('happy');
  const [showDialogue, setShowDialogue] = useState(true);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      // Update Remi state based on step
      updateRemiState(currentStep + 1);
    } else {
      setOnboardingComplete();
      useAchievementStore.getState().recordOnboardingComplete();
      router.replace('/(tabs)/home');
    }
  };

  const updateRemiState = (step: number) => {
    setShowDialogue(true);
    switch (step) {
      case 1:
        setRemiState('happy');
        break;
      case 2:
        setRemiState('thinking');
        break;
      case 3:
        setRemiState('encouraging');
        break;
      case 4:
        setRemiState('celebrating');
        break;
      case 5:
        setRemiState('happy');
        break;
      case 6:
        setRemiState('encouraging');
        break;
      default:
        setRemiState('idle');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleThemeSelect = (themeKey: string) => {
    setSelectedTheme(themeKey);
    setTheme(themeKey);
  };

  const handleLanguageSelect = async (langCode: string) => {
    await changeLanguage(langCode);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.remiContainer}>
              <Remi state={remiState} size={140} />
              {showDialogue && (
                <RemiDialogue
                  state={remiState}
                  position="bottom"
                  onClose={() => setShowDialogue(false)}
                />
              )}
            </View>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {t('remi.intro1')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('remi.intro2')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('remi.intro3')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('remi.intro4')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('remi.intro5')}
            </Text>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Target size={64} color={theme.colors.primary} />
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {t('onboarding.step1Title')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('onboarding.step1Subtitle')}
            </Text>
            <TextInput
              style={[
                styles.goalInput,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="e.g., Study for exam, Work on project..."
              placeholderTextColor={theme.colors.textSecondary}
              value={firstGoal}
              onChangeText={setFirstGoal}
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Flame size={64} color={theme.colors.warning} />
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {t('onboarding.step2Title')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('onboarding.step2Subtitle')}
            </Text>
            <Card style={styles.streakDemo}>
              <Text style={[styles.streakNumber, { color: theme.colors.warning }]}>7</Text>
              <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
                Day Streak!
              </Text>
            </Card>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Coins size={64} color={theme.colors.warning} />
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {t('onboarding.step4Title')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('onboarding.step4Subtitle')}
            </Text>
            <View style={styles.coinDemo}>
              <Text style={[styles.coinText, { color: theme.colors.warning }]}>🪙</Text>
              <Text style={[styles.coinAmount, { color: theme.colors.text }]}>+10 coins</Text>
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Palette size={64} color={theme.colors.primary} />
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {t('onboarding.step5Title')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('onboarding.step5Subtitle')}
            </Text>
            <View style={styles.themeGrid}>
              {Object.entries(themes).map(([key, themeOption]: [string, typeof themes['dark']]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleThemeSelect(key)}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: themeOption.colors.surface,
                      borderColor: selectedTheme === key ? theme.colors.primary : themeOption.colors.border,
                      borderWidth: selectedTheme === key ? 3 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.themeDot,
                      { backgroundColor: themeOption.colors.primary },
                    ]}
                  />
                  <Text style={[styles.themeName, { color: themeOption.colors.text }]}>
                    {themeOption.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Bell size={64} color={theme.colors.primary} />
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {t('onboarding.step6Title')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
              {t('onboarding.step6Subtitle')}
            </Text>
            <Button
              title="Enable Notifications"
              onPress={handleNext}
              size="lg"
            />
            <TouchableOpacity
              onPress={handleNext}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.notificationsLaterA11y')}
              testID="onboarding-notifications-later"
            >
              <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
                {t('onboarding.notificationsLater')}
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index + 1 <= currentStep ? theme.colors.primary : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      {/* Step Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      {/* Navigation */}
      {currentStep !== 6 && (
        <View style={styles.navigation}>
          {currentStep > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.navButton}>
              <ArrowLeft size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton, { backgroundColor: theme.colors.primary }]}
          >
            <ArrowRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 48,
    paddingBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  remiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  goalInput: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 24,
    fontSize: 16,
  },
  streakDemo: {
    alignItems: 'center',
    padding: 32,
    marginTop: 24,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  streakLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  coinDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  coinText: {
    fontSize: 32,
  },
  coinAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  themeButton: {
    width: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  themeDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  skipButton: {
    marginTop: 16,
  },
  skipText: {
    fontSize: 14,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 48,
  },
  navButton: {
    padding: 12,
    borderRadius: 12,
  },
  nextButton: {
    marginLeft: 'auto',
  },
});
