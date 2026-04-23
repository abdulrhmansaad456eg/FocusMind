import { Audio, type AVPlaybackStatus } from 'expo-av';
import { useCallback, useRef, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type AmbientPlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/**
 * Plays one ambient loop (local asset URI or remote URL). Mixer UI can stack multiple hooks later.
 */
export function useAmbientAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [status, setStatus] = useState<AmbientPlaybackStatus>('idle');
  const soundEffectsEnabled = useSettingsStore((s) => s.soundEffectsEnabled);

  const unload = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setStatus('idle');
  }, []);

  const loadAndPlay = useCallback(
    async (uri: string) => {
      if (!soundEffectsEnabled) {
        return;
      }
      setStatus('loading');
      await unload();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, isLooping: true },
        (playback: AVPlaybackStatus) => {
          if (!playback.isLoaded) {
            if (playback.error) {
              setStatus('error');
            }
            return;
          }
          setStatus(playback.isPlaying ? 'playing' : 'paused');
        },
      );
      soundRef.current = sound;
      setStatus('playing');
    },
    [soundEffectsEnabled, unload],
  );

  const setVolume = useCallback(async (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    if (soundRef.current) {
      await soundRef.current.setVolumeAsync(clamped);
    }
  }, []);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  return {
    status,
    loadAndPlay,
    unload,
    setVolume,
    pause,
    resume,
  };
}
