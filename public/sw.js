const CACHE_NAME = 'glpi-cache-v1';

// Assets that should be cached immediately
const PRECACHE_ASSETS = [
    '/',
    '/favicon.ico',
    '/glpi-logo.png'
];

// Install event - precache critical assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .catch(error => {
                console.error('Precaching failed:', error);
            })
    );
    // Activate new service worker immediately
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensure service worker takes control immediately
    self.clients.claim();
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip non-HTTP(S) requests
    if (!event.request.url.startsWith('http')) return;

    // Skip API requests and dynamic routes
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/dashboard') ||
        event.request.url.includes('/interventions') ||
        event.request.url.includes('/tasks')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found
                if (response) {
                    return response;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200) {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the response
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(error => {
                                console.error('Caching failed:', error);
                            });

                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        // You could return a custom offline page here
                        return new Response('Offline');
                    });
            })
    );
}); 