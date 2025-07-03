const CACHE_NAME = 'clarity-hub-v1.0.0';
const STATIC_CACHE = 'clarity-hub-static-v1.0.0';
const DYNAMIC_CACHE = 'clarity-hub-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  // Add other critical files
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/.*\.supabase\.co\/rest\/v1\//,
  /^https:\/\/.*\.googleapis\.com\/calendar\/v3\//
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
            .then((fetchResponse) => {
              return caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            })
            .catch(() => {
              // Return offline page if available
              return caches.match('/index.html');
            });
        })
    );
    return;
  }

  // Handle API requests
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached version if network fails
              return cache.match(request);
            });
        })
    );
    return;
  }

  // Handle other requests (images, fonts, etc.)
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request)
          .then((fetchResponse) => {
            // Cache non-API requests
            if (fetchResponse.status === 200 && request.method === 'GET') {
              return caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            }
            return fetchResponse;
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  } else if (event.tag === 'sync-habits') {
    event.waitUntil(syncHabits());
  } else if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: 'You have a new notification from Clarity Hub',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Clarity Hub';
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('Clarity Hub', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then((clientList) => {
          for (const client of clientList) {
            if (client.url === '/' && 'focus' in client) {
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

// Sync functions
async function syncTasks() {
  try {
    const pendingTasks = await getFromIndexedDB('pending-tasks');
    // Sync with Supabase when online
    // Implementation depends on your sync strategy
    console.log('Syncing tasks:', pendingTasks);
  } catch (error) {
    console.error('Error syncing tasks:', error);
  }
}

async function syncHabits() {
  try {
    const pendingHabits = await getFromIndexedDB('pending-habits');
    console.log('Syncing habits:', pendingHabits);
  } catch (error) {
    console.error('Error syncing habits:', error);
  }
}

async function syncNotes() {
  try {
    const pendingNotes = await getFromIndexedDB('pending-notes');
    console.log('Syncing notes:', pendingNotes);
  } catch (error) {
    console.error('Error syncing notes:', error);
  }
}

// IndexedDB helper
function getFromIndexedDB(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ClarityHubDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}