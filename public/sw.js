// Service Worker for Smart Reminder PWA

const CACHE_NAME = 'smart-reminder-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Static assets to cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/masked-icon.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached response if available
            if (cachedResponse) {
                // Fetch fresh version in background
                event.waitUntil(
                    fetch(event.request)
                        .then((response) => {
                            if (response.ok) {
                                caches.open(DYNAMIC_CACHE).then((cache) => {
                                    cache.put(event.request, response.clone());
                                });
                            }
                        })
                        .catch(() => { })
                );
                return cachedResponse;
            }

            // Fetch from network
            return fetch(event.request)
                .then((response) => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Return offline page if available
                    return caches.match('/index.html');
                });
        })
    );
});

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {};

    const options = {
        body: data.body || 'You have a reminder!',
        icon: data.icon || '/icons/icon-192.png',
        badge: data.badge || '/icons/badge-72.png',
        tag: data.tag || 'default',
        data: data.data || {},
        actions: data.actions || [
            { action: 'complete', title: 'Mark Done' },
            { action: 'snooze', title: 'Snooze' },
        ],
        vibrate: [200, 100, 200],
        requireInteraction: true,
        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Smart Reminder', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const action = event.action;
    const data = event.notification.data;

    if (action === 'complete' || action === 'snooze') {
        // Handle action
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                // Focus existing window or open new one
                for (const client of clientList) {
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.postMessage({
                            type: 'NOTIFICATION_ACTION',
                            action,
                            data,
                        });
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    } else {
        // Default click - open app
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes('/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Background sync event (for offline task completion)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

// Sync tasks function
async function syncTasks() {
    // Get pending tasks from IndexedDB and sync with server
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
        client.postMessage({ type: 'SYNC_COMPLETE' });
    });
}

// Message event - handle messages from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
