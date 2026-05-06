import { useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Item, UpdateItemInput } from '@/types';
import { getItemById, updateItem as dbUpdateItem, archiveItem as dbArchiveItem, deleteItem as dbDeleteItem } from '@/db/itemsRepo';
import { enrichItem } from '@/services/ItemService';

export function useItemDetail(id: string) {
  const db = useSQLiteContext();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getItemById(db, id);
      setItem(raw ? enrichItem(raw) : null);
    } finally {
      setLoading(false);
    }
  }, [db, id]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateItem = useCallback(async (patch: UpdateItemInput) => {
    await dbUpdateItem(db, id, patch);
    await refresh();
  }, [db, id, refresh]);

  const archiveItem = useCallback(async () => {
    await dbArchiveItem(db, id);
  }, [db, id]);

  const deleteItem = useCallback(async () => {
    await dbDeleteItem(db, id);
  }, [db, id]);

  return { item, loading, refresh, updateItem, archiveItem, deleteItem };
}
