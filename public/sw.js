// MotoTrack Service Worker - Offline Map Tile Caching
const CACHE_NAME = 'mototrack-v1'
const MAX_CACHE_ENTRIES = 500

// Tile URL patterns to cache
const TILE_URL_PATTERNS = [
  /maptiler\.com/,
  /openstreetmap\.org/,
  /cartocdn\.com/,
  /openfreemap\.org/,
  /basemaps\.cartocdn\.com/,
]

// App shell resources to cache on install
const APP_SHELL = [
  '/',
  '/manifest.json',
]

// Check if a URL is a tile request
function isTileRequest(url) {
  return TILE_URL_PATTERNS.some(pattern => pattern.test(url))
}

// Check if a URL is an API request
function isApiRequest(url) {
  return url.includes('/api/') || url.includes('router.project-osrm.org')
}

// LRU eviction - remove oldest entries when cache is too large
async function trimCache() {
  const cache = await caches.open(CACHE_NAME)
  const keys = await cache.keys()

  if (keys.length > MAX_CACHE_ENTRIES) {
    // Delete oldest entries (first in = oldest)
    const deleteCount = keys.length - MAX_CACHE_ENTRIES
    for (let i = 0; i < deleteCount; i++) {
      await cache.delete(keys[i])
    }
  }
}

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache app shell resources, ignoring failures for non-critical resources
        return Promise.allSettled(
          APP_SHELL.map(url =>
            cache.add(url).catch(() => {
              // Silently fail - app shell caching is best-effort
            })
          )
        )
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - routing strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = request.url

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!url.startsWith('http')) return

  if (isTileRequest(url)) {
    // Cache First strategy for tiles
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          // Return cached tile, but also update cache in background
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(request, networkResponse)
            }
          }).catch(() => {
            // Network failed, that's ok - we have the cached version
          })
          return cachedResponse
        }

        // No cache, try network
        try {
          const networkResponse = await fetch(request)
          if (networkResponse.ok) {
            // Clone the response before putting it in the cache
            const responseToCache = networkResponse.clone()
            cache.put(request, responseToCache)
            // Trim cache if needed
            trimCache()
          }
          return networkResponse
        } catch (error) {
          // Network failed and no cache - return offline placeholder for tiles
          return new Response('', {
            status: 503,
            statusText: 'Offline - Tile not cached',
          })
        }
      })
    )
  } else if (isApiRequest(url)) {
    // Network First strategy for API requests
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          return caches.match(request)
        })
    )
  } else {
    // Network First for page requests and other resources
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful responses for pages and assets
          if (networkResponse.ok && (request.mode === 'navigate' || url.startsWith(self.location.origin))) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse
            // If it's a navigation request, return the cached root page
            if (request.mode === 'navigate') {
              return caches.match('/')
            }
            return new Response('', { status: 503, statusText: 'Offline' })
          })
        })
    )
  }
})

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.open(CACHE_NAME).then((cache) => {
      cache.keys().then((keys) => {
        event.ports[0].postMessage({ count: keys.length })
      })
    })
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      caches.open(CACHE_NAME)
      event.ports[0].postMessage({ cleared: true })
    })
  }
})
