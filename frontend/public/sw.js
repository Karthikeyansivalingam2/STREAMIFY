// Service worker disabled to prevent boilerplate caching issues
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
