import { openDB } from 'idb';
import { useCallback } from 'react';

const DB_NAME = 'DictionaryDB';
const STORE_NAME = 'DictionaryStore';

const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

const saveToDB = async (key: string, value: any) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put(value, key);
  await tx.done;
};

const loadFromDB = async (key: string) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  const value = await store.get(key);
  await tx.done;
  return value;
};

export const clearDB = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};

export const useIndexedDB = () => {
  const saveData = useCallback(async (key: string, value: any) => {
    await saveToDB(key, JSON.stringify(value));
  }, []);

  const loadData = useCallback(async (key: string) => {
    const data = await loadFromDB(key);
    return data ? JSON.parse(data) : null;
  }, []);

  return { saveData, loadData };
};
