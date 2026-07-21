import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { AppButton, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant - ManaOoru" }] }),
  component: AiAssistantPage,
});

const prompts = [
  { label: "Crop Suggestions", icon: Leaf },
  { label: "Disease Detection", icon: Stethoscope },
  { label: "Weather Help", icon: CloudSun },
  { label: "Government Schemes", icon: ShieldQuestion },
  { label: "Nearby Workers", icon: Users },
  { label: "Nearby Services", icon: Brain },
];

function AiAssistantPage() {
  const { language, profile, weather } = useVillagePreferences();
  const [message, setMessage] = useState("");
  const [listening, setListening] = useState(false);
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text: "Namaste. Ask me about crops, weather, workers, services, or government schemes in Telugu, English, or Hindi.",
    },
  ]);
  const weatherSummary =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, ${weather.condition}`
      : "live weather is unavailable right now";
  const weatherDetails =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, humidity ${weather.humidity ?? "--"}%, wind ${weather.wind ?? "--"} km/h, rain alert ${weather.rain}`
      : "live weather is unavailable right now. Check the Weather page after confirming the village spelling.";
  const weatherTrust =
    weather.live && weather.temp !== null
      ? `Source: ${weather.source ?? "Open-Meteo live"}${
          weather.placeName ? `, matched to ${weather.placeName}` : ""
        }.`
      : "I will not guess weather values when live data is unavailable.";

  const replies: Record<string, string> = {
    "Crop Suggestions":
      language === "te"
        ? `${profile.village}లో పంట సలహాలకు పంట పేరు, నీటి వనరు, నేల రకం చెప్పండి. ప్రస్తుత స్థితి: ${weatherSummary}.`
        : language === "hi"
          ? `${profile.village} में फसल सलाह के लिए फसल, मिट्टी और पानी की जानकारी दें. अभी स्थिति: ${weatherSummary}.`
          : `For ${profile.village}, share crop, soil type, and water source. Current status: ${weatherSummary}.`,
    "Disease Detection":
      language === "te"
        ? "ఆకు మచ్చలు, పసుపు రంగు, పురుగులు లేదా కాండం నష్టం వివరించండి. అవసరమైతే వ్యవసాయ అధికారిని సంప్రదించమని సూచిస్తాను."
        : language === "hi"
          ? "पत्ते के दाग, पीलापन, कीड़े या तने की समस्या बताएं. जरूरत हो तो कृषि अधिकारी से संपर्क की सलाह दूंगा."
          : "Describe leaf spots, yellowing, insects, or stem damage. I will suggest likely causes and when to contact an agriculture officer.",
    "Weather Help":
      language === "te"
        ? `${profile.village} వాతావరణం: ${weatherDetails}.`
        : language === "hi"
          ? `${profile.village} मौसम: ${weatherDetails}.`
          : `${profile.village} weather: ${weatherDetails}.`,
    "Government Schemes":
      language === "te"
        ? `${profile.district}, ${profile.state}కు సంబంధించిన పథకాల కోసం రైతు రకం, పంట, భూమి వివరాలు చెప్పండి.`
        : language === "hi"
          ? `${profile.district}, ${profile.state} की योजनाओं के लिए किसान श्रेणी, फसल और जमीन विवरण बताएं.`
          : `For schemes in ${profile.district}, ${profile.state}, tell me farmer category, crop, and land details.`,
    "Nearby Workers":
      language === "te"
        ? `${profile.village} దగ్గర వ్యవసాయ పనివారు, ట్రాక్టర్ డ్రైవర్లు, ఎలక్ట్రిషియన్, ప్లంబర్‌లను Workers పేజీలో కనుగొనండి.`
        : language === "hi"
          ? `${profile.village} के पास कामगार, ट्रैक्टर ड्राइवर, इलेक्ट्रिशियन और प्लंबर Workers पेज पर मिलेंगे.`
          : `Find labour, tractor drivers, electricians, and plumbers near ${profile.village} on the Workers page.`,
    "Nearby Services":
      language === "te"
        ? `${profile.village}లో స్థానిక సేవలు: ఎలక్ట్రిషియన్, ప్లంబర్, బోర్‌వెల్, ఇంటర్నెట్, వాహన రిపేర్.`
        : language === "hi"
          ? `${profile.village} में सेवाएं: इलेक्ट्रिशियन, प्लंबर, बोरवेल, इंटरनेट, वाहन रिपेयर.`
          : `Services in ${profile.village}: electrician, plumber, borewell, internet, vehicle repair, and transport.`,
  };

  const buildResponse = (text: string) => {
    const normalized = text.toLowerCase();
    if (
      normalized.includes("weather") ||
      normalized.includes("rain") ||
      normalized.includes("వాతావరణ") ||
      normalized.includes("बारिश") ||
      normalized.includes("मौसम")
    ) {
      return `${replies["Weather Help"]} ${weatherTrust}`;
    }
    if (
      normalized.includes("crop") ||
      normalized.includes("paddy") ||
      normalized.includes("cotton") ||
      normalized.includes("పంట") ||
      normalized.includes("फसल")
    ) {
      return replies["Crop Suggestions"];
    }
    if (
      normalized.includes("scheme") ||
      normalized.includes("subsidy") ||
      normalized.includes("పథ")
    ) {
      return replies["Government Schemes"];
    }
    if (
      normalized.includes("worker") ||
      normalized.includes("labour") ||
      normalized.includes("పని")
    ) {
      return replies["Nearby Workers"];
    }
    return (
      replies[text] ??
      `I can help with that for ${profile.village || "your village"}. Share the crop, service need, urgency, and location so I can suggest the best next step.`
    );
  };

  const send = (text = message) => {
    if (!text.trim()) return;
    const response = buildResponse(text.trim());
    setChat((items) => [
      ...items,
      { role: "user", text: text.trim() },
      { role: "assistant", text: response },
    ]);
    setMessage("");
  };

  const speakLastAnswer = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const lastAssistant = [...chat].reverse().find((item) => item.role === "assistant");
    if (!lastAssistant) return;
    const utterance = new SpeechSynthesisUtterance(lastAssistant.text);
    utterance.lang = language === "hi" ? "hi-IN" : language === "en" ? "en-IN" : "te-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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
      setChat((items) => [
        ...items,
        {
          role: "assistant",
          text: "Voice input is not supported in this browser. You can type in Telugu, English, or Hindi.",
        },
      ]);
      return;
    }
    const recognition = new RecognitionCtor();
    recognition.lang = language === "hi" ? "hi-IN" : language === "en" ? "en-IN" : "te-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setChat((items) => [
        ...items,
        {
          role: "assistant",
          text: "I could not hear clearly. Please allow microphone access or type your question.",
        },
      ]);
    };
    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript;
      if (text) setMessage(text);
    };
    recognition.start();
  };

  return (
    <PageLayout
      title="AI Assistant"
      subtitle="Voice and text support for farming, services, weather, and village questions."
      icon={<Bot className="size-7" />}
    >
      <SectionHeader
        eyebrow="Smart village help"
        title="Ask in Telugu, English, or Hindi"
        description="A polished assistant for farmers, workers, services, schemes, and live weather-aware guidance."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <SurfaceCard className="overflow-hidden p-5">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={<Languages className="size-5" />} />
              <div>
                <p className="font-semibold text-clay">Languages</p>
                <p className="text-sm text-muted-foreground">Telugu, English, Hindi</p>
              </div>
            </div>
            <div className="mt-5 rounded-[18px] border border-primary/15 bg-primary/10 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Weather aware
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {weatherDetails}. {weatherTrust}
              </p>
            </div>
          </SurfaceCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {prompts.map((prompt) => (
              <SurfaceCard key={prompt.label} className="p-4">
                <button
                  onClick={() => {
                    send(prompt.label);
                  }}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <FeatureIcon icon={<prompt.icon className="size-5" />} />
                  <span className="font-semibold text-clay">{prompt.label}</span>
                </button>
              </SurfaceCard>
            ))}
          </div>
        </div>
        <SurfaceCard className="flex min-h-[620px] flex-col overflow-hidden p-0" hover={false}>
          <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[#123820] via-primary to-secondary p-5 text-primary-foreground">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.16),transparent_34%),linear-gradient(246deg,rgba(242,184,75,0.2),transparent_38%)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                    ManaOoru AI
                  </p>
                  <h2 className="font-display text-2xl font-semibold">Village support chat</h2>
                </div>
                <Sparkles className="size-6" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Village", profile.village || "Not selected"],
                  ["Weather", weatherSummary],
                  ["Mode", listening ? "Voice active" : "Ready"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[16px] border border-white/16 bg-white/12 p-3"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                      {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(234,242,232,0.62),rgba(255,255,255,0.52))] p-5">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${item.role === "user" ? "bg-primary text-primary-foreground" : "bg-white text-foreground"}`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/70 bg-white/80 p-4 backdrop-blur-xl">
            <div className="flex gap-2">
              <button
                onClick={startVoice}
                className={`grid size-12 place-items-center rounded-[18px] border text-primary transition hover:-translate-y-0.5 hover:border-primary ${listening ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white"}`}
                aria-label="Voice input"
              >
                <Mic className="size-5" />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything about your village..."
                className="premium-input min-w-0 flex-1 rounded-[18px] px-4 text-sm"
              />
              <AppButton onClick={() => send()} icon={<Send className="size-4" />}>
                Send
              </AppButton>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={speakLastAnswer}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 font-semibold text-primary transition hover:border-primary"
              >
                <Volume2 className="size-3.5" /> Read answer
              </button>
              <span>
                {listening
                  ? "Listening in your selected language..."
                  : "Mic works on browsers that support speech recognition."}
              </span>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
