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
  private previousCwd: string | null = null;

  constructor(initialState?: VFS) {
    this.state = initialState || createInitialFileSystem();
    this.previousCwd = this.state.cwd;
  }

  get cwd() {
    return this.state.cwd;
  }
  
  serialize(): VFS {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  private _resolvePath(path: string): string {
    if (path === '-') return this.previousCwd || this.state.cwd;

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
    if (resolvedPath === '/') return this.state.root;

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
      const parent = this.getNode(parentPath) as VFSDirectory;
      if (parent.type !== 'directory') throw new Error(`Invalid path: ${path}`);
      return { parent, name };
  }

  public cd(path: string) {
    const newPath = this._resolvePath(path);
    const node = this.getNode(newPath);
    if (node.type !== 'directory') {
      throw new Error(`cd: not a directory: ${path}`);
    }
    this.previousCwd = this.state.cwd;
    this.state.cwd = newPath;
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

  public rmdir(path: string) {
    const { parent, name } = this.getParentNode(path);
    const node = parent.children[name];
    if (!node) {
        throw new Error(`rmdir: failed to remove '${name}': No such file or directory`);
    }
    if (node.type !== 'directory') {
        throw new Error(`rmdir: failed to remove '${name}': Not a directory`);
    }
    if (Object.keys(node.children).length > 0) {
        throw new Error(`rmdir: failed to remove '${name}': Directory not empty`);
    }
    delete parent.children[name];
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
    // In unix, rm can remove empty directories with -d, but for this sim, we'll just allow file removal.
    if (node.type === 'directory') {
        throw new Error(`rm: cannot remove '${name}': Is a directory`);
    }
    delete parent.children[name];
    parent.modified = new Date().toISOString();
  }

  public cp(sourcePath: string, destPath: string) {
    const sourceNode = this.getNode(sourcePath);
    if(sourceNode.type === 'directory') throw new Error(`cp: ${sourcePath} is a directory (not supported)`);
    
    let finalDestPath = destPath;
    try {
      const destNode = this.getNode(destPath);
      if (destNode.type === 'directory') {
        finalDestPath = this._resolvePath(destPath + '/' + sourceNode.name);
      }
    } catch (e) {
      // destination doesn't exist, that's fine
    }

    this.writeFile(finalDestPath, sourceNode.content);
  }

  public mv(sourcePath: string, destPath: string) {
    this.cp(sourcePath, destPath);
    this.rm(sourcePath);
  }
  
  public chmod(path: string, mode: string) {
      const node = this.getNode(path);
      // This is a simplified chmod, only supporting octal for now
      const newPerms = parseInt(mode, 8);
      if(isNaN(newPerms)) throw new Error(`chmod: invalid mode: ‘${mode}’`);
      node.permissions = newPerms;
      node.modified = new Date().toISOString();
  }

  public permissionsToString(perms: number): string {
    const r = (perms & 4) ? 'r' : '-';
    const w = (perms & 2) ? 'w' : '-';
    const x = (perms & 1) ? 'x' : '-';
    return r + w + x;
  }
}

    