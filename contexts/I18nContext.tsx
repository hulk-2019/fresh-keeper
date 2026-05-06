import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as Localization from 'expo-localization';
import i18n from '@/i18n';

export type Language = 'system' | 'en' | 'zh';

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue>({
  language: 'system',
  setLanguage: async () => {},
});

function resolveLanguage(lang: Language): string {
  if (lang === 'system') {
    const locale = Localization.getLocales()[0]?.languageCode ?? 'en';
    return locale.startsWith('zh') ? 'zh' : 'en';
  }
  return lang;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [language, setLanguageState] = useState<Language>('system');

  useEffect(() => {
    db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['language'])
      .then(row => {
        const lang = (row?.value ?? 'system') as Language;
        setLanguageState(lang);
        i18n.changeLanguage(resolveLanguage(lang));
      });
  }, [db]);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(resolveLanguage(lang));
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['language', lang]
    );
  }, [db]);

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
