// Firebase Cloud Messaging Background Service Worker for ManaOoru
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// Initialize Firebase Messaging in Service Worker
// The service worker retrieves config from URL query params or environment defaults
const urlParams = new URLSearchParams(self.location.search);
const apiKey = urlParams.get('apiKey') || "";
const projectId = urlParams.get('projectId') || "";
const messagingSenderId = urlParams.get('messagingSenderId') || "";
const appId = urlParams.get('appId') || "";

if (apiKey && projectId) {
  firebase.initializeApp({
    apiKey: apiKey,
    authDomain: `${projectId}.firebaseapp.com`,
    projectId: projectId,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId,
    appId: appId,
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);
    const title = payload.notification?.title || payload.data?.title || 'ManaOoru Update';
    const options = {
      body: payload.notification?.body || payload.data?.body || 'New village notice or alert available.',
      icon: payload.notification?.icon || payload.data?.icon || '/pwa-192x192.png',
      badge: payload.notification?.badge || payload.data?.badge || '/pwa-192x192.png',
      data: {
        url: payload.data?.url || payload.data?.action_url || '/',
        ...payload.data
      },
    };

    self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
