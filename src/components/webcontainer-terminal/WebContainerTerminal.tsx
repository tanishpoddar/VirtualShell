'use client';

import React, { useCallback, useRef } from 'react';
import { useWebContainer } from '@/hooks/useWebContainer';
import { useTerminal } from '@/hooks/useTerminal';
import { useFilesystemSync } from '@/hooks/useFilesystemSync';
import useAuth from '@/hooks/use-auth';
import { TerminalUI } from './TerminalUI';
import { LoadingState } from './LoadingState';
import { ErrorBoundary } from './ErrorBoundary';
import { ControlPanel } from './ControlPanel';
import { AutocompleteService } from '@/lib/webcontainer/autocomplete';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface WebContainerTerminalProps {
  className?: string;
}

export const WebContainerTerminal: React.FC<WebContainerTerminalProps> = ({
  className = '',
}) => {
  const { user } = useAuth();
  const { status, error, executeCommand, reset, isReady, manager } = useWebContainer();
  const { session, addToHistory, setWorkingDirectory } = useTerminal(user?.uid);
  const { isSyncing, lastSyncTime, syncError, isDirty, manualSync } = useFilesystemSync(
    manager,
    user?.uid
  );

  const autocompleteServiceRef = useRef<AutocompleteService | null>(null);
  const terminalRef = useRef<any>(null);

  // Initialize autocomplete service
  React.useEffect(() => {
    if (manager && isReady) {
      autocompleteServiceRef.current = new AutocompleteService(manager);
    }
  }, [manager, isReady]);

  const handleCommand = useCallback(
    async (command: string) => {
      if (!isReady) {
        throw new Error('Terminal not ready');
      }

      addToHistory(command);

      try {
        const result = await executeCommand(command);

        // Write output to terminal
        if (terminalRef.current?.writeOutput) {
          if (result.stdout) {
            terminalRef.current.writeOutput(result.stdout);
          }
          if (result.stderr) {
            terminalRef.current.writeOutput(`\x1b[31m${result.stderr}\x1b[0m`);
          }
        }

        // Update working directory if cd command
        if (command.trim().startsWith('cd ')) {
          try {
            const newDir = await manager?.readFile('/.pwd');
            if (newDir) {
              setWorkingDirectory(newDir);
            }
          } catch {
            // Ignore errors reading pwd
          }
        }
      } catch (err) {
        const errorMessage = (err as Error).message;
        if (terminalRef.current?.writeOutput) {
          terminalRef.current.writeOutput(`\x1b[31mError: ${errorMessage}\x1b[0m`);
        }
        throw err;
      }
    },
    [isReady, addToHistory, executeCommand, manager, setWorkingDirectory]
  );

  const handleReset = useCallback(async () => {
    await reset();
    if (terminalRef.current?.writeOutput) {
      terminalRef.current.writeOutput('\x1b[32mTerminal reset successfully\x1b[0m');
    }
  }, [reset]);

  if (status === 'loading') {
    return <LoadingState message="Starting WebContainer..." />;
  }

  if (status === 'error' && error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Terminal Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Failed to initialize terminal'}
          <br />
          <span className="text-sm">Please refresh the page to try again.</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`flex flex-col ${className}`}>
        <ControlPanel
          onReset={handleReset}
          onSave={user ? manualSync : undefined}
          isSyncing={isSyncing}
          lastSyncTime={lastSyncTime}
          isDirty={isDirty}
        />

        {syncError && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sync error: {syncError.message}
            </AlertDescription>
          </Alert>
        )}

        <TerminalUI
          ref={terminalRef}
          onCommand={handleCommand}
          autocompleteService={autocompleteServiceRef.current || undefined}
          currentDirectory={session.workingDirectory}
          readOnly={!isReady}
          className="flex-1"
        />
      </div>
    </ErrorBoundary>
  );
};

export default WebContainerTerminal;
