'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FilesystemSync } from '@/lib/webcontainer/filesystem-sync';
import { WebContainerManager } from '@/lib/webcontainer/manager';

export interface UseFilesystemSyncReturn {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: Error | null;
  isDirty: boolean;
  manualSync: () => Promise<void>;
  loadFromLocal: () => Promise<boolean>;
  loadFromCloud: (userId: string) => Promise<boolean>;
}

export function useFilesystemSync(
  manager: WebContainerManager | null,
  userId?: string
): UseFilesystemSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const syncRef = useRef<FilesystemSync | null>(null);

  useEffect(() => {
    if (manager) {
      syncRef.current = new FilesystemSync(manager);
    }

    return () => {
      if (syncRef.current) {
        syncRef.current.cleanup();
      }
    };
  }, [manager]);

  useEffect(() => {
    const initializeSync = async () => {
      if (!syncRef.current || !manager?.isReady()) return;

      try {
        if (userId) {
          // Try to load from cloud first
          await syncRef.current.initializeWithCloud(userId);
        } else {
          // Load from local only
          await syncRef.current.loadFromLocal();
        }
        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Failed to initialize sync:', err);
        setSyncError(err as Error);
      }
    };

    initializeSync();
  }, [manager, userId]);

  const manualSync = useCallback(async () => {
    if (!syncRef.current) {
      throw new Error('Filesystem sync not initialized');
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      if (userId) {
        await syncRef.current.syncToCloud(userId);
      } else {
        await syncRef.current.saveToLocal();
      }
      setLastSyncTime(new Date());
      setIsDirty(false);
    } catch (err) {
      setSyncError(err as Error);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  const loadFromLocal = useCallback(async (): Promise<boolean> => {
    if (!syncRef.current) {
      throw new Error('Filesystem sync not initialized');
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const loaded = await syncRef.current.loadFromLocal();
      if (loaded) {
        setLastSyncTime(new Date());
      }
      return loaded;
    } catch (err) {
      setSyncError(err as Error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const loadFromCloud = useCallback(
    async (cloudUserId: string): Promise<boolean> => {
      if (!syncRef.current) {
        throw new Error('Filesystem sync not initialized');
      }

      setIsSyncing(true);
      setSyncError(null);

      try {
        const loaded = await syncRef.current.loadFromCloud(cloudUserId);
        if (loaded) {
          setLastSyncTime(new Date());
        }
        return loaded;
      } catch (err) {
        setSyncError(err as Error);
        return false;
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Mark as dirty when filesystem changes
  useEffect(() => {
    if (syncRef.current && manager?.isReady()) {
      const outputUnsubscribe = manager.onOutput(() => {
        setIsDirty(true);
        syncRef.current?.markDirty();
      });

      return () => {
        outputUnsubscribe();
      };
    }
  }, [manager]);

  return {
    isSyncing,
    lastSyncTime,
    syncError,
    isDirty,
    manualSync,
    loadFromLocal,
    loadFromCloud,
  };
}
