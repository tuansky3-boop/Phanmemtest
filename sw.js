/* Service worker: cache tĩnh để dùng offline */
const CACHE = 'c1-v2';
const ASSETS = ['./', 'index.html', 'css/styles.css', 'js/app.js', 'js/data/questions.js', 'js/data/signs.js', 'js/data/scenes.js', 'manifest.webmanifest', 'assets/icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
// Network-first cho file của app (luôn lấy bản mới khi online), fallback cache khi offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
