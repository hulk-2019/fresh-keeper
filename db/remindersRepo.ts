import { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Reminder } from '@/types';

interface ReminderRow {
  id: string;
  item_id: string;
  primary_days_before: number;
  secondary_days_before: number | null;
  enabled: number;
}

function rowToReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    itemId: row.item_id,
    primaryDaysBefore: row.primary_days_before,
    secondaryDaysBefore: row.secondary_days_before ?? undefined,
    enabled: row.enabled === 1,
  };
}

export async function getReminderByItemId(db: SQLiteDatabase, itemId: string): Promise<Reminder | null> {
  const row = await db.getFirstAsync<ReminderRow>('SELECT * FROM reminders WHERE item_id = ?', [itemId]);
  return row ? rowToReminder(row) : null;
}

export async function upsertReminder(db: SQLiteDatabase, reminder: Omit<Reminder, 'id'> & { id?: string }): Promise<void> {
  const id = reminder.id ?? Crypto.randomUUID();
  await db.runAsync(
    `INSERT OR REPLACE INTO reminders (id, item_id, primary_days_before, secondary_days_before, enabled)
     VALUES (?, ?, ?, ?, ?)`,
    [id, reminder.itemId, reminder.primaryDaysBefore, reminder.secondaryDaysBefore ?? null, reminder.enabled ? 1 : 0]
  );
}

export async function deleteReminderByItemId(db: SQLiteDatabase, itemId: string): Promise<void> {
  await db.runAsync('DELETE FROM reminders WHERE item_id = ?', [itemId]);
}
