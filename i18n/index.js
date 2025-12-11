import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Preloaded translations
import en from '../assets/locales/en.json';
import pinglish from '../assets/locales/pinglish.json';
import ur from '../assets/locales/ur.json';

const LANGUAGE_KEY = 'APP_LANGUAGE';

// Load saved language
const loadSavedLanguage = async () => {
  try {
    return await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch {
    return null;
  }
};

// Save language
const saveLanguage = async (lang) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {}
};

// Change language instantly
export const changeAppLanguage = async (lang) => {
  await i18n.changeLanguage(lang);
  await saveLanguage(lang);
};

// Initialize i18n
export const initI18n = async () => {
  const savedLang = await loadSavedLanguage();

  // SAFELY detect device language
  let deviceLang = 'en';

  try {
    if (Localization?.locale) {
      const raw = Localization.locale;
      deviceLang = raw?.split?.('-')?.[0] || 'en';
    }
  } catch (err) {
    deviceLang = 'en';
  }

  const initialLang = savedLang || deviceLang || 'en';

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      lng: initialLang,
      fallbackLng: 'en',
      resources: {
        en: { translation: en },
        ur: { translation: ur },
        pinglish: { translation: pinglish }
      },
      interpolation: {
        escapeValue: false
      }
    });

  return i18n;
};
