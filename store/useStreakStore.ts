import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  streakShields: number; // Items to protect a missed day
  milestones: number[]; // Completed milestones (3, 7, 14, 30, 60, 100)
  
  // Actions
  checkAndUpdateStreak: (hasSessionToday: boolean) => void;
  useStreakShield: () => boolean;
  addStreakShield: () => void;
  getWeeklySummary: () => { day: string; minutes: number }[];
}

const MILESTONES = [3, 7, 14, 30, 60, 100];

export const useStreakStore = create<StreakState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      streakShields: 1,
      milestones: [],

      checkAndUpdateStreak: (hasSessionToday) => {
        const { currentStreak, longestStreak, lastActiveDate, streakShields, milestones } = get();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        // Already logged in today
        if (lastActiveDate === today) {
          return;
        }

        let newStreak = currentStreak;
        let newShields = streakShields;
        let newMilestones = [...milestones];

        if (hasSessionToday) {
          // Continue or start streak
          if (lastActiveDate === yesterday || !lastActiveDate) {
            newStreak = currentStreak + 1;
          } else {
            // Missed days - check for streak shield
            if (streakShields > 0) {
              newShields = streakShields - 1;
              newStreak = currentStreak + 1; // Protected
            } else {
              newStreak = 1; // Reset
            }
          }

          // Check for milestones
          if (MILESTONES.includes(newStreak) && !milestones.includes(newStreak)) {
            newMilestones.push(newStreak);
            newShields += 1; // Earn a shield at milestones
          }
        }

        set({
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          lastActiveDate: today,
          streakShields: newShields,
          milestones: newMilestones,
        });
      },

      useStreakShield: () => {
        const { streakShields } = get();
        if (streakShields > 0) {
          set({ streakShields: streakShields - 1 });
          return true;
        }
        return false;
      },

      addStreakShield: () => {
        const { streakShields } = get();
        set({ streakShields: streakShields + 1 });
      },

      getWeeklySummary: () => {
        // Return mock data for now - will be populated from focus sessions
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.map(day => ({
          day,
          minutes: Math.floor(Math.random() * 120),
        }));
      },
    }),
    {
      name: '@focusmind_streak',
      storage: createJSONStorage(() => AsyncStorage),
      skipHydration: true,
    }
  )
);
