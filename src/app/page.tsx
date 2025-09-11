'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Experiment2 from '@/components/experiments/exp2';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="h-8 w-8 mr-2 text-primary"
            >
              <g fill="currentColor">
                <path d="M50,5A45,45,0,1,1,5,50,45,45,0,0,1,50,5m0-5a50,50,0,1,0,50,50A50,50,0,0,0,50,0h0Z" />
                <path d="M30,30h40v10h-40Z" />
                <path d="M30,45h10v35h-10Z" />
                <path d="M60,45h10v35h-10Z" />
                <path d="M45,45h10v10h-10Z" />
                <path d="M45,60h10v10h-10Z" />
              </g>
            </svg>
            <span className="font-bold hidden sm:inline-block font-serif">
              OS Virtual Labs
            </span>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Tabs defaultValue="exp2" className="w-full">
          <TabsList>
            <TabsTrigger value="exp1">Exp 1</TabsTrigger>
            <TabsTrigger value="exp2">Exp 2</TabsTrigger>
            <TabsTrigger value="exp3">Exp 3</TabsTrigger>
            <TabsTrigger value="exp4">Exp 4</TabsTrigger>
            <TabsTrigger value="exp5">Exp 5</TabsTrigger>
            <TabsTrigger value="exp6">Exp 6</TabsTrigger>
            <TabsTrigger value="exp7">Exp 7</TabsTrigger>
            <TabsTrigger value="exp8">Exp 8</TabsTrigger>
          </TabsList>
          <TabsContent value="exp1">
            <p className="p-4">Experiment 1 content will be here.</p>
          </TabsContent>
          <TabsContent value="exp2">
            <Experiment2 />
          </TabsContent>
          <TabsContent value="exp3">
            <p className="p-4">Experiment 3 content will be here.</p>
          </TabsContent>
          <TabsContent value="exp4">
            <p className="p-4">Experiment 4 content will be here.</p>
          </TabsContent>
          <TabsContent value="exp5">
            <p className="p-4">Experiment 5 content will be here.</p>
          </TabsContent>
          <TabsContent value="exp6">
            <p className="p-4">Experiment 6 content will be here.</p>
          </TabsContent>
          <TabsContent value="exp7">
            <p className="p-4">Experiment 7 content will be here.</p>
          </TabsContent>
          <TabsContent value="exp8">
            <p className="p-4">Experiment 8 content will be here.</p>
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-6 md:px-8 md:py-0 bg-background/95 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            SRM Institute of Science and Technology – School of Computing
          </p>
        </div>
      </footer>
    </div>
  );
}
