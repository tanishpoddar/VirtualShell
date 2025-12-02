
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { Home as HomeIcon, Menu } from 'lucide-react';
import SrmLogo from '@/components/srm-logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const experimentSections = {
  aim: 'Aim',
  procedure: 'Procedure',
  fork: 'fork()',
  functions: 'Other Functions',
  vfork: 'vfork()',
  program: 'Example Program'
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To create a process using fork() and understand the usage of getpid(), getppid(), wait() functions.</p>
    </div>
  ),
  procedure: (
    <div>
        <h4 className="font-bold">Compilation of C Program</h4>
        <p className="font-semibold">Step 1: Open the terminal and edit your program and save with extension “.c”</p>
        <p>Example: <code>nano test.c</code></p>
        <p className="font-semibold mt-2">Step 2: Compile your program using gcc compiler</p>
        <p>Example: <code>gcc test.c</code> ➔ Output file will be “a.out”</p>
        <p>(or) <code>gcc –o test text.c</code> ➔ Output file will be “test”</p>
        <p className="font-semibold mt-2">Step 3: Correct the errors if any and run the program</p>
        <p>Example: <code>./a.out</code> (or) <code>./test</code></p>
    </div>
  ),
  fork: (
    <div>
        <h4 className="font-bold">Syntax for process creation</h4>
        <pre className="bg-muted p-2 rounded-md my-2"><code>int fork();</code></pre>
        <p>Returns 0 in child process and child process ID in parent process.</p>
    </div>
  ),
  functions: (
    <div>
        <h4 className="font-bold">Other Related Functions</h4>
        <ul className="list-disc list-inside space-y-1">
            <li><code>int getpid()</code> ➔ returns the current process ID</li>
            <li><code>int getppid()</code> ➔ returns the parent process ID</li>
            <li><code>wait()</code> ➔ makes a process wait for other process to complete</li>
        </ul>
    </div>
  ),
  vfork: (
    <div>
        <h4 className="font-bold">Virtual fork</h4>
        <ul className="list-disc list-inside space-y-1">
            <li><code>vfork()</code> is similar to fork but both processes shares the same address space.</li>
        </ul>
    </div>
  ),
  program: (
    <div>
        <h4 className="font-bold">Q1. Find the output of the following program</h4>
        <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`#include <stdio.h>
#include<unistd.h>

int main()
{
  int a=5,b=10,pid;
  printf("Before fork a=%d b=%d \\n",a,b);
  
  pid=fork();
  
  if(pid==0)
  {
    a=a+1; b=b+1;
    printf("In child a=%d b=%d \\n",a,b);
  }
  else
  {
    sleep(1);
    a=a-1; b=b-1;
    printf("In Parent a=%d b=%d \\n",a,b);
  }
  return 0;
}`}</code></pre>
    </div>
  )
};

export default function Experiment4Page() {
  const [activeSection, setActiveSection] = useState('aim');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <p className="text-sm text-muted-foreground">Experiment 4: Process Creation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">{experimentSections[activeSection as keyof typeof experimentSections]}</CardTitle>
                        </CardHeader>
                        <CardContent className="prose prose-blue max-w-none dark:prose-invert">
                            {experimentContent[activeSection as keyof typeof experimentContent]}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
          </main>
      </div>
    </div>
  );
}
