/** Remote preview loops (Mixkit free license — requires network during session). */
export const MAX_AMBIENT_LAYERS = 3;

export interface AmbientTrack {
  id: string;
  labelKey: string;
  uri: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'rain',
    labelKey: 'focus.ambientRain',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3',
  },
  {
    id: 'thunder',
    labelKey: 'focus.ambientThunder',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-rumble-2675.mp3',
  },
  {
    id: 'cafe',
    labelKey: 'focus.ambientCafe',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-coffee-shop-ambience-1215.mp3',
  },
  {
    id: 'forest',
    labelKey: 'focus.ambientForest',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-birds-ambience-1680.mp3',
  },
  {
    id: 'ocean',
    labelKey: 'focus.ambientOcean',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-sea-waves-loop-1186.mp3',
  },
  {
    id: 'white',
    labelKey: 'focus.ambientWhite',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-air-conditioner-noise-2677.mp3',
  },
  {
    id: 'brown',
    labelKey: 'focus.ambientBrown',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-dry-thunder-ambience-3597.mp3',
  },
  {
    id: 'lofi',
    labelKey: 'focus.ambientLoFi',
    uri: 'https://assets.mixkit.co/music/preview/mixkit-driving-ambient-138.mp3',
  },
  {
    id: 'fire',
    labelKey: 'focus.ambientFire',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3',
  },
  {
    id: 'library',
    labelKey: 'focus.ambientLibrary',
    uri: 'https://assets.mixkit.co/sfx/preview/mixkit-quiet-library-ambience-4513.mp3',
  },
];

export function getAmbientUri(id: string): string | undefined {
  return AMBIENT_TRACKS.find((t) => t.id === id)?.uri;
}
