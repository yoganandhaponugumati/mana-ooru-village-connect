import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { sendLoginNotification } from "@/lib/api/notification.functions";
import { requestFcmToken } from "@/lib/firebase-messaging";

const ASKED_KEY = "manaooru.push.permission.asked.v1";

async function unregisterOldPushServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const reg of registrations) {
      if (reg.active?.scriptURL.includes("push-sw.js")) {
        await reg.unregister();
      }
    }
  } catch (error) {
    console.error("[Push] Error unregistering old push-sw.js:", error);
  }
}

export async function subscribeToPush(_reason?: string) {
  if (typeof window === "undefined") {
    console.warn("[Push] Skipping subscription outside the browser.");
    return false;
  }

  if (!("Notification" in window)) {
    console.warn("[Push] Notifications are not supported in this browser.");
    return false;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;

  if (!userId) {
    console.warn("[Push] No authenticated session found. Skipping subscription.");
    return false;
  }

  await unregisterOldPushServiceWorker();

  const token = await requestFcmToken(userId);

  window.localStorage.setItem(ASKED_KEY, "yes");

  if (!token) {
    console.warn("[Push] Failed to register FCM token.");
    return false;
  }

  return true;
}

export async function unsubscribeFromPush() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const userId = session?.user?.id;

  if (!userId) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      fcm_token: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[Push] Error clearing FCM token:", error.message);
  }
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

          const sessionKey = `manaooru.login.notified.${user.id}`;

          if (window.sessionStorage.getItem(sessionKey) !== "yes") {
            window.sessionStorage.setItem(sessionKey, "yes");
            void sendLoginNotification();
          }
        }
      })
      .catch((error) => {
        console.warn("[Push] Auto-subscription notification bypassed:", error?.message || error);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    void requestFcmToken(user.id);
    void unregisterOldPushServiceWorker();

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

          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(notification.title, {
                body: notification.body,
                icon: "/site-icon.png",
              });
            } catch {
              navigator.serviceWorker?.getRegistration()?.then((registration) => {
                registration?.showNotification(notification.title ?? "GramMitra • Village Alert", {
                  body: notification.body,
                  icon: "/site-icon.png",
                } as any);
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);
}

/**
 * Triggers an immediate browser push & toast notification for newly created posts/complaints/notices.
 * Uses ServiceWorkerRegistration.showNotification for 100% Android Chrome, PWA & Desktop compatibility.
 */
export async function showInstantPushNotification(options: {
  title: string;
  body: string;
  actionUrl?: string;
  icon?: string;
}) {
  const { title, body, actionUrl = "/", icon = "/site-icon.png" } = options;

  // 1. Toast alert notification inside app
  toast.success(title, {
    description: body,
    duration: 6000,
    action: {
      label: "View Post",
      onClick: () => {
        if (typeof window !== "undefined") {
          window.location.assign(actionUrl);
        }
      },
    },
  });

  // 2. Mobile Haptic Vibration
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // Haptic fallback
    }
  }

  // 3. Mobile Android & Desktop Native System Push Notification
  if (typeof window === "undefined" || !("Notification" in window)) return;

  const triggerServiceWorkerNotification = async () => {
    try {
      let reg: ServiceWorkerRegistration | undefined;
      if ("serviceWorker" in navigator) {
        reg = await navigator.serviceWorker.ready.catch(() => undefined);
        if (!reg) {
          reg = await navigator.serviceWorker.getRegistration().catch(() => undefined);
        }
        if (!reg) {
          reg = await navigator.serviceWorker
            .register("/firebase-messaging-sw.js", { scope: "/" })
            .catch(() => undefined);
        }
      }

      if (reg && "showNotification" in reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: "/notification-badge.svg",
          data: { url: actionUrl },
          vibrate: [200, 100, 200],
          tag: `post_${Date.now()}`,
          renotify: true,
        } as any);
        return;
      }
    } catch (swErr) {
      console.warn("[Push] Service Worker showNotification failed:", swErr);
    }

    // Standard Desktop browser fallback
    try {
      new Notification(title, {
        body,
        icon,
        badge: "/notification-badge.svg",
        data: { url: actionUrl },
      });
    } catch (err) {
      console.warn("[Push] Standard Notification API fallback failed:", err);
    }
  };

  if (Notification.permission === "granted") {
    await triggerServiceWorkerNotification();
  } else if (Notification.permission !== "denied") {
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        await triggerServiceWorkerNotification();
      }
    } catch (permErr) {
      console.warn("[Push] Permission request error:", permErr);
    }
  }
}
