/* Service worker do Plantão Obstétrico.
   Escopo registrado em "/", mas só intercepta /plantao e os assets necessários
   para ele funcionar offline. As demais rotas (consultório) passam direto. */
const CACHE = 'plantao-v1';
const SHELL = '/plantao';
const PRECACHE = [
  '/plantao',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegação: tratamos apenas o app de plantão (network-first → cache → shell).
  if (req.mode === 'navigate') {
    if (url.pathname === '/plantao' || url.pathname.startsWith('/plantao/')) {
      event.respondWith(
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(SHELL, copy));
            return res;
          })
          .catch(() => caches.match(SHELL))
      );
    }
    return; // demais navegações: sem interceptação
  }

  // Assets estáticos necessários ao plantão: cache-first.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.webmanifest'
  ) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
            return res;
          })
      )
    );
  }
});
