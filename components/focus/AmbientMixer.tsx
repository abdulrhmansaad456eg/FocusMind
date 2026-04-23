import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeProvider';
import { AMBIENT_TRACKS, MAX_AMBIENT_LAYERS } from '../../constants/ambientSounds';

type Mode = 'select' | 'playback';

type Base = {
  testID?: string;
};

type SelectProps = Base & {
  mode: 'select';
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

type PlaybackProps = Base & {
  mode: 'playback';
  selectedIds: string[];
};

type AmbientMixerProps = SelectProps | PlaybackProps;

export function AmbientMixer(props: AmbientMixerProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const soundsRef = useRef<Record<string, Audio.Sound>>({});

  const unloadAll = useCallback(async () => {
    const entries = Object.entries(soundsRef.current);
    soundsRef.current = {};
    await Promise.all(
      entries.map(async ([, sound]) => {
        try {
          await sound.unloadAsync();
        } catch {
          /* ignore */
        }
      }),
    );
  }, []);

  const playbackKey = props.mode === 'playback' ? props.selectedIds.join('|') : '';

  useEffect(() => {
    if (props.mode !== 'playback') {
      return undefined;
    }
    const ids = props.selectedIds.slice(0, MAX_AMBIENT_LAYERS);
    let cancelled = false;

    const run = async () => {
      await unloadAll();
      if (cancelled || ids.length === 0) {
        return;
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
      for (const id of ids) {
        const track = AMBIENT_TRACKS.find((a) => a.id === id);
        if (!track || cancelled) {
          continue;
        }
        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri: track.uri },
            { shouldPlay: true, isLooping: true, volume: 0.35 },
            (s: AVPlaybackStatus) => {
              if (!s.isLoaded && 'error' in s && s.error) {
                console.warn('Ambient playback error', id, s.error);
              }
            },
          );
          soundsRef.current[id] = sound;
        } catch (e) {
          console.warn('Ambient load failed', id, e);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
      void unloadAll();
    };
  }, [props.mode, playbackKey, unloadAll]);

  if (props.mode === 'playback') {
    return null;
  }

  const toggle = (id: string) => {
    const has = props.selectedIds.includes(id);
    if (has) {
      props.onChange(props.selectedIds.filter((x) => x !== id));
      return;
    }
    if (props.selectedIds.length >= MAX_AMBIENT_LAYERS) {
      props.onChange([...props.selectedIds.slice(1), id]);
      return;
    }
    props.onChange([...props.selectedIds, id]);
  };

  return (
    <View style={styles.wrap} testID={props.testID}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('focus.ambientSounds')}</Text>
      <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>{t('focus.ambientHint')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {AMBIENT_TRACKS.map((track) => {
          const on = props.selectedIds.includes(track.id);
          return (
            <TouchableOpacity
              key={track.id}
              onPress={() => toggle(track.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={t(track.labelKey)}
              testID={`ambient-chip-${track.id}`}
              style={[
                styles.chip,
                {
                  borderColor: on ? theme.colors.primary : theme.colors.border,
                  backgroundColor: on ? theme.colors.primary + '22' : theme.colors.surface,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: on ? theme.colors.primary : theme.colors.text }]}>
                {t(track.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    marginBottom: 10,
  },
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 13,
  },
});
