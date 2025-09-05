import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';
import type { Locale } from '../types/i18n';

const fallbackLng: Locale = 'ja';
const supportedLngs = ['ja', 'en', 'zh-CN', 'zh-TW', 'ko'];

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    supportedLngs,
    debug: import.meta.env.DEV,
    
    load: 'currentOnly',
    preload: supportedLngs,
    
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },

    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    ns: ['common'],
    defaultNS: 'common',

    react: {
      useSuspense: true,
    },
  });

export default i18n;