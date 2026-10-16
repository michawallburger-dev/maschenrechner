/**
 * Service Worker: macht die App nach dem ersten Aufruf offline nutzbar (US-08, AK3).
 *
 * Strategie: Alle App-Dateien werden bei der Installation vorab gespeichert.
 * Anfragen an die eigene Adresse werden zuerst aus dem Cache beantwortet.
 * Fremde Adressen werden nicht angefragt (siehe Datenschutzkonzept).
 *
 * WICHTIG: Bei jeder neuen Version CACHE_NAME erhöhen, sonst sehen
 * Nutzerinnen weiterhin die alte Version.
 */

const CACHE_NAME = 'maschenrechner-v0.1.0';

// Alle Dateien der App, relativ zum Speicherort dieses Service Workers
const APP_DATEIEN = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/app.js',
  './js/rechner.js',
  './js/eingabe.js',
  './js/format.js',
  './js/texte.js',
  './js/einheiten.js',
  './js/speicher.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_DATEIEN))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request;
  if (anfrage.method !== 'GET') return;

  const url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) return;

  ereignis.respondWith(
    caches.match(anfrage, { ignoreSearch: true }).then((treffer) => {
      if (treffer) return treffer;
      return fetch(anfrage).catch(() => {
        // Offline und nicht im Cache: Seitenaufrufe bekommen die Startseite
        if (anfrage.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    }),
  );
});
