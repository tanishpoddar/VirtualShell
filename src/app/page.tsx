'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import SrmLogo from '@/components/srm-logo';
import AuthButton from '@/components/auth-button';
import { ArrowRight, Terminal, Cpu, Code2, Zap, Shield, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

const experiments = [
  { id: 1, title: 'Experiment 1', description: 'Shell Programming', href: '/exp1', color: 'from-blue-500 to-cyan-500' },
  { id: 2, title: 'Experiment 2', description: 'Basic Linux Commands & Filters', href: '/exp2', color: 'from-purple-500 to-pink-500' },
  { id: 3, title: 'Experiment 3', description: 'Shell Programs', href: '/exp3', color: 'from-green-500 to-emerald-500' },
  { id: 4, title: 'Experiment 4', description: 'Process Creation', href: '/exp4', color: 'from-orange-500 to-red-500' },
  { id: 5, title: 'Experiment 5', description: 'Multi-Threading', href: '/exp5', color: 'from-indigo-500 to-blue-500' },
  { id: 6, title: 'Experiment 6', description: 'Mutual Exclusion', href: '/exp6', color: 'from-pink-500 to-rose-500' },
  { id: 7, title: 'Experiment 7', description: 'Dining Philosophers Problem', href: '/exp7', color: 'from-teal-500 to-cyan-500' },
  { id: 8, title: 'Experiment 8', description: 'CPU Scheduling', href: '/exp8', color: 'from-amber-500 to-orange-500' },
  { id: 9, title: 'Experiment 9', description: 'Priority & Round Robin Scheduling', href: '/exp9', color: 'from-violet-500 to-purple-500' },
  { id: 10, title: 'Experiment 10', description: 'Banker\'s Algorithm', href: '/exp10', color: 'from-lime-500 to-green-500' },
  { id: 11, title: 'Experiment 11', description: 'Memory Allocation', href: '/exp11', color: 'from-sky-500 to-blue-500' },
  { id: 12, title: 'Experiment 12', description: 'Page Replacement Algorithms', href: '/exp12', color: 'from-fuchsia-500 to-pink-500' },
  { id: 13, title: 'Experiment 13', description: 'Disk Scheduling', href: '/exp13', color: 'from-emerald-500 to-teal-500' },
  { id: 14, title: 'Experiment 14', description: 'File Allocation', href: '/exp14', color: 'from-rose-500 to-red-500' },
  { id: 15, title: 'Experiment 15', description: 'File Organization', href: '/exp15', color: 'from-cyan-500 to-blue-500' },
];

const features = [
  { icon: Terminal, title: 'Real Linux Terminal', description: 'WebContainer-powered terminal with full Linux capabilities' },
  { icon: Cpu, title: 'Zero Setup', description: 'Start learning immediately, no installation required' },
  { icon: Code2, title: 'Interactive Learning', description: 'Hands-on experiments with instant feedback' },
  { icon: Zap, title: 'Fast & Responsive', description: 'Lightning-fast performance in your browser' },
  { icon: Shield, title: 'Secure Sandbox', description: 'Safe isolated environment for experimentation' },
  { icon: Layers, title: 'Cloud Sync', description: 'Your work saved automatically across devices' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const featureVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: 'spring',
      stiffness: 100,
    },
  }),
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-primary/20 bg-white shadow-md">
        <div className="container flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <SrmLogo className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="font-extrabold font-headline text-base sm:text-xl md:text-2xl tracking-tight gradient-text">
              OS Virtual Labs
            </span>
          </motion.div>
          <AuthButton />
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden tech-grid">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-background pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="container relative mx-auto px-4 md:px-6 py-16 md:py-24 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block mb-6"
            >
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ✨ Next-Generation OS Learning Platform
                </span>
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tighter mb-4 sm:mb-6 font-headline px-4">
              <span className="gradient-text">Master Operating Systems</span>
              <br />
              <span className="text-foreground">Through Interactive Labs</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-muted-foreground text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed px-4">
              Experience hands-on learning with a real Linux terminal powered by WebContainers. 
              No setup, no installation—just pure learning in your browser.
            </p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="#experiments">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                >
                  Start Learning
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-headline px-4">
              Why Choose <span className="gradient-text">OS Virtual Labs</span>?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              Everything you need to master operating systems concepts in one powerful platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={featureVariants}
              >
                <Card className="h-full card-hover border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
                  <CardHeader>
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 w-fit">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Experiments Section */}
        <section id="experiments" className="container mx-auto px-4 md:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-headline px-4">
              <span className="gradient-text">15 Interactive Experiments</span>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4">
              From shell programming to advanced scheduling algorithms—master every concept
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {experiments.map((exp) => (
              <motion.div key={exp.id} variants={itemVariants}>
                <Link href={exp.href} className={`group block h-full ${exp.href === '#' ? 'pointer-events-none' : ''}`}>
                  <Card className={`h-full card-hover border-2 hover:border-transparent relative overflow-hidden ${exp.href === '#' ? 'opacity-50' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${exp.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <CardHeader className="relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${exp.color} text-white`}>
                          #{exp.id}
                        </div>
                        <ArrowRight className={`h-5 w-5 text-muted-foreground transition-all duration-300 ${exp.href !== '#' ? 'group-hover:translate-x-1 group-hover:text-primary group-hover:scale-110' : ''}`} />
                      </div>
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {exp.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {exp.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 md:px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 sm:p-8 md:p-12 text-center text-white"
          >
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 font-headline">
                Ready to Start Your Journey?
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto px-4">
                Join thousands of students mastering operating systems through hands-on practice
              </p>
              <Link href="#experiments">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                >
                  Explore Experiments
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
