import { SQLiteDatabase } from 'expo-sqlite';
import { Category } from '@/types';

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_built_in: number;
}

function rowToCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name, icon: row.icon, color: row.color, isBuiltIn: row.is_built_in === 1 };
}

export async function getAllCategories(db: SQLiteDatabase): Promise<Category[]> {
  const rows = await db.getAllAsync<CategoryRow>('SELECT * FROM categories ORDER BY is_built_in DESC, name ASC');
  return rows.map(rowToCategory);
}

export async function getCategoryById(db: SQLiteDatabase, id: string): Promise<Category | null> {
  const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);
  return row ? rowToCategory(row) : null;
}
