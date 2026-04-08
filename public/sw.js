const CACHE_NAME = 'gramshiksha-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/student.html',
  '/parent.html',
  '/admin.html',
  '/topic.html',
  '/css/style.css',
  '/js/topics-data.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
];

// Install: cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - API calls (/ai/ask, /progress, /admin): network-first, no cache
// - Static assets: cache-first
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and API calls (let them fail naturally for offline handling)
  if (event.request.method !== 'GET') return;
  if (url.pathname.startsWith('/ai/') ||
      url.pathname.startsWith('/progress') ||
      url.pathname.startsWith('/admin/') ||
      url.pathname.startsWith('/auth/')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
