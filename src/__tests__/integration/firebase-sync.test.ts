/**
 * @jest-environment jsdom
 */

import { FirebaseSync } from '@/lib/storage/firebase-sync';
import { FilesystemSync } from '@/lib/webcontainer/filesystem-sync';
import { WebContainerManager } from '@/lib/webcontainer/manager';
import type { FilesystemSnapshot } from '@/lib/webcontainer/types';

jest.mock('firebase/firestore');
jest.mock('@/lib/firebase-config', () => ({ db: {} }));
jest.mock('@webcontainer/api');

describe('Firebase Sync Integration', () => {
  let firebaseSync: FirebaseSync;
  let manager: WebContainerManager;
  let filesystemSync: FilesystemSync;

  beforeEach(async () => {
    firebaseSync = new FirebaseSync();
    manager = WebContainerManager.getInstance();

    const { WebContainer } = require('@webcontainer/api');
    WebContainer.boot.mockResolvedValue({
      mount: jest.fn().mockResolvedValue(undefined),
      fs: {
        readdir: jest.fn().mockResolvedValue([]),
        readFile: jest.fn().mockResolvedValue(''),
        writeFile: jest.fn().mockResolvedValue(undefined),
      },
    });

    await manager.initialize();
    filesystemSync = new FilesystemSync(manager);
  });

  afterEach(async () => {
    await manager.destroy();
    filesystemSync.cleanup();
  });

  it('should sync filesystem to Firebase after login', async () => {
    const { setDoc } = require('firebase/firestore');
    setDoc.mockResolvedValue(undefined);

    const snapshot: FilesystemSnapshot = {
      version: 1,
      timestamp: Date.now(),
      files: {
        '/test.txt': { content: 'test', modified: new Date() },
      },
      directories: [],
      metadata: { totalSize: 4, fileCount: 1 },
    };

    await firebaseSync.uploadSnapshot('user123', snapshot);

    expect(setDoc).toHaveBeenCalled();
  });

  it('should restore filesystem from Firebase after login', async () => {
    const { getDoc } = require('firebase/firestore');
    
    const mockSnapshot = {
      version: 1,
      timestamp: Date.now(),
      files: {
        '/restored.txt': { content: 'restored', modified: new Date() },
      },
      directories: [],
      metadata: { totalSize: 8, fileCount: 1 },
      userId: 'user123',
      lastSync: new Date(),
    };

    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockSnapshot,
    });

    const result = await firebaseSync.downloadSnapshot('user123');

    expect(result).toBeDefined();
    expect(result?.files['/restored.txt']).toBeDefined();
  });

  it('should handle sync conflicts by using newer snapshot', async () => {
    const older: FilesystemSnapshot = {
      version: 1,
      timestamp: 1000,
      files: {},
      directories: [],
      metadata: { totalSize: 0, fileCount: 0 },
    };

    const newer: FilesystemSnapshot = {
      version: 1,
      timestamp: 2000,
      files: {},
      directories: [],
      metadata: { totalSize: 0, fileCount: 0 },
    };

    const merged = await firebaseSync.mergeSnapshots(older, newer);
    expect(merged.timestamp).toBe(2000);
  });
});
