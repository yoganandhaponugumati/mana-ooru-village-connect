import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported, type Messaging } from "firebase/messaging";
import { supabase } from "@/integrations/supabase/client";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export function isFcmConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId,
  );
}

let messagingPromise: Promise<Messaging | null> | null = null;

export async function getFcmMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;

  if (!isFcmConfigured()) {
    console.warn("[FCM] Firebase credentials not found. Push notifications are disabled.");
    return null;
  }

  if (!messagingPromise) {
    messagingPromise = isSupported()
      .then((supported) => {
        if (!supported) {
          console.warn("[FCM] Firebase Messaging is not supported.");
          return null;
        }

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

        return getMessaging(app);
      })
      .catch((err) => {
        console.warn("[FCM] Firebase Messaging unavailable in this browser environment:", err?.message || err);
        return null;
      });
  }

  return messagingPromise;
}

export async function cleanLegacyServiceWorkers() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const reg of registrations) {
      const scriptURL =
        reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || "";

      if (scriptURL.includes("push-sw.js") || scriptURL.includes("?apiKey=")) {
        await reg.unregister();
      }
    }
  } catch (error) {
    console.error("[FCM] Failed to clean legacy service workers:", error);
  }
}

export async function requestFcmToken(userId?: string): Promise<string | null> {
  try {
    await cleanLegacyServiceWorkers();

    const messaging = await getFcmMessaging();
    if (!messaging) return null;

    if (!("Notification" in window)) {
      console.warn("[FCM] Notification API is not supported.");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("[FCM] Notification permission denied.");
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

    const swRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn("[FCM] Failed to obtain FCM token.");
      return null;
    }

    if (userId) {
      const { error } = await supabase
        .from("profiles")
        .update({
          fcm_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("[FCM] Failed to save FCM token:", error.message);
      }
    }

    return token;
  } catch (error) {
    console.error("[FCM] Failed to register FCM token:", error);
    return null;
  }
}

export async function registerFcmForegroundListener(
  onNotification: (payload: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }) => void,
) {
  const messaging = await getFcmMessaging();

  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title || payload.data?.title || "GramMitra Notification";

    const body = payload.notification?.body || payload.data?.body || "";

    onNotification({
      title,
      body,
      data: payload.data,
    });
  });
}
