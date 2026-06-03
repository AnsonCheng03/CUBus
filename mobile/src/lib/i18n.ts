import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import presetEn from '../../../src/translations/en_preset.json';
import presetZh from '../../../src/translations/zh_preset.json';

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    resources: {
      en: { global: {}, preset: presetEn },
      zh: { global: {}, preset: presetZh },
    },
  });
}

export { i18next };
