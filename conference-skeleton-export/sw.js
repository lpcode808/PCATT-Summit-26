// Conference Guide Service Worker — offline support for event day
// Strategy: stale-while-revalidate (fast cache response + background update)
//
// CACHE BUSTING: When you change index.html, favicon.svg, or any other cached
// file, bump the version below (e.g. v1 -> v2).
// This forces browsers to
// re-download everything on next visit. Without the bump, returning users
// may see stale content until the background revalidate completes.

const CACHE_NAME = 'pcatt-summit-2026-guide-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './favicon.svg'
];

// Pre-cache app shell on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Clean up old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Stale-while-revalidate: respond from cache immediately,
// fetch fresh copy in background and update cache for next load
self.addEventListener('fetch', event => {
  const { request } = event;

  // Only handle same-origin GET requests (skip Google Fonts CDN, etc.)
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(cached => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => cached); // network failure: fall back to cache

        // Return cache immediately if available, otherwise wait for network
        return cached || fetchPromise;
      })
    )
  );
});
