'use client';

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import type { FilesystemSnapshot } from '../webcontainer/types';

export class FirebaseSync {
  private readonly COLLECTION = 'terminal_snapshots';

  async uploadSnapshot(userId: string, snapshot: FilesystemSnapshot): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      
      await setDoc(docRef, {
        ...snapshot,
        userId,
        lastSync: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to upload snapshot to Firebase:', err);
      throw new Error('Failed to sync to cloud');
    }
  }

  async downloadSnapshot(userId: string): Promise<FilesystemSnapshot | null> {
    try {
      const docRef = doc(db, this.COLLECTION, userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const { userId: _, lastSync, ...snapshot } = data;
        return snapshot as FilesystemSnapshot;
      }

      return null;
    } catch (err) {
      console.error('Failed to download snapshot from Firebase:', err);
      throw new Error('Failed to restore from cloud');
    }
  }

  async mergeSnapshots(
    local: FilesystemSnapshot,
    cloud: FilesystemSnapshot
  ): Promise<FilesystemSnapshot> {
    // Simple merge strategy: use the newer snapshot
    if (local.timestamp > cloud.timestamp) {
      return local;
    }
    return cloud;
  }

  async syncWithRetry(
    userId: string,
    snapshot: FilesystemSnapshot,
    maxRetries: number = 3
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.uploadSnapshot(userId, snapshot);
        return;
      } catch (err) {
        lastError = err as Error;
        console.error(`Sync attempt ${attempt} failed:`, err);

        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Sync failed after retries');
  }
}

export const firebaseSync = new FirebaseSync();
