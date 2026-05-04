// GLOAR TECH — Service Worker
const CACHE_NAME = 'gloartech-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// No interceptar nada — dejar pasar todas las peticiones
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
