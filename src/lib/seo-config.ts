/**
 * SEO Configuration for SRMIST OS Virtual Shell
 */

export const siteConfig = {
  name: 'SRMIST OS Virtual Shell',
  title: 'SRMIST OS Virtual Shell - Operating Systems Virtual Laboratory',
  description: 'Interactive Operating Systems Virtual Laboratory with real Linux terminal powered by WebContainers. Learn OS concepts through 15 hands-on experiments.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/srmist',
  },
  keywords: [
    'Operating Systems',
    'Virtual Lab',
    'Linux Terminal',
    'WebContainers',
    'OS Education',
    'SRMIST',
    'SRM Institute',
    'Computer Science',
    'Shell Programming',
    'Process Management',
    'CPU Scheduling',
    'Memory Management',
  ],
};

export const experiments = [
  {
    id: 1,
    title: 'Shell Programming',
    description: 'Learn basic shell programming concepts and commands',
    keywords: ['shell', 'bash', 'scripting', 'linux commands'],
  },
  {
    id: 2,
    title: 'Basic Linux Commands & Filters',
    description: 'Master essential Linux commands and text processing filters',
    keywords: ['linux', 'commands', 'grep', 'sed', 'awk', 'filters'],
  },
  {
    id: 3,
    title: 'Shell Programs',
    description: 'Write advanced shell programs with loops and conditionals',
    keywords: ['shell scripting', 'loops', 'conditionals', 'functions'],
  },
  {
    id: 4,
    title: 'Process Creation',
    description: 'Understand process creation and management in operating systems',
    keywords: ['process', 'fork', 'exec', 'process management'],
  },
  {
    id: 5,
    title: 'Multi-Threading',
    description: 'Learn multi-threading concepts and implementation',
    keywords: ['threads', 'multithreading', 'concurrency', 'parallel processing'],
  },
  {
    id: 6,
    title: 'Mutual Exclusion',
    description: 'Implement mutual exclusion and synchronization mechanisms',
    keywords: ['mutex', 'semaphore', 'synchronization', 'critical section'],
  },
  {
    id: 7,
    title: 'Dining Philosophers Problem',
    description: 'Solve the classic dining philosophers synchronization problem',
    keywords: ['dining philosophers', 'deadlock', 'synchronization', 'concurrency'],
  },
  {
    id: 8,
    title: 'CPU Scheduling',
    description: 'Implement and analyze various CPU scheduling algorithms',
    keywords: ['CPU scheduling', 'FCFS', 'SJF', 'scheduling algorithms'],
  },
  {
    id: 9,
    title: 'Priority & Round Robin Scheduling',
    description: 'Learn priority-based and round-robin scheduling techniques',
    keywords: ['priority scheduling', 'round robin', 'time quantum', 'preemptive'],
  },
  {
    id: 10,
    title: "Banker's Algorithm",
    description: 'Implement deadlock avoidance using Banker\'s algorithm',
    keywords: ['bankers algorithm', 'deadlock avoidance', 'resource allocation'],
  },
  {
    id: 11,
    title: 'Memory Allocation',
    description: 'Understand memory allocation strategies and techniques',
    keywords: ['memory allocation', 'first fit', 'best fit', 'worst fit'],
  },
  {
    id: 12,
    title: 'Page Replacement Algorithms',
    description: 'Implement page replacement algorithms for virtual memory',
    keywords: ['page replacement', 'FIFO', 'LRU', 'optimal', 'virtual memory'],
  },
  {
    id: 13,
    title: 'Disk Scheduling',
    description: 'Learn disk scheduling algorithms and optimization',
    keywords: ['disk scheduling', 'FCFS', 'SSTF', 'SCAN', 'C-SCAN'],
  },
  {
    id: 14,
    title: 'File Allocation',
    description: 'Understand file allocation methods in file systems',
    keywords: ['file allocation', 'contiguous', 'linked', 'indexed'],
  },
  {
    id: 15,
    title: 'File Organization',
    description: 'Learn file organization techniques and structures',
    keywords: ['file organization', 'sequential', 'indexed', 'directory structure'],
  },
];

export function getExperimentMetadata(expId: number) {
  const exp = experiments.find(e => e.id === expId);
  if (!exp) return null;

  return {
    title: `${exp.title} - Experiment ${expId}`,
    description: exp.description,
    keywords: exp.keywords,
    openGraph: {
      title: `${exp.title} | SRMIST OS Virtual Shell`,
      description: exp.description,
    },
  };
}
