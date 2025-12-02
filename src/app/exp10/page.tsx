
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
  dataStructures: 'Data Structures',
  safetyAlgorithm: 'Safety Algorithm',
  resourceRequest: 'Resource Request Algorithm',
  algorithm: 'Banker\'s Algorithm',
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To Simulate bankers algorithm for Dead Lock Avoidance (Banker‘s Algorithm)</p>
    </div>
  ),
  description: (
    <div>
      <p>Deadlock is a condition in which two or more processes are waiting indefinitely for resources held by each other, and as a result, none of them can proceed.</p>
      <ul className="list-disc list-inside space-y-1 mt-2">
        <li>When a new process enters the system, it must declare the maximum number of instances of each resource type that it may need during execution. This maximum demand may even exceed the total number of available resources in the system.</li>
        <li>When a process requests a set of resources, the system checks whether granting the request will leave the system in a safe state.</li>
        <li>If the system remains safe after allocation, the resources are assigned to the requesting process.</li>
        <li>Otherwise, the process must wait until sufficient resources are released by other processes to avoid the possibility of deadlock.</li>
      </ul>
    </div>
  ),
  dataStructures: (
    <div>
        <h4 className="font-bold">Data structures</h4>
        <ul className="list-disc list-inside space-y-2 mt-2">
            <li><b>n</b> → Total number of processes in the system.</li>
            <li><b>m</b> → Total number of different resource types.</li>
            <li><b>Available:</b> Vector of length m. Available[j] = k → There are k instances of resource type Rj currently available for allocation.</li>
            <li><b>Max:</b> Matrix of size n × m. Max[i][j] = k → Process Pi may request at most k instances of resource type Rj during execution.</li>
            <li><b>Allocation:</b> Matrix of size n × m. Allocation[i][j] = k → Process Pi is currently allocated k instances of resource type Rj.</li>
            <li><b>Need:</b> Matrix of size n × m. Need[i][j] = k → Process Pi may still request k more instances of resource type Rj to complete its task.</li>
        </ul>
    </div>
  ),
  safetyAlgorithm: (
    <div>
        <h4 className="font-bold">Safety Algorithm</h4>
        <ol className="list-decimal list-inside space-y-2 mt-2">
            <li><b>Initialization</b>
                <ul className="list-alpha list-inside ml-4">
                    <li>Let Work be a vector of length m (number of resource types).</li>
                    <li>Let Finish be a vector of length n (number of processes).</li>
                    <li>Initially: Work = Available; For all processes i: Finish[i] = False</li>
                </ul>
            </li>
            <li><b>Find Process</b>
                <ul className="list-alpha list-inside ml-4">
                    <li>Find an index i such that:</li>
                    <li>Finish[i] == False</li>
                    <li>Need[i] ≤ Work (that is, process i’s remaining needs can be satisfied with current available resources).</li>
                    <li>If no such i exists, go to Step 4.</li>
                </ul>
            </li>
            <li><b>Resource Allocation Simulation</b>
                <ul className="list-alpha list-inside ml-4">
                    <li>Pretend that process i finishes and releases its resources.</li>
                    <li>Update: Work = Work + Allocation[i]; Finish[i] = True</li>
                    <li>Repeat Step 2.</li>
                </ul>
            </li>
            <li><b>Check Safe State</b>
                <ul className="list-alpha list-inside ml-4">
                    <li>If Finish[i] == True for all processes i, then the system is in a safe state.</li>
                    <li>Otherwise, the system is not in a safe state.</li>
                </ul>
            </li>
        </ol>
    </div>
  ),
  resourceRequest: (
    <div>
        <h4 className="font-bold">Resource request algorithm:</h4>
        <p>Let Request i be request vector for the process Pi, If request i=[j]=k, then process Pi wants k instances of resource type Rj.</p>
        <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>if Request &lt;= Need i go to step 2. Otherwise raise an error condition.</li>
            <li>if Request &lt;= Available go to step 3. Otherwise Pi must since the resources are available.</li>
            <li>Have the system pretend to have allocated the requested resources to process Pi by modifying the state as follows;<br/>
            Available=Available-Request I;<br/>
            Allocation I=Allocation +Request I;<br/>
            Need i=Need i- Request I;<br/>
            If the resulting resource allocation state is safe, the transaction is completed and process Pi is allocated its resources. However if the state is unsafe, the Pi must wait for Request I and the old resource-allocation state is restored.
            </li>
        </ol>
    </div>
  ),
  algorithm: (
    <div>
        <h4 className="font-bold">ALGORITHM:</h4>
        <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Begin the program.</li>
            <li>Input the number of resources and processes.</li>
            <li>Enter the available resources vector.</li>
            <li>After allocation, compute the Need matrix as Need = Max – Allocation.</li>
            <li>Check if resources can be allocated safely to all processes.</li>
            <li>If allocation is possible for every process, the system is in a safe state.</li>
            <li>Otherwise, the system is in an unsafe state.</li>
            <li>When a new request arrives, verify whether granting the request keeps the system in a safe state.</li>
            <li>If yes, allow the request; otherwise, deny it.</li>
            <li>End the program.</li>
        </ol>
    </div>
  ),
};

export default function Experiment10Page() {
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
                <p className="text-sm text-muted-foreground">Experiment 10: Banker's Algorithm</p>
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
