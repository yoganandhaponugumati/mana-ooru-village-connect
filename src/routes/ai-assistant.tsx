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

  const send = () => {
    if (!message.trim()) return;
    const response =
      replies[message] ??
      "I can help with that. Share your village, crop or service need, and urgency so I can suggest the best next step.";
    setChat((items) => [
      ...items,
      { role: "user", text: message },
      { role: "assistant", text: response },
    ]);
    setMessage("");
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
        description="A simple assistant experience designed for villagers, farmers, workers, and local service providers."
      />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <SurfaceCard className="p-5">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={<Languages className="size-5" />} />
              <div>
                <p className="font-semibold text-clay">Languages</p>
                <p className="text-sm text-muted-foreground">Telugu, English, Hindi</p>
              </div>
            </div>
          </SurfaceCard>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {prompts.map((prompt) => (
              <SurfaceCard key={prompt.label} className="p-4">
                <button
                  onClick={() => {
                    setMessage(prompt.label);
                    setChat((items) => [
                      ...items,
                      { role: "user", text: prompt.label },
                      { role: "assistant", text: replies[prompt.label] },
                    ]);
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
        <SurfaceCard className="flex min-h-[620px] flex-col overflow-hidden p-0">
          <div className="border-b border-border bg-primary p-5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                  ManaOoru AI
                </p>
                <h2 className="font-display text-2xl font-semibold">Village support chat</h2>
              </div>
              <Sparkles className="size-6" />
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-muted/40 p-5">
            {chat.map((item, index) => (
              <div
                key={index}
                className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${item.role === "user" ? "bg-primary text-primary-foreground" : "bg-white text-foreground"}`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border bg-white p-4">
            <div className="flex gap-2">
              <button
                onClick={startVoice}
                className={`grid size-12 place-items-center rounded-full border text-primary transition hover:border-primary ${listening ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                aria-label="Voice input"
              >
                <Mic className="size-5" />
              </button>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything about your village..."
                className="min-w-0 flex-1 rounded-full border border-border px-4 text-sm"
              />
              <AppButton onClick={send} icon={<Send className="size-4" />}>
                Send
              </AppButton>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Volume2 className="size-3.5" />{" "}
              {listening
                ? "Listening in Telugu..."
                : "Mic works on browsers that support speech recognition."}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
