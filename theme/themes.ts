export interface Theme {
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    primaryLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    overlay: string;
  };
}

export const themes: Record<string, Theme> = {
  dark: {
    name: 'dark',
    colors: {
      background: '#0f172a',
      surface: '#1e293b',
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      textMuted: '#64748b',
      border: '#334155',
      accent: '#06b6d4',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  light: {
    name: 'light',
    colors: {
      background: '#fafaf9',
      surface: '#ffffff',
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      text: '#1c1917',
      textSecondary: '#78716c',
      textMuted: '#a8a29e',
      border: '#e7e5e4',
      accent: '#06b6d4',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      overlay: 'rgba(0, 0, 0, 0.3)',
    },
  },
  oled: {
    name: 'oled',
    colors: {
      background: '#000000',
      surface: '#0a0a0a',
      primary: '#00ff88',
      primaryLight: '#33ffaa',
      text: '#ffffff',
      textSecondary: '#a0a0a0',
      textMuted: '#666666',
      border: '#222222',
      accent: '#ff00ff',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  sunset: {
    name: 'sunset',
    colors: {
      background: '#1a0a2e',
      surface: '#2d1b4e',
      primary: '#f97316',
      primaryLight: '#fb923c',
      text: '#fff7ed',
      textSecondary: '#fdba74',
      textMuted: '#9a3412',
      border: '#431407',
      accent: '#c026d3',
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626',
      overlay: 'rgba(26, 10, 46, 0.6)',
    },
  },
  matcha: {
    name: 'matcha',
    colors: {
      background: '#f0fdf4',
      surface: '#ffffff',
      primary: '#16a34a',
      primaryLight: '#4ade80',
      text: '#14532d',
      textSecondary: '#166534',
      textMuted: '#86efac',
      border: '#bbf7d0',
      accent: '#15803d',
      success: '#22c55e',
      warning: '#ca8a04',
      error: '#dc2626',
      overlay: 'rgba(20, 83, 45, 0.2)',
    },
  },
  midnightBlue: {
    name: 'midnightBlue',
    colors: {
      background: '#0f172a',
      surface: '#1e1b4b',
      primary: '#f59e0b',
      primaryLight: '#fbbf24',
      text: '#fef3c7',
      textSecondary: '#d97706',
      textMuted: '#78350f',
      border: '#312e81',
      accent: '#fbbf24',
      success: '#22c55e',
      warning: '#ea580c',
      error: '#dc2626',
      overlay: 'rgba(30, 27, 75, 0.6)',
    },
  },
};

export const defaultTheme = themes.dark;
