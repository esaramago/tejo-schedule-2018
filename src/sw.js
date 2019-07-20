// Credits: https://airhorner.com

const version = "1.0.1";
const cacheName = `horariostejo-${version}`;
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                //`/`,
                `/index.html`,
                `/seixal.html`,
                `/montijo.html`,
                `/404.html`,
                `/css/base.css`,
                `/css/components.head.css`,
                `/css/components.body.css`,
                `/css/components.hidden.css`,
                `/css/utilities.css`,
                `/main.js`
            ])
            .then(() => self.skipWaiting());
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(cacheName)
            .then(cache => cache.match(event.request, { ignoreSearch: true }))
            .then(response => {
                return response || fetch(event.request);
            })
    );
});