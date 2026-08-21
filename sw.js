const CACHE_NAME = 'pmp-exam-prep-v2';
const ASSETS = [
  './pmp-exam-prep.html',
  './questions-es.js',
  './questions-en.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first para los archivos de preguntas, de modo que al subir
// ampliaciones del banco la app las recoja en cuanto haya conexión.
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  const isData = url.includes('questions-') || url.includes('pmp-exam-prep.html');
  if (isData) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
