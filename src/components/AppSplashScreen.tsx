import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

export function AppSplashScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasSeen = sessionStorage.getItem("grammitra_splash_seen");
    if (!hasSeen) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        sessionStorage.setItem("grammitra_splash_seen", "true");
      }, 1700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem("grammitra_splash_seen", "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.35, ease: "easeInOut" } }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[9999999] flex flex-col items-center justify-between bg-zinc-950 text-white select-none overflow-hidden cursor-pointer"
        >
          {/* Ambient Glowing Background Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-emerald-500/20 blur-[100px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 size-72 rounded-full bg-amber-500/15 blur-[90px] animate-pulse duration-[3000ms] pointer-events-none" />

          {/* Top Badge */}
          <div className="pt-12 z-10 flex items-center gap-1.5 text-xs font-black tracking-widest uppercase text-emerald-400/80">
            <ShieldCheck className="size-4" />
            <span>Digital Gram Panchayat OS</span>
          </div>

          {/* Center Brand Identity */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {/* Animated Logo Container with Pulsing Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 opacity-60 blur-md animate-pulse" />
              <div className="relative size-24 sm:size-28 rounded-full border-2 border-white/30 bg-zinc-900/90 p-3 shadow-2xl flex items-center justify-center backdrop-blur-xl">
                <img
                  src="/logo.webp"
                  alt="GramMitra Emblem"
                  width="100"
                  height="100"
                  className="size-full object-contain drop-shadow-md"
                />
              </div>
            </motion.div>

            {/* Title & Tagline */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight drop-shadow-lg">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                  GramMitra
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base font-bold text-zinc-300 tracking-wide flex items-center justify-center gap-2">
                <span>మా ఊరు</span>
                <span className="size-1 rounded-full bg-emerald-400" />
                <span>మన డిజిటల్ వ్యవస్థ</span>
              </p>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Loading Indicator */}
          <div className="pb-12 z-10 w-full max-w-xs px-6 flex flex-col items-center gap-3">
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-amber-400 rounded-full"
              />
            </div>
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="size-3 text-amber-400 animate-spin" />
              <span>Connecting Village Ecosystem...</span>
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
