// Service worker to enable PWA features
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// Fetch listener is REQUIRED for PWA installation prompt to trigger
self.addEventListener('fetch', (event) => {
  // We can just pipe the request through, but the listener must exist
  event.respondWith(fetch(event.request));
});
