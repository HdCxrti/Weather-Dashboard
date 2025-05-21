// This is the service worker file for the Weather Dashboard PWA
// Copyright (c) 2025 Jake's Weather Dashboard. All rights reserved.

const CACHE_NAME = "weather-dashboard-v1";
const OFFLINE_URL = "/offline.html";

// Files to cache
const urlsToCache = [
  "/",
  OFFLINE_URL,
  "/index.html",
  "/manifest.json",
  "/robots.txt",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install service worker and cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );

  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Clean up old caches when activating
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Ensure service worker takes control of clients right away
  self.clients.claim();
});

// Fetch strategies with network-first for API calls, cache-first for static assets
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests and WebSocket requests
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.startsWith('ws:') || 
      event.request.url.startsWith('wss:')) {
    return;
  }

  // API requests - network first with cache fallback
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // If we can't fetch from network and don't have a cached response,
            // show the offline page for API requests
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // Static assets - cache first with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Cache only successful responses and valid URLs
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response to store in cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Show offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }

          // No response for other requests
          return new Response("Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});
