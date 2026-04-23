import { useStreakStore } from '../store/useStreakStore';

/** Thin hook over streak store for screens and future side-effects. */
export function useStreak() {
  return useStreakStore();
}
