import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export function useHaptics() {
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);

  const impact = useCallback(
    async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
      if (!hapticsEnabled) {
        return;
      }
      await Haptics.impactAsync(style);
    },
    [hapticsEnabled],
  );

  const notification = useCallback(
    async (style: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
      if (!hapticsEnabled) {
        return;
      }
      await Haptics.notificationAsync(style);
    },
    [hapticsEnabled],
  );

  return { impact, notification, hapticsEnabled };
}
