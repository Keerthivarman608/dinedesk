// Enhanced Service Worker with Dynamic Caching
const CACHE_NAME = 'dinedesk-cache-v2';
const DYNAMIC_CACHE = 'dinedesk-dynamic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
          return caches.delete(key);
        }
      })
    ))
  );
});

self.addEventListener('fetch', event => {
  // Network first, falling back to cache strategy for API or dynamic content
  if (event.request.url.includes('/api/') || event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request.url, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache first, falling back to network for static assets
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request).then(fetchRes => {
            return caches.open(DYNAMIC_CACHE).then(cache => {
              // Don't cache if not a valid scheme (like chrome-extension://)
              if (event.request.url.startsWith('http')) {
                cache.put(event.request.url, fetchRes.clone());
              }
              return fetchRes;
            });
          });
        })
    );
  }
});
