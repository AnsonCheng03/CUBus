import i18next from 'i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import preset_en from './translations/en_preset.json';
import preset_zh from './translations/zh_preset.json';

export const i18n = i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh',
    saveMissing: true,
    interpolation: { escapeValue: false },
    resources: {
      en: { global: {}, preset: preset_en },
      zh: { global: {}, preset: preset_zh },
    },
  });
