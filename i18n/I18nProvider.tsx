import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { I18nManager } from 'react-native';
import i18n from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@focusmind_language';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
        
        // Handle RTL for Arabic
        const isRTL = savedLanguage === 'ar';
        if (isRTL !== I18nManager.isRTL) {
          I18nManager.forceRTL(isRTL);
        }
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
    setIsLoaded(true);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}

export async function changeLanguage(lang: string) {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    
    // Handle RTL
    const isRTL = lang === 'ar';
    if (isRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  } catch (error) {
    console.error('Failed to change language:', error);
  }
}
