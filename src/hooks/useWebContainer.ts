'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { WebContainerManager } from '@/lib/webcontainer/manager';
import type { WebContainerStatus, CommandResult } from '@/lib/webcontainer/types';

export interface UseWebContainerReturn {
  status: WebContainerStatus;
  error: Error | null;
  executeCommand: (command: string) => Promise<CommandResult>;
  reset: () => Promise<void>;
  isReady: boolean;
  manager: WebContainerManager | null;
}

export function useWebContainer(): UseWebContainerReturn {
  const [status, setStatus] = useState<WebContainerStatus>('uninitialized');
  const [error, setError] = useState<Error | null>(null);
  const managerRef = useRef<WebContainerManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let errorUnsubscribe: (() => void) | undefined;

    const initializeContainer = async () => {
      try {
        const manager = WebContainerManager.getInstance();
        managerRef.current = manager;

        // Check if already initialized
        const currentStatus = manager.getStatus();
        if (currentStatus === 'ready') {
          setStatus('ready');
          setIsInitialized(true);
          return;
        }

        // Subscribe to status changes
        const checkStatus = () => {
          setStatus(manager.getStatus());
          setError(manager.getError());
        };

        errorUnsubscribe = manager.onError((err) => {
          setError(err);
          setStatus('error');
        });

        setStatus('loading');
        await manager.initialize();
        checkStatus();
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
        setStatus('error');
      }
    };

    initializeContainer();

    return () => {
      if (errorUnsubscribe) {
        errorUnsubscribe();
      }
    };
  }, []);

  const executeCommand = useCallback(async (command: string): Promise<CommandResult> => {
    if (!managerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const result = await managerRef.current.executeCommand(command);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const reset = useCallback(async (): Promise<void> => {
    if (!managerRef.current) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await managerRef.current.reset();
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    status,
    error,
    executeCommand,
    reset,
    isReady: status === 'ready' && isInitialized,
    manager: managerRef.current,
  };
}
