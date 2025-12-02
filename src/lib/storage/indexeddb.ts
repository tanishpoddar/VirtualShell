'use client';

import type { FilesystemSnapshot } from '../webcontainer/types';

const DB_NAME = 'SRM_OS_Labs';
const DB_VERSION = 1;
const STORE_NAME = 'filesystem_snapshots';

export class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('userId', 'userId', { unique: false });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveSnapshot(snapshot: FilesystemSnapshot, id: string = 'default'): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const data = {
        id,
        ...snapshot,
        savedAt: new Date().toISOString(),
      };

      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save snapshot'));
    });
  }

  async loadSnapshot(id: string = 'default'): Promise<FilesystemSnapshot | null> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id: _, savedAt, ...snapshot } = result;
          resolve(snapshot as FilesystemSnapshot);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to load snapshot'));
    });
  }

  async deleteSnapshot(id: string = 'default'): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete snapshot'));
    });
  }

  async listSnapshots(): Promise<Array<{ id: string; timestamp: number; userId?: string }>> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const snapshots = request.result.map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          userId: item.userId,
        }));
        resolve(snapshots);
      };

      request.onerror = () => reject(new Error('Failed to list snapshots'));
    });
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    }
    return { used: 0, quota: 0 };
  }

  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear storage'));
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export const indexedDBStorage = new IndexedDBStorage();
