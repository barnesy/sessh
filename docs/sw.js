const CACHE_NAME = 'sessh-pwa-v14';
const PRECACHE_URLS = [
  './',
  './index.html',
  './fold-studio-dock.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.includes('/api/') || url.pathname.endsWith('/call') || url.pathname.endsWith('/status')) {
    return;
  }
  // Network-first for fold-studio-dock.js & index.html with instant offline cache fallback
  if (url.pathname.endsWith('fold-studio-dock.js') || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
