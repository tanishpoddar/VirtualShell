'use client';

import { useState, useCallback } from 'react';
import type { TerminalSession } from '@/lib/webcontainer/types';

export interface UseTerminalReturn {
  session: TerminalSession;
  addToHistory: (command: string) => void;
  clearHistory: () => void;
  getHistoryItem: (index: number) => string | undefined;
  historyLength: number;
  setWorkingDirectory: (dir: string) => void;
  setEnvironmentVariable: (key: string, value: string) => void;
  updateLastActivity: () => void;
}

export function useTerminal(userId?: string): UseTerminalReturn {
  const [session, setSession] = useState<TerminalSession>(() => ({
    id: `session-${Date.now()}`,
    userId,
    startTime: new Date(),
    lastActivity: new Date(),
    commandHistory: [],
    workingDirectory: '/',
    environment: {},
  }));

  const addToHistory = useCallback((command: string) => {
    setSession((prev) => ({
      ...prev,
      commandHistory: [command, ...prev.commandHistory].slice(0, 1000), // Keep last 1000 commands
      lastActivity: new Date(),
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      commandHistory: [],
      lastActivity: new Date(),
    }));
  }, []);

  const getHistoryItem = useCallback(
    (index: number): string | undefined => {
      return session.commandHistory[index];
    },
    [session.commandHistory]
  );

  const setWorkingDirectory = useCallback((dir: string) => {
    setSession((prev) => ({
      ...prev,
      workingDirectory: dir,
      lastActivity: new Date(),
    }));
  }, []);

  const setEnvironmentVariable = useCallback((key: string, value: string) => {
    setSession((prev) => ({
      ...prev,
      environment: {
        ...prev.environment,
        [key]: value,
      },
      lastActivity: new Date(),
    }));
  }, []);

  const updateLastActivity = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      lastActivity: new Date(),
    }));
  }, []);

  return {
    session,
    addToHistory,
    clearHistory,
    getHistoryItem,
    historyLength: session.commandHistory.length,
    setWorkingDirectory,
    setEnvironmentVariable,
    updateLastActivity,
  };
}
