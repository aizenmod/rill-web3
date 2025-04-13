import { useCallback, useEffect, useState } from 'react';
import type { Repository } from '~/components/repositories/RepoList.client';

// Constants for IndexedDB
const DB_NAME = 'RillRepositories';
const DB_VERSION = 1;
const STORE_NAME = 'repositories';

// Client-only hook
export function useRepositoryDb() {
  const [isReady, setIsReady] = useState(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initialize the database
  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // Skip on server
    }

    const openRequest = indexedDB.open(DB_NAME, DB_VERSION);

    openRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('cid', 'cid', { unique: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    openRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      setDb(db);
      setIsReady(true);
    };

    openRequest.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      setIsReady(false);
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Save a new repository
  const saveRepository = useCallback(
    async (repository: Omit<Repository, 'id'>) => {
      if (!db || !isReady) {
        throw new Error('Database not ready');
      }

      return new Promise<string>((resolve, reject) => {
        // Generate a unique ID
        const id = `repo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const request = store.add({
          ...repository,
          id,
        });

        request.onsuccess = () => resolve(id);
        request.onerror = () => reject(request.error);
      });
    },
    [db, isReady]
  );

  // Get all repositories
  const getAllRepositories = useCallback(async () => {
    if (!db || !isReady) {
      return [];
    }

    return new Promise<Repository[]>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db, isReady]);

  // Get a repository by CID
  const getRepositoryByCid = useCallback(
    async (cid: string) => {
      if (!db || !isReady) {
        throw new Error('Database not ready');
      }

      return new Promise<Repository | null>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('cid');
        const request = index.get(cid);

        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    },
    [db, isReady]
  );

  // Delete a repository
  const deleteRepository = useCallback(
    async (id: string) => {
      if (!db || !isReady) {
        throw new Error('Database not ready');
      }

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    [db, isReady]
  );

  return {
    isReady,
    saveRepository,
    getAllRepositories,
    getRepositoryByCid,
    deleteRepository,
  };
} 