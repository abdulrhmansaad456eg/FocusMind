import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FocusSession } from './useFocusStore';

export const ACHIEVEMENT_IDS = [
  'firstFocus',
  'nightOwl',
  'earlyBird',
  'ironMind',
  'monkMode',
  'silentGiant',
  'linguist',
  'completionist',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

interface AchievementState {
  unlocked: AchievementId[];
  languageSwitchCount: number;
  onboardingCompleteTracked: boolean;
  recordSessionCompleted: (
    session: FocusSession,
    ctx: { streak: number; totalHours: number; sessionsToday: number; totalSessions: number },
  ) => void;
  recordLanguageSwitch: () => void;
  recordOnboardingComplete: () => void;
  isUnlocked: (id: AchievementId) => boolean;
}

function mergeUnlock(current: AchievementId[], next: AchievementId[]): AchievementId[] {
  const set = new Set([...current, ...next]);
  return ACHIEVEMENT_IDS.filter((id) => set.has(id));
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      unlocked: [],
      languageSwitchCount: 0,
      onboardingCompleteTracked: false,

      recordSessionCompleted: (session, ctx) => {
        const unlocked: AchievementId[] = [];
        const { unlocked: prev } = get();

        if (ctx.totalSessions === 1 && !prev.includes('firstFocus')) {
          unlocked.push('firstFocus');
        }

        const d = new Date(session.date);
        const hour = d.getHours();
        if (hour >= 0 && hour < 4) {
          unlocked.push('nightOwl');
        }
        if (hour >= 4 && hour < 7) {
          unlocked.push('earlyBird');
        }
        if (ctx.streak >= 7) {
          unlocked.push('ironMind');
        }
        if (ctx.sessionsToday >= 5) {
          unlocked.push('monkMode');
        }
        if (ctx.totalHours >= 100) {
          unlocked.push('silentGiant');
        }

        if (unlocked.length) {
          set({ unlocked: mergeUnlock(prev, unlocked) });
        }
      },

      recordLanguageSwitch: () => {
        const { languageSwitchCount, unlocked } = get();
        const next = languageSwitchCount + 1;
        const add: AchievementId[] = [];
        if (next >= 3 && !unlocked.includes('linguist')) {
          add.push('linguist');
        }
        set({
          languageSwitchCount: next,
          unlocked: add.length ? mergeUnlock(unlocked, add) : unlocked,
        });
      },

      recordOnboardingComplete: () => {
        const { unlocked, onboardingCompleteTracked } = get();
        if (onboardingCompleteTracked) {
          return;
        }
        set({
          onboardingCompleteTracked: true,
          unlocked: mergeUnlock(unlocked, ['completionist']),
        });
      },

      isUnlocked: (id) => get().unlocked.includes(id),
    }),
    {
      name: 'focusmind-achievements',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
