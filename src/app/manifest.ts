import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SRMIST OS Virtual Shell - Operating Systems Virtual Lab',
    short_name: 'OS Virtual Shell',
    description: 'Interactive Operating Systems Virtual Laboratory with real Linux terminal powered by WebContainers. Learn OS concepts through hands-on experiments.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['education', 'productivity', 'utilities'],
    lang: 'en-US',
    dir: 'ltr',
  };
}
