/**
 * @jest-environment jsdom
 */

import { WebContainerManager } from '../manager';
import * as fc from 'fast-check';

// Mock WebContainer API
jest.mock('@webcontainer/api', () => ({
  WebContainer: {
    boot: jest.fn().mockResolvedValue({
      mount: jest.fn().mockResolvedValue(undefined),
      spawn: jest.fn(),
      fs: {
        writeFile: jest.fn().mockResolvedValue(undefined),
        readFile: jest.fn().mockResolvedValue('test content'),
        readdir: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt']),
        rm: jest.fn().mockResolvedValue(undefined),
      },
      teardown: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('WebContainerManager', () => {
  let manager: WebContainerManager;

  beforeEach(() => {
    manager = WebContainerManager.getInstance();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await manager.destroy();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await manager.initialize();
      expect(manager.getStatus()).toBe('ready');
      expect(manager.isReady()).toBe(true);
    });

    it('should handle initialization errors with retry', async () => {
      const { WebContainer } = require('@webcontainer/api');
      WebContainer.boot
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          mount: jest.fn().mockResolvedValue(undefined),
          fs: {},
        });

      await manager.initialize();
      expect(manager.getStatus()).toBe('ready');
    });

    it('should set error status after max retries', async () => {
      const { WebContainer } = require('@webcontainer/api');
      WebContainer.boot.mockRejectedValue(new Error('Persistent error'));

      await expect(manager.initialize()).rejects.toThrow();
      expect(manager.getStatus()).toBe('error');
      expect(manager.getError()).not.toBeNull();
    });
  });

  describe('Command Execution', () => {
    beforeEach(async () => {
      const { WebContainer } = require('@webcontainer/api');
      const mockProcess = {
        output: {
          pipeTo: jest.fn((stream) => {
            stream.write('command output\n');
            return Promise.resolve();
          }),
        },
        exit: Promise.resolve(0),
      };
      WebContainer.boot.mockResolvedValue({
        mount: jest.fn().mockResolvedValue(undefined),
        spawn: jest.fn().mockResolvedValue(mockProcess),
        fs: {},
      });
      await manager.initialize();
    });

    it('should execute commands and return results', async () => {
      const result = await manager.executeCommand('echo "hello"');
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('command output');
    });

    it('should throw error when not initialized', async () => {
      await manager.destroy();
      await expect(manager.executeCommand('ls')).rejects.toThrow();
    });

    /**
     * Feature: webcontainer-terminal, Property 1: Command Execution Consistency
     * Validates: Requirements 1.5, 3.1, 3.2, 3.3, 3.4
     */
    it('should execute commands consistently (property test)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom('ls', 'pwd', 'echo test', 'cat welcome.txt'), {
            minLength: 1,
            maxLength: 5,
          }),
          async (commands) => {
            const results: any[] = [];
            for (const cmd of commands) {
              const result1 = await manager.executeCommand(cmd);
              const result2 = await manager.executeCommand(cmd);
              results.push({ cmd, result1, result2 });
              
              // Same command should produce same exit code
              expect(result1.exitCode).toBe(result2.exitCode);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Filesystem Operations', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should write files successfully', async () => {
      await expect(manager.writeFile('/test.txt', 'content')).resolves.not.toThrow();
    });

    it('should read files successfully', async () => {
      const content = await manager.readFile('/test.txt');
      expect(typeof content).toBe('string');
    });

    it('should list directory contents', async () => {
      const files = await manager.listDirectory('/');
      expect(Array.isArray(files)).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should reset filesystem', async () => {
      await expect(manager.reset()).resolves.not.toThrow();
    });

    /**
     * Feature: webcontainer-terminal, Property 6: Reset Idempotence
     * Validates: Requirements 5.2, 5.3
     */
    it('should always reset to same initial state (property test)', async () => {
      await fc.assert(
        fc.asyncProperty(fc.anything(), async (_) => {
          await manager.reset();
          const files1 = await manager.listDirectory('/');
          
          await manager.reset();
          const files2 = await manager.listDirectory('/');
          
          // After reset, filesystem should be in same state
          expect(files1.sort()).toEqual(files2.sort());
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Event Callbacks', () => {
    it('should register and call output callbacks', async () => {
      const callback = jest.fn();
      const unsubscribe = manager.onOutput(callback);

      await manager.initialize();
      await manager.executeCommand('echo test');

      expect(callback).toHaveBeenCalled();
      unsubscribe();
    });

    it('should register and call error callbacks', () => {
      const callback = jest.fn();
      const unsubscribe = manager.onError(callback);

      const error = new Error('test error');
      manager['notifyError'](error);

      expect(callback).toHaveBeenCalledWith(error);
      unsubscribe();
    });
  });
});
