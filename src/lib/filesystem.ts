'use client';
import { VFS, VFSNode, VFSDirectory, VFSFile } from './types';

export const createInitialFileSystem = (): VFS => {
  const now = new Date().toISOString();
  return {
    cwd: '/home/student',
    root: {
      type: 'directory',
      name: '/',
      children: {
        home: {
          type: 'directory',
          name: 'home',
          children: {
            student: {
              type: 'directory',
              name: 'student',
              children: {
                'f1': { type: 'file', name: 'f1', content: 'This is file f1.', permissions: 0o644, owner: 'student', group: 'student', modified: now },
                'f2.txt': { type: 'file', name: 'f2.txt', content: 'This is file f2.txt\nIt has two lines.', permissions: 0o644, owner: 'student', group: 'student', modified: now },
              },
              permissions: 0o755, owner: 'student', group: 'student', modified: now,
            },
          },
          permissions: 0o755, owner: 'root', group: 'root', modified: now,
        },
        etc: {
            type: 'directory',
            name: 'etc',
            children: {
              passwd: { type: 'file', name: 'passwd', content: 'root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student,,,:/home/student:/bin/bash\n', permissions: 0o644, owner: 'root', group: 'root', modified: now },
            },
            permissions: 0o755, owner: 'root', group: 'root', modified: now,
        },
        bin: {
            type: 'directory',
            name: 'bin',
            children: {},
            permissions: 0o755, owner: 'root', group: 'root', modified: now,
        }
      },
      permissions: 0o755, owner: 'root', group: 'root', modified: now,
    },
  };
};

export class VirtualFileSystem {
  private state: VFS;

  constructor(initialState?: VFS) {
    this.state = initialState || createInitialFileSystem();
  }

  get cwd() {
    return this.state.cwd;
  }
  
  serialize(): VFS {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  private _resolvePath(path: string): string {
    if (path.startsWith('/')) {
        return path;
    }
    const parts = (this.state.cwd === '/' ? '' : this.state.cwd).split('/').concat(path.split('/'));
    const resolved: string[] = [];
    for (const part of parts) {
        if (part === '' || part === '.') continue;
        if (part === '..') {
            resolved.pop();
        } else {
            resolved.push(part);
        }
    }
    return '/' + resolved.join('/');
  }

  public getNode(path: string): VFSNode {
    const resolvedPath = this._resolvePath(path);
    const parts = resolvedPath.split('/').filter(p => p);
    let currentNode: VFSNode = this.state.root;

    for (const part of parts) {
      if (currentNode.type !== 'directory' || !currentNode.children[part]) {
        throw new Error(`path not found: ${path}`);
      }
      currentNode = currentNode.children[part];
    }
    return currentNode;
  }
  
  public getParentNode(path: string): { parent: VFSDirectory, name: string } {
      const resolvedPath = this._resolvePath(path);
      const parts = resolvedPath.split('/').filter(p => p);
      if (parts.length === 0) throw new Error(`Cannot get parent of root`);
      const name = parts.pop()!;
      const parentPath = '/' + parts.join('/');
      const parent = this.getNode(parentPath);
      if (parent.type !== 'directory') throw new Error(`Invalid path: ${path}`);
      return { parent, name };
  }

  public cd(path: string) {
    const node = this.getNode(path);
    if (node.type !== 'directory') {
      throw new Error(`cd: not a directory: ${path}`);
    }
    this.state.cwd = this._resolvePath(path);
  }

  public mkdir(path: string) {
    const { parent, name } = this.getParentNode(path);
    if (parent.children[name]) {
        throw new Error(`mkdir: cannot create directory ‘${name}’: File exists`);
    }
    parent.children[name] = {
        type: 'directory',
        name,
        children: {},
        permissions: 0o755,
        owner: 'student',
        group: 'student',
        modified: new Date().toISOString(),
    };
    parent.modified = new Date().toISOString();
  }

  public touch(path: string) {
    try {
        const node = this.getNode(path);
        node.modified = new Date().toISOString();
    } catch(e) {
        const { parent, name } = this.getParentNode(path);
        parent.children[name] = {
            type: 'file',
            name,
            content: '',
            permissions: 0o644,
            owner: 'student',
            group: 'student',
            modified: new Date().toISOString(),
        }
        parent.modified = new Date().toISOString();
    }
  }

  public writeFile(path: string, content: string, append: boolean = false) {
    try {
        const node = this.getNode(path);
        if (node.type !== 'file') throw new Error(`writeFile: not a file: ${path}`);
        node.content = append ? node.content + content : content;
        node.modified = new Date().toISOString();
    } catch (e) {
        const { parent, name } = this.getParentNode(path);
        parent.children[name] = {
            type: 'file',
            name,
            content: content,
            permissions: 0o644,
            owner: 'student',
            group: 'student',
            modified: new Date().toISOString(),
        }
    }
  }

  public cat(path: string): string {
    const node = this.getNode(path);
    if (node.type !== 'file') {
      throw new Error(`cat: ${path}: Is a directory`);
    }
    return node.content;
  }
  
  public rm(path: string) {
    const { parent, name } = this.getParentNode(path);
    if (!parent.children[name]) {
        throw new Error(`rm: cannot remove '${name}': No such file or directory`);
    }
    const node = parent.children[name];
    if (node.type === 'directory' && Object.keys(node.children).length > 0) {
        throw new Error(`rm: cannot remove '${name}': Directory not empty`);
    }
    delete parent.children[name];
    parent.modified = new Date().toISOString();
  }

  public permissionsToString(perms: number): string {
    const r = (perms & 4) ? 'r' : '-';
    const w = (perms & 2) ? 'w' : '-';
    const x = (perms & 1) ? 'x' : '-';
    return r + w + x;
  }
}
