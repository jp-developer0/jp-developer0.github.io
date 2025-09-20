// Service Worker para Portfolio Juan Pablo González
// Versión 1.0.0

const CACHE_NAME = 'portfolio-jp-v1.0.0';
const CACHE_STATIC_NAME = 'portfolio-static-v1.0.0';
const CACHE_DYNAMIC_NAME = 'portfolio-dynamic-v1.0.0';

// Recursos esenciales para cachear
const STATIC_ASSETS = [
  './',
  './index.html',
  './src/styles/main.css',
  './src/scripts/main.js',
  './favicon.png',
  // Fuentes críticas
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
  // Recursos críticos de imágenes
  './assets/img/me.jpg'
];

// Recursos que se pueden cachear dinámicamente
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /^https:\/\/www\.vectorlogo\.zone/,
  /^https:\/\/upload\.wikimedia\.org/
];

// Recursos que nunca se deben cachear
const NO_CACHE_PATTERNS = [
  /^https:\/\/www\.googletagmanager\.com/,
  /^https:\/\/www\.google-analytics\.com/,
  /analytics/,
  /gtag/
];

// Tiempo de vida del cache dinámico (7 días)
const DYNAMIC_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/**
 * Evento de instalación del Service Worker
 */
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
});

/**
 * Evento de activación del Service Worker
 */
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      cleanupOldCaches(),
      // Reclamar control de todas las páginas
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker activated successfully');
    })
  );
});

/**
 * Evento de fetch - manejo de requests
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // No cachear requests de analytics
  if (shouldNotCache(request.url)) {
    return fetch(request);
  }

  // Estrategia de cache basada en el tipo de recurso
  if (request.method === 'GET') {
    if (isStaticAsset(request.url)) {
      // Cache First para recursos estáticos
      event.respondWith(cacheFirst(request));
    } else if (isNavigationRequest(request)) {
      // Network First para páginas HTML
      event.respondWith(networkFirst(request));
    } else if (isDynamicAsset(request.url)) {
      // Stale While Revalidate para recursos dinámicos
      event.respondWith(staleWhileRevalidate(request));
    } else {
      // Network First por defecto
      event.respondWith(networkFirst(request));
    }
  }
});

/**
 * Estrategia Cache First
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_STATIC_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return caches.match('./index.html'); // Fallback
  }
}

/**
 * Estrategia Network First
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_DYNAMIC_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para páginas
    if (isNavigationRequest(request)) {
      return caches.match('./index.html');
    }

    throw error;
  }
}

/**
 * Estrategia Stale While Revalidate
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_DYNAMIC_NAME);
  const cachedResponse = await cache.match(request);

  // Actualizar en background
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.log('[SW] Network update failed:', error);
    });

  // Devolver cache inmediatamente si existe, sino esperar red
  return cachedResponse || fetchPromise;
}

/**
 * Determinar si es un recurso estático
 */
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.includes(asset)) ||
         url.includes('/src/') ||
         url.includes('/assets/') ||
         url.includes('favicon');
}

/**
 * Determinar si es un request de navegación
 */
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

/**
 * Determinar si es un recurso dinámico cacheable
 */
function isDynamicAsset(url) {
  return DYNAMIC_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Determinar si NO se debe cachear
 */
function shouldNotCache(url) {
  return NO_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Limpiar caches antiguos
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [CACHE_STATIC_NAME, CACHE_DYNAMIC_NAME];

  const deletePromises = cacheNames
    .filter(cacheName => !validCaches.includes(cacheName))
    .map(cacheName => {
      console.log('[SW] Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    });

  await Promise.all(deletePromises);

  // Limpiar cache dinámico viejo
  await cleanupDynamicCache();
}

/**
 * Limpiar entradas viejas del cache dinámico
 */
async function cleanupDynamicCache() {
  const cache = await caches.open(CACHE_DYNAMIC_NAME);
  const requests = await cache.keys();
  const now = Date.now();

  const deletePromises = requests
    .filter(request => {
      const cached = cache.match(request);
      return cached && (now - cached.headers.get('date')) > DYNAMIC_CACHE_TTL;
    })
    .map(request => cache.delete(request));

  await Promise.all(deletePromises);
}

/**
 * Evento de mensaje del cliente
 */
self.addEventListener('message', event => {
  const { data } = event;

  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CACHE_INFO':
      getCacheInfo().then(info => {
        event.ports[0].postMessage(info);
      });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;

    case 'UPDATE_CACHE':
      updateStaticCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

/**
 * Obtener información del cache
 */
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    info[cacheName] = {
      size: keys.length,
      urls: keys.map(key => key.url)
    };
  }

  return info;
}

/**
 * Limpiar todos los caches
 */
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName));
  await Promise.all(deletePromises);
  console.log('[SW] All caches cleared');
}

/**
 * Actualizar cache estático
 */
async function updateStaticCache() {
  const cache = await caches.open(CACHE_STATIC_NAME);
  await cache.addAll(STATIC_ASSETS);
  console.log('[SW] Static cache updated');
}

/**
 * Evento de sincronización en background
 */
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Sincronización en background
 */
async function doBackgroundSync() {
  try {
    // Aquí se pueden agregar tareas de sincronización
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Manejo de errores globales
 */
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

/**
 * Evento de notificación push (para futuras implementaciones)
 */
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.png',
      badge: '/favicon.png',
      tag: 'portfolio-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/favicon.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

/**
 * Manejo de clics en notificaciones
 */
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});

console.log('[SW] Service Worker loaded successfully');