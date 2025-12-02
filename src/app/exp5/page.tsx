
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
  create: 'Create Thread',
  terminate: 'Terminate Thread',
  join: 'Join Thread',
  self: 'Get Thread ID',
  equal: 'Compare Threads',
  program: 'Example Program'
};

const experimentContent: Record<string, React.ReactNode> = {
  aim: (
    <div>
      <h3 className="text-xl font-bold mb-2 font-headline">Aim:</h3>
      <p>To write a C program to demonstrate various thread related concepts.</p>
    </div>
  ),
  create: (
    <div>
      <h4 className="font-bold">A. Create a new thread</h4>
      <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`int pthread_create(pthread_t * thread, const pthread_attr_t * attr, void * (*start_routine)(void *), void *arg);`}</code></pre>
      <p className="font-semibold">Parameters:</p>
      <ul className="list-disc list-inside space-y-1">
          <li><code>thread</code>: pointer to an unsigned integer value that returns the thread id of the thread created.</li>
          <li><code>attr</code>: pointer to a structure that is used to define thread attributes like detached state, scheduling policy, stack address, etc. Set to NULL for default thread attributes.</li>
          <li><code>start_routine</code>: pointer to a subroutine that is executed by the thread. The return type and parameter type of the subroutine must be of type void *. The function has a single attribute but if multiple values need to be passed to the function, a struct must be used.</li>
          <li><code>arg</code>: pointer to void that contains the arguments to the function defined in the earlier argument</li>
      </ul>
    </div>
  ),
  terminate: (
    <div>
      <h4 className="font-bold">B. Terminate a thread</h4>
      <pre className="bg-muted p-2 rounded-md my-2"><code>void pthread_exit(void *retval);</code></pre>
      <p className="font-semibold">Parameters:</p>
      <ul className="list-disc list-inside space-y-1">
          <li><code>Retval</code>: the pointer to an integer that stores the return status of the thread terminated.</li>
      </ul>
    </div>
  ),
  join: (
    <div>
      <h4 className="font-bold">C. Wait for the termination of a thread</h4>
      <pre className="bg-muted p-2 rounded-md my-2"><code>int pthread_join(pthread_t th, void **thread_return);</code></pre>
      <p className="font-semibold">Parameters:</p>
      <ul className="list-disc list-inside space-y-1">
          <li><code>th</code>: thread id of the thread for which the current thread waits.</li>
          <li><code>thread_return</code>: pointer to the location where the exit status of the thread mentioned in th is stored.</li>
      </ul>
    </div>
  ),
  self: (
    <div>
      <h4 className="font-bold">D. Get the thread id of the current thread.</h4>
      <pre className="bg-muted p-2 rounded-md my-2"><code>pthread_t pthread_self(void);</code></pre>
    </div>
  ),
  equal: (
    <div>
      <h4 className="font-bold">E. Compare Two Threads</h4>
      <p>It compares whether two threads are the same or not. If the two threads are equal, the function returns a non-zero value otherwise zero.</p>
      <pre className="bg-muted p-2 rounded-md my-2"><code>int pthread_equal(pthread_t t1, pthread_t t2);</code></pre>
      <p className="font-semibold">Parameters:</p>
      <ul className="list-disc list-inside space-y-1">
          <li><code>t1</code>: the thread id of the first thread</li>
          <li><code>t2</code>: the thread id of the second thread</li>
      </ul>
    </div>
  ),
  program: (
    <div>
      <h4 className="font-bold">Q1. Create 3 threads, first one to find the sum of odd numbers; second one to find the sum of even numbers; third one to find the sum of natural numbers; This program also displays the list of odd/even numbers.</h4>
      <p>Complete the code snippet wherever applicable in the below program highlighted in red colour font.</p>
        <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`#include /* include suitable header file */
#include<stdio.h>
#define NUM_THREADS 3

int je,jo,evensum=0,sumn=0,oddsum=0,evenarr[50],oddarr[50];

void *Even(void *threadid) {
  int i,n; je=0;
  n=(int)threadid;
  for(i=1;i<=n;i++) {
    if(i%2==0) {
      evenarr[je]=i;
      evensum=evensum+i;
      je++;
    }
  }
}

void *Odd(_________) {
  int i,n; jo=0;
  n=(int)threadid;
  for(i=0;i<=n;i++) {
    if(logic to allow only odd numbers) {
      //Calculate sum of odd numbers only
    }
  }
}

void *SumN(_________) {
  int i,n;
  n=(int)threadid;
  for(i=1;i<=n;i++) {
    //Calculate sum of natural numbers only
  }
}

int main() {
  pthread_t threads[NUM_THREADS];
  int i,t;
  printf("Enter a number\\n");
  scanf("%d",&t);
  pthread_create(&threads[0], NULL, Even, (void *)t);
  //create a thread to call Odd function
  //create a thread to call SumN function
  
  for(i=0;i<NUM_THREADS;i++) {
    pthread_join(threads[i],NULL);
  }

  printf("The sum of first N natural numbers is %d\\n", /* display the sum of natural numbers */);
  printf("The sum of first N even numbers is %d\\n", /* display the sum of even numbers */);
  printf("The sum of first N odd numbers is %d\\n",oddsum);
  printf("The first N Even numbers are----\\n");
  //Print all the Even numbers
  printf("The first N Odd numbers are ----\\n");
  //Print all the ODD numbers
  pthread_exit(NULL);
}`}</code></pre>
        <h4 className="font-bold mt-4">Answer:</h4>
        <pre className="bg-muted p-2 rounded-md my-2 text-sm"><code>{`#include <pthread.h>
#include <stdio.h>
#define NUM_THREADS 3

int je, jo, evensum = 0, sumn = 0, oddsum = 0, evenarr[50], oddarr[50];

void *Even(void *threadid) {
  int i, n;
  je = 0;
  n = (int)threadid;
  for (i = 1; i <= n; i++) {
    if (i % 2 == 0) {
      evenarr[je] = i;
      evensum = evensum + i;
      je++;
    }
  }
  pthread_exit(NULL);
}

void *Odd(void *threadid) {
  int i, n;
  jo = 0;
  n = (int)threadid;
  for (i = 1; i <= n; i++) {
    if (i % 2 != 0) {
      oddarr[jo] = i; 
      oddsum = oddsum + i;
      jo++;
    }
  }
  pthread_exit(NULL);
}

void *SumN(void *threadid) {
  int i, n;
  n = (int)threadid;
  for (i = 1; i <= n; i++) {
    sumn = sumn + i;
  }
  pthread_exit(NULL);
}

int main() {
  pthread_t threads[NUM_THREADS];
  int i, t;
  printf("Enter a number\\n");
  scanf("%d", &t);

  pthread_create(&threads[0], NULL, Even, (void *)t);
  pthread_create(&threads[1], NULL, Odd, (void *)t);
  pthread_create(&threads[2], NULL, SumN, (void *)t);
  
  for (i = 0; i < NUM_THREADS; i++) {
    pthread_join(threads[i], NULL);
  }

  printf("The sum of first N natural numbers is %d\\n", sumn);
  printf("The sum of first N even numbers is %d\\n", evensum);
  printf("The sum of first N odd numbers is %d\\n", oddsum);
  
  printf("The first N Even numbers are----\\n");
  for (i = 0; i < je; i++) printf("%d ", evenarr[i]);
  printf("\\n");

  printf("The first N Odd numbers are ----\\n");
  for (i = 0; i < jo; i++) printf("%d ", oddarr[i]);
  printf("\\n");

  pthread_exit(NULL);
}`}</code></pre>
    </div>
  )
};

export default function Experiment5Page() {
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
                <p className="text-sm text-muted-foreground">Experiment 5: Multi-Threading</p>
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
