import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, ChevronRight, ChevronLeft, Volume2, VolumeX, MapPin, Megaphone, AlertTriangle, Landmark, PhoneCall, Sparkles, Maximize2, Minimize2, Radio, CheckCircle2, Award, ArrowRight } from "lucide-react";

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
  const [isFullscreen, setIsFullscreen] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Soft Web Audio API Sound Chime when step changes
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      console.debug("Audio chime skipped", e);
    }
  };

  // 5 Feature-Specific Video Guide Steps (Each step is 100% focused on ONE feature!)
  const guideSteps = [
    {
      step: "01",
      title: "Why Should You Use ManaOoru?",
      titleTe: "1. మన ఊరు పరిచయం & మీ గ్రామాన్ని ఎంచుకోవడం",
      desc: "Complete digital home for your village. Access local workers, land, notices, and emergency contacts in 1 place.",
      descTe: "మన గ్రామంలోని నోటీసులు, రోడ్ల సమస్యలు, ప్రభుత్వ పథకాలు మరియు పనివారి వివరాలు దళారులు లేకుండా ఉచితంగా తెలుసుకోవడానికి మన ఊరు ఉపయోగపడుతుంది.",
      teluguSpeech: "నమస్కారం! మన ఊరు యాప్‌కి స్వాగతం. మొదట మీ జిల్లా, మండలం మరియు గ్రామాన్ని ఎంచుకోండి. దీనితో మీ గ్రామంలో ఉన్న పనివారు, పంట పొలాలు, పంచాయతీ నోటీసులు మరియు అత్యవసర సేవలు అన్నీ ఉచితంగా మీ ఫోన్‌లోనే చూడవచ్చు.",
      icon: Sparkles,
      badge: "Feature 1 · మన ఊరు పరిచయం",
      bgGradient: "from-emerald-800 via-teal-900 to-emerald-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/50 p-4 backdrop-blur-md text-white space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>🏡 100% Free Village Platform</span>
            <span className="rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-emerald-200">Zero Middlemen</span>
          </div>
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-3 text-sm font-black text-white">
            📍 Selected Village: Kothur, Rangareddy District
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="rounded-xl bg-white/10 p-2.5 flex items-center gap-2">
              <Megaphone className="size-4 text-emerald-400" /> 📢 Panchayat Notices
            </div>
            <div className="rounded-xl bg-white/10 p-2.5 flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-400" /> 🚨 Report Problems
            </div>
          </div>
        </div>
      ),
    },
    {
      step: "02",
      title: "Check & Post Village Notices",
      titleTe: "2. గ్రామ నోటీసులు చూడడం & పోస్ట్ చేయడం",
      desc: "Panchayat announcements, power cuts, water supply notices, and medical health camps.",
      descTe: "గ్రామ నోటీసులు విభాగానికి వెళ్లి పంచాయతీ ప్రచారాలు, కరెంట్ కోతలు, మరియు ఆరోగ్య శిబిరాల నోటీసులు చూడవచ్చు. మీరు కూడా గ్రామ సమాచారాన్ని పోస్ట్ చేయవచ్చు.",
      teluguSpeech: "రెండవది, గ్రామ నోటీసులు. పంచాయతీ కార్యాలయ ప్రచారాలు, కరెంట్ కోతల సమాచారం, నీటి సరఫరా మరియు ఉచిత వైద్య శిబిరాల నోటీసులు ఇక్కడ చూడవచ్చు. అలాగే మీ గ్రామానికి చెందిన ఏ సమాచారాన్నైనా మీరు ఉచితంగా పోస్ట్ చేయవచ్చు.",
      icon: Megaphone,
      badge: "Feature 2 · గ్రామ నోటీసులు",
      bgGradient: "from-teal-800 via-emerald-900 to-teal-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/50 p-4 backdrop-blur-md text-white space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-teal-300">
            <span>📌 Pinned Official Panchayat Notice</span>
            <span className="text-emerald-400">Gram Panchayat</span>
          </div>
          <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/30 p-3 text-xs font-bold text-white">
            📢 "Free Medical Health Camp this Sunday at Panchayat Office (9 AM - 1 PM)"
          </div>
          <div className="flex justify-end">
            <span className="rounded-xl bg-white/20 px-3.5 py-1.5 text-xs font-black text-white">+ Post Village Notice</span>
          </div>
        </div>
      ),
    },
    {
      step: "03",
      title: "Report Civic Problems with Photo Proof",
      titleTe: "3. రోడ్లు & కరెంట్ సమస్యలపై ఫొటో ప్రూఫ్‌తో ఫిర్యాదు",
      desc: "Report damaged CC roads, water leakage, or broken streetlights directly to Sarpanch with photo proof.",
      descTe: "మీ గ్రామంలో పాడైపోయిన రోడ్లు, డ్రైనేజీ లేదా వీధిదీపాల సమస్యలు ఉంటే, ఒక ఫొటో తీసి ఫిర్యాదు చేయండి. పంచాయతీ అధికారులు చర్యలు తీసుకుంటారు.",
      teluguSpeech: "మూడవది, గ్రామ సమస్యలపై ఫిర్యాదు. మీ ఊరిలో పాడైపోయిన సీసీ రోడ్లు, నీటి లీకేజీలు, లేదా విరిగిపోయిన వీధిదీపాల సమస్యలు ఉంటే, ఒక ఫొటో తీసి జతచేయండి. మీ ఫిర్యాదు నేరుగా గ్రామ పంచాయతీ అధికారుల దృష్టికి వెళ్తుంది.",
      icon: AlertTriangle,
      badge: "Feature 3 · సమస్యలపై ఫిర్యాదు",
      bgGradient: "from-rose-800 via-red-900 to-rose-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/50 p-4 backdrop-blur-md text-white space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-rose-300">
            <span>📸 Photo Proof Attached (Road Damage)</span>
            <span className="rounded-full bg-rose-500/30 px-2.5 py-0.5 text-rose-200">Pending Action</span>
          </div>
          <div className="rounded-xl bg-white/10 p-2.5 text-xs font-bold text-white">
            🚨 "CC Road cracked & drainage water near Bus Stop"
          </div>
          <p className="text-[10px] text-rose-200">👍 18 Village Upvotes · Sent to Sarpanch Desk</p>
        </div>
      ),
    },
    {
      step: "04",
      title: "Government Schemes & Citizen Services",
      titleTe: "4. ప్రభుత్వ పథకాలు & సేవలు పొందే విధానం",
      desc: "Access PM-KISAN, Rythu Bharosa, crop insurance, pensions, and Aadhaar update services with direct official links.",
      descTe: "రైతు భరోసా, పీఎం కిసాన్, ఆసరా పింఛన్లు మరియు ఆధార్ కార్డు సేవలను పథకాల విభాగంలో ఉచితంగా తనిఖీ చేసి దరఖాస్తు చేసుకోవచ్చు.",
      teluguSpeech: "నాల్గవది, ప్రభుత్వ పథకాలు. రైతు భరోసా, పీఎం కిసాన్, క్రాప్ ఇన్సూరెన్స్, ఆసరా పింఛన్లు మరియు ఆధార్ కార్డు సేవలకు సంబంధించిన వివరాలు మరియు అధికారిక వెబ్‌సైట్ లింక్‌లు పథకాల విభాగంలో ఉచితంగా పొందవచ్చు.",
      icon: Landmark,
      badge: "Feature 4 · ప్రభుత్వ పథకాలు",
      bgGradient: "from-amber-800 via-orange-900 to-amber-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/50 p-4 backdrop-blur-md text-white space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span>🏛️ Official Government Schemes Desk</span>
            <span className="text-emerald-400 font-extrabold">100% Free Links</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-white">
            <div className="rounded-xl bg-white/10 p-2">🌾 PM-KISAN ₹6,000/yr</div>
            <div className="rounded-xl bg-white/10 p-2">🛡️ PM Fasal Bima</div>
            <div className="rounded-xl bg-white/10 p-2">☀️ Solar Pump KUSUM</div>
            <div className="rounded-xl bg-white/10 p-2">💳 Aadhaar & Ration</div>
          </div>
        </div>
      ),
    },
    {
      step: "05",
      title: "Hire Workers, Farmland & Direct Phone Calls",
      titleTe: "5. పనివారు, పొలాలు కౌలు & నేరుగా మాట్లాడడం",
      desc: "Hire tractor drivers, daily wage farm helpers, or lease farmland without middleman commission fees.",
      descTe: "కూలీలు, పొలాలు కౌలు లేదా మార్కెట్ ఉత్పత్తుల కోసం ఎలాంటి కమీషన్లు లేకుండా మీ గ్రామస్తులతో నేరుగా ఫోన్ చేసి మాట్లాడండి.",
      teluguSpeech: "ఐదవది, నేరుగా మాట్లాడడం. వ్యవసాయ కూలీలు, ట్రాక్టర్ డ్రైవర్లు, లేదా పొలాలు కౌలుకు ఇవ్వడానికి ఎలాంటి దళారులు లేదా కమీషన్లు లేకుండా నేరుగా ఫోన్ చేసి మాట్లాడవచ్చు.",
      icon: PhoneCall,
      badge: "Feature 5 · నేరుగా మాట్లాడండి",
      bgGradient: "from-indigo-800 via-purple-900 to-indigo-950",
      animElements: (
        <div className="rounded-2xl border border-white/20 bg-black/50 p-4 backdrop-blur-md text-white text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
            <PhoneCall className="size-4 animate-bounce" /> Direct Call Connected
          </div>
          <p className="text-xs font-bold text-white">📞 Call Tractor Drivers & Land Owners Directly</p>
        </div>
      ),
    },
  ];

  // Speech Synthesis Helper: Ensures current feature is 100% SPOKEN before moving to next
  const speakStepTelugu = (stepIdx: number) => {
    if (muted || !("speechSynthesis" in window)) {
      // Fallback timer if muted or speech unsupported
      if (!isPaused) {
        timerRef.current = setTimeout(() => {
          setActiveStep((prev) => (prev + 1) % guideSteps.length);
        }, 9000);
      }
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);

      const textToSpeak = guideSteps[stepIdx].teluguSpeech;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

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
      utterance.rate = 0.82; // Slower, clear, natural pace for rural comprehension
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      
      // CRITICAL: Advance to next step ONLY AFTER current speech has 100% FINISHED!
      utterance.onend = () => {
        setIsSpeaking(false);
        if (!isPaused) {
          timerRef.current = setTimeout(() => {
            setActiveStep((prev) => (prev + 1) % guideSteps.length);
          }, 1800); // 1.8s pause after speech ends before next feature
        }
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        if (!isPaused) {
          timerRef.current = setTimeout(() => {
            setActiveStep((prev) => (prev + 1) % guideSteps.length);
          }, 7000);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error", e);
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsSpeaking(false);
      return;
    }

    playChimeSound();
    speakStepTelugu(activeStep);

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
      <div className={`fixed inset-0 z-[99999] grid place-items-center bg-black/95 p-2 sm:p-4 backdrop-blur-2xl animate-in fade-in duration-200 overflow-y-auto ${isFullscreen ? "p-0" : ""}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full ${isFullscreen ? "h-screen rounded-none" : "max-w-5xl rounded-3xl min-h-[640px]"} overflow-hidden border border-white/20 bg-card text-foreground shadow-2xl flex flex-col justify-between`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-black text-base shadow-lg">
                🎬
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-extrabold text-clay flex items-center gap-2">
                  ManaOoru Feature Guide · ప్రతీ ఫీచర్ వివరణ
                  {isSpeaking && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-black text-emerald-400 border border-emerald-500/30">
                      <Radio className="size-3.5 animate-pulse text-emerald-400" />
                      🔊 Explaining Feature Now...
                    </span>
                  )}
                </h3>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  ఒక్కొక్క ఫీచర్ పూర్తిగా వివరించిన తర్వాత తరువాతి దానికి వెళ్తుంది (Complete Feature Walkthrough)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
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
                className="hidden sm:grid size-10 place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-primary transition"
                title="Toggle Fullscreen Mode"
              >
                {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="grid size-10 place-items-center rounded-full bg-background border border-border text-muted-foreground hover:text-destructive transition"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Main Animated Cinema Stage */}
          <div className={`relative bg-gradient-to-br ${current.bgGradient} p-6 sm:p-12 text-white flex-1 flex flex-col justify-between transition-colors duration-700 overflow-hidden`}>
            {/* Background Glows */}
            <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 size-96 rounded-full bg-black/40 blur-3xl" />

            {/* Top Bar inside Cinema Stage */}
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
                className="relative z-10 my-6 grid gap-8 md:grid-cols-2 md:items-center"
              >
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-3xl sm:text-5xl font-black text-white leading-tight">
                      {current.titleTe}
                    </h2>
                    <p className="text-base sm:text-lg font-bold text-white/90 mt-1.5">
                      {current.title}
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-white/85 leading-relaxed font-medium">
                    {current.descTe} ({current.desc})
                  </p>

                  {/* Audio Visualizer Waves */}
                  {!muted && isSpeaking && (
                    <div className="flex items-center gap-2 pt-2 text-emerald-300 font-bold text-xs bg-black/30 rounded-xl px-3.5 py-2 border border-emerald-400/30 w-fit">
                      <span className="relative flex size-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-3 rounded-full bg-emerald-400" />
                      </span>
                      <span>🔊 Explaining this feature completely in Telugu...</span>
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
                    className={`h-3 rounded-full transition-all duration-500 ${
                      idx === activeStep ? "w-12 bg-white shadow-xl" : "w-3 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPaused((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-bold text-white transition"
                >
                  {isPaused ? <Play className="size-4" /> : <Pause className="size-4" />}
                  <span>{isPaused ? "Play Auto-cycle" : "Pause"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1 + guideSteps.length) % guideSteps.length)}
                  className="grid size-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                  aria-label="Previous feature"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev + 1) % guideSteps.length)}
                  className="grid size-10 place-items-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                  aria-label="Next feature"
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
              <span>మన ఊరు డిజిటల్ నెట్‌వర్క్ · 100% ఉచిత సేవలు (Free Village OS)</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-8 py-3 text-xs font-black text-white shadow-xl hover:brightness-110 transition"
            >
              Start Using ManaOoru Now (ప్రారంభించండి) →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
