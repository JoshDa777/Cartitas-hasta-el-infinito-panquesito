/* ============================================
   CARTAS HASTA EL INFINITO PANQUESITO
   Service Worker - Modo offline y caché
   ============================================ */

const CACHE_NAME = 'panquesito-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/storage.js',
  './js/app.js',
  './manifest.json'
];

// Instalación: cachear archivos principales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: estrategia cache-first con red como respaldo
self.addEventListener('fetch', (event) => {
  // Solo manejar solicitudes GET
  if (event.request.method !== 'GET') return;

  // No cachear solicitudes a GitHub API
  if (event.request.url.includes('api.github.com')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;

        return fetch(event.request)
          .then((response) => {
            // Cachear solo respuestas exitosas
            if (response.ok && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            // Si falla la red, intentar devolver el index.html
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nuevo recuerdo en Cartas hasta el Infinito Panquesito',
    icon: data.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💖</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💖</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '💖 Panquesito', options)
  );
});

// Manejar clic en notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url || './index.html');
        }
      })
  );
});