import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleResetPassword = async () => {
    if (!email) {
      return;
    }

    try {
      await forgotPassword(email);
      setEmailSent(true);
      Alert.alert(
        t('auth.resetEmailSent'),
        t('auth.resetEmailInstructions')
      );
    } catch (err) {
      console.error('Password reset error:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('auth.forgotPasswordTitle')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {emailSent ? t('auth.checkYourEmail') : t('auth.forgotPasswordSubtitle')}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {!emailSent && (
        <>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            placeholder={t('auth.email')}
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="reset-email-input"
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleResetPassword}
            disabled={isLoading || !email}
            testID="reset-password-button"
          >
            <Text style={styles.buttonText}>
              {isLoading ? t('common.loading') : t('auth.sendResetLink')}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {emailSent && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={() => setEmailSent(false)}
          testID="resend-reset-button"
        >
          <Text style={styles.buttonText}>
            {t('auth.resendResetLink')}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => router.push('/(auth)/login')}
        style={styles.backLink}
      >
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          {t('auth.backToLogin')}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 24,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
