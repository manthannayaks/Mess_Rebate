// Service Worker for Campus Mess Companion PWA
const CACHE_NAME = 'mess-companion-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/mess-menu.html',
  '/rebates.html',
  '/academic-calendar.html',
  '/login.html',
  '/admin-dashboard.html',
  '/404.html',
  '/assets/styles/main.css',
  '/assets/scripts/app-shell.js',
  '/assets/scripts/home.js',
  '/assets/scripts/menu.js',
  '/assets/scripts/rebates.js',
  '/assets/scripts/calendar.js',
  '/assets/scripts/admin.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache install failed:', err);
      })
  );
  self.skipWaiting();
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
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((response) => {
          // Don't cache non-GET requests or non-successful responses
          if (event.request.method !== 'GET' || !response || response.status !== 200) {
            return response;
          }
          // Clone the response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/404.html');
        }
      })
  );
});

// Background sync for reminders (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'meal-reminder') {
    event.waitUntil(showMealReminder());
  }
});

function showMealReminder() {
  return self.registration.showNotification('Meal Reminder', {
    body: 'Time for your meal!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    tag: 'meal-reminder',
    requireInteraction: false
  });
}

