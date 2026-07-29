import { useEffect, useState } from "react";
import { Download, Smartphone, X, Check, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<boolean> => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    }
    return false;
  };

  return { deferredPrompt, isInstalled, triggerInstall };
}

export function InstallAppButton({
  variant = "pill",
  className = "",
}: {
  variant?: "pill" | "full" | "icon" | "drawer";
  className?: string;
}) {
  const { isInstalled, triggerInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleClick = async () => {
    const installed = await triggerInstall();
    if (!installed) {
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return (
      <a
        href="/"
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3.5 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 border border-emerald-300 shadow-sm transition hover:scale-105 active:scale-95"
      >
        <Check className="size-3.5 text-emerald-600" />
        <span>✅ App Installed (Open App)</span>
      </a>
    );
  }

  return (
    <>
      {variant === "pill" && (
        <button
          type="button"
          onClick={handleClick}
          className={`relative inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-primary to-teal-600 px-3.5 text-xs font-extrabold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95 ${className}`}
        >
          <Smartphone className="size-3.5 animate-pulse" />
          <span className="whitespace-nowrap">📲 Install App</span>
        </button>
      )}

      {variant === "drawer" && (
        <button
          type="button"
          onClick={handleClick}
          className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-emerald-600 via-primary to-teal-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg transition hover:brightness-110 active:scale-95 ${className}`}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="size-4 animate-bounce" />
            <span>📲 How to Download & Install App</span>
          </div>
          <span className="text-[10px] font-medium opacity-95">మా ఊరు యాప్ ఇన్స్టాల్ చేయండి</span>
        </button>
      )}

      {variant === "full" && (
        <button
          type="button"
          onClick={handleClick}
          className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-primary px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-emerald-500/25 active:scale-95 ${className}`}
        >
          <Download className="size-4" />
          <span>Install ManaOoru Mobile App</span>
        </button>
      )}

      {variant === "icon" && (
        <button
          type="button"
          onClick={handleClick}
          title="Install App"
          className={`grid size-9 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground ${className}`}
        >
          <Smartphone className="size-4" />
        </button>
      )}

      {/* Installation Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-white dark:bg-zinc-950 p-6 text-foreground shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <X className="size-4" />
              </button>

              <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Smartphone className="size-7" />
              </div>

              <h3 className="text-center font-display text-xl font-bold text-clay dark:text-white">
                Install ManaOoru App
              </h3>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                మా ఊరు యాప్ మీ ఫోన్‌లో ఇన్స్టాల్ చేసుకోండి
              </p>

              <div className="mt-5 space-y-3 rounded-2xl border border-border bg-muted/30 p-4 text-xs font-medium">
                {isIOS ? (
                  <>
                    <p className="font-bold text-primary">For iPhone / iPad (Safari):</p>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-white font-bold text-[10px]">
                        1
                      </span>
                      <span>Tap the <strong>Share</strong> button <Share className="inline size-3 text-blue-500" /> at bottom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-white font-bold text-[10px]">
                        2
                      </span>
                      <span>Scroll & tap <strong>Add to Home Screen</strong> (➕)</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-primary">For Android & Desktop Browser:</p>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-white font-bold text-[10px]">
                        1
                      </span>
                      <span>Tap browser menu (<strong>⋮</strong> or <strong>≡</strong>) top right</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-white font-bold text-[10px]">
                        2
                      </span>
                      <span>Select <strong>Install App</strong> or <strong>Add to Home screen</strong></span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="mt-6 w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110"
              >
                Got It / సరే
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
