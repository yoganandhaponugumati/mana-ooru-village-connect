import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  deletePushSubscription,
  savePushSubscription,
  sendLoginNotification,
  sendTestPushNotification,
} from "@/lib/api/notification.functions";

const ASKED_KEY = "manaooru.push.permission.asked.v1";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function getVapidPublicKey() {
  return import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
}

function toPushSubscriptionPayload(subscription: PushSubscription) {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Browser returned an incomplete push subscription.");
  }
  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  };
}

function logPushEnvironment() {
  const hasWindow = typeof window !== "undefined";
  console.log("[Push] typeof window:", typeof window);

  if (!hasWindow) {
    console.log("[Push] navigator.serviceWorker:", undefined);
    console.log('[Push] "serviceWorker" in navigator:', false);
    console.log("[Push] window.isSecureContext:", undefined);
    console.log("[Push] window.location.origin:", undefined);
    return;
  }

  console.log("[Push] navigator.serviceWorker:", navigator.serviceWorker);
  console.log('[Push] "serviceWorker" in navigator:', "serviceWorker" in navigator);
  console.log("[Push] window.isSecureContext:", window.isSecureContext);
  console.log("[Push] window.location.origin:", window.location.origin);
}

async function verifyServiceWorkerAsset() {
  console.log("[Push] Verifying /push-sw.js exists...");
  try {
    const response = await fetch("/push-sw.js", {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "text/javascript,*/*" },
    });
    console.log("[Push] /push-sw.js status:", response.status, response.statusText);
    console.log("[Push] /push-sw.js content-type:", response.headers.get("content-type"));

    if (!response.ok) {
      throw new Error(`/push-sw.js returned ${response.status} ${response.statusText}`);
    }

    const body = await response.clone().text();
    if (!body.includes("self.addEventListener")) {
      throw new Error("/push-sw.js did not look like the push service worker script.");
    }

    console.log("[Push] /push-sw.js verified.");
    return true;
  } catch (error) {
    console.error("[Push] /push-sw.js verification failed:", error);
    return false;
  }
}

async function getServiceWorkerRegistration() {
  if (!("serviceWorker" in navigator)) {
    console.warn("[Push] Service workers are not supported in this browser.");
    if (!window.isSecureContext) {
      console.warn("[Push] Service workers require a secure context. Use HTTPS or localhost.");
    }
    return null;
  }

  const assetOk = await verifyServiceWorkerAsset();
  if (!assetOk) return null;

  try {
    console.log("[Push] Registering service worker...");
    const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });
    await registration.update();
    const readyRegistration = await navigator.serviceWorker.ready;
    console.log("[Push] Service worker registered:", readyRegistration.scope);
    console.log("[Push] Service worker active:", readyRegistration.active?.scriptURL);
    return readyRegistration;
  } catch (error) {
    console.error("[Push] Service worker registration failed:", error);
    return null;
  }
}

export async function subscribeToPush(source = "app") {
  console.log(`[Push] Starting subscription flow from ${source}.`);
  logPushEnvironment();

  if (typeof window === "undefined") {
    console.warn("[Push] Skipping subscription outside the browser.");
    return false;
  }

  if (!("Notification" in window)) {
    console.warn("[Push] Notifications are not supported in this browser.");
    return false;
  }

  if (!("PushManager" in window)) {
    console.warn("[Push] PushManager is not supported in this browser.");
    return false;
  }

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    console.warn("Missing VITE_VAPID_PUBLIC_KEY; browser push is disabled.");
    return false;
  }
  console.log("[Push] VAPID public key found.");

  const registration = await getServiceWorkerRegistration();
  if (!registration) return false;

  console.log("[Push] Current notification permission:", Notification.permission);
  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;
  window.localStorage.setItem(ASKED_KEY, "yes");
  console.log("[Push] Notification permission result:", permission);

  if (permission !== "granted") {
    console.warn("[Push] Permission was not granted; subscription was not created.");
    return false;
  }

  console.log("[Push] Checking for an existing push subscription...");
  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    console.log("[Push] Existing subscription found; reusing it.");
  } else {
    console.log("[Push] Creating a new push subscription...");
  }

  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  console.log("[Push] Push subscription ready:", subscription.endpoint);

  console.log("[Push] Saving subscription to backend...");
  await savePushSubscription({ data: toPushSubscriptionPayload(subscription) });
  console.log("[Push] Subscription saved to backend.");

  console.log("[Push] Sending test push notification...");
  const testResult = await sendTestPushNotification();
  console.log("[Push] Test push request complete:", testResult);
  return true;
}

export async function unsubscribeFromPush() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await deletePushSubscription({ data: { endpoint } });
}

export function useBrowserPushNotifications() {
  const { user } = useAuth();
  const loginNotifiedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      loginNotifiedRef.current = null;
      return;
    }

    const shouldAsk = window.localStorage.getItem(ASKED_KEY) !== "yes";
    if (!shouldAsk && Notification.permission !== "granted") return;

    subscribeToPush("login")
      .then((enabled) => {
        if (enabled && loginNotifiedRef.current !== user.id) {
          loginNotifiedRef.current = user.id;
          void sendLoginNotification();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const onServiceWorkerMessage = (event: MessageEvent) => {
      console.log("[Push SW -> Page]", event.data);
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onServiceWorkerMessage);
    }

    const channel = supabase
      .channel(`foreground-notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as {
            title?: string;
            body?: string;
            action_url?: string | null;
            dedupe_key?: string | null;
          };
          if (!notification.title || !notification.body) return;

          toast(notification.title, {
            description: notification.body,
            action: notification.action_url
              ? {
                  label: "Open",
                  onClick: () => {
                    window.location.assign(notification.action_url ?? "/");
                  },
                }
              : undefined,
          });

          if (Notification.permission === "granted" && document.visibilityState !== "visible") {
            navigator.serviceWorker.getRegistration("/push-sw.js").then((registration) => {
              registration?.showNotification(notification.title ?? "ManaOoru", {
                body: notification.body,
                icon: "/site-icon.svg",
                badge: "/notification-badge.svg",
                tag: notification.dedupe_key ?? undefined,
                data: { url: notification.action_url ?? "/" },
              });
            });
          }
        },
      )
      .subscribe();

    return () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onServiceWorkerMessage);
      }
      void supabase.removeChannel(channel);
    };
  }, [user]);
}
