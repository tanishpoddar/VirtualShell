'use client';

import React, { useState } from 'react';
import { RotateCcw, Save, Cloud, CloudOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export interface ControlPanelProps {
  onReset: () => Promise<void>;
  onSave?: () => Promise<void>;
  isSyncing?: boolean;
  lastSyncTime?: Date | null;
  isDirty?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onReset,
  onSave,
  isSyncing = false,
  lastSyncTime,
  isDirty = false,
}) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onReset();
      toast({
        title: 'Terminal Reset',
        description: 'Terminal has been reset to initial state.',
      });
    } catch (err) {
      toast({
        title: 'Reset Failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      await onSave();
      toast({
        title: 'Saved',
        description: 'Terminal state has been saved.',
      });
    } catch (err) {
      toast({
        title: 'Save Failed',
        description: (err as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
        <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
          {isSyncing ? (
            <>
              <Cloud className="h-4 w-4 animate-pulse text-blue-400" />
              <span>Syncing...</span>
            </>
          ) : lastSyncTime ? (
            <>
              <Cloud className="h-4 w-4 text-green-400" />
              <span>
                Last saved: {lastSyncTime.toLocaleTimeString()}
                {isDirty && ' (unsaved changes)'}
              </span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4 text-gray-500" />
              <span>Not synced</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSyncing || !isDirty}
              title="Save terminal state"
            >
              <Save className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            disabled={isResetting}
            title="Reset terminal"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Terminal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all files and reset the terminal to its initial state.
              {isDirty && ' You have unsaved changes that will be lost.'}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} disabled={isResetting}>
              {isResetting ? 'Resetting...' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ControlPanel;
