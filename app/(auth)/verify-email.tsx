import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
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
    verifyEmail,
    resendCode,
    logout,
    error,
    clearError,
  } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [codeSent, setCodeSent] = useState(true);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (fullCode: string) => {
    if (isVerifying) return;

    setIsVerifying(true);
    clearError();

    try {
      const success = await verifyEmail(fullCode);
      if (success) {
        router.replace('/(onboarding)/tutorial');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    clearError();
    try {
      await resendCode();
      setCanResend(false);
      setCountdown(60);
      setCodeSent(true);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Failed to resend code:', err);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  // Get error message
  const getErrorMessage = () => {
    if (error === 'verificationError') return t('validation.verificationError');
    return error;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('auth.verifyEmailTitle')}
      </Text>

      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('auth.verifyEmailSubtitle', { email: pendingVerificationEmail })}
      </Text>

      {/* Success message */}
      {codeSent && (
        <Text style={[styles.codeSentText, { color: '#22c55e' }]}>
          {t('validation.codeSent')}
        </Text>
      )}

      {/* Error message */}
      {getErrorMessage() && (
        <Text style={[styles.error, { color: '#ef4444' }]}>
          {getErrorMessage()}
        </Text>
      )}

      {/* 6-digit code input */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref: TextInput | null) => { inputRefs.current[index] = ref; }}
            style={[
              styles.codeInput,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: error ? '#ef4444' : theme.colors.border,
              },
            ]}
            value={digit}
            onChangeText={(value) => handleCodeChange(index, value)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            testID={`code-input-${index}`}
          />
        ))}
      </View>

      {/* Verify button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleVerify(code.join(''))}
        disabled={isVerifying || code.join('').length !== 6}
        testID="verify-button"
      >
        {isVerifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{t('auth.iVerified')}</Text>
        )}
      </TouchableOpacity>

      {/* Resend button */}
      <TouchableOpacity
        style={[
          styles.resendButton,
          { borderColor: theme.colors.border },
          !canResend && styles.resendButtonDisabled,
        ]}
        onPress={handleResend}
        disabled={!canResend}
        testID="resend-code-button"
      >
        <Text
          style={[
            styles.resendButtonText,
            { color: canResend ? theme.colors.primary : theme.colors.textSecondary },
          ]}
        >
          {canResend
            ? t('auth.resendVerification')
            : t('auth.resendIn', { seconds: countdown })}
        </Text>
      </TouchableOpacity>

      {/* Use different email */}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeSentText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  codeInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
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
});
