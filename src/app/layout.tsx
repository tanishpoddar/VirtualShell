import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Footer from '@/components/footer';
import { Providers } from './providers';
import { StructuredData } from '@/components/structured-data';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'),
  title: {
    default: 'SRMIST OS Virtual Shell - Operating Systems Virtual Laboratory',
    template: '%s | SRMIST OS Virtual Shell',
  },
  description: 'Interactive Operating Systems Virtual Laboratory with real Linux terminal powered by WebContainers. Learn OS concepts through 15 hands-on experiments including shell programming, process management, CPU scheduling, and memory management.',
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
    'Disk Scheduling',
    'File Systems',
    'Interactive Learning',
    'Online Lab',
    'Virtual Shell',
  ],
  authors: [{ name: 'SRMIST School of Computing' }],
  creator: 'SRMIST School of Computing',
  publisher: 'SRM Institute of Science and Technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'SRMIST OS Virtual Shell',
    title: 'SRMIST OS Virtual Shell - Operating Systems Virtual Laboratory',
    description: 'Interactive Operating Systems Virtual Laboratory with real Linux terminal. Learn OS concepts through hands-on experiments.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SRMIST OS Virtual Shell',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SRMIST OS Virtual Shell - Operating Systems Virtual Laboratory',
    description: 'Interactive Operating Systems Virtual Laboratory with real Linux terminal. Learn OS concepts through hands-on experiments.',
    images: ['/og-image.png'],
    creator: '@SRMIST',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  category: 'education',
  classification: 'Education',
  applicationName: 'SRMIST OS Virtual Shell',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <StructuredData />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800&family=Source+Code+Pro:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
            <div className='flex-grow'>
                {children}
            </div>
            <Footer />
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}
