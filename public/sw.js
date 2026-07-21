// Minimal service worker — enables PWA installability.
// Network-first for GET requests, falling back to cache when offline.
const CACHE = 'urban-club-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cache successful same-origin responses for offline fallback
        if (res.ok && new URL(req.url).origin === self.location.origin) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(req, copy))
        }
        return res
      })
      .catch(() => caches.match(req)),
  )
})
