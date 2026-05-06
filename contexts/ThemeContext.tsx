import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAppColors, AppColorScheme } from '@/constants/theme';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  scheme: 'light' | 'dark';
  colors: AppColorScheme;
  setPreference: (p: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  scheme: 'light',
  colors: getAppColors('light'),
  setPreference: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const systemScheme = useSystemColorScheme() ?? 'light';
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', ['theme'])
      .then(row => {
        if (row?.value === 'light' || row?.value === 'dark' || row?.value === 'system') {
          setPreferenceState(row.value);
        }
      });
  }, [db]);

  const setPreference = useCallback(async (p: ThemePreference) => {
    setPreferenceState(p);
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['theme', p]
    );
  }, [db]);

  const scheme: 'light' | 'dark' = preference === 'system' ? systemScheme : preference;
  const colors = getAppColors(scheme);

  return (
    <ThemeContext.Provider value={{ preference, scheme, colors, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useAppColors(): AppColorScheme {
  return useContext(ThemeContext).colors;
}
