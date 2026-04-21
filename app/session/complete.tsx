import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useFocusStore } from '../../store/useFocusStore';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CoinDisplay } from '../../components/ui/CoinDisplay';
import { Star } from 'phosphor-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function SessionComplete() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { currentSession, completeSession } = useFocusStore();

  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    // Trigger confetti on mount
    setTimeout(() => {
      confettiRef.current?.start();
    }, 100);
  }, []);

  const handleComplete = () => {
    completeSession(rating, note);
    router.replace('/(tabs)/home');
  };

  // If no session data, show completion message
  const sessionDuration = currentSession?.duration || 0;
  const coinsEarned = Math.floor(sessionDuration / 25) * 10;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Confetti */}
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut={true}
        colors={[theme.colors.primary, theme.colors.accent, theme.colors.warning, theme.colors.success]}
      />
      
      <Text style={[styles.title, { color: theme.colors.text }]}>
        🎉 {t('focus.sessionComplete')}
      </Text>

      <Card style={styles.coinsCard}>
        <Text style={[styles.coinsLabel, { color: theme.colors.textSecondary }]}>
          {t('focus.coinsEarned')}
        </Text>
        <CoinDisplay amount={coinsEarned} size="lg" />
      </Card>

      {/* Rating */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('focus.rateProductivity')}
      </Text>
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Star
              size={40}
              color={star <= rating ? theme.colors.warning : theme.colors.border}
              weight={star <= rating ? 'fill' : 'regular'}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Note */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {t('focus.addNote')}
      </Text>
      <TextInput
        style={[
          styles.noteInput,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder="How did it go? (optional)"
        placeholderTextColor={theme.colors.textSecondary}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={280}
        textAlignVertical="top"
      />
      <Text style={[styles.charCount, { color: theme.colors.textMuted }]}>
        {note.length}/280
      </Text>

      {/* Complete Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Done"
          onPress={handleComplete}
          size="lg"
          style={styles.doneButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  coinsCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    minWidth: 200,
  },
  coinsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  noteInput: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    fontSize: 16,
    marginBottom: 8,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 24,
  },
  doneButton: {
    width: '100%',
  },
});
