const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

const staticAssets = [
  './',
  'manifest.json',
  './index.css',
  './App.css'
];

self.addEventListener('install', async event => {
  const cache = await caches.open(STATIC_CACHE);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', async event => {
  const keys = await caches.keys();
  keys.forEach(key => {
    if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) caches.delete(key);
  });
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req){
  const cachedResponse = await caches.match(req);
  return cachedResponse || fetch(req);
}

async function networkFirst(req){
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (error) {
    const cachedResponse = await cache.match(req);
    return cachedResponse || new Response(JSON.stringify({ error: 'Offline' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}