
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
  sequential: 'Sequential File Allocation',
  indexed: 'Indexed File Allocation',
};

const experimentContent: Record<string, React.ReactNode> = {
  sequential: (
    <div>
      <h4 className="font-bold">A) SEQUENTIAL:</h4>
      <p className="font-bold mt-2">AIM:</p>
      <p>To write a C program for implementing sequential file allocation method</p>
      <p className="font-bold mt-2">DESCRIPTION:</p>
      <p>The most common form of file structure is the sequential file in this type of file, a fixed format is used for records. All records (of the system) have the same length, consisting of the same number of fixed length fields in a particular order because the length and position of each field are known, only the values of fields need to be stored, the field name and length for each field are attributes of the file structure.</p>
      <p className="font-bold mt-2">ALGORITHM:</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Start the program.</li>
        <li>Get the number of files.</li>
        <li>Get the memory requirement of each file.</li>
        <li>Allocate the required locations to each in sequential order a). Randomly select a location from available location s1= random(100);
            <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`if(b[s1].flag==0)
{
  for(j=s1;j<s1+p[i];j++)
  {
    if((b[j].flag)==0)count++;
  }
  if(count==p[i]) break;
}`}</code></pre>
        </li>
        <li>Allocate and set flag=1 to the allocated locations.
            <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`for(s=s1;s<(s1+p[i]);s++)
{
  k[i][j]=s; j=j+1;
  b[s].bno=s;
  b[s].flag=1;
}`}</code></pre>
        </li>
        <li>Print the results file no, length, Blocks allocated.</li>
        <li>Stop the program</li>
      </ol>
    </div>
  ),
  indexed: (
    <div>
      <h4 className="font-bold">B) INDEXED:</h4>
      <p className="font-bold mt-2">AIM:</p>
      <p>To implement allocation method using chained method</p>
      <p className="font-bold mt-2">DESCRIPTION:</p>
      <p>In the chained method file allocation table contains a field which points to starting block of memory. From it for each bloc a pointer is kept to next successive block. Hence, there is no external fragmentation.</p>
      <p className="font-bold mt-2">ALGORITHM:</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Start the program.</li>
        <li>Get the number of files.</li>
        <li>Get the memory requirement of each file.</li>
        <li>Allocate the required locations by selecting a location randomly q= random(100);
            <ul className="list-alpha list-inside ml-4">
              <li>Check whether the selected location is free .</li>
              <li>If the location is free allocate and set flag=1 to the allocated locations.
                <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`q=random(100);
if(b[q].flag==0)
{
  b[q].flag=1;
  b[q].fno=j;
  r[i][j]=q;
}`}</code></pre>
              </li>
            </ul>
        </li>
        <li>Print the results file no, length ,Blocks allocated.</li>
        <li>Stop the program</li>
      </ol>
    </div>
  ),
};

export default function Experiment14Page() {
  const [activeSection, setActiveSection] = useState('sequential');
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
                <p className="text-sm text-muted-foreground">Experiment 14: File Allocation</p>
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
