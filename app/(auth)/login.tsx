import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export default function Login() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoading, error, needsVerification, clearError, googleLogin } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (needsVerification) {
      router.push('/(auth)/verify-email');
    }
  }, [needsVerification, router]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }
    try {
      const success = await login(email, password);
      if (success) {
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Google Sign-In requires @react-native-google-signin/google-signin package
      // and proper Firebase OAuth configuration
      // For now, show setup instructions
      Alert.alert(
        'Google Sign-In Setup Required',
        'To enable Google Sign-In:\n\n1. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID to your .env\n2. Install: npx expo install @react-native-google-signin/google-signin\n3. Configure OAuth in Firebase Console\n4. Rebuild the app',
        [{ text: 'OK' }]
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.welcomeBack')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('auth.loginSubtitle')}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

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
        testID="email-input"
      />

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.surface, 
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder={t('auth.password')}
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleLogin}
        disabled={isLoading}
        testID="login-button"
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('common.loading') : t('auth.login')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.googleButton, { borderColor: theme.colors.border }]}
        onPress={handleGoogleSignIn}
        disabled={googleLoading || isLoading}
        testID="google-login-button"
      >
        {googleLoading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <>
            <Text style={[styles.googleIcon]}>G</Text>
            <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>
              {t('auth.continueWithGoogle')}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
        <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
          {t('auth.or')}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={[styles.link, { color: theme.colors.textSecondary }]}>
          {t('auth.forgotPassword')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          {t('auth.noAccount')}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
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
  link: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  googleButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
});
