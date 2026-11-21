import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import ar from './locales/ar.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl', flag: '🇦🇪' }
];

export const getLanguageDirection = (langCode) => {
  const found = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return found?.dir || 'ltr';
};

const savedLanguage = typeof window !== 'undefined'
  ? localStorage.getItem('aaroh_lang') || 'en'
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      pa: { translation: pa },
      bn: { translation: bn },
      ta: { translation: ta },
      te: { translation: te },
      mr: { translation: mr },
      gu: { translation: gu },
      fr: { translation: fr },
      es: { translation: es },
      ar: { translation: ar }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document direction and lang on language change
export const applyLanguageSettings = (lang) => {
  const dir = getLanguageDirection(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (dir === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }
};

// Initial apply
applyLanguageSettings(savedLanguage);

i18n.on('languageChanged', (lng) => {
  applyLanguageSettings(lng);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('aaroh_lang', lng);
  }
});

export default i18n;
