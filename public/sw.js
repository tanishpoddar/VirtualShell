// Service Worker for caching WebContainer assets
const CACHE_NAME = 'srm-os-labs-v1';
const WEBCONTAINER_CACHE = 'webcontainer-assets-v1';

const STATIC_ASSETS = [
  '/',
  '/exp2',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== WEBCONTAINER_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache WebContainer assets aggressively
  if (url.pathname.includes('webcontainer') || url.pathname.includes('wasm')) {
    event.respondWith(
      caches.open(WEBCONTAINER_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(request).then((networkResponse) => {
            // Cache successful responses
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Network first for API calls
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});
