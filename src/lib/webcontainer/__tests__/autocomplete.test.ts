/**
 * @jest-environment jsdom
 */

import { AutocompleteService } from '../autocomplete';
import { WebContainerManager } from '../manager';
import * as fc from 'fast-check';

jest.mock('../manager');

describe('AutocompleteService', () => {
  let service: AutocompleteService;
  let mockManager: jest.Mocked<WebContainerManager>;

  beforeEach(() => {
    mockManager = {
      isReady: jest.fn().mockReturnValue(true),
      listDirectory: jest.fn().mockResolvedValue(['file1.txt', 'file2.txt', 'dir1', 'dir2']),
    } as any;

    service = new AutocompleteService(mockManager);
  });

  describe('Command Completion', () => {
    it('should complete common commands', async () => {
      const completions = await service.getCompletions('l', '/');
      expect(completions).toContain('ls');
    });

    it('should return empty array for empty input', async () => {
      const completions = await service.getCompletions('', '/');
      expect(completions).toEqual([]);
    });

    it('should filter commands by prefix', async () => {
      const completions = await service.getCompletions('ec', '/');
      expect(completions).toContain('echo');
      expect(completions).not.toContain('ls');
    });
  });

  describe('Path Completion', () => {
    it('should complete file paths', async () => {
      const completions = await service.getCompletions('ls file', '/');
      expect(completions.length).toBeGreaterThan(0);
    });

    it('should handle directory paths', async () => {
      mockManager.listDirectory.mockResolvedValue(['subdir1', 'subdir2']);
      const completions = await service.getCompletions('cd sub', '/');
      expect(completions).toContain('subdir1');
      expect(completions).toContain('subdir2');
    });

    it('should handle errors gracefully', async () => {
      mockManager.listDirectory.mockRejectedValue(new Error('Directory not found'));
      const completions = await service.getCompletions('ls invalid/', '/');
      expect(completions).toEqual([]);
    });
  });

  describe('Common Prefix', () => {
    it('should find common prefix for multiple completions', async () => {
      const completions = ['file1.txt', 'file2.txt', 'file3.txt'];
      const common = await service.getCommonCompletion(completions);
      expect(common).toBe('file');
    });

    it('should return single completion as-is', async () => {
      const completions = ['unique.txt'];
      const common = await service.getCommonCompletion(completions);
      expect(common).toBe('unique.txt');
    });

    it('should return null for empty completions', async () => {
      const common = await service.getCommonCompletion([]);
      expect(common).toBeNull();
    });
  });

  /**
   * Feature: webcontainer-terminal, Property 5: Autocompletion Validity
   * Validates: Requirements 4.3
   */
  it('should only suggest valid completions (property test)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
          minLength: 1,
          maxLength: 10,
        }),
        fc.string({ minLength: 1, maxLength: 10 }),
        async (availableFiles, partial) => {
          mockManager.listDirectory.mockResolvedValue(availableFiles);
          
          const completions = await service.getCompletions(`ls ${partial}`, '/');
          
          // All completions should start with the partial string
          for (const completion of completions) {
            const lastPart = completion.split('/').pop() || '';
            expect(lastPart.startsWith(partial) || completion.startsWith(partial)).toBe(true);
          }
          
          // All completions should exist in available files
          for (const completion of completions) {
            const fileName = completion.split('/').pop() || completion;
            expect(availableFiles.some(f => f.startsWith(fileName.split(' ').pop() || ''))).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
