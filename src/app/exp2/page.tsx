
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import useAuth from '@/hooks/use-auth';
import { executeCommand } from '@/lib/commands';
import { VirtualFileSystem, createInitialFileSystem } from '@/lib/filesystem';
import type { VFS } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

import Terminal from '@/components/terminal';
import CommandHints from '@/components/command-hints';
import SrmLogo from '@/components/srm-logo';
import AuthButton from '@/components/auth-button';
import Link from 'next/link';
import { Home as HomeIcon, Menu } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const experimentSections = {
  aim: 'Aim',
  basics: 'Basics',
  files: 'Working with Files',
  directories: 'Working with Directories',
  substitution: 'File Name Substitution',
  redirection: 'I/O Redirection',
  piping: 'Piping',
  environment: 'Environment Variables',
  permission: 'File Permission',
  filters: 'Filters (2b)',
  admin: 'System Admin (2b)',
  terminal: 'Terminal',
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To execute basic linux commands, filters and admin commands.</p>
    </div>
  ),
  basics: (
     <div className="prose-headings:font-headline">
      <h3 className="text-xl font-bold">Exp. No.:2(a) BASIC LINUX COMMANDS</h3>
      <h4 className="font-bold">a) Basics</h4>
      <ul className="space-y-2 list-decimal list-inside">
        <li><code>echo SRM</code> ➔ to display the string SRM</li>
        <li><code>clear</code> ➔ to clear the screen</li>
        <li><code>date</code> ➔ to display the current date and time</li>
        <li><code>cal 2003</code> ➔ to display the calendar for the year 2003</li>
        <li><code>cal 6 2003</code> ➔ to display the calendar for the June-2003</li>
        <li><code>passwd</code> ➔ to change password</li>
      </ul>
    </div>
  ),
  files: (
    <div className="prose-headings:font-headline">
      <h4 className="font-bold">b) Working with Files</h4>
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
    </div>
  ),
  directories: (
    <div className="prose-headings:font-headline">
      <h4 className="font-bold">c) Working with Directories</h4>
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
    </div>
  ),
  substitution: (
    <div className="prose-headings:font-headline">
      <h4 className="font-bold">d) File name substitution</h4>
      <ul className="space-y-2 list-decimal list-inside">
          <li><code>ls f?</code> ➔ list files start with ‘f’ and followed by any one character</li>
          <li><code>ls *.c</code> ➔ list files with extension ‘c’</li>
          <li><code>ls [gpy]et</code> ➔ list files whose first letter is any one of the character g, p or y and followed by the word et</li>
          <li><code>ls [a-d,l-m]ring</code> ➔ list files whose first letter is any one of the character from a to d and l to m and followed by the word ring.</li>
      </ul>
    </div>
  ),
  redirection: (
    <div className="prose-headings:font-headline">
        <h4 className="font-bold">e) I/O Redirection</h4>
        <h5 className='font-bold'>Input redirection</h5>
        <p><code>wc –l &lt; ex1</code> ➔ To find the number of lines of the file ‘ex1’</p>
        <h5 className='font-bold mt-2'>Output redirection</h5>
        <p><code>who > f2</code> ➔ the output of ‘who’ will be redirected to file f2</p>
        <p><code>cat >> f1</code> ➔ to append more into the file f1</p>
    </div>
  ),
  piping: (
    <div className="prose-headings:font-headline">
        <h4 className="font-bold">f) Piping</h4>
        <p>Syntax : <code>Command1 | command2</code></p>
        <p>Output of the command1 is transferred to the command2 as input. Finally output of the command2 will be displayed on the monitor.</p>
        <h5 className='font-bold mt-2'>Example.</h5>
        <p><code>cat f1 | more</code> list the contents of file f1 screen by screen</p>
        <p><code>head –6 f1 |tail –2</code> prints the 5th & 6th lines of the file f1.</p>
    </div>
  ),
  environment: (
    <div className="prose-headings:font-headline">
      <h4 className="font-bold">g) Environment variables</h4>
      <ul className="space-y-2 list-decimal list-inside">
          <li><code>echo $HOME</code> ➔ display the path of the home directory</li>
          <li><code>echo $PS1</code> ➔ display the prompt string $</li>
          <li><code>echo $PS2</code> ➔ display the second prompt string ( > symbol by default )</li>
          <li><code>echo $LOGNAME</code> ➔ login name</li>
          <li><code>echo $PATH</code> ➔ list of pathname where the OS searches for an executable file</li>
      </ul>
    </div>
  ),
  permission: (
     <div className="prose-headings:font-headline">
        <h4 className="font-bold">h) File Permission</h4>
        <p><code>chmod</code> command is used to change the access permission of a file.</p>
        <h5 className='font-bold mt-2'>Method-1:</h5>
        <p>Syntax : <code>chmod ugoa+/-rwx filename</code></p>
        <p>u : user, g : group, o : others, + : Add permission - : Remove the permission r : read, w : write, x :execute, a : all permissions</p>
        <p>Example: <code>chmod ug+rw f1</code></p>
        <p>Adding ‘read & write’ permissions of file f1 to both user and group members.</p>
        <h5 className='font-bold mt-2'>Method-2</h5>
        <p>Syntax : <code>chmod octnum file1</code></p>
        <p>The 3 digit octal number represents as follows: First digit -- file permissions for the user, Second digit -- file permissions for the group, Third digit -- file permissions for others</p>
        <p>Each digit is specified as the sum of following: 4 – read permission, 2 – write permission, 1 – execute permission</p>
        <p>Example: <code>chmod 754 f1</code></p>
        <p>It changes the file permission for the file as follows: read, write & execute permissions for the user ie; 4+2+1 = 7, read, & execute permissions for the group members ie; 4+0+1 = 5, only read permission for others ie; 4+0+0 = 4</p>
     </div>
  ),
  filters: (
    <div className="prose-headings:font-headline">
        <h3 className="text-xl font-bold">Exp. No.:2(b) FILTERS and ADMIN COMMANDS</h3>
        <h4 className="font-bold">A. FILTERS</h4>
        <ul className="space-y-4">
            <li>
                <h5 className="font-bold">1. cut</h5>
                <p>Used to cut characters or fileds from a file/input</p>
                <p>Syntax :</p>
                <p><code>cut -cchars filename</code></p>
                <p><code>-ffieldnos filename</code></p>
                 <p>Example:<br/>
                <code>cut –c 5 file.txt</code><br/>
                <code>cut –c 5-10 file.txt</code><br/>
                <code>cut –c 5,7,9 file.txt</code><br/>
                By default, tab is the filed separator(delimiter). If the fileds of the files are separated by any other character, we need to specify explicitly by –d option<br/>
                <code>cut -ddelimitchar -ffileds filename</code></p>
            </li>
            <li>
                <h5 className="font-bold">2. grep</h5>
                <p>Used to search one or more files for a particular pattern.</p>
                <p>Syntax : <code>grep pattern filename(s)</code></p>
                <p>Lines that contain the pattern in the file(s) get displayed. Pattern can be any regular expressions. More than one files can be searched for a pattern</p>
                <p><code>-v</code> option displays the lines that do not contain the pattern</p>
                <p><code>-l</code> list only name of the files that contain the pattern</p>
                <p><code>-n</code> displays also the line number along with the lines that matches the pattern</p>
            </li>
            <li>
                <h5 className="font-bold">3. sort</h5>
                <p>Used to sort the file in order</p>
                <p>Syntax : <code>sort filename</code></p>
                 <p>Sorts the data as text by default. Sorts by the first filed by default.</p>
                <p><code>-r</code> option sorts the file in descending order</p>
                <p><code>-u</code> eliminates duplicate lines</p>
                <p><code>-o filename</code> writes sorted data into the file fname</p>
                <p><code>-tdchar</code> sorts the file in which fileds are separated by dchar</p>
                <p><code>-n</code> sorts the data as number</p>
                <p><code>+1n</code> skip first filed and sort the file by second filed numerically</p>
            </li>
            <li>
                <h5 className="font-bold">4. uniq</h5>
                <p>Displays unique lines of a sorted file</p>
                <p>Syntax : <code>uniq filename</code></p>
                <p><code>-d</code> option displays only the duplicate lines</p>
                <p><code>-c</code> displays unique lines with no. of occurrences.</p>
            </li>
            <li>
                <h5 className="font-bold">5. diff</h5>
                <p>Used to differentiate two files</p>
                <p>Syntax : <code>diff f1 f2</code></p>
                <p>compare two files f1 & f2 and prints all the lines that are differed between f1 & f2.</p>
            </li>
        </ul>
    </div>
  ),
  admin: (
    <div className="prose-headings:font-headline">
        <h4 className="font-bold text-lg mt-4 mb-2">B. SYSTEM ADMIN COMMANDS</h4>
        <h5 className="font-bold">INSTALLING SOFTWARE</h5>
         <ul className="space-y-2 list-decimal list-inside">
            <li>Update the package repositories: <code>sudo apt-get update</code></li>
            <li>Update installed software: <code>sudo apt-get upgrade</code></li>
            <li>Install a package/software: <code>sudo apt-get install &lt;package-name&gt;</code></li>
            <li>Remove a package from the system: <code>sudo apt-get remove &lt;package-name&gt;</code></li>
            <li>Reinstall a package: <code>sudo apt-get install &lt;package-name&gt; --reinstall</code></li>
        </ul>

        <h5 className="font-bold mt-6 mb-2">MANAGING USERS</h5>
        <ul className="list-disc list-inside space-y-2">
            <li>Managing users is a critical aspect of server management.</li>
            <li>In Ubuntu, the root user is disabled for safety.</li>
            <li>Root access can be completed by using the sudo command by a user who is in the “admin” group.</li>
            <li>When you create a user during installation, that user is added automatically to the admin group.</li>
        </ul>
         <ul className="space-y-2 list-decimal list-inside mt-4">
            <li>Add a user: <code>sudo adduser username</code></li>
            <li>Disable a user: <code>sudo passwd -l username</code></li>
            <li>Enable a user: <code>sudo passwd -u username</code></li>
            <li>Delete a user: <code>sudo userdel –r username</code></li>
            <li>Create a group: <code>sudo addgroup groupname</code></li>
            <li>Delete a group: <code>sudo delgroup groupname</code></li>
            <li>Create a user with group: <code>sudo adduser username groupname</code></li>
            <li>See the password expiry value for a user: <code>sudo chage -l username</code></li>
            <li>Make changes: <code>sudo chage username</code></li>
            <li>GUI Tool for user management: If you do not want to run the commands in terminal to manage users and groups, then you can install a GUI add-on .<br/><code>sudo apt install gnome-system-tools</code><br/>Once done, type<br/><code>users-admin</code></li>
        </ul>
        <p className='mt-4'>Note: These are simulated commands. In a real system, they would require administrative privileges.</p>
    </div>
  ),
};

export default function Experiment2Page() {
  const { user, loading: authLoading } = useAuth();
  const [vfs, setVfs] = useState<VirtualFileSystem>(new VirtualFileSystem(createInitialFileSystem()));
  const [loading, setLoading] = useState(true);
  const [terminalHistory, setTerminalHistory] = useState<Array<{ type: 'command' | 'output'; content: string }>>([]);
  const vfsRef = useRef(vfs);
  const [activeSection, setActiveSection] = useState('aim');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleRunHint = (command: string) => {
    setActiveSection('terminal');
    setTimeout(() => handleCommand(command), 50);
  }

  const renderNavLinks = (isSheet = false) => (
    <ul className='space-y-1'>
      {Object.entries(experimentSections).map(([key, title]) => (
        <li key={key}>
           <Button
              variant={activeSection === key ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left h-auto py-2 px-3 transition-colors duration-200"
              onClick={() => {
                setActiveSection(key)
                if (isSheet) setIsMenuOpen(false);
              }}
            >
            {title}
            </Button>
        </li>
      ))}
    </ul>
  );


  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
          <div className="flex items-center gap-4">
             <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <HomeIcon className="h-5 w-5" />
             </Link>
            <div className="h-6 w-px bg-border" />
            <SrmLogo className="h-8 w-8" />
            <div className='hidden md:block'>
                <h1 className="font-extrabold font-headline text-xl tracking-tight">OS Virtual Labs</h1>
                <p className="text-sm text-muted-foreground">Experiment 2: Basic Commands & Filters</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AuthButton />
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <div className='p-4'>
                      <h2 className="text-lg font-semibold mb-4">Experiment Sections</h2>
                      {renderNavLinks(true)}
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 container mx-auto p-4 md:p-6">
          <nav className="hidden md:block md:col-span-1 lg:col-span-1">
              <Card className="sticky top-20 animate-fade-in-left">
                  <CardHeader>
                      <CardTitle className="text-lg">Experiment Sections</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    {renderNavLinks()}
                  </CardContent>
              </Card>
          </nav>
          <main className="md:col-span-3 lg:col-span-4 flex flex-col gap-6">
             <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="flex flex-col gap-6"
                >
                    {activeSection !== 'terminal' ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-headline">{experimentSections[activeSection as keyof typeof experimentSections]}</CardTitle>
                            </CardHeader>
                            <CardContent className="prose prose-blue max-w-none dark:prose-invert">
                                {experimentContent[activeSection as keyof typeof experimentContent]}
                            </CardContent>
                        </Card>
                    ) : (
                      <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Terminal</CardTitle>
                                <CardDescription>Execute commands here. Your file system is saved automatically when logged in.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                {loading ? (
                                    <Skeleton className="w-full h-[400px] md:h-[600px] rounded-lg" />
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
                      </>
                    )}
                </motion.div>
            </AnimatePresence>
          </main>
      </div>
    </div>
  );
}
