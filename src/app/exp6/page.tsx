
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Home as HomeIcon, Menu } from 'lucide-react';
import SrmLogo from '@/components/srm-logo';
import AuthButton from '@/components/auth-button';
import WebContainerTerminal from '@/components/webcontainer-terminal/WebContainerTerminal';
import CommandHints from '@/components/command-hints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const experimentSections = {
  aim: 'Aim',
  description: 'Description',
  systemCalls: 'System V Semaphore Calls',
  program: 'Example Program',
  terminal: 'Terminal',
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To demonstrate Mutual Exclusion-Semaphore and Reader Writer Solution</p>
    </div>
  ),
  description: (
    <div>
      <h4 className="font-bold">Semaphore</h4>
      <p>Semaphore is used to implement process synchronization. This is to protect critical region shared among multiples processes.</p>
    </div>
  ),
  systemCalls: (
    <div>
      <h4 className="font-bold">1. System V Semaphore System Calls</h4>
      <p className="font-semibold">Step 1: Include the following header files for System V semaphore:</p>
      <pre className="bg-muted p-2 rounded-md my-2"><code>{'<sys/ipc.h>, <sys/sem.h>, <sys/types.h>'}</code></pre>
      
      <p className="font-semibold mt-4">Step 2: To create a semaphore array, define the following function</p>
      <pre className="bg-muted p-2 rounded-md my-2"><code>int semget(key_t key, int nsems, int semflg)</code></pre>
      <ul className="list-disc list-inside">
        <li><code>key</code> ➔ semaphore id</li>
        <li><code>nsems</code> ➔ no. of semaphores in the semaphore array</li>
        <li><code>semflg</code> ➔ <code>IPC_CREATE|0664</code> : to create a new semaphore</li>
        <li><code>IPC_EXCL|IPC_CREAT|0664</code> : to create new semaphore and the call fails if the semaphore already exists</li>
      </ul>

      <p className="font-semibold mt-4">Step 3: To perform operations on the semaphore sets viz., allocating resources, waiting for the resources or freeing the resources, define the following functions</p>
      <pre className="bg-muted p-2 rounded-md my-2"><code>int semop(int semid, struct sembuf *semops, size_t nsemops)</code></pre>
      <ul className="list-disc list-inside">
        <li><code>semid</code> ➔ semaphore id returned by semget()</li>
        <li><code>nsemops</code> ➔ the number of operations in that array</li>
        <li><code>semops</code> ➔ The pointer to an array of operations to be performed on the semaphore set. The structure is as follows:</li>
      </ul>
      <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`struct sembuf {
  unsigned short sem_num; /* Semaphore set num */
  short sem_op; /* Semaphore operation */
  short sem_flg; /*Operation flags, IPC_NOWAIT, SEM_UNDO */
};`}</code></pre>

      <p className="font-semibold mt-4">Step 4: To perform control operation on semaphore,</p>
      <pre className="bg-muted p-2 rounded-md my-2"><code>int semctl(int semid, int semnum, int cmd,…);</code></pre>
       <ul className="list-disc list-inside">
        <li><code>semid</code> ➔ identifier of the semaphore returned by semget()</li>
        <li><code>semnum</code> ➔ semaphore number</li>
        <li><code>cmd</code> ➔ the command to perform on the semaphore. Ex. GETVAL, SETVAL</li>
        <li><code>semun</code> ➔ value depends on the cmd. For few cases, this is not applicable.</li>
      </ul>
    </div>
  ),
  program: (
    <div>
        <h4 className="font-bold">Q1. Execute and write the output of the following program for mutual exclusion using System V semaphore</h4>
        <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`#include<sys/ipc.h>
#include<sys/sem.h>
#include<unistd.h>
#include<stdio.h>
#include<sys/wait.h>

int main()
{
  int pid,semid,val;
  struct sembuf sop;
  semid=semget((key_t)6,1,IPC_CREAT|0666);
  
  pid=fork();
  
  sop.sem_num=0;
  sop.sem_op=0;
  sop.sem_flg=0;
  
  if (pid!=0)
  {
    sleep(1);
    printf("The Parent waits for WAIT signal\\n");
    semop(semid,&sop,1);
    printf("The Parent WAKED UP & doing her job\\n");
    sleep(10);
    printf("Parent Over\\n");
    wait(NULL); // Wait for child to terminate
    semctl(semid, 0, IPC_RMID, 0); // Remove semaphore
  }
  else
  {
    printf("The Child sets WAIT signal & doing her job\\n");
    semctl(semid,0,SETVAL,1);
    sleep(10);
    printf("The Child sets WAKE signal & finished her job\\n");
    semctl(semid,0,SETVAL,0);
    printf("Child Over\\n");
  }
  return 0;
}`}</code></pre>
    </div>
  ),
};

export default function Experiment6Page() {
  const [activeSection, setActiveSection] = useState('aim');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRunHint = (command: string) => {
    setActiveSection('terminal');
  };

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
                <p className="text-sm text-muted-foreground">Experiment 6: Mutual Exclusion</p>
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
                                    <CardDescription>Real Linux terminal powered by WebContainers. Your filesystem is saved automatically when logged in.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <WebContainerTerminal />
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
