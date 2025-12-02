/**
 * @jest-environment jsdom
 */

import { FirebaseSync } from '../firebase-sync';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as fc from 'fast-check';
import type { FilesystemSnapshot } from '../../webcontainer/types';

jest.mock('firebase/firestore');
jest.mock('@/lib/firebase-config', () => ({
  db: {},
}));

describe('FirebaseSync', () => {
  let sync: FirebaseSync;

  beforeEach(() => {
    sync = new FirebaseSync();
    jest.clearAllMocks();
  });

  describe('Upload Snapshot', () => {
    it('should upload snapshot to Firestore', async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      const snapshot: FilesystemSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {
          '/test.txt': { content: 'test', modified: new Date() },
        },
        directories: [],
        metadata: { totalSize: 4, fileCount: 1 },
      };

      await sync.uploadSnapshot('user123', snapshot);

      expect(setDoc).toHaveBeenCalled();
    });

    it('should throw error on upload failure', async () => {
      (setDoc as jest.Mock).mockRejectedValue(new Error('Network error'));

      const snapshot: FilesystemSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {},
        directories: [],
        metadata: { totalSize: 0, fileCount: 0 },
      };

      await expect(sync.uploadSnapshot('user123', snapshot)).rejects.toThrow(
        'Failed to sync to cloud'
      );
    });
  });

  describe('Download Snapshot', () => {
    it('should download snapshot from Firestore', async () => {
      const mockSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {
          '/test.txt': { content: 'test', modified: new Date() },
        },
        directories: [],
        metadata: { totalSize: 4, fileCount: 1 },
        userId: 'user123',
        lastSync: new Date(),
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockSnapshot,
      });

      const result = await sync.downloadSnapshot('user123');

      expect(result).toBeDefined();
      expect(result?.version).toBe(1);
    });

    it('should return null when no snapshot exists', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await sync.downloadSnapshot('user123');

      expect(result).toBeNull();
    });
  });

  describe('Merge Snapshots', () => {
    it('should use newer snapshot', async () => {
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

      const result = await sync.mergeSnapshots(older, newer);
      expect(result.timestamp).toBe(2000);

      const result2 = await sync.mergeSnapshots(newer, older);
      expect(result2.timestamp).toBe(2000);
    });
  });

  describe('Sync with Retry', () => {
    it('should retry on failure', async () => {
      (setDoc as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);

      const snapshot: FilesystemSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {},
        directories: [],
        metadata: { totalSize: 0, fileCount: 0 },
      };

      await sync.syncWithRetry('user123', snapshot);

      expect(setDoc).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      (setDoc as jest.Mock).mockRejectedValue(new Error('Persistent error'));

      const snapshot: FilesystemSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {},
        directories: [],
        metadata: { totalSize: 0, fileCount: 0 },
      };

      await expect(sync.syncWithRetry('user123', snapshot, 2)).rejects.toThrow();
    });
  });

  /**
   * Feature: webcontainer-terminal, Property 7: Firebase Sync Consistency
   * Validates: Requirements 2.3
   */
  it('should eventually sync filesystem changes to Firebase (property test)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          files: fc.dictionary(
            fc.string({ minLength: 1, maxLength: 20 }),
            fc.string({ minLength: 0, maxLength: 100 })
          ),
          directories: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            maxLength: 5,
          }),
        }),
        fc.string({ minLength: 5, maxLength: 20 }),
        async (fsData, userId) => {
          const snapshot: FilesystemSnapshot = {
            version: 1,
            timestamp: Date.now(),
            files: Object.fromEntries(
              Object.entries(fsData.files).map(([path, content]) => [
                `/${path}`,
                { content, modified: new Date() },
              ])
            ),
            directories: fsData.directories.map((d) => `/${d}`),
            metadata: {
              totalSize: Object.values(fsData.files).reduce(
                (sum, content) => sum + content.length,
                0
              ),
              fileCount: Object.keys(fsData.files).length,
            },
          };

          // Mock successful upload
          (setDoc as jest.Mock).mockResolvedValue(undefined);
          (getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ ...snapshot, userId, lastSync: new Date() }),
          });

          // Upload
          await sync.uploadSnapshot(userId, snapshot);

          // Download and verify
          const downloaded = await sync.downloadSnapshot(userId);

          expect(downloaded).toBeDefined();
          expect(downloaded?.version).toBe(snapshot.version);
          expect(Object.keys(downloaded?.files || {})).toHaveLength(
            Object.keys(snapshot.files).length
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
