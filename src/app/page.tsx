'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SrmLogo from '@/components/srm-logo';
import { ArrowRight } from 'lucide-react';

const experiments = [
  { id: 1, title: 'Experiment 1', description: 'Shell Programming', href: '#' },
  { id: 2, title: 'Experiment 2', description: 'Basic Linux Commands & Filters', href: '/exp2' },
  { id: 3, title: 'Experiment 3', description: 'CPU Scheduling Algorithms', href: '#' },
  { id: 4, title: 'Experiment 4', description: 'Deadlock Avoidance', href: '#' },
  { id: 5, title: 'Experiment 5', description: 'Deadlock Detection', href: '#' },
  { id: 6, title: 'Experiment 6', description: 'Page Replacement Algorithms', href: '#' },
  { id: 7, title: 'Experiment 7', description: 'Memory Allocation', href: '#' },
  { id: 8, title: 'Experiment 8', description: 'Disk Scheduling', href: '#' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          <div className="mr-4 flex items-center">
            <SrmLogo className="h-8 w-8 mr-3" />
            <span className="font-extrabold font-headline text-2xl tracking-tight">
              OS Virtual Labs
            </span>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 md:px-6 py-12 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4">
            Welcome to the Operating Systems Virtual Lab
          </h1>
          <p className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl">
            An interactive, web-based platform to learn and master fundamental OS concepts through hands-on experimentation. No setup required.
          </p>
        </section>

        <section className="container mx-auto px-4 md:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {experiments.map((exp) => (
              <Link href={exp.href} key={exp.id} className={`group ${exp.href === '#' ? 'pointer-events-none' : ''}`}>
                <Card className={`h-full transition-all duration-300 ease-in-out ${exp.href !== '#' ? 'hover:shadow-lg hover:-translate-y-1 hover:border-primary' : 'opacity-50'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{exp.title}</span>
                      <ArrowRight className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${exp.href !== '#' ? 'group-hover:translate-x-1 group-hover:text-primary' : ''}`} />
                    </CardTitle>
                    <CardDescription>{exp.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
