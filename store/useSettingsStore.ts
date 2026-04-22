import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: '@focusmind_settings',
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
    }
  )
);
