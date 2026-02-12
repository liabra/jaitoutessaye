/**
 * SERVICE WORKER - PWA Offline-First
 * J'ai tout essayé - Consultable sans réseau
 */

const CACHE_NAME = 'jai-tout-essaye-v2';
const OFFLINE_URL = '/offline.html';

// Fichiers à mettre en cache immédiatement
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/css/main.css',
    '/js/main.js',
    '/js/pwa.js',
    '/offline.html',
    '/manifest.json',
    '/images/icon-192.png',
    '/images/icon-512.png',
    // Polices Google Fonts en cache
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=IBM+Plex+Mono:wght@400;500;600&family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap'
];

// Pages et ressources à mettre en cache dynamiquement
const DYNAMIC_CACHE = [
    '/pages/maternite.html',
    '/pages/coding.html',
    '/pages/astuces.html',
    '/pages/communaute.html'
];

// ============================================
// INSTALLATION
// ============================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installation...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Mise en cache des fichiers statiques');
                return cache.addAll(STATIC_CACHE);
            })
            .then(() => {
                console.log('[SW] Installation terminée');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Erreur d\'installation:', error);
            })
    );
});

// ============================================
// ACTIVATION
// ============================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activation...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Suppression du cache obsolète:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Activation terminée');
                return self.clients.claim();
            })
    );
});

// ============================================
// FETCH STRATEGY: Cache First, Network Fallback
// ============================================

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 🚫 Ne jamais intercepter l’admin ni l’OAuth
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/callback') ||
    url.origin.includes('github.com')
  ) {
    return; // laisser le navigateur gérer
  }

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});


// ============================================
// STRATÉGIES DE CACHE
// ============================================

/**
 * Cache First Strategy
 * Cherche d'abord en cache, puis réseau si non trouvé
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('[SW] Réponse depuis le cache:', request.url);
        
        // Update cache in background
        fetchAndCache(request, cache);
        
        return cachedResponse;
    }
    
    console.log('[SW] Pas en cache, récupération réseau:', request.url);
    return fetchAndCache(request, cache);
}

/**
 * Network First Strategy (pour contenu dynamique)
 */
async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    
    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Fetch et mise en cache
 */
async function fetchAndCache(request, cache) {
    try {
        const response = await fetch(request);
        
        // Ne mettre en cache que les réponses réussies
        if (response.status === 200) {
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[SW] Erreur de récupération:', error);
        throw error;
    }
}

// ============================================
// BACKGROUND SYNC (pour les formulaires offline)
// ============================================

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-comments') {
        event.waitUntil(syncComments());
    }
});

async function syncComments() {
    // Synchroniser les commentaires postés offline
    console.log('[SW] Synchronisation des commentaires...');
    
    try {
        const db = await openDatabase();
        const comments = await getUnsyncedComments(db);
        
        for (const comment of comments) {
            await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(comment)
            });
            await markCommentAsSynced(db, comment.id);
        }
        
        console.log('[SW] Synchronisation terminée');
    } catch (error) {
        console.error('[SW] Erreur de synchronisation:', error);
    }
}

// ============================================
// PUSH NOTIFICATIONS (optionnel)
// ============================================

self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/icon-192.png',
        badge: '/images/badge-72.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});

// ============================================
// MESSAGE HANDLING
// ============================================

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        const urlsToCache = event.data.urls;
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => cache.addAll(urlsToCache))
        );
    }
});

// ============================================
// UTILITIES
// ============================================

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('JaiToutEssayeDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('comments')) {
                db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function getUnsyncedComments(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['comments'], 'readonly');
        const store = transaction.objectStore('comments');
        const request = store.getAll();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const comments = request.result.filter(c => !c.synced);
            resolve(comments);
        };
    });
}

function markCommentAsSynced(db, id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const request = store.get(id);
        
        request.onsuccess = () => {
            const comment = request.result;
            comment.synced = true;
            const updateRequest = store.put(comment);
            updateRequest.onsuccess = () => resolve();
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        
        request.onerror = () => reject(request.error);
    });
}

console.log('[SW] Service Worker chargé');
