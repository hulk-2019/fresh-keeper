import { SQLiteDatabase } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Item, CreateItemInput, UpdateItemInput } from '@/types';

interface ItemRow {
  id: string;
  name: string;
  category_id: string;
  photo_uri: string | null;
  production_date: string | null;
  expiry_date: string;
  notes: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
}

function rowToPartialItem(row: ItemRow, tagIds: string[]): Omit<Item, 'daysLeft' | 'status'> {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    tagIds,
    photoUri: row.photo_uri ?? undefined,
    productionDate: row.production_date ?? undefined,
    expiryDate: row.expiry_date,
    notes: row.notes ?? undefined,
    archived: row.archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getTagIdsForItem(db: SQLiteDatabase, itemId: string): Promise<string[]> {
  const rows = await db.getAllAsync<{ tag_id: string }>(
    'SELECT tag_id FROM item_tags WHERE item_id = ?',
    [itemId]
  );
  return rows.map(r => r.tag_id);
}

export async function getAllItems(db: SQLiteDatabase): Promise<Omit<Item, 'daysLeft' | 'status'>[]> {
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE archived = 0 ORDER BY expiry_date ASC'
  );
  return Promise.all(rows.map(async row => {
    const tagIds = await getTagIdsForItem(db, row.id);
    return rowToPartialItem(row, tagIds);
  }));
}

export async function getItemById(db: SQLiteDatabase, id: string): Promise<Omit<Item, 'daysLeft' | 'status'> | null> {
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE id = ?', [id]);
  if (!row) return null;
  const tagIds = await getTagIdsForItem(db, id);
  return rowToPartialItem(row, tagIds);
}

export async function createItem(db: SQLiteDatabase, input: CreateItemInput): Promise<string> {
  const id = Crypto.randomUUID();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO items (id, name, category_id, photo_uri, production_date, expiry_date, notes, archived, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [id, input.name, input.categoryId, input.photoUri ?? null, input.productionDate ?? null,
     input.expiryDate, input.notes ?? null, now, now]
  );
  for (const tagId of input.tagIds) {
    await db.runAsync('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)', [id, tagId]);
  }
  return id;
}

export async function updateItem(db: SQLiteDatabase, id: string, patch: UpdateItemInput): Promise<void> {
  const now = new Date().toISOString();
  const fields: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now];

  if (patch.name !== undefined)           { fields.push('name = ?');            values.push(patch.name); }
  if (patch.categoryId !== undefined)     { fields.push('category_id = ?');     values.push(patch.categoryId); }
  if (patch.photoUri !== undefined)       { fields.push('photo_uri = ?');       values.push(patch.photoUri ?? null); }
  if (patch.productionDate !== undefined) { fields.push('production_date = ?'); values.push(patch.productionDate ?? null); }
  if (patch.expiryDate !== undefined)     { fields.push('expiry_date = ?');     values.push(patch.expiryDate); }
  if (patch.notes !== undefined)          { fields.push('notes = ?');           values.push(patch.notes ?? null); }

  values.push(id);
  await db.runAsync(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`, values);

  if (patch.tagIds !== undefined) {
    await db.runAsync('DELETE FROM item_tags WHERE item_id = ?', [id]);
    for (const tagId of patch.tagIds) {
      await db.runAsync('INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)', [id, tagId]);
    }
  }
}

export async function archiveItem(db: SQLiteDatabase, id: string): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync('UPDATE items SET archived = 1, updated_at = ? WHERE id = ?', [now, id]);
}

export async function deleteItem(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
}
