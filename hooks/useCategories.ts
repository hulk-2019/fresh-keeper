import { useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Category } from '@/types';
import { getAllCategories } from '@/db/categoriesRepo';

export function useCategories() {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCategories(db).then(cats => {
      setCategories(cats);
      setLoading(false);
    });
  }, [db]);

  return { categories, loading };
}
