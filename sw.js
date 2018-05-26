var cachesName = 'news-bit-v1';

var filesToCache = [
  '/',
  'css/main.css',
  'js/app.js',
  'js/controller.js',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'css/material.min.css',
  'js/material.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js',
  'https://code.jquery.com/jquery-1.11.1.js',
  'https://cdn.jsdelivr.net/npm/idb@2.1.2/lib/idb.min.js'
];

// on installation of service worker, add files to the cache
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cachesName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

// delete old caches when a new one activates
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function(cacheName) {
            return cacheName.startsWith('news-bit-') && cacheName != cachesName;
          })
          .map(function(cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// intercept requests
self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);

  if (requestUrl.pathname === '/fetch') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
