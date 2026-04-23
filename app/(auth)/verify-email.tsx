import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export default function VerifyEmail() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    pendingVerificationEmail,
    resendVerification,
    checkVerificationStatus,
    logout,
    error,
    clearError,
  } = useAuthStore();

  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleCheckVerification = useCallback(async () => {
    setIsChecking(true);
    clearError();

    try {
      const isVerified = await checkVerificationStatus();
      if (isVerified) {
        router.replace('/(tabs)/home');
      }
    } finally {
      setIsChecking(false);
    }
  }, [checkVerificationStatus, router, clearError]);

  const handleResend = useCallback(async () => {
    clearError();
    try {
      await resendVerification();
      setCanResend(false);
      setCountdown(60);
    } catch (err) {
      console.error('Failed to resend verification:', err);
    }
  }, [resendVerification, clearError]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/login');
  }, [logout, router]);

  // Auto-check every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChecking) {
        handleCheckVerification();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [handleCheckVerification, isChecking]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.iconContainer}>
        <Text style={styles.emailIcon}>📧</Text>
      </View>

      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('auth.verifyEmailTitle')}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('auth.verifyEmailSubtitle', { email: pendingVerificationEmail })}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.infoBox}>
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          {t('auth.spamFolderTip')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleCheckVerification}
        disabled={isChecking}
        testID="check-verification-button"
      >
        {isChecking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {t('auth.iVerified')}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.resendButton,
          { borderColor: theme.colors.border },
          !canResend && styles.resendButtonDisabled
        ]}
        onPress={handleResend}
        disabled={!canResend}
        testID="resend-verification-button"
      >
        <Text
          style={[
            styles.resendButtonText,
            { color: canResend ? theme.colors.primary : theme.colors.textSecondary }
          ]}
        >
          {canResend
            ? t('auth.resendVerification')
            : t('auth.resendIn', { seconds: countdown })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutLink}>
        <Text style={[styles.link, { color: theme.colors.textSecondary }]}>
          {t('auth.useDifferentEmail')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  emailIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    maxWidth: '100%',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    marginBottom: 24,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutLink: {
    marginTop: 8,
  },
  link: {
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
