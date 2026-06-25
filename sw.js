const CACHE_NAME = 'casirpro-cache-v4';
const STATIC_ASSETS = [
  './',
  './pos.html',
  './owner.html',
  './store.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/offline.js',
  './js/payment.js',
  './js/printer.js',
  './js/whatsapp.js',
  './js/promo.js',
  './js/staff.js',
  './js/reports.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Pre-caching failed:', err);
      });
    }).then(() => {
      self.skipWaiting();
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'INSTALLED' });
        });
      });
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (!url.origin.startsWith(self.location.origin)) return;

  // API calls: network-first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirstWithCache(request));
    return;
  }

  // Static assets: cache-first
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Return cached index as fallback for navigation
        if (request.mode === 'navigate') {
          return caches.match('./pos.html');
        }
      });
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function networkFirstWithCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const clone = response.clone();
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, clone);
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, message: 'Anda sedang offline. Data akan tersimpan dan tersinkronisasi saat koneksi kembali.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}