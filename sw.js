/* Mi tablero: abre sin conexión. La red va primero para que siempre
   llegue la última versión; si no hay red, se usa lo guardado. */
const V = 'mi-tablero-v6';
const BASE = ['./', 'index.html', 'js/red-config.js', 'manifest.webmanifest', 'manifest-ios.webmanifest',
  'js/frases.json',
  'icons/ci-192.png', 'icons/ci-512.png', 'icons/ci-180.png', 'icons/isotipo.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const guardar = (req, res) => {
  if (res && (res.ok || res.type === 'opaque')) {
    const copia = res.clone();
    caches.open(V).then(c => c.put(req, copia));
  }
  return res;
};

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin) {
    e.respondWith((async () => {
      const guardado = await caches.match(req, { ignoreSearch: true });
      const red = fetch(req).then(res => guardar(req, res));
      if (!guardado) return red.catch(() => caches.match('index.html'));
      /* con copia guardada: se espera a la red hasta 2,5 s y si no, se usa la copia */
      const espera = new Promise(ok => setTimeout(() => ok(guardado), 2500));
      return Promise.race([red.catch(() => guardado), espera]);
    })());
  } else if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname) || u.hostname === 'www.gstatic.com') {
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(res => guardar(req, res))));
  }
});

/* ---------- avisos ---------- */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { b: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.t || 'Mi tablero', {
    body: d.b || '', icon: 'icons/ci-192.png', badge: 'icons/ci-192.png', tag: d.tag || undefined, data: { url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
