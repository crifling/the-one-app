import { openDB, type IDBPDatabase } from 'idb';
import type { StateStorage } from 'zustand/middleware';

// Single object store holding one JSON string per key. The whole app document
// lives under one key, which keeps persistence and backups simple.
const DB_NAME = 'min-hverdag';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

/** A zustand-compatible StateStorage backed by IndexedDB. */
export const idbStorage: StateStorage = {
  async getItem(name) {
    const db = await getDb();
    const value = await db.get(STORE_NAME, name);
    return (value as string | undefined) ?? null;
  },
  async setItem(name, value) {
    const db = await getDb();
    await db.put(STORE_NAME, value, name);
  },
  async removeItem(name) {
    const db = await getDb();
    await db.delete(STORE_NAME, name);
  },
};
