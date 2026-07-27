const CACHE_NAME = 'rapidsy-v1.1';
const DYNAMIC_CACHE = 'rapidsy-dynamic-v1.1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-icon.png'
];

// Install Event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Bypasses:
    // 1. Non-GET requests
    // 2. Supabase API calls
    // 3. Vite development resources (HMR, internal scripts)
    // 4. Chrome extensions or other protocols
    if (
        event.request.method !== 'GET' ||
        url.hostname.includes('supabase.co') ||
        url.pathname.startsWith('/@') ||           // Vite internal paths like /@react-refresh
        url.pathname.includes('node_modules') ||    // Development dependencies
        (url.protocol !== 'http:' && url.protocol !== 'https:') ||
        (event.request.mode === 'navigate' && url.searchParams.has('code')) ||
        (event.request.mode === 'navigate' && url.hash.includes('access_token'))
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if found
            if (cachedResponse) {
                return cachedResponse;
            }

            // Network fallback
            return fetch(event.request).then((networkResponse) => {
                // If the request was for a resource that we should cache dynamically
                // (Avoiding caching huge assets or development scripts that might leak into the check above)
                if (networkResponse && networkResponse.status === 200) {
                    return caches.open(DYNAMIC_CACHE).then((cache) => {
                        // Cache the new resource (clone it because response stream can be used once)
                        cache.put(event.request.url, networkResponse.clone());
                        return networkResponse;
                    });
                }
                return networkResponse;
            }).catch(() => {
                // If fetch fails (offline), and we have a cached page for it, return it or just fail
                return caches.match('/offline.html');
            });
        })
    );
});
