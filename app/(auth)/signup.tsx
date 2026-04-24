import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore';
import { validatePassword, validateEmail, validateUsername } from '../../utils/validation';
import { isFirebaseConfigured } from '../../services/firebase';

export default function Signup() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { signup, isLoading, error, needsVerification, clearError, checkUsernameAvailability } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Password validation state
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

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

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameTaken(false);
      return;
    }

    const timer = setTimeout(async () => {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.isValid) return;

      setCheckingUsername(true);
      const exists = await checkUsernameAvailability(username);
      setUsernameTaken(exists);
      setCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  // Validate email on change
  useEffect(() => {
    if (email) {
      setEmailValid(validateEmail(email));
    }
  }, [email]);

  // Validate password on change
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValid(validation.isValid);
      
      // Update individual checks
      setPasswordChecks({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      });
    }
  }, [password]);

  const getErrorMessage = useCallback(() => {
    if (error) {
      // Translate error keys
      if (error === 'usernameTaken') return t('validation.usernameTaken');
      if (error === 'emailInvalid') return t('validation.emailInvalid');
      if (error === 'passwordWeak') return t('validation.passwordWeak');
      if (error === 'verificationError') return t('validation.verificationError');
      return error;
    }
    if (usernameTaken) return t('validation.usernameTaken');
    if (!emailValid && email) return t('validation.emailInvalid');
    return null;
  }, [error, usernameTaken, emailValid, email, t]);

  const handleSignup = async () => {
    if (!email || !password || !username) {
      return;
    }

    if (usernameTaken || !emailValid || !passwordValid) {
      return;
    }

    try {
      const success = await signup(email, password, username);
      if (success) {
        router.replace('/(tabs)/home');
      }
      // If success is false but no error, verification code was sent
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

      {getErrorMessage() && (
        <Text style={[styles.error, { color: '#ef4444' }]}>
          {getErrorMessage()}
        </Text>
      )}

      {/* Remi Welcome Message */}
      <Text style={[styles.remiText, { color: theme.colors.textSecondary }]}>
        {t('remi.welcomeSignup')}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: usernameTaken ? '#ef4444' : theme.colors.border,
            },
          ]}
          placeholder={t('auth.username')}
          placeholderTextColor={theme.colors.textSecondary}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          testID="username-input"
        />
        {checkingUsername && (
          <ActivityIndicator style={styles.inputIcon} size="small" color={theme.colors.textSecondary} />
        )}
        {!checkingUsername && username.length >= 3 && (
          <Text style={[styles.inputIcon, { color: usernameTaken ? '#ef4444' : '#22c55e' }]}>
            {usernameTaken ? '✗' : '✓'}
          </Text>
        )}
      </View>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: !emailValid && email ? '#ef4444' : theme.colors.border,
          },
        ]}
        placeholder={t('auth.email')}
        placeholderTextColor={theme.colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        testID="email-input"
      />

      <View>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: !passwordValid && password ? '#ef4444' : theme.colors.border,
            },
          ]}
          placeholder={t('auth.password')}
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setShowPasswordRequirements(true);
          }}
          onFocus={() => setShowPasswordRequirements(true)}
          secureTextEntry
          testID="password-input"
        />

        {/* Password Requirements */}
        {showPasswordRequirements && (
          <View style={[styles.passwordRequirements, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
              {t('auth.passwordRequirements')}
            </Text>
            <RequirementItem met={passwordChecks.length} text={t('auth.reqLength')} />
            <RequirementItem met={passwordChecks.uppercase} text={t('auth.reqUppercase')} />
            <RequirementItem met={passwordChecks.lowercase} text={t('auth.reqLowercase')} />
            <RequirementItem met={passwordChecks.number} text={t('auth.reqNumber')} />
            <RequirementItem met={passwordChecks.special} text={t('auth.reqSpecial')} />
          </View>
        )}
      </View>

      {/* Firebase Not Configured Warning */}
      {!isFirebaseConfigured() && (
        <View style={[styles.warningBox, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
          <Text style={[styles.warningText, { color: '#92400e' }]}>
            Firebase not configured. Please check your .env file and restart the app.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleSignup}
        disabled={isLoading}
        testID="signup-button"
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('common.loading') : t('auth.signupSendCode')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.link, { color: theme.colors.primary }]}>
          {t('auth.hasAccount')}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
        {t('auth.termsAgreement')}
      </Text>
    </View>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementItem}>
      <Text style={[styles.checkmark, { color: met ? '#22c55e' : '#9ca3af' }]}>
        {met ? '✓' : '○'}
      </Text>
      <Text style={[styles.requirementText, { color: met ? '#22c55e' : '#9ca3af' }]}>
        {text}
      </Text>
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
    marginBottom: 16,
  },
  remiText: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
    fontSize: 18,
    fontWeight: 'bold',
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
    marginBottom: 16,
    textAlign: 'center',
  },
  termsText: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
  },
  passwordRequirements: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  checkmark: {
    width: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  requirementText: {
    fontSize: 13,
  },
  warningBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
