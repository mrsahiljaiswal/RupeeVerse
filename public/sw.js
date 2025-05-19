const CACHE_NAME = 'atm-locator-cache-v1';
const OFFLINE_URL = '/offline.html';

// List of URLs to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/markers/bank.svg',
  '/markers/atm.svg',
  '/markers/user.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Check if the request is for a map tile
  if (event.request.url.includes('tile.openstreetmap.org')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if found
          if (response) {
            return response;
          }

          // Clone the request because it can only be used once
          const fetchRequest = event.request.clone();

          return fetch(fetchRequest).then(
            (response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response because it can only be used once
              const responseToCache = response.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            }
          ).catch(() => {
            // If network fails, return offline page
            return caches.match(OFFLINE_URL);
          });
        })
    );
  } else {
    // For non-map requests, use network-first strategy
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
}); 