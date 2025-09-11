'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import useAuth from '@/hooks/use-auth';
import { executeCommand } from '@/lib/commands';
import { VirtualFileSystem, createInitialFileSystem } from '@/lib/filesystem';
import type { VFS } from '@/lib/types';

import AppHeader from '@/components/layout/header';
import AppFooter from '@/components/layout/footer';
import InstructionsPanel from '@/components/instructions-panel';
import Terminal from '@/components/terminal';
import CommandHints from '@/components/command-hints';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [vfs, setVfs] = useState<VirtualFileSystem>(new VirtualFileSystem(createInitialFileSystem()));
  const [loading, setLoading] = useState(true);
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'command' | 'output'; content: string }>>([]);
  const vfsRef = useRef(vfs);

  useEffect(() => {
    vfsRef.current = vfs;
  }, [vfs]);

  const saveVfsState = useCallback(async (newVfs: VirtualFileSystem) => {
    if (user) {
      try {
        const docRef = doc(db, 'labs', user.uid);
        await setDoc(docRef, newVfs.serialize());
      } catch (error) {
        console.error('Error saving lab state:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user) {
      setLoading(true);
      const docRef = doc(db, 'labs', user.uid);

      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as VFS;
          const newVfs = new VirtualFileSystem(data);
          // Only update if it's different from the current state to avoid loops
          if (JSON.stringify(newVfs.serialize()) !== JSON.stringify(vfsRef.current.serialize())) {
            setVfs(newVfs);
          }
        } else {
          const newVfs = new VirtualFileSystem(createInitialFileSystem());
          setVfs(newVfs);
          saveVfsState(newVfs);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to VFS changes:", error);
        setVfs(new VirtualFileSystem(createInitialFileSystem()));
        setLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      setVfs(new VirtualFileSystem(createInitialFileSystem()));
      setTerminalHistory([]);
      setLoading(false);
    }
  }, [user, authLoading, saveVfsState]);

  const handleCommand = async (command: string) => {
    const newHistory = [...terminalHistory, { type: 'command' as const, content: command }];
    setTerminalHistory(newHistory);

    if (command.trim().toLowerCase() === 'clear') {
      setTerminalHistory([]);
      return;
    }
    
    const { stdout, stderr, vfs: updatedVfs } = await executeCommand(command, vfs);
    const output = stdout + (stderr ? `\n${stderr}` : '');

    setTerminalHistory(prev => [...prev, { type: 'output', content: output }]);

    setVfs(updatedVfs);
    await saveVfsState(updatedVfs);
  };
  
  const handleReset = async () => {
    const newVfs = new VirtualFileSystem(createInitialFileSystem());
    setVfs(newVfs);
    setTerminalHistory([]);
    await saveVfsState(newVfs);
  };

  const handleRunHint = (command: string) => {
    handleCommand(command);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader onReset={handleReset} />
      <main className="flex-grow container mx-auto p-4 flex flex-col md:flex-row gap-6">
        <div className="flex-grow flex flex-col gap-4 md:w-3/5 lg:w-4/5">
          {loading ? (
            <Skeleton className="w-full h-[400px] rounded-lg" />
          ) : (
            <Terminal
              onCommand={handleCommand}
              history={terminalHistory}
              cwd={vfs.cwd}
            />
          )}
          <CommandHints onRunHint={handleRunHint} />
        </div>
        <div className="md:w-2/5 lg:w-1/5">
          <InstructionsPanel />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
