// Service worker registration script
// Copyright (c) 2025 Jake's Weather Dashboard. All rights reserved.

// Check if service worker is supported in the browser and we're not in development mode
const isProduction = import.meta.env.PROD;

if ('serviceWorker' in navigator && isProduction) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
} else if (!isProduction) {
  // In development, don't register the service worker to avoid WebSocket issues
  console.log('Service Worker registration skipped in development mode');
  
  // Attempt to unregister any existing service workers to prevent conflicts
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Service Worker unregistered in development mode');
      }
    });
  }
}
