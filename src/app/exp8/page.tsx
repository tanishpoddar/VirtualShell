
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
  fcfs: 'FCFS Algorithm',
  sjf: 'SJF (Placeholder)',
  priority: 'Priority (Placeholder)',
  roundRobin: 'Round Robin (Placeholder)',
  terminal: 'Terminal',
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To demonstrate the FCFS and SJF CPU scheduling algorithms</p>
    </div>
  ),
  fcfs: (
    <div>
        <h4 className="font-bold">1. FCFS Scheduling Algorithm</h4>
        <p>Given n processes with their burst times, the task is to find average waiting time and average turn around time using FCFS scheduling algorithm. First in, first out (FIFO), also known as first come, first served (FCFS), is the simplest scheduling algorithm. FIFO simply queues processes in the order that they arrive in the ready queue. In this, the process that comes first will be executed first and next process starts only after the previous gets fully executed.</p>
        <p className='mt-2'>Here we are considering that arrival time for all processes is 0.</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
            <li><b>Turn Around Time:</b> Time Difference between completion time and arrival time.<br/><code>Turn Around Time = Completion Time – Arrival Time</code></li>
            <li><b>Waiting Time(W.T):</b> Time Difference between turn around time and burst time.<br/><code>Waiting Time = Turn Around Time – Burst Time</code></li>
        </ul>
        <h5 className="font-bold mt-4">Algorithm:</h5>
        <ol className="list-decimal list-inside space-y-1">
            <li>Input the processes along with their burst time (bt).</li>
            <li>Find waiting time (wt) for all processes.</li>
            <li>As first process that comes need not to wait so waiting time for process 1 will be 0 i.e. wt[0] = 0.</li>
            <li>Find waiting time for all other processes i.e. for process i -&gt; <code>wt[i] = bt[i-1] + wt[i-1]</code></li>
            <li>Find turnaround time = <code>waiting_time + burst_time</code> for all processes.</li>
            <li>Find average waiting time = <code>total_waiting_time / no_of_processes</code></li>
            <li>Similarly, find average turnaround time = <code>total_turn_around_time / no_of_processes</code>.</li>
        </ol>
        <p className="mt-2"><b>Input :</b> Processes Numbers and their burst times</p>
        <p><b>Output :</b> Process-wise burst-time, waiting-time and turnaround-time. Also display Average-waiting time and Average-turnaround-time</p>
    </div>
  ),
  sjf: (
    <div>
        <h4 className="font-bold">Shortest Job First (SJF)</h4>
        <p>Content for SJF will be added soon.</p>
    </div>
  ),
  priority: (
     <div>
        <h4 className="font-bold">Priority Scheduling</h4>
        <p>Content for Priority Scheduling will be added soon.</p>
    </div>
  ),
  roundRobin: (
     <div>
        <h4 className="font-bold">Round Robin Scheduling</h4>
        <p>Content for Round Robin Scheduling will be added soon.</p>
    </div>
  ),
};

export default function Experiment8Page() {
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
                <p className="text-sm text-muted-foreground">Experiment 8: CPU Scheduling</p>
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
