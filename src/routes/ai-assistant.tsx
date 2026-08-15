import { createFileRoute, Link } from "@tanstack/react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Bot,
  Brain,
  CloudSun,
  Languages,
  Leaf,
  Mic,
  Send,
  ShieldQuestion,
  Sparkles,
  Stethoscope,
  Users,
  Volume2,
  Copy,
  Share2,
  Check,
  Loader2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FeatureIcon, SurfaceCard } from "@/components/design-system";
import { useVillagePreferences } from "@/lib/village-preferences";
import { toast } from "sonner";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — GramMitra" }] }),
  component: AiAssistantPage,
});

const prompts = [
  { label: "Crop Suggestions", key: "crop", icon: Leaf, desc: "Best crops for soil & season" },
  {
    label: "Disease & Pest Control",
    key: "pest",
    icon: Stethoscope,
    desc: "Pest identification & organic spray",
  },
  {
    label: "Weather Forecast Advice",
    key: "weather",
    icon: CloudSun,
    desc: "Rain alerts & irrigation advice",
  },
  {
    label: "Government Schemes",
    key: "schemes",
    icon: ShieldQuestion,
    desc: "Rythu Bharosa, PM-Kisan & Pensions",
  },
  {
    label: "Nearby Workers & Equipment",
    key: "workers",
    icon: Users,
    desc: "Tractor, labor & electric services",
  },
  {
    label: "Gram Panchayat Services",
    key: "services",
    icon: Brain,
    desc: "MeeSeva certificates & Dharani 1B",
  },
];

/**
 * High-speed local rural knowledge engine for instantaneous (<100ms) answers.
 */
function getSmartLocalResponse(
  query: string,
  lang: string,
  village: string,
  weatherText: string,
): string {
  const q = query.toLowerCase();

  // 1. Crop / Farming
  if (/crop|seed|harvest|paddy|rice|cotton|chilli|soil|fertilizer|వరి|పంట|వ్యవసాయం|ఫసల్/i.test(q)) {
    if (lang === "te") {
      return `🌱 **పంట సలహా (${village || "మీ గ్రామం"}):**\n\n- **ప్రస్తుత సీజన్ అనుకూల పంటలు:** వరి, పత్తి, మిరప, కంది మరియు వేరుశనగ.\n- **ఎరువుల యాజమాన్యం:** విత్తే ముందు ఎకరానికి 4 టన్నుల సేంద్రీయ ఎరువును వర్తించండి. రసాయనిక ఎరువులు వాడే ముందు మట్టి పరీక్ష చేయించండి.\n- **వాతావరణ హెచ్చరిక:** ${weatherText}.\n\n💡 మరింత సమాచారం కోసం పంచాయతీ వ్యవసాయ అధికారి (AO) గారిని కలవండి.`;
    }
    if (lang === "hi") {
      return `🌱 **फसल सलाह (${village || "आपका गाँव"}):**\n\n- **उपयुक्त फसलें:** धान, कपास, मिर्च, अरहर और मूंगफली।\n- **उर्वरक प्रबंधन:** बुवाई से पहले प्रति एकड़ 4 टन जैविक खाद डालें।\n- **मौसम अपडेट:** ${weatherText}।\n\n💡 विस्तृत सहायता के लिए पंचायत कृषि अधिकारी से संपर्क करें।`;
    }
    return `🌱 **Crop Advisory (${village || "Your Village"}):**\n\n- **Recommended Crops:** Paddy, Cotton, Chilli, Red Gram, and Groundnut.\n- **Soil & Fertilizer:** Apply 4 tons of farmyard manure per acre before sowing. Conduct soil testing before heavy NPK application.\n- **Live Weather Impact:** ${weatherText}.\n\n💡 Consult your Mandal Agricultural Officer for subsidized seeds.`;
  }

  // 2. Pest & Disease
  if (/pest|disease|leaf|insect|worm|spray|neem|పురుగు|తెగులు|మందు|कीड़ा|बीमारी/i.test(q)) {
    if (lang === "te") {
      return `🩺 **సస్యరక్షణ & తెగుళ్ల నివారణ:**\n\n- **జైవిక నివారణ:** 15 లీటర్ల నీటిలో 50మి.లీ వేప నూనె (10,000 ppm) కలిపి పిచికారీ చేయండి.\n- **కాండం తొలుచు పురుగు:** ఎకరానికి 4 లింగ ఆకర్షణ బుట్టలు (Pheromone traps) ఏర్పాటు చేయండి.\n- **ఆకు మచ్చ తెగులు:** మచ్చలు ఎక్కువగా ఉంటే కార్బెండజిమ్ 1 గ్రాము లీటరు నీటికి కలిపి పిచికారీ చేయండి.`;
    }
    if (lang === "hi") {
      return `🩺 **कीट एवं रोग नियंत्रण:**\n\n- **जैविक उपाय:** 15 लीटर पानी में 50ml नीम का तेल मिलाकर छिड़काव करें।\n- **तना छेदक:** प्रति एकड़ 4 फेरोमोन ट्रैप लगाएं।\n- **पत्ती धब्बा रोग:** कार्बोडाज़िम 1 ग्राम प्रति लीटर पानी में मिलाकर स्प्रे करें।`;
    }
    return `🩺 **Pest & Disease Control Advisory:**\n\n- **Biological Spray:** Mix 50ml Neem Oil (10,000 ppm) in 15 Liters of water for aphid and caterpillar control.\n- **Stem Borer:** Install 4 Pheromone traps per acre for early detection.\n- **Fungal Leaf Spot:** Spray Carbendazim 1g per Liter of water during early dry hours.`;
  }

  // 3. Schemes
  if (
    /scheme|pension|kisan|rythu|aasara|money|fund|subsid|పథకం|పెన్షన్|రైతు బంధు|योजना|पेंशन/i.test(
      q,
    )
  ) {
    if (lang === "te") {
      return `🏛️ **ముఖ్యమైన ప్రభుత్వ సంక్షేమ పథకాలు:**\n\n1. **రైతు బంధు / రైతు భరోసా:** సాగు పెట్టుబడి సాయం ఎకరానికి రూ.5,000 - రూ.7,500 direct bank transfer.\n2. **PM-Kisan:** ఏటా రూ.6,000 మూడు విడతల్లో జమ.\n3. **ఆసరా పెన్షన్లు:** వృద్ధులు, వితంతువులు, చేనేత మరియు దివ్యాంగులకు నెలవారీ ఆర్థిక చేయూత.\n4. **ఉపాధి హామీ (NREGS):** గ్రామాల్లో 100 రోజుల వేతన ఉపాధి.\n\n📄 **కావాల్సిన పత్రాలు:** ఆధార్ కార్డ్, పట్టాదార్ పాస్‌బుక్, బ్యాంక్ ఖాతా మరియు రేషన్ కార్డ్.`;
    }
    if (lang === "hi") {
      return `🏛️ **प्रमुख सरकारी योजनाएं:**\n\n1. **पीएम-किसान सम्मान निधि:** सालाना ₹6,000 तीन किश्तों में।\n2. **रैथु भरोसा / किसान सहायता:** प्रति एकड़ ₹5,000 - ₹7,500 सीधा बैंक खाते में।\n3. **आसरा पेंशन:** बुजुर्गों, विधवाओं और दिव्यांगों के लिए मासिक पेंशन।\n4. **मनरेगा (NREGS):** गाँव में 100 दिनों का रोजगार।\n\n📄 **आवश्यक दस्तावेज:** आधार कार्ड, बैंक पासबुक और राशन कार्ड।`;
    }
    return `🏛️ **Government Welfare Schemes Checklist:**\n\n1. **PM-Kisan Samman Nidhi:** ₹6,000 annual income support in 3 instalments.\n2. **Rythu Bharosa / State Agri Support:** Direct bank transfer for crop investment.\n3. **Aasara Pensions:** Monthly financial assistance for seniors, widows, and disabled citizens.\n4. **NREGS Work Card:** 100 days guaranteed wage employment per household.\n\n📄 **Documents Needed:** Aadhaar Card, Dharani/Pahani Land Passbook, Bank Passbook & Ration Card.`;
  }

  // 4. Weather
  if (/weather|rain|temperature|cloud|wind|వర్షం|వాతావరణం|ఎండ|मौसम|बारिश/i.test(q)) {
    if (lang === "te") {
      return `🌤️ **గ్రామ వాతావరణ నివేదిక (${village || "మీ ప్రాంతం"}):**\n\n- **ప్రస్తుత ఉష్ణోగ్రత:** ${weatherText}.\n- **రైతులకు సలహా:** వర్ష సూచన ఉన్నప్పుడు ఎరువుల పిచికారీ మరియు నీటి పారుదల వాయిదా వేయండి. ధాన్యం నిల్వలను తడివకుండా తార్పాలిన్లతో కప్పండి.`;
    }
    return `🌤️ **Live Village Weather Advisory (${village || "Your Village"}):**\n\n- **Current Status:** ${weatherText}.\n- **Farming Advice:** Postpone pesticide spraying if rain alert is high. Cover harvested grains with tarpaulin sheets to prevent moisture damage.`;
  }

  // 5. Default General Response
  if (lang === "te") {
    return `🌾 **గ్రామమిత్ర AI సలహాదారు (${village || "గ్రామం"}):**\n\nమీరు అడిగిన **"${query}"** ప్రశ్నకు సంబంధించి:\n- **వ్యవసాయం:** మీ పొలం భూసార వివరాల ఆధారంగా విత్తనాలు ఎంచుకోండి.\n- **ప్రభుత్వ సేవలు:** మీ సమీప మీసేవ లేదా గ్రామ పంచాయతీ కార్యాలయంలో దరఖాస్తు చేసుకోండి.\n- **నేరుగా మాట్లాడండి:** సర్పంచ్ లేదా విఆర్ఓ సంప్రదింపుల కోసం '/government' పేజీ చూడండి.`;
  }
  if (lang === "hi") {
    return `🌾 **ग्राममित्र AI सलाहकार (${village || "गाँव"}):**\n\nआपके प्रश्न **"${query}"** के बारे में:\n- **कृषि सहायता:** मिट्टी की जांच के आधार पर फसल का चयन करें।\n- **सरकारी सेवाएं:** निकटतम मी-सेवा या पंचायत भवन से संपर्क करें।\n- **सरकारी अधिकारी:** '/government' पेज पर जाकर अधिकारियों से बात करें।`;
  }
  return `🌾 **GramMitra AI Assistant (${village || "Village"}):**\n\nRegarding **"${query}"**:\n- **Agriculture:** Choose verified seeds based on local soil and moisture conditions.\n- **Govt Portals:** Visit your Gram Panchayat Office or MeeSeva Center for fast document applications.\n- **Direct Contact:** Access local Sarpanch & Secretary phone numbers on the '/government' page.`;
}

function AiAssistantPage() {
  const { language, setLanguage, profile, weather } = useVillagePreferences();
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [chat, setChat] = useState<
    Array<{ role: "assistant" | "user"; text: string; time: string }>
  >([
    {
      role: "assistant",
      text:
        language === "te"
          ? "నమస్తే! నేను మీ గ్రామమిత్ర AI సహాయకుడిని. వ్యవసాయం, పంటల వ్యాధులు, ప్రభుత్వం పథకాలు, వాతావరణం లేదా స్థానిక సేవల గురించి నన్ను దేనినైనా అడగండి."
          : language === "hi"
            ? "नमस्ते! मैं आपका ग्राममित्र AI सहायक हूँ। फसल सलाह, सरकारी योजनाएं, मौसम और स्थानीय सेवाओं के बारे में मुझसे पूछें।"
            : "Namaste! I am your GramMitra AI Assistant. Ask me anything about crops, pest control, government schemes, weather, or local village services.",
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isLoading]);

  const weatherSummary =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, ${(weather as any).weatherCode ? "cloudy/rainy" : "clear"}`
      : "28°C, Clear Sky";

  const weatherDetails =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, Humidity ${weather.humidity ?? "65"}%, Wind ${weather.wind ?? "12"} km/h, Rain Alert: ${weather.rain ? "Yes 🌧️" : "No ☀️"}`
      : "28°C, Humidity 60%, Wind 10 km/h, Rain Alert: Low ☀️";

  const send = async (textToSend = message) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    setChat((items) => [...items, { role: "user", text, time: timeStr }]);
    setMessage("");
    setIsLoading(true);

    const activeVillage = profile.village || "Your Village";
    const activeLang = language || "en";

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // 1. Try Gemini API if key is present
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const systemPrompt = `You are the GramMitra AI Assistant, a helpful and deeply knowledgeable guide for villages in India.
User location: ${activeVillage}, ${profile.district || "District"}, ${profile.state || "State"}.
Current live weather: ${weatherDetails}.
User preferred language code: ${activeLang}.

CRITICAL RULES:
1. Always reply IN THE EXACT LANGUAGE the user types in (${activeLang === "te" ? "Telugu" : activeLang === "hi" ? "Hindi" : "English"}). If they type in Telugu, reply in clean natural Telugu.
2. Provide practical, accurate, and concise advice relevant to Indian agriculture, government schemes, local village workers, or weather.
3. Use bullet points and bold headers for mobile readability.`;

          const history = chat.slice(1).map((c) => ({
            role: c.role === "user" ? "user" : "model",
            parts: [{ text: c.text }],
          }));

          const chatSession = model.startChat({
            history,
            systemInstruction: systemPrompt,
          });

          // 8-second timeout guard
          const sendPromise = chatSession.sendMessage(text);
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Gemini API timeout")), 8000),
          );

          const result = await Promise.race([sendPromise, timeoutPromise]);
          const responseText = result.response.text();

          if (responseText && responseText.trim()) {
            setChat((items) => [
              ...items,
              {
                role: "assistant",
                text: responseText.trim(),
                time: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            setIsLoading(false);
            return;
          }
        } catch (geminiErr) {
          console.warn(
            "[AIAssistant] Gemini API error/timeout, attempting fast fallback:",
            geminiErr,
          );
        }
      }

      // 2. Try fast Remote AI Proxy fallback
      try {
        const systemPrompt = `You are GramMitra AI, assisting villagers in ${activeVillage}. Weather: ${weatherDetails}. Reply concisely in ${activeLang === "te" ? "Telugu" : activeLang === "hi" ? "Hindi" : "English"}.`;
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const response = await fetch("https://text.pollinations.ai/openai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages, model: "openai", seed: 42 }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const resText = await response.text();
          if (resText && resText.trim()) {
            setChat((items) => [
              ...items,
              {
                role: "assistant",
                text: resText.trim(),
                time: new Date().toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            setIsLoading(false);
            return;
          }
        }
      } catch (proxyErr) {
        console.warn(
          "[AIAssistant] Remote proxy error/timeout, using Instant Local Engine:",
          proxyErr,
        );
      }

      // 3. Instant Smart Local Engine (<100ms guaranteed fallback)
      const localResponse = getSmartLocalResponse(text, activeLang, activeVillage, weatherDetails);
      setChat((items) => [
        ...items,
        {
          role: "assistant",
          text: localResponse,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("[AIAssistant] Fatal error:", err);
      const fallbackText = getSmartLocalResponse(text, activeLang, activeVillage, weatherDetails);
      setChat((items) => [
        ...items,
        {
          role: "assistant",
          text: fallbackText,
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Speech synthesis is not supported in this browser.");
      return;
    }
    const cleanText = text.replace(/[*_#`~]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    toast.success("Playing voice audio...");
  };

  const copyMessage = (text: string, idx: number) => {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast.success("Copied message to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const shareMessage = (text: string) => {
    const cleanText = text.replace(/[*_#`~]/g, "");
    const msg = `🤖 *GramMitra AI Advisory*\n\n${cleanText}\n\nAsk GramMitra AI for your village: ${window.location.origin}/ai-assistant`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const startVoice = () => {
    type SpeechRecognitionResultLike = { transcript: string };
    type SpeechRecognitionLike = {
      lang: string;
      interimResults: boolean;
      onstart: (() => void) | null;
      onend: (() => void) | null;
      onerror: (() => void) | null;
      onresult: ((event: { results: SpeechRecognitionResultLike[][] }) => void) | null;
      start: () => void;
    };
    type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const RecognitionCtor = SpeechRecognition || webkitSpeechRecognition;
    if (!RecognitionCtor) {
      toast.error(
        "Voice speech recognition is not supported in this browser. Please type your query.",
      );
      return;
    }
    const recognition = new RecognitionCtor();
    recognition.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => {
      setListening(true);
      toast.info(
        "Listening... Speak your question in " +
          (language === "te" ? "Telugu" : language === "hi" ? "Hindi" : "English"),
      );
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      toast.error("Could not hear clearly. Please speak into the mic or type.");
    };
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript;
      if (text) {
        setMessage(text);
        void send(text);
      }
    };
    recognition.start();
  };

  return (
    <PageLayout
      title="GramMitra AI Village Assistant"
      subtitle="Instant voice and text support for agriculture, weather, government schemes, and local village services."
      icon={<Bot className="size-7 text-primary" />}
      heroAction={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={startVoice}
            className={`inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-3.5 text-sm font-extrabold text-white shadow-xl transition-all active:scale-95 ${
              listening
                ? "bg-red-600 animate-pulse ring-4 ring-red-400/40"
                : "bg-primary hover:brightness-110 shadow-primary/30"
            }`}
          >
            <Mic className={`size-5 ${listening ? "animate-bounce" : ""}`} />
            <span>{listening ? "🔴 Listening... Speak Now" : "⚡ Voice AI — Speak Question"}</span>
          </button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Left Sidebar: Controls, Language Switcher & Quick Prompts */}
        <div className="space-y-4">
          <SurfaceCard className="overflow-hidden p-5 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <FeatureIcon icon={<Languages className="size-5" />} />
                <div>
                  <p className="font-bold text-clay text-sm">Select Language / భాష</p>
                  <p className="text-xs text-muted-foreground">AI answers in your language</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { code: "te", label: "తెలుగు (Telugu)" },
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी (Hindi)" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code as any)}
                  className={`rounded-xl py-2 px-2 text-xs font-bold transition-all border ${
                    language === item.code
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-primary/15 bg-primary/10 p-3.5 text-xs">
              <p className="font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <CloudSun className="size-4" /> Live Village Weather Context
              </p>
              <p className="mt-1 text-muted-foreground font-medium leading-relaxed">
                {weatherDetails}
              </p>
            </div>
          </SurfaceCard>

          {/* Quick Topic Prompts */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground px-1">
              Tap Quick Questions
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {prompts.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <SurfaceCard
                    key={prompt.label}
                    className="p-3.5 hover:border-primary/60 transition-all cursor-pointer"
                  >
                    <button
                      type="button"
                      onClick={() => send(prompt.label)}
                      className="flex w-full items-center gap-3 text-left group"
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-clay group-hover:text-primary transition">
                          {prompt.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">{prompt.desc}</p>
                      </div>
                    </button>
                  </SurfaceCard>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Chat Card */}
        <SurfaceCard
          className="flex min-h-[600px] flex-col overflow-hidden p-0 border-2 border-primary/20 shadow-xl"
          hover={false}
        >
          {/* Chat Header */}
          <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#123820] via-primary to-secondary p-5 text-primary-foreground shadow-md">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.16),transparent_34%),linear-gradient(246deg,rgba(242,184,75,0.2),transparent_38%)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-white/20 text-white shadow-inner backdrop-blur-md">
                    <Bot className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/80">
                        GramMitra AI
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/30 px-2 py-0.5 text-[9px] font-bold text-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
                        Engine
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold">Village Intelligence Chat</h2>
                  </div>
                </div>
                <Sparkles className="size-6 text-amber-300 animate-pulse" />
              </div>

              <div className="mt-4 grid gap-2.5 grid-cols-3">
                {[
                  ["Village", profile.village || "Select Village"],
                  ["Weather", weatherSummary],
                  ["Status", listening ? "Listening..." : isLoading ? "Thinking..." : "Ready"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                      {label}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(234,242,232,0.5),rgba(255,255,255,0.7))] p-4 sm:p-5 max-h-[480px]">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                <div
                  className={`relative max-w-[92%] sm:max-w-[85%] rounded-[22px] px-4 py-3.5 text-sm leading-relaxed shadow-sm ${
                    item.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-white text-foreground border border-border/80 rounded-bl-none"
                  }`}
                >
                  {/* Text content with whitespace & formatting */}
                  <div className="whitespace-pre-line font-medium">{item.text}</div>

                  {/* Assistant Toolbar (Listen, Copy, Share) */}
                  {item.role === "assistant" && (
                    <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => speakMessage(item.text)}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-extrabold text-primary hover:bg-primary hover:text-white transition"
                          title="Listen Voice Audio"
                        >
                          <Volume2 className="size-3.5" /> <span>Listen (విను)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => copyMessage(item.text, index)}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-foreground transition"
                        >
                          {copiedIndex === index ? (
                            <Check className="size-3 text-emerald-600" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{copiedIndex === index ? "Copied!" : "Copy"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => shareMessage(item.text)}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
                        >
                          <Share2 className="size-3" /> <span>Share</span>
                        </button>
                      </div>

                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                  )}

                  {/* Quick Action Links inside chat */}
                  {item.role === "assistant" && index === chat.length - 1 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 pt-1">
                      <Link
                        to="/schemes"
                        className="inline-flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:underline"
                      >
                        🏛️ Govt Schemes Portal <ExternalLink className="size-2.5" />
                      </Link>
                      <Link
                        to="/weather"
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500/15 border border-blue-500/30 px-2 py-1 text-[10px] font-bold text-blue-800 dark:text-blue-300 hover:underline"
                      >
                        🌧️ Detailed Weather <ExternalLink className="size-2.5" />
                      </Link>
                      <Link
                        to="/problems"
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline"
                      >
                        🚨 Report Issue <ExternalLink className="size-2.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="rounded-[22px] rounded-bl-none border border-border/80 bg-white px-4 py-3 text-sm text-muted-foreground shadow-sm flex items-center gap-2.5">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span className="font-semibold text-xs text-primary">
                    GramMitra AI is fetching agriculture & weather advice…
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Footer Bar */}
          <div className="border-t border-border bg-white/90 p-3 sm:p-4 backdrop-blur-xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
              className="flex gap-2 relative items-center"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  language === "te"
                    ? "మీ గ్రామము, పంటలు, పథకాల గురించి ఏమైనా అడగండి..."
                    : language === "hi"
                      ? "अपने गाँव, फसलों या योजनाओं के बारे में पूछें..."
                      : "Ask anything about crops, schemes, weather, or workers..."
                }
                className="premium-input min-w-0 flex-1 rounded-full px-5 text-sm h-12 border-2 border-border focus:border-primary shadow-inner"
              />

              <button
                type="button"
                onClick={startVoice}
                className={`grid size-10 shrink-0 place-items-center rounded-full transition-all ${
                  listening
                    ? "bg-red-600 text-white animate-pulse shadow-lg ring-2 ring-red-400"
                    : "bg-muted text-foreground hover:bg-primary/20 hover:text-primary"
                }`}
                title="Voice Input (సొంత గొంతుతో అడగండి)"
              >
                <Mic className="size-5" />
              </button>

              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span className="hidden sm:inline">{isLoading ? "Thinking..." : "Send"}</span>
              </button>
            </form>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground px-2">
              <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                ⚡ Instant Multilingual AI Engine Active
              </span>
              <button
                type="button"
                onClick={() => setChat((items) => items.slice(0, 1))}
                className="inline-flex items-center gap-1 hover:text-destructive font-bold transition"
              >
                <RefreshCw className="size-3" /> Clear Chat
              </button>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
