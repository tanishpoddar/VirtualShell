'use client';

import { WebContainerManager } from './manager';
import { indexedDBStorage } from '../storage/indexeddb';
import type { FilesystemSnapshot } from './types';

export class FilesystemSync {
  private manager: WebContainerManager;
  private isDirty: boolean = false;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DEBOUNCE_MS = 5000;

  constructor(manager: WebContainerManager) {
    this.manager = manager;
  }

  async createSnapshot(): Promise<FilesystemSnapshot> {
    if (!this.manager.isReady()) {
      throw new Error('WebContainer not ready');
    }

    const files: FilesystemSnapshot['files'] = {};
    const directories: string[] = [];
    let totalSize = 0;
    let fileCount = 0;

    const traverseDirectory = async (path: string): Promise<void> => {
      try {
        const entries = await this.manager.listDirectory(path);

        for (const entry of entries) {
          const fullPath = `${path}/${entry}`.replace(/\/+/g, '/');

          try {
            // Try to read as file
            const content = await this.manager.readFile(fullPath);
            files[fullPath] = {
              content,
              modified: new Date(),
            };
            totalSize += content.length;
            fileCount++;
          } catch {
            // It's a directory
            directories.push(fullPath);
            await traverseDirectory(fullPath);
          }
        }
      } catch (err) {
        console.warn(`Failed to traverse ${path}:`, err);
      }
    };

    await traverseDirectory('/');

    return {
      version: 1,
      timestamp: Date.now(),
      files,
      directories,
      metadata: {
        totalSize,
        fileCount,
      },
    };
  }

  async restoreSnapshot(snapshot: FilesystemSnapshot): Promise<void> {
    if (!this.manager.isReady()) {
      throw new Error('WebContainer not ready');
    }

    // Clear existing filesystem
    await this.manager.reset();

    // Restore directories first
    for (const dir of snapshot.directories) {
      try {
        // WebContainer will create parent directories automatically
        await this.manager.writeFile(`${dir}/.keep`, '');
      } catch (err) {
        console.warn(`Failed to create directory ${dir}:`, err);
      }
    }

    // Restore files
    for (const [path, fileData] of Object.entries(snapshot.files)) {
      try {
        await this.manager.writeFile(path, fileData.content);
      } catch (err) {
        console.error(`Failed to restore file ${path}:`, err);
      }
    }
  }

  async saveToLocal(snapshotId: string = 'default'): Promise<void> {
    try {
      const snapshot = await this.createSnapshot();
      await indexedDBStorage.saveSnapshot(snapshot, snapshotId);
      this.isDirty = false;
    } catch (err) {
      console.error('Failed to save to IndexedDB:', err);
      throw err;
    }
  }

  async loadFromLocal(snapshotId: string = 'default'): Promise<boolean> {
    try {
      const snapshot = await indexedDBStorage.loadSnapshot(snapshotId);
      if (snapshot) {
        await this.restoreSnapshot(snapshot);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to load from IndexedDB:', err);
      return false;
    }
  }

  async loadFromCloud(userId: string): Promise<boolean> {
    try {
      const { firebaseSync } = await import('../storage/firebase-sync');
      const snapshot = await firebaseSync.downloadSnapshot(userId);
      
      if (snapshot) {
        await this.restoreSnapshot(snapshot);
        // Also save to local for offline access
        await this.saveToLocal(userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to load from cloud:', err);
      return false;
    }
  }

  async syncToCloud(userId: string): Promise<void> {
    try {
      const { firebaseSync } = await import('../storage/firebase-sync');
      const snapshot = await this.createSnapshot();
      await firebaseSync.syncWithRetry(userId, snapshot);
    } catch (err) {
      console.error('Failed to sync to cloud:', err);
      throw err;
    }
  }

  async initializeWithCloud(userId: string): Promise<void> {
    // Try to load from cloud first
    const cloudLoaded = await this.loadFromCloud(userId);
    
    if (!cloudLoaded) {
      // Fall back to local
      const localLoaded = await this.loadFromLocal(userId);
      
      if (localLoaded) {
        // Sync local to cloud
        try {
          await this.syncToCloud(userId);
        } catch (err) {
          console.warn('Failed to sync local to cloud:', err);
        }
      }
    }
  }

  markDirty(): void {
    this.isDirty = true;
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      if (this.isDirty) {
        try {
          await this.saveToLocal();
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }
    }, this.SAVE_DEBOUNCE_MS);
  }

  async forceSave(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    await this.saveToLocal();
  }

  isDirtyState(): boolean {
    return this.isDirty;
  }

  cleanup(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}
