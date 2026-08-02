import { useState, useEffect } from "react";
import { Bell, BellRing, X, CheckCircle2 } from "lucide-react";
import { subscribeToPush, showInstantPushNotification } from "@/lib/push-notifications";
import { useAuth } from "@/lib/auth";

export function PushNotificationBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setPermissionState(Notification.permission);
    const dismissed = window.localStorage.getItem("grammitra_push_banner_dismissed");

    if (Notification.permission !== "granted" && dismissed !== "true") {
      setShowBanner(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await subscribeToPush("banner_click");
      if (granted || Notification.permission === "granted") {
        setPermissionState("granted");
        setShowBanner(false);
        window.localStorage.setItem("grammitra_push_banner_dismissed", "true");

        // Fire immediate confirmation push notification
        await showInstantPushNotification({
          title: "🎉 Mobile Push Notifications Active!",
          body: "You will now receive instant alerts whenever someone posts in your village.",
          actionUrl: "/timeline",
        });
      }
    } catch (err) {
      console.error("Failed to enable push notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("grammitra_push_banner_dismissed", "true");
    }
  };

  if (!showBanner || permissionState === "granted") return null;

  return (
    <div className="relative z-[999] border-b border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-primary/15 px-4 py-3 text-foreground backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <BellRing className="size-5 animate-bounce" />
          </div>
          <div className="min-w-0 flex-1 text-xs sm:text-sm">
            <span className="font-bold text-foreground">Enable Mobile Push Notifications</span>
            <span className="hidden sm:inline text-muted-foreground ml-1.5">
              • Get instant status-bar alerts when someone posts a job, crop, or Panchayat notice.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <Bell className="size-3.5" />
                <span>Turn On Push</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification prompt"
            className="grid size-8 place-items-center rounded-xl bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground transition"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
