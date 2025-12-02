'use client';

import { WebContainerManager } from './manager';

export class AutocompleteService {
  private manager: WebContainerManager;
  private commonCommands = [
    'ls', 'cd', 'pwd', 'cat', 'echo', 'mkdir', 'rm', 'cp', 'mv',
    'grep', 'find', 'chmod', 'chown', 'touch', 'head', 'tail',
    'sort', 'uniq', 'wc', 'diff', 'tar', 'gzip', 'gunzip',
    'ps', 'kill', 'top', 'df', 'du', 'free', 'uname', 'whoami',
    'date', 'cal', 'clear', 'history', 'man', 'help',
  ];

  constructor(manager: WebContainerManager) {
    this.manager = manager;
  }

  async getCompletions(partial: string, cwd: string = '/'): Promise<string[]> {
    if (!partial) return [];

    const parts = partial.split(' ');
    const lastPart = parts[parts.length - 1];

    // If it's the first word, complete commands
    if (parts.length === 1) {
      return this.completeCommand(lastPart);
    }

    // Otherwise, try to complete file/directory paths
    return this.completePath(lastPart, cwd);
  }

  private completeCommand(partial: string): string[] {
    return this.commonCommands
      .filter((cmd) => cmd.startsWith(partial))
      .sort();
  }

  private async completePath(partial: string, cwd: string): Promise<string[]> {
    try {
      if (!this.manager.isReady()) {
        return [];
      }

      // Determine the directory to search
      let searchDir = cwd;
      let prefix = partial;

      if (partial.includes('/')) {
        const lastSlash = partial.lastIndexOf('/');
        const dirPart = partial.substring(0, lastSlash + 1);
        prefix = partial.substring(lastSlash + 1);

        if (dirPart.startsWith('/')) {
          searchDir = dirPart;
        } else {
          searchDir = `${cwd}/${dirPart}`.replace(/\/+/g, '/');
        }
      }

      const entries = await this.manager.listDirectory(searchDir);
      const matches = entries
        .filter((entry) => entry.startsWith(prefix))
        .map((entry) => {
          if (partial.includes('/')) {
            const dirPart = partial.substring(0, partial.lastIndexOf('/') + 1);
            return dirPart + entry;
          }
          return entry;
        })
        .sort();

      return matches;
    } catch (err) {
      console.error('Error completing path:', err);
      return [];
    }
  }

  async getCommonCompletion(completions: string[]): Promise<string | null> {
    if (completions.length === 0) return null;
    if (completions.length === 1) return completions[0];

    // Find common prefix
    let commonPrefix = completions[0];
    for (let i = 1; i < completions.length; i++) {
      let j = 0;
      while (
        j < commonPrefix.length &&
        j < completions[i].length &&
        commonPrefix[j] === completions[i][j]
      ) {
        j++;
      }
      commonPrefix = commonPrefix.substring(0, j);
      if (!commonPrefix) break;
    }

    return commonPrefix || null;
  }
}
