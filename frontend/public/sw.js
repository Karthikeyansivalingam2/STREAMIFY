const CACHE_NAME = 'streamify-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Navigation request (HTML) - Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets/Images - Cache First with Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(fetchResponse => {
            // Don't cache API calls
            if (event.request.url.includes('/api/')) return fetchResponse;
            
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            });
        });
      }).catch(() => {
          // Silent fail for non-essential assets
      })
  );
});

