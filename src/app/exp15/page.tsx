
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
  procedure: 'Procedure',
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
        <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
        <ol className="list-decimal list-inside space-y-1">
            <li>To study and simulate single-level directory organization.</li>
            <li>To study and simulate two-level (user-wise) directory organization.</li>
        </ol>
    </div>
  ),
  description: (
    <div>
        <ul className="list-disc list-inside space-y-2">
            <li><b>Single-Level Directory:</b> All files exist in one common directory. Simple to implement but leads to name conflicts and poor scalability as the number of files grows.</li>
            <li><b>Two-Level Directory:</b> Each user gets their own directory (UFD). A master file directory (MFD) maps user names → user directories. Reduces name conflicts (same filename allowed under different users) and improves organization.</li>
        </ul>
    </div>
  ),
  procedure: (
    <div>
        <h4 className="font-bold">Procedure:</h4>
        <ol className="list-decimal list-inside space-y-2 mt-2">
            <li>Write C programs that simulate:
                <ul className="list-disc list-inside ml-4">
                    <li>Creating, deleting, searching, and listing files (single-level).</li>
                    <li>Creating users and then creating, deleting, searching, and listing files under each user (two-level).</li>
                </ul>
            </li>
            <li>Compile and run each program.
                <p>Linux/Mac: <code>gcc single_level.c -o single_level && ./single_level</code></p>
                <p><code>gcc two_level.c -o two_level && ./two_level</code></p>
            </li>
            <li>Exercise the menu:
                <ul className="list-disc list-inside ml-4">
                    <li>Create files (and duplicate names) to observe behavior.</li>
                    <li>Delete files and confirm by listing.</li>
                    <li>Search for files that exist and that don’t exist.</li>
                    <li>In two-level, create multiple users and create the same filename under different users to see how two-level avoids conflicts.</li>
                </ul>
            </li>
            <li>Record observations and answer viva questions.</li>
        </ol>
    </div>
  ),
};

export default function Experiment15Page() {
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
                <p className="text-sm text-muted-foreground">Experiment 15: File Organization</p>
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
