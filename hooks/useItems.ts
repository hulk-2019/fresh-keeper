import { useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Item, CreateItemInput } from '@/types';
import { getAllItems, createItem as dbCreateItem, archiveItem as dbArchiveItem, deleteItem as dbDeleteItem } from '@/db/itemsRepo';
import { enrichItem } from '@/services/ItemService';

export function useItems() {
  const db = useSQLiteContext();
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await getAllItems(db);
      setAllItems(raw.map(enrichItem));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => { refresh(); }, [refresh]);

  const createItem = useCallback(async (input: CreateItemInput) => {
    await dbCreateItem(db, input);
    await refresh();
  }, [db, refresh]);

  const archiveItem = useCallback(async (id: string) => {
    await dbArchiveItem(db, id);
    await refresh();
  }, [db, refresh]);

  const deleteItem = useCallback(async (id: string) => {
    await dbDeleteItem(db, id);
    await refresh();
  }, [db, refresh]);

  const expiringItems = allItems.filter(i => i.status === 'expiring');

  return {
    items: allItems,
    loading,
    refresh,
    allCount: allItems.length,
    expiringCount: expiringItems.length,
    createItem,
    archiveItem,
    deleteItem,
  };
}
