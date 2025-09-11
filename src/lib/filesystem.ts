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
                'f1': { type: 'file', name: 'f1', content: 'This is file f1.\nIt contains sample text.\n', permissions: 0o644, owner: 'student', group: 'student', modified: now },
                'f2': { type: 'file', name: 'f2', content: 'This is file f2.\nIt has different content.\n', permissions: 0o644, owner: 'student', group: 'student', modified: now },
                'ex1': { type: 'file', name: 'ex1', content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n', permissions: 0o644, owner: 'student', group: 'student', modified: now },
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
    if (!this.state.cwd) {
        this.state.cwd = '/home/student';
    }
    this.previousCwd = this.state.cwd;
  }

  get cwd() {
    return this.state.cwd;
  }
  
  serialize(): VFS {
    return JSON.parse(JSON.stringify(this.state));
  }
  
  public resolvePath(path: string, allowDir: boolean = false): string {
    if (path === '-') return this.previousCwd || this.state.cwd;

    if (path.startsWith('/')) {
        // Absolute path
        const parts = path.split('/').filter(p => p);
        const resolved: string[] = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                resolved.pop();
            } else {
                resolved.push(part);
            }
        }
        return '/' + resolved.join('/');
    }
    
    // Relative path
    const cwdParts = this.state.cwd.split('/').filter(p => p);
    const pathParts = path.split('/').filter(p => p);
    const combined = [...cwdParts, ...pathParts];
    const resolved: string[] = [];

    for (const part of combined) {
        if (part === '.') continue;
        if (part === '..') {
            resolved.pop();
        } else {
            resolved.push(part);
        }
    }
    
    const finalPath = '/' + resolved.join('/');

    if(allowDir) return finalPath;

    // Check if the resolved path points to a directory when it shouldn't
    try {
        const node = this.getNode(finalPath, true);
        if (node.type === 'directory' && !path.endsWith('/') && path !== '.' && path !== '..') {
             // If original path was `d` and it's a directory, this is valid.
             // If original path was `d/f` and `d` is dir, this is valid.
             const pathSegments = path.split('/').filter(Boolean);
             if (pathSegments[pathSegments.length-1] === node.name) return finalPath;
        }
    } catch(e) {
        // It's a new file/path, that's okay
    }


    return finalPath;
  }

  public getNode(path: string, suppressError: boolean = false): VFSNode {
    const resolvedPath = this.resolvePath(path, true);
    if (resolvedPath === '/') return this.state.root;

    const parts = resolvedPath.split('/').filter(p => p);
    let currentNode: VFSNode = this.state.root;

    for (const part of parts) {
      if (currentNode.type !== 'directory' || !currentNode.children[part]) {
        if (suppressError) return currentNode; // return last valid node
        throw new Error(`path not found: ${path}`);
      }
      currentNode = currentNode.children[part];
    }
    return currentNode;
  }
  
  public getParentNode(path: string): { parent: VFSDirectory, name: string } {
      const resolvedPath = this.resolvePath(path);
      const parts = resolvedPath.split('/').filter(p => p);
      if (parts.length === 0) throw new Error(`Cannot get parent of root`);
      const name = parts.pop()!;
      const parentPath = '/' + parts.join('/');
      const parent = this.getNode(parentPath, true) as VFSDirectory;
      if (parent.type !== 'directory') throw new Error(`Invalid path: ${path}`);
      return { parent, name };
  }

  public cd(path: string) {
    const newPath = this.resolvePath(path, true);
    const node = this.getNode(newPath);
    if (node.type !== 'directory') {
      throw new Error(`cd: not a directory: ${path}`);
    }
    this.previousCwd = this.state.cwd;
    this.state.cwd = newPath === '/' && newPath.length > 1 ? newPath.slice(0, -1) : newPath;
    if (this.state.cwd === '') this.state.cwd = '/';
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
        if (!name) return;
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
        parent.modified = new Date().toISOString();
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
    const node = parent.children[name];
    if (!node) {
        throw new Error(`rm: cannot remove '${name}': No such file or directory`);
    }
    if (node.type === 'directory') { // Simplified rm, doesn't handle -r
        throw new Error(`rm: cannot remove '${name}': Is a directory`);
    }
    delete parent.children[name];
    parent.modified = new Date().toISOString();
  }

  public cp(sourcePath: string, destPath: string) {
    const sourceNode = this.getNode(sourcePath);
    if(sourceNode.type === 'directory') throw new Error(`cp: ${sourcePath} is a directory (not supported)`);
    
    let finalDestPath = this.resolvePath(destPath, true);
    let name = sourceNode.name;

    try {
      const destNode = this.getNode(destPath);
      if (destNode.type === 'directory') {
        name = sourceNode.name;
        finalDestPath = this.resolvePath(destPath + '/' + name, true);
      }
    } catch (e) {
      // destination doesn't exist, that's fine
       const { name: destName } = this.getParentNode(destPath);
       name = destName;
    }
    
    const { parent } = this.getParentNode(finalDestPath);
    const newFile: VFSFile = {
        ...JSON.parse(JSON.stringify(sourceNode)),
        name,
        modified: new Date().toISOString(),
    };
    parent.children[name] = newFile;
    parent.modified = new Date().toISOString();
  }

  public mv(sourcePath: string, destPath: string) {
    const { parent: sourceParent, name: sourceName } = this.getParentNode(sourcePath);
    const sourceNode = this.getNode(sourcePath);

    let destParent = sourceParent;
    let destName = sourceName;
    
    try {
      let destNode = this.getNode(destPath);
      if (destNode.type === 'directory') {
        destParent = destNode as VFSDirectory;
        destName = sourceName;
      } else {
        // Overwriting a file
        const { parent, name } = this.getParentNode(destPath);
        destParent = parent;
        destName = name;
      }
    } catch(e) {
      // Moving to a new path
      const { parent, name } = this.getParentNode(destPath);
      destParent = parent;
      destName = name;
    }

    // Check if overwriting an existing file in the new location
    if (destParent.children[destName]) {
        if (destParent.children[destName].type === 'directory') {
            throw new Error(`mv: cannot overwrite directory '${destName}' with non-directory`);
        }
    }
    
    delete sourceParent.children[sourceName];
    sourceParent.modified = new Date().toISOString();
    
    sourceNode.name = destName;
    sourceNode.modified = new Date().toISOString();
    destParent.children[destName] = sourceNode;
    destParent.modified = new Date().toISOString();
  }
  
  public chmod(path: string, mode: string) {
      const node = this.getNode(path);
      // This is a simplified chmod, only supporting octal for now
      const newPerms = parseInt(mode, 8);
      if(isNaN(newPerms) || newPerms > 0o777) throw new Error(`chmod: invalid mode: ‘${mode}’`);
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

    