'use client';

import React, { useCallback } from 'react';
import { useWebContainer } from '@/hooks/useWebContainer';
import { useFilesystemSync } from '@/hooks/useFilesystemSync';
import useAuth from '@/hooks/use-auth';
import { TerminalUI } from './TerminalUI';
import { LoadingState } from './LoadingState';
import { ErrorBoundary } from './ErrorBoundary';
import { ControlPanel } from './ControlPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export interface WebContainerTerminalProps {
  className?: string;
}

export const WebContainerTerminal: React.FC<WebContainerTerminalProps> = ({
  className = '',
}) => {
  const { user } = useAuth();
  const { status, error, reset, isReady, manager } = useWebContainer();
  const { isSyncing, lastSyncTime, syncError, isDirty, manualSync } = useFilesystemSync(
    manager,
    user?.uid
  );

  const handleReset = useCallback(async () => {
    await reset();
    // Reload the page to restart the shell
    window.location.reload();
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

        <div className="mt-2">
          <TerminalUI
            manager={manager}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default WebContainerTerminal;
