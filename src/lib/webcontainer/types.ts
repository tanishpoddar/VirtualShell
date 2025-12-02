/**
 * TypeScript types for WebContainer integration
 */

import type { WebContainer } from '@webcontainer/api';

export type WebContainerStatus = 'uninitialized' | 'loading' | 'ready' | 'error';

export interface WebContainerConfig {
  workdir?: string;
  coep?: 'credentialless' | 'require-corp';
}

export interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration?: number;
}

export interface WebContainerState {
  status: WebContainerStatus;
  instance: WebContainer | null;
  error: Error | null;
  workdir: string;
  lastActivity: Date;
}

export interface FilesystemSnapshot {
  version: number;
  timestamp: number;
  userId?: string;
  files: {
    [path: string]: {
      content: string;
      permissions?: number;
      modified: Date;
    };
  };
  directories: string[];
  metadata: {
    totalSize: number;
    fileCount: number;
  };
}

export interface TerminalSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  commandHistory: string[];
  workingDirectory: string;
  environment: Record<string, string>;
}

export interface WebContainerError extends Error {
  code: string;
  recoverable: boolean;
  userMessage: string;
}

export const ErrorCodes = {
  INIT_FAILED: 'INIT_FAILED',
  BROWSER_UNSUPPORTED: 'BROWSER_UNSUPPORTED',
  MEMORY_INSUFFICIENT: 'MEMORY_INSUFFICIENT',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  COMMAND_FAILED: 'COMMAND_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
  FILESYSTEM_ERROR: 'FILESYSTEM_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
