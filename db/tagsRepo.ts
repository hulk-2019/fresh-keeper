import { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Tag } from '@/types';

interface TagRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

function rowToTag(row: TagRow): Tag {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.created_at };
}

export async function getAllTags(db: SQLiteDatabase): Promise<Tag[]> {
  const rows = await db.getAllAsync<TagRow>('SELECT * FROM tags ORDER BY created_at ASC');
  return rows.map(rowToTag);
}

export async function createTag(db: SQLiteDatabase, name: string, color: string): Promise<Tag> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.runAsync('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)', [id, name, color, now]);
  return { id, name, color, createdAt: now };
}

export async function updateTag(db: SQLiteDatabase, id: string, name: string, color: string): Promise<void> {
  await db.runAsync('UPDATE tags SET name = ?, color = ? WHERE id = ?', [name, color, id]);
}

export async function deleteTag(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
}
