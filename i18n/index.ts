import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en';
import zh from './zh';

export const resources = {
  en: { translation: en },
  zh: { translation: zh },
} as const;

const systemLocale = Localization.getLocales()[0]?.languageCode ?? 'en';
const defaultLng = systemLocale.startsWith('zh') ? 'zh' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18n;
