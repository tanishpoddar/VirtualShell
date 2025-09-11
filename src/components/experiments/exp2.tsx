'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import useAuth from '@/hooks/use-auth';
import { executeCommand } from '@/lib/commands';
import { VirtualFileSystem, createInitialFileSystem } from '@/lib/filesystem';
import type { VFS } from '@/lib/types';

import AppHeader from '@/components/layout/header';
import AppFooter from '@/components/layout/footer';
import Terminal from '@/components/terminal';
import CommandHints from '@/components/command-hints';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const experimentSections = {
  '2a': 'Exp. 2(a) - Basic Linux Commands',
  basics: 'Basics',
  files: 'Working with Files',
  directories: 'Working with Directories',
  substitution: 'File Name Substitution',
  redirection: 'I/O Redirection',
  piping: 'Piping',
  environment: 'Environment Variables',
  permission: 'File Permission',
  '2b': 'Exp. 2(b) - Filters and Admin Commands',
  filters: 'Filters',
};

const experimentContent: Record<string, React.ReactNode> = {
  '2a': (
    <div>
      <h3 className="text-lg font-bold mb-2">Aim:</h3>
      <p>To execute basic linux commands</p>
      <h3 className="text-lg font-bold mt-4 mb-2">Procedure:</h3>
    </div>
  ),
  basics: (
    <ul className="space-y-2 list-decimal list-inside">
      <li><code>echo SRM</code> ➔ to display the string SRM</li>
      <li><code>clear</code> ➔ to clear the screen</li>
      <li><code>date</code> ➔ to display the current date and time</li>
      <li><code>cal 2003</code> ➔ to display the calendar for the year 2003</li>
      <li><code>cal 6 2003</code> ➔ to display the calendar for the June-2003</li>
      <li><code>passwd</code> ➔ to change password</li>
    </ul>
  ),
  files: (
    <ul className="space-y-2 list-decimal list-inside">
      <li>
        <code>ls</code> ➔ list files in the present working directory
        <ul className="list-disc list-inside ml-4">
          <li><code>ls –l</code> ➔ list files with detailed information (long list)</li>
          <li><code>ls –a</code> ➔ list all files including the hidden files</li>
        </ul>
      </li>
      <li><code>cat > f1</code> ➔ to create a file (Press ^d to finish typing)</li>
      <li><code>cat f1</code> ➔ display the content of the file f1</li>
      <li>
        <code>wc f1</code> ➔ list no. of characters, words & lines of a file f1
        <ul className="list-disc list-inside ml-4">
          <li><code>wc –c f1</code> ➔ list only no. of characters of file f1</li>
          <li><code>wc –w f1</code> ➔ list only no. of words of file f1</li>
          <li><code>wc –l f1</code> ➔ list only no. of lines of file f1</li>
        </ul>
      </li>
      <li><code>cp f1 f2</code> ➔ copy file f1 into f2</li>
      <li><code>mv f1 f2</code> ➔ rename file f1 as f2</li>
      <li><code>rm f1</code> ➔ remove the file f1</li>
      <li><code>head –5 f1</code> ➔ list first 5 lines of the file f1</li>
      <li><code>tail –5 f1</code> ➔ list last 5 lines of the file f1</li>
    </ul>
  ),
  directories: (
    <ul className="space-y-2 list-decimal list-inside">
        <li><code>mkdir elias</code> ➔ to create the directory elias</li>
        <li><code>cd elias</code> ➔ to change the directory as elias</li>
        <li><code>rmdir elias</code> ➔ to remove the directory elias</li>
        <li><code>pwd</code> ➔ to display the path of the present working directory</li>
        <li><code>cd</code> ➔ to go to the home directory</li>
        <li><code>cd ..</code> ➔ to go to the parent directory</li>
        <li><code>cd -</code> ➔ to go to the previous working directory</li>
        <li><code>cd /</code> ➔ to go to the root directory</li>
    </ul>
  ),
  substitution: (
     <ul className="space-y-2 list-decimal list-inside">
        <li><code>ls f?</code> ➔ list files start with ‘f’ and followed by any one character</li>
        <li><code>ls *.c</code> ➔ list files with extension ‘c’</li>
        <li><code>ls [gpy]et</code> ➔ list files whose first letter is any one of the character g, p or y and followed by the word et</li>
        <li><code>ls [a-d,l-m]ring</code> ➔ list files whose first letter is any one of the character from a to d and l to m and followed by the word ring.</li>
     </ul>
  ),
    redirection: (
    <div>
        <h4 className='font-bold'>Input redirection</h4>
        <p><code>wc –l &lt; ex1</code> ➔ To find the number of lines of the file ‘ex1’</p>
        <h4 className='font-bold mt-2'>Output redirection</h4>
        <p><code>who > f2</code> ➔ the output of ‘who’ will be redirected to file f2</p>
        <p><code>cat >> f1</code> ➔ to append more into the file f1</p>
    </div>
  ),
  piping: (
    <div>
        <p>Syntax : <code>Command1 | command2</code></p>
        <p>Output of the command1 is transferred to the command2 as input. Finally output of the command2 will be displayed on the monitor.</p>
        <h4 className='font-bold mt-2'>Example.</h4>
        <p><code>cat f1 | more</code> list the contents of file f1 screen by screen</p>
        <p><code>head –6 f1 |tail –2</code> prints the 5th & 6th lines of the file f1.</p>
    </div>
  ),
  environment: (
    <ul className="space-y-2 list-decimal list-inside">
        <li><code>echo $HOME</code> ➔ display the path of the home directory</li>
        <li><code>echo $PS1</code> ➔ display the prompt string $</li>
        <li><code>echo $PS2</code> ➔ display the second prompt string ( > symbol by default )</li>
        <li><code>echo $LOGNAME</code> ➔ login name</li>
        <li><code>echo $PATH</code> ➔ list of pathname where the OS searches for an executable file</li>
    </ul>
  ),
  permission: (
     <div>
        <p><code>chmod</code> command is used to change the access permission of a file.</p>
        <h4 className='font-bold mt-2'>Method-1:</h4>
        <p>Syntax : <code>chmod ugoa+/-rwx filename</code></p>
        <p>u : user, g : group, o : others, + : Add permission - : Remove the permission r : read, w : write, x :execute, a : all permissions</p>
        <p>Example: <code>chmod ug+rw f1</code></p>
        <p>Adding ‘read & write’ permissions of file f1 to both user and group members.</p>
        <h4 className='font-bold mt-2'>Method-2</h4>
        <p>Syntax : <code>chmod octnum file1</code></p>
        <p>The 3 digit octal number represents as follows: First digit -- file permissions for the user, Second digit -- file permissions for the group, Third digit -- file permissions for others</p>
        <p>Each digit is specified as the sum of following: 4 – read permission, 2 – write permission, 1 – execute permission</p>
        <p>Example: <code>chmod 754 f1</code></p>
     </div>
  ),
  '2b': (
     <div>
      <h3 className="text-lg font-bold mb-2">Aim:</h3>
      <p>To execute filters and admin commands.</p>
      <h3 className="text-lg font-bold mt-4 mb-2">Procedure:</h3>
    </div>
  ),
  filters: (
    <ul className="space-y-4">
        <li>
            <h4 className="font-bold">1. cut</h4>
            <p>Used to cut characters or fileds from a file/input</p>
            <p>Syntax : <code>cut -cchars filename</code> or <code>-ffieldnos filename</code></p>
        </li>
        <li>
            <h4 className="font-bold">2. grep</h4>
            <p>Used to search one or more files for a particular pattern.</p>
            <p>Syntax : <code>grep pattern filename(s)</code></p>
        </li>
        <li>
            <h4 className="font-bold">3. sort</h4>
            <p>Used to sort the file in order</p>
            <p>Syntax : <code>sort filename</code></p>
        </li>
         <li>
            <h4 className="font-bold">4. uniq</h4>
            <p>Displays unique lines of a sorted file</p>
            <p>Syntax : <code>uniq filename</code></p>
        </li>
         <li>
            <h4 className="font-bold">5. diff</h4>
            <p>Used to differentiate two files</p>
            <p>Syntax : <code>diff f1 f2</code></p>
        </li>
    </ul>
  )
};

export default function Experiment2() {
  const { user, loading: authLoading } = useAuth();
  const [vfs, setVfs] = useState<VirtualFileSystem>(new VirtualFileSystem(createInitialFileSystem()));
  const [loading, setLoading] = useState(true);
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'command' | 'output'; content: string }>>([]);
  const vfsRef = useRef(vfs);
  const [activeSection, setActiveSection] = useState('2a');

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
    <div className="flex flex-col md:flex-row gap-6 pt-4">
        <nav className="md:w-1/4 lg:w-1/5">
            <Card>
                <CardHeader>
                    <CardTitle>Experiment 2</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className='space-y-2'>
                        {Object.entries(experimentSections).map(([key, title]) => (
                            <li key={key}>
                                <Button
                                variant={activeSection === key ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setActiveSection(key)}
                                >
                                {title}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </nav>
        <main className="flex-grow flex flex-col gap-4 md:w-3/4 lg:w-4/5">
            <Card>
                <CardHeader>
                    <CardTitle>{experimentSections[activeSection as keyof typeof experimentSections]}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-48">
                         {experimentContent[activeSection as keyof typeof experimentContent]}
                    </ScrollArea>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Terminal</CardTitle>
                </CardHeader>
                 <CardContent>
                    {loading ? (
                        <Skeleton className="w-full h-[400px] rounded-lg" />
                    ) : (
                        <Terminal
                        onCommand={handleCommand}
                        history={terminalHistory}
                        cwd={vfs.cwd}
                        />
                    )}
                 </CardContent>
            </Card>

            <CommandHints onRunHint={handleRunHint} />
        </main>
    </div>
  );
}
