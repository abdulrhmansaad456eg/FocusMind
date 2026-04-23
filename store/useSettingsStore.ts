import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';

interface SettingsState {
  // Session defaults
  defaultSessionType: 'pomodoro' | 'deepWork' | 'quickBurst' | 'windDown';
  defaultPomodoroDuration: number;
  defaultAmbientSound: string | null;

  // Preferences
  hapticsEnabled: boolean;
  soundEffectsEnabled: boolean;

  // Notifications
  sessionRemindersEnabled: boolean;
  streakWarningsEnabled: boolean;
  weeklySummaryEnabled: boolean;

  // Actions
  setDefaultSessionType: (type: SettingsState['defaultSessionType']) => void;
  setDefaultPomodoroDuration: (duration: number) => void;
  setDefaultAmbientSound: (sound: string | null) => void;
  toggleHaptics: () => void;
  toggleSoundEffects: () => void;
  toggleSessionReminders: () => void;
  toggleStreakWarnings: () => void;
  toggleWeeklySummary: () => void;

  // Test functions
  testHaptics: () => Promise<void>;
  testSound: () => Promise<void>;
  testNotification: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  defaultSessionType: 'pomodoro',
  defaultPomodoroDuration: 25,
  defaultAmbientSound: null,
  hapticsEnabled: true,
  soundEffectsEnabled: true,
  sessionRemindersEnabled: true,
  streakWarningsEnabled: true,
  weeklySummaryEnabled: true,

  setDefaultSessionType: (type) => set({ defaultSessionType: type }),
  setDefaultPomodoroDuration: (duration) => set({ defaultPomodoroDuration: duration }),
  setDefaultAmbientSound: (sound) => set({ defaultAmbientSound: sound }),

  toggleHaptics: () => set({ hapticsEnabled: !get().hapticsEnabled }),
  toggleSoundEffects: () => set({ soundEffectsEnabled: !get().soundEffectsEnabled }),
  toggleSessionReminders: () => set({ sessionRemindersEnabled: !get().sessionRemindersEnabled }),
  toggleStreakWarnings: () => set({ streakWarningsEnabled: !get().streakWarningsEnabled }),
  toggleWeeklySummary: () => set({ weeklySummaryEnabled: !get().weeklySummaryEnabled }),

  // Test haptic feedback
  testHaptics: async () => {
    if (get().hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // Double pulse for confirmation
      setTimeout(async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, 150);
    }
  },

  // Test sound effect
  testSound: async () => {
    if (get().soundEffectsEnabled) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/sounds/notification.wav'),
          { shouldPlay: true }
        );
        // Unload after playing
        setTimeout(() => {
          sound.unloadAsync();
        }, 1000);
      } catch (error) {
        console.log('Sound test failed:', error);
      }
    }
  },

  // Test notification
  testNotification: async () => {
    if (get().sessionRemindersEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Your notifications are working! 🎉',
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    }
  },
}));
