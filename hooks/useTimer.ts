import { useEffect } from 'react';
import { useFocusStore } from '../store/useFocusStore';

/**
 * Advances the focus timer once per second while `enabled` is true.
 * Matches the master prompt `hooks/useTimer.ts` contract.
 */
export function useTimer(enabled: boolean): void {
  const tick = useFocusStore((s) => s.tick);
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const id = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(id);
  }, [enabled, tick]);
}
