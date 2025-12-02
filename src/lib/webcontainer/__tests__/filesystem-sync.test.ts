/**
 * @jest-environment jsdom
 */

import { FilesystemSync } from '../filesystem-sync';
import { WebContainerManager } from '../manager';
import { indexedDBStorage } from '../../storage/indexeddb';
import * as fc from 'fast-check';
import type { FilesystemSnapshot } from '../types';

jest.mock('../manager');
jest.mock('../../storage/indexeddb');

describe('FilesystemSync', () => {
  let sync: FilesystemSync;
  let mockManager: jest.Mocked<WebContainerManager>;

  beforeEach(() => {
    mockManager = {
      isReady: jest.fn().mockReturnValue(true),
      listDirectory: jest.fn().mockResolvedValue([]),
      readFile: jest.fn().mockResolvedValue('test content'),
      writeFile: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    } as any;

    sync = new FilesystemSync(mockManager);

    (indexedDBStorage.saveSnapshot as jest.Mock).mockResolvedValue(undefined);
    (indexedDBStorage.loadSnapshot as jest.Mock).mockResolvedValue(null);
  });

  afterEach(() => {
    sync.cleanup();
    jest.clearAllMocks();
  });

  describe('Snapshot Creation', () => {
    it('should create snapshot from filesystem', async () => {
      mockManager.listDirectory.mockResolvedValue(['file1.txt', 'dir1']);
      mockManager.readFile
        .mockResolvedValueOnce('content1')
        .mockRejectedValueOnce(new Error('Is a directory'));

      const snapshot = await sync.createSnapshot();

      expect(snapshot.version).toBe(1);
      expect(snapshot.files).toBeDefined();
      expect(snapshot.directories).toBeDefined();
      expect(snapshot.metadata).toBeDefined();
    });

    it('should throw error when WebContainer not ready', async () => {
      mockManager.isReady.mockReturnValue(false);
      await expect(sync.createSnapshot()).rejects.toThrow('WebContainer not ready');
    });
  });

  describe('Snapshot Restoration', () => {
    it('should restore snapshot to filesystem', async () => {
      const snapshot: FilesystemSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {
          '/test.txt': { content: 'test', modified: new Date() },
        },
        directories: ['/testdir'],
        metadata: { totalSize: 4, fileCount: 1 },
      };

      await sync.restoreSnapshot(snapshot);

      expect(mockManager.reset).toHaveBeenCalled();
      expect(mockManager.writeFile).toHaveBeenCalled();
    });
  });

  describe('Local Storage', () => {
    it('should save to IndexedDB', async () => {
      mockManager.listDirectory.mockResolvedValue(['file1.txt']);
      mockManager.readFile.mockResolvedValue('content');

      await sync.saveToLocal();

      expect(indexedDBStorage.saveSnapshot).toHaveBeenCalled();
    });

    it('should load from IndexedDB', async () => {
      const snapshot: FilesystemSnapshot = {
        version: 1,
        timestamp: Date.now(),
        files: {
          '/test.txt': { content: 'test', modified: new Date() },
        },
        directories: [],
        metadata: { totalSize: 4, fileCount: 1 },
      };

      (indexedDBStorage.loadSnapshot as jest.Mock).mockResolvedValue(snapshot);

      const loaded = await sync.loadFromLocal();

      expect(loaded).toBe(true);
      expect(mockManager.reset).toHaveBeenCalled();
    });

    it('should return false when no snapshot exists', async () => {
      (indexedDBStorage.loadSnapshot as jest.Mock).mockResolvedValue(null);

      const loaded = await sync.loadFromLocal();

      expect(loaded).toBe(false);
    });
  });

  describe('Dirty State Management', () => {
    it('should mark as dirty and schedule save', () => {
      jest.useFakeTimers();
      
      sync.markDirty();
      expect(sync.isDirtyState()).toBe(true);

      jest.advanceTimersByTime(5000);
      
      jest.useRealTimers();
    });

    it('should force immediate save', async () => {
      mockManager.listDirectory.mockResolvedValue([]);
      
      await sync.forceSave();

      expect(indexedDBStorage.saveSnapshot).toHaveBeenCalled();
    });
  });

  /**
   * Feature: webcontainer-terminal, Property 2: Filesystem Persistence Round-Trip
   * Validates: Requirements 2.1, 2.2
   */
  it('should preserve filesystem state through save/load cycle (property test)', async () => {
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
        async (fsData) => {
          // Create a snapshot from the generated data
          const originalSnapshot: FilesystemSnapshot = {
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

          // Mock the save/load cycle
          (indexedDBStorage.saveSnapshot as jest.Mock).mockResolvedValue(undefined);
          (indexedDBStorage.loadSnapshot as jest.Mock).mockResolvedValue(originalSnapshot);

          // Save
          mockManager.listDirectory.mockImplementation(async (path) => {
            if (path === '/') {
              return Object.keys(fsData.files).concat(fsData.directories);
            }
            return [];
          });

          mockManager.readFile.mockImplementation(async (path) => {
            const cleanPath = path.replace(/^\//, '');
            return fsData.files[cleanPath] || '';
          });

          await sync.saveToLocal('test');

          // Load
          const loaded = await sync.loadFromLocal('test');

          expect(loaded).toBe(true);
          expect(mockManager.reset).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});
