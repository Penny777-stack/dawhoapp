const CACHE_NAME = 'finance-app-v1';
const ASSETS = [
  './',
  './index.html',
  './net-worth.html',
  './portfolio.html',
  './stock-ledger.html',
  './salary-income.html',
  './salary-composition.html',
  './daily-spending.html',
  './fixed-expenses.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate: answer instantly from cache (works offline),
// and refresh the cache in the background whenever the network is available.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isSameOrigin = e.request.url.startsWith(self.location.origin);

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (isSameOrigin && res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
