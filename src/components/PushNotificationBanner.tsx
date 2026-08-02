import { useState, useEffect } from "react";
import { BellRing, X } from "lucide-react";
import { subscribeToPush, showInstantPushNotification } from "@/lib/push-notifications";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

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
      if (typeof window !== "undefined" && "Notification" in window) {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);

        if (perm === "granted") {
          if (user) {
            void subscribeToPush("banner_click");
          }
          await showInstantPushNotification({
            title: "🎉 Mobile Push Notifications Active!",
            body: "You will now receive instant alerts whenever someone posts in your village.",
            actionUrl: "/timeline",
          });
        } else {
          toast.info("Notifications were blocked in your browser settings.");
        }
      }
    } catch (err) {
      console.error("[PushBanner] Error requesting permissions:", err);
    } finally {
      setLoading(false);
      setShowBanner(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("grammitra_push_banner_dismissed", "true");
      }
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
    <div className="fixed bottom-16 inset-x-3 sm:bottom-6 sm:inset-x-auto sm:right-6 z-[99999] max-w-md rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-emerald-950/95 p-3.5 text-white shadow-2xl backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/25 text-amber-400">
            <BellRing className="size-5 animate-bounce" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-extrabold text-amber-300">Turn On GramMitra Push Alerts</p>
            <p className="text-slate-300 truncate">
              Get instant alerts for jobs, land, market & Panchayat notices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-md transition hover:bg-amber-400 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Enabling..." : "Turn On"}
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification prompt"
            className="grid size-7 place-items-center rounded-lg bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white transition cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
