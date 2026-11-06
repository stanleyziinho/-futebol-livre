/* Stanley Sports — PWA Universal. Todos os links antigos usam a mesma instalação. */
const VERSION = 'stanley-sports-universal-20261106-1';
const ROOT = '/-futebol-livre/';
const OFFLINE = [ROOT, ROOT+'index.html', ROOT+'manifest.json',
                 ROOT+'stanley-sports-icon-192.png'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(OFFLINE)).catch(err => console.warn('Offline',err)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(k=>k.startsWith('stanley-sports-')&&k!==VERSION)
      .map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // API-Football via Worker, ESPN, GE e demais serviços NUNCA usam cache offline.
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(req, {cache:'no-store'});
        if (response.ok && url.pathname.startsWith(ROOT)) {
          const clone = response.clone();
          await caches.open(VERSION).then(c => c.put(ROOT+'index.html',clone));
        }
        return response;
      } catch {
        const c = await caches.open(VERSION);
        return await c.match(ROOT+'index.html') || Response.error();
      }
    })());
    return;
  }
  event.respondWith((async () => {
    try {
      const response = await fetch(req, {cache:'no-store'});
      if (response.ok && url.pathname.startsWith(ROOT)) {
        const clone = response.clone();
        await caches.open(VERSION).then(c=>c.put(req,clone));
      }
      return response;
    } catch {
      return await caches.match(req) || Response.error();
    }
  })());
});
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});