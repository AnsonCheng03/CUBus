import 'intl-pluralrules';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation from '../initDatas/translation.json';
import presetEn from '../translations/en_preset.json';
import presetZh from '../translations/zh_preset.json';

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    fallbackLng: 'zh',
    interpolation: { escapeValue: false },
    resources: {
      en: { global: translation.en, preset: presetEn },
      zh: { global: translation.zh, preset: presetZh },
    },
  });
}

export { i18next };
