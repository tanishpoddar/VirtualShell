
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
  description: 'Description',
  firstFit: 'First Fit Algorithm',
  bestFit: 'Best Fit Algorithm',
  worstFit: 'Worst Fit Algorithm',
  example: 'Example'
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To Write a C program to simulate the following contiguous memory allocation techniques a) Worst-fit b) Best-fit c) First-fit</p>
    </div>
  ),
  description: (
    <div>
      <p>One of the simplest methods for memory allocation is to divide memory into several fixed sized partitions. Each partition may contain exactly one process. In this multiple-partition method, when a partition is free, a process is selected from the input queue and is loaded into the free partition. When the process terminates, the partition becomes available for another process. The operating system keeps a table indicating which parts of memory are available and which are occupied. Finally, when a process arrives and needs memory, a memory section large enough for this process is provided. When it is time to load or swap a process into main memory, and if there is more than one free block of memory of sufficient size, then the operating system must decide which free block to allocate.</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
          <li><b>Best-fit</b> strategy chooses the block that is closest in size to the request.</li>
          <li><b>First-fit</b> chooses the first available block that is large enough.</li>
          <li><b>Worst-fit</b> chooses the largest available block.</li>
      </ul>
    </div>
  ),
  firstFit: (
    <div>
        <h4 className="font-bold">Algorithm for First Fit</h4>
        <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Start.</li>
            <li>Input the number of memory blocks and their sizes.</li>
            <li>Input the number of processes and their sizes.</li>
            <li>For each process, do the following:
                <ul className="list-alpha list-inside ml-4">
                    <li>Scan the memory blocks from the beginning.</li>
                    <li>Allocate the process to the first block that is large enough.</li>
                    <li>Reduce the size of that block by the size of the process.</li>
                    <li>Stop searching further for this process and move to the next process.</li>
                    <li>If no block can hold the process, mark it as “Not Allocated.”</li>
                </ul>
            </li>
            <li>Display the allocation result and the remaining sizes of each block.</li>
            <li>Stop.</li>
        </ol>
    </div>
  ),
  bestFit: (
    <div>
        <h4 className="font-bold">Algorithm for Best Fit</h4>
        <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Start.</li>
            <li>Input the number of memory blocks and their sizes.</li>
            <li>Input the number of processes and their sizes.</li>
            <li>For each process, do the following:
                <ul className="list-alpha list-inside ml-4">
                    <li>Search all the blocks and find the block that leaves the smallest leftover space after allocation, but is still large enough for the process.</li>
                    <li>Allocate the process to that block.</li>
                    <li>Reduce the size of that block by the size of the process.</li>
                    <li>If no suitable block is found, mark the process as “Not Allocated.”</li>
                </ul>
            </li>
            <li>Display the allocation result and the remaining sizes of each block.</li>
            <li>Stop.</li>
        </ol>
    </div>
  ),
  worstFit: (
    <div>
        <h4 className="font-bold">Algorithm for Worst Fit</h4>
        <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Start.</li>
            <li>Input the number of memory blocks and their sizes.</li>
            <li>Input the number of processes and their sizes.</li>
            <li>For each process, do the following:
                <ul className="list-alpha list-inside ml-4">
                    <li>Search all the blocks and find the block that is the largest available among those big enough for the process.</li>
                    <li>Allocate the process to that block.</li>
                    <li>Reduce the size of that block by the size of the process.</li>
                    <li>If no suitable block is found, mark the process as “Not Allocated.”</li>
                </ul>
            </li>
            <li>Display the allocation result and the remaining sizes of each block.</li>
            <li>Stop.</li>
        </ol>
    </div>
  ),
  example: (
    <div>
      <h4 className="font-bold">Example:</h4>
      <p>Blocks: [100, 500, 200, 300, 600]</p>
      <p>Processes: [212, 417, 112, 426]</p>
      <h5 className="font-bold mt-4">First Fit (step-by-step)</h5>
      <ul className="list-disc list-inside">
        <li>P1=212 → B2(500) → B2=288</li>
        <li>P2=417 → B5(600) → B5=183</li>
        <li>P3=112 → B2(288) → B2=176</li>
        <li>P4=426 → no fit → Not Allocated</li>
        <li>Final blocks: B1=100, B2=176, B3=200, B4=300, B5=183</li>
      </ul>
      <h5 className="font-bold mt-4">Best Fit (step-by-step)</h5>
      <ul className="list-disc list-inside">
        <li>P1=212 → smallest adequate is B4(300) → B4=88</li>
        <li>P2=417 → smallest adequate is B2(500) → B2=83</li>
        <li>P3=112 → smallest adequate is B3(200) → B3=88</li>
        <li>P4=426 → B5(600) → B5=174</li>
        <li>Final blocks: B1=100, B2=83, B3=88, B4=88, B5=174</li>
      </ul>
      <h5 className="font-bold mt-4">Worst Fit (step-by-step)</h5>
      <ul className="list-disc list-inside">
        <li>P1=212 → largest adequate is B5(600) → B5=388</li>
        <li>P2=417 → largest adequate is B2(500) → B2=83</li>
        <li>P3=112 → largest adequate is B5(388) → B5=276</li>
        <li>P4=426 → no fit → Not Allocated</li>
        <li>Final blocks: B1=100, B2=83, B3=200, B4=300, B5=276</li>
      </ul>
    </div>
  ),
};

export default function Experiment11Page() {
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
                <p className="text-sm text-muted-foreground">Experiment 11: Memory Allocation</p>
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
