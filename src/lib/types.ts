export interface VFSBase {
  name: string;
  permissions: number;
  owner: string;
  group: string;
  modified: string; // ISO string
}

export interface VFSFile extends VFSBase {
  type: 'file';
  content: string;
}

export interface VFSDirectory extends VFSBase {
  type: 'directory';
  children: { [key: string]: VFSNode };
}

export type VFSNode = VFSFile | VFSDirectory;

export interface VFS {
  cwd: string;
  root: VFSDirectory;
}
