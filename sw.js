'use strict';
const CACHE = 'ashi-offline-v16';
const BASE = new URL('./', self.location.href).href;
const FILES = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES.map(path => new Request(new URL(path, BASE), {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('ashi-offline-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || !url.href.startsWith(BASE)) return;
  if (event.request.cache === 'no-store') {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (!response.ok) throw new Error('Page unavailable');
      // Refresh the saved page only after a successful online navigation.
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(BASE, copy)));
      return response;
    }).catch(() => caches.open(CACHE).then(cache => cache.match(BASE))));
  } else {
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
  }
});









