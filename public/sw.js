const CACHE_NAME = 'secudroit-cache-v1';

// Fichiers statiques et routes à mettre en cache immédiatement
const PRECACHE_URLS = [
  '/',
  '/agent/hub',
  '/agent/code', // La page SecuDroit elle-même
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Stratégie Cache-First spécifique pour SecuDroit (articles_droit)
  // Si l'API ou la ressource contient 'droit' ou 'code', on privilégie le cache
  if (url.pathname.includes('/agent/code') || url.pathname.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // On retourne le cache, mais on met à jour en arrière-plan (Stale-while-revalidate)
          event.waitUntil(
            fetch(event.request).then((networkResponse) => {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            })
          );
          return cachedResponse;
        }

        // Si non trouvé dans le cache, on fetch
        return fetch(event.request).then((networkResponse) => {
          // On cache la nouvelle réponse pour la prochaine fois
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Comportement par défaut (Network First) pour le reste de l'app
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
