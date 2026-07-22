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
      firebaseConfig.appId
  );
}

let messagingPromise: Promise<Messaging | null> | null = null;

export async function getFcmMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!isFcmConfigured()) {
    console.info("[FCM] Firebase credentials not found in env. Set VITE_FIREBASE_* variables to enable FCM.");
    return null;
  }

  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported) {
        console.warn("[FCM] Messaging is not supported in this browser.");
        return null;
      }
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
      return getMessaging(app);
    }).catch((err) => {
      console.error("[FCM] Failed to initialize messaging:", err);
      return null;
    });
  }

  return messagingPromise;
}

export async function requestFcmToken(userId?: string): Promise<string | null> {
  try {
    const messaging = await getFcmMessaging();
    if (!messaging) return null;

    if (!("Notification" in window)) {
      console.warn("[FCM] Notification API not supported.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Notification permission was not granted:", permission);
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

    console.log("VAPID KEY:", vapidKey);
    console.log("VAPID KEY LENGTH:", vapidKey?.length);
    const swRegistration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?apiKey=${encodeURIComponent(firebaseConfig.apiKey || "")}&projectId=${encodeURIComponent(firebaseConfig.projectId || "")}&messagingSenderId=${encodeURIComponent(firebaseConfig.messagingSenderId || "")}&appId=${encodeURIComponent(firebaseConfig.appId || "")}`,
      { scope: "/" }
    );

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (token) {
      console.log("[FCM] Obtained device FCM Token:", token);

      if (userId) {
        // Save FCM token to user profile
        const { error } = await supabase
          .from("profiles")
          .update({ fcm_token: token, updated_at: new Date().toISOString() })
          .eq("id", userId);

        if (error) {
          console.warn("[FCM] Note: profiles table fcm_token column error:", error.message);
        }
      }
      return token;
    }

    return null;
  } catch (error:any) {
    console.error("========== FCM FULL ERROR ==========");
    console.error(error);
    console.error("Name:", error?.name);
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Stack:", error?.stack);
    console.error("====================================");
    return null;
  }
}

export async function registerFcmForegroundListener(
  onNotification: (payload: { title?: string; body?: string; data?: Record<string, unknown> }) => void
) {
  const messaging = await getFcmMessaging();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("[FCM] Received foreground message:", payload);
    const title = payload.notification?.title || payload.data?.title || "ManaOoru Notification";
    const body = payload.notification?.body || payload.data?.body || "";
    onNotification({ title, body, data: payload.data });
  });
}
