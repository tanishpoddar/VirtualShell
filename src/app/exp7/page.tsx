
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
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To write C programs to simulate solutions to Dining Philosophers Problem.</p>
    </div>
  ),
  description: (
    <div>
      <ul className="list-disc list-inside space-y-2">
        <li>The dining – philosophers problem is considered a classic synchronization problem because it is an example of a large class of concurrency – control problems. It is a simple representation of the need to allocate several resources among several processes in a deadlock-free and starvation- free manner.</li>
        <li>Consider five philosophers who spend their lives thinking and eating.</li>
        <li>The philosophers share a circular table surrounded by five chairs, each belonging to one philosopher.</li>
        <li>In the center of the table is a bowl of rice, and the table is laid with five single chopsticks.</li>
        <li>When a philosopher thinks, she does not interact with her colleagues.</li>
        <li>From time to time, a philosopher gets hungry and tries to pick up the two chopsticks that are closest to her (the chopsticks that are between her and her left and right neighbours).</li>
        <li>A philosopher may pick up only one chopstick at a time. Obviously, she cannot pick up a chopstick that is already in the hand of a neighbour.</li>
        <li>When a hungry philosopher has both her chopsticks at the same time, she eats without releasing her chopsticks.</li>
        <li>When she is finished eating, she puts down both of her chopsticks and starts thinking again.</li>
        <li>The dining-philosophers problem may lead to a deadlock situation and hence some rules have to be framed to avoid the occurrence of deadlock.</li>
      </ul>
    </div>
  )
};

export default function Experiment7Page() {
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
                <p className="text-sm text-muted-foreground">Experiment 7: Dining Philosophers Problem</p>
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
