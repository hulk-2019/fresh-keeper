import { useState, useCallback, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { Tag } from '@/types';
import { getAllTags, createTag as dbCreateTag, updateTag as dbUpdateTag, deleteTag as dbDeleteTag } from '@/db/tagsRepo';

export function useTags() {
  const db = useSQLiteContext();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTags(await getAllTags(db));
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => { refresh(); }, [refresh]);

  const createTag = useCallback(async (name: string, color: string) => {
    await dbCreateTag(db, name, color);
    await refresh();
  }, [db, refresh]);

  const updateTag = useCallback(async (id: string, name: string, color: string) => {
    await dbUpdateTag(db, id, name, color);
    await refresh();
  }, [db, refresh]);

  const deleteTag = useCallback(async (id: string) => {
    await dbDeleteTag(db, id);
    await refresh();
  }, [db, refresh]);

  return { tags, loading, refresh, createTag, updateTag, deleteTag };
}
