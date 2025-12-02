
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
  priority: 'Priority Scheduling',
  roundRobin: 'Round Robin Scheduling',
};

const experimentContent: Record<string, React.ReactNode> = {
  priority: (
    <div>
        <h4 className="font-bold">1. PRIORITY SCHEDULING ALGORITHM:</h4>
        <p className="font-bold mt-2">AIM:</p>
        <p>To write a c program to simulate the CPU scheduling priority algorithm.</p>
        <p className="font-bold mt-2">DESCRIPTION:</p>
        <p>To calculate the average waiting time in the priority algorithm, sort the burst times according to their priorities and then calculate the average waiting time of the processes. The waiting time of each process is obtained by summing up the burst times of all the previous processes.</p>
        <p className="font-bold mt-2">ALGORITHM:</p>
        <ol className="list-decimal list-inside space-y-1">
            <li>Start the process</li>
            <li>Accept the number of processes in the ready Queue</li>
            <li>For each process in the ready Q, assign the process id and accept the CPU burst time</li>
            <li>Sort the ready queue according to the priority number.</li>
            <li>Set the waiting of the first process as ‗0‘ and its burst time as its turnaround time</li>
            <li>Arrange the processes based on process priority</li>
            <li>For each process in the Ready Q calculate Waiting time(n)= waiting time (n-1) + Burst time (n-1)</li>
            <li>For each process in the Ready Q calculate Turnaround time (n)= waiting time(n)+Burst time(n)</li>
            <li>Calculate Average waiting time = Total waiting Time / Number of process and Average Turnaround time = Total Turnaround Time / Number of process. Print the results in an order.</li>
            <li>Stop</li>
        </ol>
    </div>
  ),
  roundRobin: (
     <div>
        <h4 className="font-bold">2. ROUND ROBIN SCHEDULING ALGORITHM</h4>
        <p className="font-bold mt-2">AIM:</p>
        <p>To simulate the CPU scheduling algorithm round-robin.</p>
        <p className="font-bold mt-2">DESCRIPTION:</p>
        <p>The aim is to calculate the average waiting time. There will be a time slice, each process should be executed within that time-slice and if not, it will go to the waiting state so first check whether the burst time is less than the time-slice. If it is less than it assign the waiting time to the sum of the total times. If it is greater than the burst-time then subtract the time slot from the actual burst time and increment it by time-slot and the loop continues until all the processes are completed.</p>
        <p className="font-bold mt-2">ALGORITHM:</p>
        <ol className="list-decimal list-inside space-y-1">
            <li>Start the process</li>
            <li>Accept the number of processes in the ready Queue and time quantum (or) time slice</li>
            <li>For each process in the ready Q, assign the process id and accept the CPU burst time</li>
            <li>Calculate the no. of time slices for each process where No. of time slice for process (n) = burst time process (n)/time slice</li>
            <li>If the burst time is less than the time slice then the no. of time slices =1.</li>
            <li>Consider the ready queue is a circular Q, calculate Waiting time for process (n) = waiting time of process(n-1)+ burst time of process(n-1 ) + the time difference in getting the CPU from process(n-1) and Turnaround time for process(n) = waiting time of process(n) + burst time of process(n)+ the time difference in getting CPU from process(n).</li>
            <li>Calculate Average waiting time = Total waiting Time / Number of process and Average Turnaround time = Total Turnaround Time / Number of process</li>
            <li>Stop the process</li>
        </ol>
    </div>
  ),
};

export default function Experiment9Page() {
  const [activeSection, setActiveSection] = useState('priority');
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
                <p className="text-sm text-muted-foreground">Experiment 9: Priority & Round Robin Scheduling</p>
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
