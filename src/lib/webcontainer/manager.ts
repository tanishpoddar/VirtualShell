'use client';

import { WebContainer } from '@webcontainer/api';
import type {
  WebContainerConfig,
  WebContainerStatus,
  CommandResult,
  WebContainerError,
} from './types';
import { ErrorCodes } from './types';

export class WebContainerManager {
  private static instance: WebContainerManager | null = null;
  private container: WebContainer | null = null;
  private status: WebContainerStatus = 'uninitialized';
  private error: Error | null = null;
  private outputCallbacks: ((data: string) => void)[] = [];
  private errorCallbacks: ((error: Error) => void)[] = [];
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): WebContainerManager {
    if (!WebContainerManager.instance) {
      WebContainerManager.instance = new WebContainerManager();
    }
    return WebContainerManager.instance;
  }

  async initialize(config?: WebContainerConfig): Promise<void> {
    if (this.status === 'ready' && this.container) {
      return;
    }

    if (this.status === 'loading' && this.initPromise) {
      return this.initPromise;
    }

    this.status = 'loading';
    this.error = null;

    this.initPromise = this.performInitialization(config);
    return this.initPromise;
  }

  private async performInitialization(
    config?: WebContainerConfig
  ): Promise<void> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.container = await WebContainer.boot({
          workdirName: config?.workdir || 'home',
          coep: config?.coep || 'credentialless',
        });

        await this.setupDefaultEnvironment();

        this.status = 'ready';
        this.error = null;
        this.initPromise = null;
        return;
      } catch (err) {
        lastError = err as Error;
        console.error(`WebContainer initialization attempt ${attempt} failed:`, err);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    this.status = 'error';
    this.error = this.createError(
      lastError?.message || 'Failed to initialize WebContainer',
      ErrorCodes.INIT_FAILED,
      true,
      'Failed to start the terminal. Please refresh the page and try again.'
    );
    this.initPromise = null;
    this.notifyError(this.error);
    throw this.error;
  }

  private async setupDefaultEnvironment(): Promise<void> {
    if (!this.container) return;

    try {
      await this.container.mount({
        'welcome.txt': {
          file: {
            contents: 'Welcome to SRM OS Virtual Labs!\nType "help" for available commands.\n',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to setup default environment:', err);
    }
  }

  async executeCommand(command: string): Promise<CommandResult> {
    if (!this.container || this.status !== 'ready') {
      throw this.createError(
        'WebContainer not ready',
        ErrorCodes.COMMAND_FAILED,
        false,
        'Terminal is not ready. Please wait for initialization to complete.'
      );
    }

    const startTime = Date.now();

    try {
      const process = await this.container.spawn('sh', ['-c', command]);

      let stdout = '';
      let stderr = '';

      process.output.pipeTo(
        new WritableStream({
          write: (data) => {
            stdout += data;
            this.notifyOutput(data);
          },
        })
      );

      const exitCode = await process.exit;
      const duration = Date.now() - startTime;

      return {
        exitCode,
        stdout,
        stderr,
        duration,
      };
    } catch (err) {
      const error = err as Error;
      throw this.createError(
        error.message,
        ErrorCodes.COMMAND_FAILED,
        true,
        `Command failed: ${error.message}`
      );
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.container || this.status !== 'ready') {
      throw this.createError(
        'WebContainer not ready',
        ErrorCodes.FILESYSTEM_ERROR,
        false,
        'Cannot write file: Terminal is not ready.'
      );
    }

    try {
      await this.container.fs.writeFile(path, content);
    } catch (err) {
      const error = err as Error;
      throw this.createError(
        error.message,
        ErrorCodes.FILESYSTEM_ERROR,
        true,
        `Failed to write file: ${error.message}`
      );
    }
  }

  async readFile(path: string): Promise<string> {
    if (!this.container || this.status !== 'ready') {
      throw this.createError(
        'WebContainer not ready',
        ErrorCodes.FILESYSTEM_ERROR,
        false,
        'Cannot read file: Terminal is not ready.'
      );
    }

    try {
      const content = await this.container.fs.readFile(path, 'utf-8');
      return content;
    } catch (err) {
      const error = err as Error;
      throw this.createError(
        error.message,
        ErrorCodes.FILESYSTEM_ERROR,
        true,
        `Failed to read file: ${error.message}`
      );
    }
  }

  async listDirectory(path: string): Promise<string[]> {
    if (!this.container || this.status !== 'ready') {
      throw this.createError(
        'WebContainer not ready',
        ErrorCodes.FILESYSTEM_ERROR,
        false,
        'Cannot list directory: Terminal is not ready.'
      );
    }

    try {
      const entries = await this.container.fs.readdir(path);
      return entries;
    } catch (err) {
      const error = err as Error;
      throw this.createError(
        error.message,
        ErrorCodes.FILESYSTEM_ERROR,
        true,
        `Failed to list directory: ${error.message}`
      );
    }
  }

  async reset(): Promise<void> {
    if (!this.container) {
      return;
    }

    try {
      const files = await this.container.fs.readdir('/');
      for (const file of files) {
        try {
          await this.container.fs.rm(`/${file}`, { recursive: true, force: true });
        } catch (err) {
          console.warn(`Failed to remove ${file}:`, err);
        }
      }

      await this.setupDefaultEnvironment();
    } catch (err) {
      const error = err as Error;
      throw this.createError(
        error.message,
        ErrorCodes.FILESYSTEM_ERROR,
        true,
        `Failed to reset terminal: ${error.message}`
      );
    }
  }

  async destroy(): Promise<void> {
    if (this.container) {
      try {
        await this.container.teardown();
      } catch (err) {
        console.error('Error during WebContainer teardown:', err);
      }
      this.container = null;
    }
    this.status = 'uninitialized';
    this.error = null;
    this.outputCallbacks = [];
    this.errorCallbacks = [];
  }

  getStatus(): WebContainerStatus {
    return this.status;
  }

  getError(): Error | null {
    return this.error;
  }

  isReady(): boolean {
    return this.status === 'ready' && this.container !== null;
  }

  onOutput(callback: (data: string) => void): () => void {
    this.outputCallbacks.push(callback);
    return () => {
      this.outputCallbacks = this.outputCallbacks.filter((cb) => cb !== callback);
    };
  }

  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyOutput(data: string): void {
    this.outputCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error('Error in output callback:', err);
      }
    });
  }

  private notifyError(error: Error): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    });
  }

  private createError(
    message: string,
    code: string,
    recoverable: boolean,
    userMessage: string
  ): WebContainerError {
    const error = new Error(message) as WebContainerError;
    error.code = code;
    error.recoverable = recoverable;
    error.userMessage = userMessage;
    return error;
  }
}
