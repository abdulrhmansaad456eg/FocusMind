import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';

export default function Signup() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleSignup = async () => {
    try {
      const success = await signup(email, password, username);
      if (success) {
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('auth.createAccount')}</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('auth.signupSubtitle')}
      </Text>

      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.surface, 
          color: theme.colors.text,
          borderColor: theme.colors.border 
        }]}
        placeholder={t('auth.username')}
        placeholderTextColor={theme.colors.textSecondary}
        value={username}
        onChangeText={setUsername}
        testID="username-input"
      />

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
        onPress={handleSignup}
        disabled={isLoading}
        testID="signup-button"
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('common.loading') : t('auth.signup')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          {t('auth.hasAccount')}
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
    marginTop: 24,
    textAlign: 'center',
    fontSize: 14,
  },
  error: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});
