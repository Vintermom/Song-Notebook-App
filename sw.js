const CACHE = 'songbook-v1'
const APP_ASSETS = [
  '/', '/index.html', '/manifest.json', '/sw.js',
  '/src/main.jsx', '/src/App.jsx', '/src/styles.css'
]
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_ASSETS)))
})
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  )
})
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)))
})
