import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronRight, ChevronLeft, Volume2, VolumeX, CheckCircle2, PhoneCall, MapPin, PlusCircle, Sparkles } from "lucide-react";

export function VideoGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const guideSteps = [
    {
      step: "01",
      title: "Select Your Village & Mandal",
      titleTe: "1. మీ గ్రామాన్ని ఎంచుకోండి",
      desc: "Pick your village in Telangana, Andhra Pradesh, or India. Instant access to local workers, land, and notices.",
      descTe: "తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌లోని మీ గ్రామం మరియు మండలాన్ని సులభంగా ఎంచుకోండి.",
      icon: MapPin,
      badge: "Step 1 · గ్రామం ఎంపిక",
      bgGradient: "from-emerald-600 via-teal-700 to-emerald-900",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span>📍 Telangana / Andhra Pradesh</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2 text-sm font-black text-white">
            🏡 Selected: Kothur Village, Rangareddy
          </div>
          <div className="flex gap-2 text-[10px] font-bold">
            <span className="rounded-md bg-emerald-500/30 px-2 py-0.5">🌾 12 Workers</span>
            <span className="rounded-md bg-amber-500/30 px-2 py-0.5">🚜 5 Tractors</span>
            <span className="rounded-md bg-blue-500/30 px-2 py-0.5">📢 3 Notices</span>
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Post Requirement or Photo Proof",
      titleTe: "2. అవసరాన్ని పోస్ట్ చేయండి",
      desc: "Need tractor drivers? Have land to lease? Or reporting a damaged road? Attach a photo and post in 1 minute.",
      descTe: "పనివారు కావలెనా? పొలం కౌలుకు ఇవ్వాలా? రోడ్డు లేదా లైటు సమస్య ఉన్నదా? ఫొటో జతచేసి పోస్ట్ చేయండి.",
      icon: PlusCircle,
      badge: "Step 2 · పోస్ట్ చేయండి",
      bgGradient: "from-indigo-600 via-purple-700 to-indigo-900",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span>📸 Photo Proof Attached (5x responses)</span>
            <span className="text-emerald-400 font-black">✓ Verified</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2 text-xs font-bold text-white">
            🚨 "Streetlight broken near Bus Stop"
          </div>
          <p className="text-[10px] text-white/80">Posted to Gram Panchayat & entire village</p>
        </div>
      ),
    },
    {
      step: "03",
      title: "Connect Directly via Phone or WhatsApp",
      titleTe: "3. నేరుగా ఫోన్లో మాట్లాడండి",
      desc: "No middleman fees. Call or chat directly with verified neighbours and local shopkeepers.",
      descTe: "ఎలాంటి దళారులు లేదా కమీషన్లు లేవు. నేరుగా రైతు, కూలీ లేదా దుకాణదారుడితో ఫోనులో మాట్లాడండి.",
      icon: PhoneCall,
      badge: "Step 3 · నేరుగా కనెక్ట్ అవ్వండి",
      bgGradient: "from-amber-600 via-orange-700 to-amber-900",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
            <PhoneCall className="size-4 animate-bounce" /> Direct Call Connected
          </div>
          <p className="text-xs font-bold text-white">📞 Calling Ramesh (Tractor Driver) · 9876543210</p>
        </div>
      ),
    },
  ];

  const current = guideSteps[activeStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] grid place-items-center bg-black/80 p-4 backdrop-blur-xl animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-card text-foreground shadow-2xl"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground font-black text-xs">
                ▶️
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-clay">ManaOoru Video Guide</h3>
                <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  మన ఊరు పోర్టల్ ఎలా ఉపయోగించాలి? (How It Works)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMuted((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition"
              >
                {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5 text-emerald-600" />}
                <span>{muted ? "Muted" : "Telugu Audio"}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-destructive transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Animated Video Presentation Stage */}
          <div className={`relative bg-gradient-to-br ${current.bgGradient} p-6 sm:p-8 text-white min-h-[320px] flex flex-col justify-between transition-colors duration-500`}>
            {/* Step Badge */}
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                {current.badge}
              </span>
              <span className="text-3xl font-black text-white/40">{current.step} / 03</span>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="my-6 space-y-4"
              >
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight">
                    {current.titleTe}
                  </h2>
                  <p className="text-sm font-semibold text-white/90 mt-1">
                    {current.title}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                  {current.descTe} ({current.desc})
                </p>

                {/* Animated Simulated App Screen */}
                <div className="pt-2">
                  {current.animElements}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Timeline Dots & Navigation Controls */}
            <div className="flex items-center justify-between border-t border-white/20 pt-4">
              <div className="flex gap-2">
                {guideSteps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeStep ? "w-8 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1 + 3) % 3)}
                  className="grid size-8 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % 3)}
                  className="grid size-8 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-card flex items-center justify-between gap-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Sparkles className="size-4 text-emerald-600" />
              <span>Simple 3-step digital village experience</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:brightness-110 transition"
            >
              Start Using ManaOoru Now →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
