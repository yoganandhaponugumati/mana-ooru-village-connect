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
        console.error("[Push] Auto-subscription error on login:", error);
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
                icon: "/site-icon.svg",
              });
            } catch {
              navigator.serviceWorker?.getRegistration()?.then((registration) => {
                registration?.showNotification(notification.title ?? "GramMitra • Village Alert", {
                  body: notification.body,
                  icon: "/site-icon.svg",
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
