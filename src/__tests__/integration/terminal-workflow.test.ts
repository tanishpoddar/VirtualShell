/**
 * @jest-environment jsdom
 */

import { WebContainerManager } from '@/lib/webcontainer/manager';
import { FilesystemSync } from '@/lib/webcontainer/filesystem-sync';
import { indexedDBStorage } from '@/lib/storage/indexeddb';

// Mock WebContainer API
jest.mock('@webcontainer/api');
jest.mock('@/lib/storage/indexeddb');

describe('Terminal Workflow Integration', () => {
  let manager: WebContainerManager;
  let sync: FilesystemSync;

  beforeEach(async () => {
    manager = WebContainerManager.getInstance();
    
    // Mock WebContainer boot
    const { WebContainer } = require('@webcontainer/api');
    WebContainer.boot.mockResolvedValue({
      mount: jest.fn().mockResolvedValue(undefined),
      spawn: jest.fn().mockResolvedValue({
        output: {
          pipeTo: jest.fn((stream) => {
            stream.write('test output\n');
            return Promise.resolve();
          }),
        },
        exit: Promise.resolve(0),
      }),
      fs: {
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue('test content'),
        readdir: jest.fn().mockResolvedValue(['file1.txt']),
        rm: jest.fn().mockResolvedValue(undefined),
      },
      teardown: jest.fn().mockResolvedValue(undefined),
    });

    await manager.initialize();
    sync = new FilesystemSync(manager);
  });

  afterEach(async () => {
    await manager.destroy();
    sync.cleanup();
  });

  it('should complete full workflow: init → execute → save → restore', async () => {
    // 1. Initialize
    expect(manager.isReady()).toBe(true);

    // 2. Execute commands
    const result1 = await manager.executeCommand('echo "hello"');
    expect(result1.exitCode).toBe(0);

    const result2 = await manager.executeCommand('ls');
    expect(result2.exitCode).toBe(0);

    // 3. Save to local
    (indexedDBStorage.saveSnapshot as jest.Mock).mockResolvedValue(undefined);
    await sync.saveToLocal('test-session');

    expect(indexedDBStorage.saveSnapshot).toHaveBeenCalled();

    // 4. Restore from local
    const mockSnapshot = {
      version: 1,
      timestamp: Date.now(),
      files: {
        '/test.txt': { content: 'restored', modified: new Date() },
      },
      directories: [],
      metadata: { totalSize: 8, fileCount: 1 },
    };

    (indexedDBStorage.loadSnapshot as jest.Mock).mockResolvedValue(mockSnapshot);
    const loaded = await sync.loadFromLocal('test-session');

    expect(loaded).toBe(true);
    expect(manager.isReady()).toBe(true);
  });

  it('should handle command execution errors gracefully', async () => {
    const { WebContainer } = require('@webcontainer/api');
    WebContainer.boot.mockResolvedValue({
      mount: jest.fn().mockResolvedValue(undefined),
      spawn: jest.fn().mockRejectedValue(new Error('Command failed')),
      fs: {},
    });

    await manager.initialize();

    await expect(manager.executeCommand('invalid-command')).rejects.toThrow();
    expect(manager.isReady()).toBe(true); // Should still be ready after error
  });

  it('should persist state across multiple operations', async () => {
    // Execute multiple commands
    await manager.executeCommand('mkdir test');
    await manager.executeCommand('cd test');
    await manager.executeCommand('touch file.txt');

    // Save state
    (indexedDBStorage.saveSnapshot as jest.Mock).mockResolvedValue(undefined);
    await sync.saveToLocal();

    // Verify save was called
    expect(indexedDBStorage.saveSnapshot).toHaveBeenCalled();
  });
});
