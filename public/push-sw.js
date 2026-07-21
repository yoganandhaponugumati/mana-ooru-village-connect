const SW_LOG_PREFIX = "[Push SW]";

function logToClients(message, details) {
  console.log(SW_LOG_PREFIX, message, details || "");
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        client.postMessage({
          source: "push-sw",
          message,
          details,
          at: new Date().toISOString(),
        });
      }
    })
    .catch((error) => {
      console.error(SW_LOG_PREFIX, "Could not post log to clients", error);
    });
}

self.addEventListener("install", (event) => {
  logToClients("install");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  logToClients("activate");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  logToClients("push event received", {
    hasData: Boolean(event.data),
  });

  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
    logToClients("push payload parsed", payload);
  } catch (error) {
    logToClients("push payload parse failed", String(error));
    payload = {};
  }

  const title = payload.title || "ManaOoru • Village Alert";
  const options = {
    body: payload.body || "You have a new update in your village. Tap to open.",
    icon: payload.icon || "/site-icon.svg",
    badge: payload.badge || "/notification-badge.svg",
    tag: payload.tag || payload.notificationId || `manaooru-push-${Date.now()}`,
    renotify: true,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: "open",
        title: "👀 Tap to Open in ManaOoru",
      },
    ],
    data: {
      url: payload.url || "/",
      notificationId: payload.notificationId,
    },
  };

  logToClients("showNotification called", { title, options });
  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => {
        logToClients("showNotification resolved", { title, tag: options.tag });
      })
      .catch((error) => {
        logToClients("showNotification failed", String(error));
        throw error;
      }),
  );
});

self.addEventListener("notificationclick", (event) => {
  logToClients("notification click", event.notification.data);
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "/", self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    }),
  );
});
