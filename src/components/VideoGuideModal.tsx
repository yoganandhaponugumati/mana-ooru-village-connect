import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ChevronRight, ChevronLeft, Volume2, VolumeX, MapPin, PlusCircle, PhoneCall, AlertTriangle, ShieldCheck, Sparkles, Maximize2, Minimize2, Radio } from "lucide-react";

export function VideoGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const guideSteps = [
    {
      step: "01",
      title: "Select Your Village & Mandal",
      titleTe: "1. మీ గ్రామాన్ని ఎంచుకోండి",
      desc: "Instant access to local workers, land leases, and Panchayat notices in your exact village.",
      descTe: "మొదట మీ తెలంగాణ లేదా ఆంధ్రప్రదేశ్ జిల్లా, మండలం మరియు గ్రామాన్ని ఎంచుకోండి.",
      teluguSpeech: "స్వాగతం! మొదట మీ తెలంగాణ లేదా ఆంధ్రప్రదేశ్ జిల్లా, మండలం మరియు గ్రామాన్ని ఎంచుకోండి. దీనితో మీ ఊరి పనివారు, పొలాలు మరియు నోటీసులు ఉచితంగా చూడవచ్చు.",
      icon: MapPin,
      badge: "Step 1 · గ్రామం ఎంపిక",
      bgGradient: "from-emerald-700 via-teal-800 to-emerald-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <MapPin className="size-4 animate-bounce" />
            <span>📍 Telangana & Andhra Pradesh 100% Mandals</span>
          </div>
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3 text-sm font-black text-white">
            🏡 Selected: Kothur Village, Rangareddy District
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-center">
            <span className="rounded-lg bg-emerald-500/30 px-2 py-1.5 border border-emerald-400/30">🌾 18 Workers</span>
            <span className="rounded-lg bg-amber-500/30 px-2 py-1.5 border border-amber-400/30">🚜 8 Tractors</span>
            <span className="rounded-lg bg-blue-500/30 px-2 py-1.5 border border-blue-400/30">📢 5 Notices</span>
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Hire Workers & Tractor Drivers",
      titleTe: "2. కూలీలు & ట్రాక్టర్ డ్రైవర్లను వెతకండి",
      desc: "Need daily wage farm helpers, tractor drivers, or electricians? Call directly without middleman fees.",
      descTe: "వ్యవసాయ పనులకు కూలీలు లేదా ట్రాక్టర్ డ్రైవర్ కావాలా? వర్కర్స్ విభాగానికి వెళ్లి నేరుగా మాట్లాడండి.",
      teluguSpeech: "వ్యవసాయ పనులకు కూలీలు లేదా ట్రాక్టర్ డ్రైవర్ కావాలా? వర్కర్స్ విభాగానికి వెళ్లి నేరుగా ఫోన్ చేసి మాట్లాడండి.",
      icon: PlusCircle,
      badge: "Step 2 · పనివారు & ట్రాక్టర్లు",
      bgGradient: "from-indigo-700 via-purple-800 to-indigo-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
            <span>🚜 Tractor Driver Available</span>
            <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-emerald-300 font-extrabold">₹900/day</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 text-xs font-bold text-white flex items-center justify-between">
            <span>👨‍🌾 Ramesh (Experienced Rotavator Driver)</span>
            <span className="text-emerald-400 font-black">📞 Call Direct</span>
          </div>
          <p className="text-[10px] text-indigo-200">Zero commission fees · Direct neighbour connection</p>
        </div>
      ),
    },
    {
      step: "03",
      title: "Land Lease & Grain Marketplace",
      titleTe: "3. పొలం కౌలు & ధాన్యం అమ్మకాలు",
      desc: "Post farmland for lease or list paddy, milk, and seeds with photos for 5x response.",
      descTe: "మీ పంట పొలాలు కౌలుకు ఇవ్వడానికి లేదా ధాన్యం అమ్మడానికి ఒక ఫొటో ప్రూఫ్‌తో ఉచితంగా పోస్ట్ చేయండి.",
      teluguSpeech: "మీ పంట పొలాలు కౌలుకు ఇవ్వడానికి లేదా ధాన్యం అమ్మడానికి ఒక ఫొటో ప్రూఫ్‌తో ఉచితంగా ప్రకటన పోస్ట్ చేయండి.",
      icon: ShieldCheck,
      badge: "Step 3 · మార్కెట్ & కౌలు",
      bgGradient: "from-amber-700 via-orange-800 to-amber-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>🌾 3 Acres Black Soil Farmland for Lease</span>
            <span className="text-emerald-400 font-black">📸 Photo Proof</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2 text-xs font-bold text-white">
            💧 Borewell water + Road access · Dasarlapally
          </div>
        </div>
      ),
    },
    {
      step: "04",
      title: "Report Village Problems with Photo Proof",
      titleTe: "4. రోడ్లు & కరెంట్ సమస్యలపై ఫిర్యాదు",
      desc: "Upload photo proof of damaged CC roads, overflowing drainage, or broken streetlights.",
      descTe: "పాడైపోయిన రోడ్లు, డ్రైనేజీ లేదా కరెంట్ సమస్యలను ఫొటో తీసి గ్రామ పంచాయతీ దృష్టికి తీసుకెళ్లండి.",
      teluguSpeech: "పాడైపోయిన రోడ్లు, డ్రైనేజీ లేదా కరెంట్ సమస్యలను ఫొటో తీసి గ్రామ పంచాయతీ అధికారుల దృష్టికి తీసుకెళ్లండి.",
      icon: AlertTriangle,
      badge: "Step 4 · గ్రామ సమస్యలు",
      bgGradient: "from-rose-700 via-red-800 to-rose-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>🚨 Civic Complaint Posted</span>
            <span className="text-amber-300 font-extrabold">👍 14 Village Upvotes</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2 text-xs font-bold text-white">
            🚰 Water leakage near main bus stop
          </div>
        </div>
      ),
    },
    {
      step: "05",
      title: "100% Free & No Middlemen",
      titleTe: "5. పూర్తిగా ఉచితం & ఎలాంటి దళారులు లేరు",
      desc: "Direct phone connection with neighbours. Built specifically for Telangana & AP villages.",
      descTe: "మన ఊరు యాప్ పూర్తిగా ఉచితం! ఎలాంటి దళారులు లేకుండా మీ గ్రామస్తులతో నేరుగా కనెక్ట్ అవ్వండి.",
      teluguSpeech: "మన ఊరు యాప్ పూర్తిగా ఉచితం! ఎలాంటి దళారులు లేకుండా మీ గ్రామస్తులతో నేరుగా కనెక్ట్ అవ్వండి.",
      icon: PhoneCall,
      badge: "Step 5 · 100% ఉచిత సేవ",
      bgGradient: "from-teal-700 via-emerald-800 to-teal-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-md text-white text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
            <PhoneCall className="size-4 animate-bounce" /> Direct Call Connected
          </div>
          <p className="text-xs font-bold text-white">📞 Connect with Gram Panchayat & Village Neighbours</p>
        </div>
      ),
    },
  ];

  // Speech Synthesis Helper
  const speakStepTelugu = (stepIdx: number) => {
    if (muted || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const textToSpeak = guideSteps[stepIdx].teluguSpeech;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Try finding Telugu or Indian English/Hindi fallback voices
      const voices = window.speechSynthesis.getVoices();
      const teluguVoice = voices.find(
        (v) => v.lang.includes("te") || v.name.toLowerCase().includes("telugu")
      );
      const indianVoice = voices.find(
        (v) => v.lang.includes("in") || v.lang.includes("hi")
      );
      if (teluguVoice) utterance.voice = teluguVoice;
      else if (indianVoice) utterance.voice = indianVoice;

      utterance.lang = "te-IN";
      utterance.rate = 0.88; // Slower pace for rural comprehension
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    speakStepTelugu(activeStep);

    if (!isPaused) {
      timerRef.current = setTimeout(() => {
        setActiveStep((prev) => (prev + 1) % guideSteps.length);
      }, 7000); // 7s per step
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, activeStep, isPaused, muted]);

  if (!isOpen) return null;

  const current = guideSteps[activeStep];

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (next && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else if (!next) {
        speakStepTelugu(activeStep);
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-[99999] grid place-items-center bg-black/90 p-2 sm:p-4 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto ${isFullscreen ? "p-0" : ""}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full ${isFullscreen ? "h-screen rounded-none" : "max-w-4xl rounded-3xl min-h-[600px]"} overflow-hidden border border-white/20 bg-card text-foreground shadow-2xl flex flex-col justify-between`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-md">
                🎬
              </div>
              <div>
                <h3 className="font-display text-base font-extrabold text-clay flex items-center gap-2">
                  ManaOoru Video Guide · ఎలా ఉపయోగించాలి?
                  {isSpeaking && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-400 border border-emerald-500/30">
                      <Radio className="size-3 animate-pulse text-emerald-400" />
                      🔊 Telugu Voice Speaking
                    </span>
                  )}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  మన ఊరు డిజిటల్ సేవలు (Learn Core Features)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                  muted
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4 animate-pulse text-emerald-400" />}
                <span>{muted ? "Muted (మ్యూట్)" : "Telugu Audio (ఆడియో ON)"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen((v) => !v)}
                className="hidden sm:grid size-9 place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-primary transition"
                title="Fullscreen Toggle"
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="grid size-9 place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-destructive transition"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Main Animated Cinema Stage */}
          <div className={`relative bg-gradient-to-br ${current.bgGradient} p-6 sm:p-10 text-white flex-1 flex flex-col justify-between transition-colors duration-700 overflow-hidden`}>
            {/* Background Glows */}
            <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 size-80 rounded-full bg-black/30 blur-3xl" />

            {/* Top Bar inside Stage */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider backdrop-blur-md border border-white/20">
                {current.badge}
              </span>
              <span className="text-4xl font-black text-white/30">{current.step} / 05</span>
            </div>

            {/* Dynamic Step Animated Presentation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 my-6 grid gap-6 md:grid-cols-2 md:items-center"
              >
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-2xl sm:text-4xl font-black text-white leading-tight">
                      {current.titleTe}
                    </h2>
                    <p className="text-base font-bold text-white/90 mt-1">
                      {current.title}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium">
                    {current.descTe} ({current.desc})
                  </p>

                  {/* Audio Visualizer Waves */}
                  {!muted && isSpeaking && (
                    <div className="flex items-center gap-1.5 pt-2 text-emerald-300 font-bold text-xs">
                      <span className="relative flex size-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
                      </span>
                      <span>🔊 Speaking Telugu voice narration...</span>
                    </div>
                  )}
                </div>

                {/* Animated UI Mockup */}
                <div className="relative">
                  {current.animElements}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Stage Bottom Navigation Bar */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-4">
              <div className="flex items-center gap-2">
                {guideSteps.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStep(idx)}
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      idx === activeStep ? "w-10 bg-white shadow-lg" : "w-2.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaused((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-3.5 py-1.5 text-xs font-bold text-white transition"
                >
                  {isPaused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                  <span>{isPaused ? "Play Auto-cycle" : "Pause"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1 + guideSteps.length) % guideSteps.length)}
                  className="grid size-9 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % guideSteps.length)}
                  className="grid size-9 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                  aria-label="Next step"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-card flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Sparkles className="size-4 text-emerald-600 shrink-0" />
              <span>మన ఊరు డిజిటల్ నెట్‌వర్క్ · 100% ఉచిత సేవలు</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3 text-xs font-black text-white shadow-lg hover:brightness-110 transition"
            >
              Start Using ManaOoru Now (ప్రారంభించండి) →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
