import { SQLiteDatabase } from 'expo-sqlite';
import { BUILT_IN_CATEGORIES } from '@/constants/categories';

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = result?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        category_id     TEXT NOT NULL DEFAULT 'cat_other',
        photo_uri       TEXT,
        production_date TEXT,
        expiry_date     TEXT NOT NULL,
        notes           TEXT,
        archived        INTEGER NOT NULL DEFAULT 0,
        created_at      TEXT NOT NULL,
        updated_at      TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id          TEXT PRIMARY KEY,
        name        TEXT NOT NULL,
        icon        TEXT NOT NULL,
        color       TEXT NOT NULL,
        is_built_in INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS tags (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        color      TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS item_tags (
        item_id TEXT NOT NULL,
        tag_id  TEXT NOT NULL,
        PRIMARY KEY (item_id, tag_id),
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id                    TEXT PRIMARY KEY,
        item_id               TEXT NOT NULL,
        primary_days_before   INTEGER NOT NULL DEFAULT 7,
        secondary_days_before INTEGER,
        enabled               INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON items(expiry_date);
      CREATE INDEX IF NOT EXISTS idx_items_archived    ON items(archived);
      CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);

      PRAGMA user_version = 1;
    `);

    await db.runAsync("INSERT OR IGNORE INTO settings (key, value) VALUES ('defaultPrimaryReminderDays', '7')");
    await db.runAsync("INSERT OR IGNORE INTO settings (key, value) VALUES ('defaultSecondaryReminderDays', '30')");
    await db.runAsync("INSERT OR IGNORE INTO settings (key, value) VALUES ('language', 'system')");
    await db.runAsync("INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'system')");
  }

  // 每次启动都确保内置分类存在（防止首次安装 version 已 >= 1 时种子缺失）
  for (const cat of BUILT_IN_CATEGORIES) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (id, name, icon, color, is_built_in) VALUES (?, ?, ?, ?, ?)',
      [cat.id, cat.name, cat.icon, cat.color, 1]
    );
  }
}
