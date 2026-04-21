import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Theme, themes, defaultTheme } from './themes';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  theme: Theme;
  setTheme: (themeName: string) => void;
  themeName: string;
  isAuto: boolean;
  setIsAuto: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@focusmind_theme';
const THEME_AUTO_KEY = '@focusmind_theme_auto';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeName, setThemeName] = useState<string>('dark');
  const [isAuto, setIsAuto] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const savedAuto = await AsyncStorage.getItem(THEME_AUTO_KEY);
      
      if (savedAuto !== null) {
        setIsAuto(savedAuto === 'true');
      }
      
      if (savedTheme && themes[savedTheme]) {
        setThemeName(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
    setIsLoaded(true);
  };

  const saveTheme = async (name: string) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const saveAuto = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_AUTO_KEY, value.toString());
    } catch (error) {
      console.error('Failed to save auto theme:', error);
    }
  };

  const setTheme = (name: string) => {
    if (themes[name]) {
      setThemeName(name);
      saveTheme(name);
      if (isAuto) {
        setIsAuto(false);
        saveAuto(false);
      }
    }
  };

  const handleSetIsAuto = (value: boolean) => {
    setIsAuto(value);
    saveAuto(value);
  };

  const getEffectiveTheme = (): Theme => {
    if (isAuto) {
      return systemColorScheme === 'dark' ? themes.dark : themes.light;
    }
    return themes[themeName] || defaultTheme;
  };

  const value: ThemeContextType = {
    theme: getEffectiveTheme(),
    setTheme,
    themeName,
    isAuto,
    setIsAuto: handleSetIsAuto,
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
