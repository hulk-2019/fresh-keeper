import { useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

interface Settings {
  defaultPrimaryReminderDays: number;
  defaultSecondaryReminderDays: number;
}

export function useSettings() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<Settings>({
    defaultPrimaryReminderDays: 7,
    defaultSecondaryReminderDays: 30,
  });

  const load = useCallback(async () => {
    const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
    const map: Record<string, string> = {};
    for (const row of rows) map[row.key] = row.value;
    setSettings({
      defaultPrimaryReminderDays: parseInt(map['defaultPrimaryReminderDays'] ?? '7', 10),
      defaultSecondaryReminderDays: parseInt(map['defaultSecondaryReminderDays'] ?? '30', 10),
    });
  }, [db]);

  useEffect(() => { load(); }, [load]);

  const setSetting = useCallback(async (key: keyof Settings, value: number) => {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, String(value)]
    );
    await load();
  }, [db, load]);

  return { settings, setSetting };
}
