import { createFileRoute } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FeatureIcon, SurfaceCard } from "@/components/design-system";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant - GramMitra" }] }),
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
  const [isLoading, setIsLoading] = useState(false);

  const weatherSummary =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, ${(weather as any).weatherCode ? "cloudy/rainy" : "clear"}`
      : "Weather data unavailable";

  const weatherDetails =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, humidity ${weather.humidity ?? "--"}%, wind ${weather.wind ?? "--"} km/h, rain alert ${weather.rain}`
      : "live weather is unavailable right now.";

  const send = async (text = message) => {
    if (!text.trim() || isLoading) return;

    setChat((items) => [...items, { role: "user", text: text.trim() }]);
    setMessage("");
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        // Real AI Fallback using a free unauthenticated endpoint
        try {
          const systemPrompt = `You are the GramMitra AI Assistant, a helpful and deeply knowledgeable guide for villages in India.
Your goal is to assist villagers with agriculture, government schemes, local services, and weather.
The user is located in ${profile.village || "an unknown village"}${profile.district ? `, ${profile.district}` : ""}${profile.state ? `, ${profile.state}` : ""}.
Current weather in their village: ${weatherDetails}.
The user prefers to speak in ${language === "te" ? "Telugu" : language === "hi" ? "Hindi" : "English"}.

CRITICAL RULES:
1. Always reply IN THE EXACT LANGUAGE the user types in, or their preferred language (${language}). If they type in Telugu, YOU MUST reply in Telugu perfectly without grammatical errors. If they type in English, reply in English.
2. Keep your answers concise, practical, and highly relevant to Indian agriculture or rural life.
3. Do not use complex markdown that is hard to read on mobile. Use simple bullet points if needed.
4. Always incorporate the provided village location and live weather into your advice if relevant.`;

          const pollinationsMessages = [
            { role: "system", content: systemPrompt },
            ...chat.slice(1).map((c) => ({ role: c.role, content: c.text })),
            { role: "user", content: text.trim() },
          ];

          const response = await fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: pollinationsMessages,
              model: "mistral",
              seed: Math.floor(Math.random() * 1000),
            }),
          });

          if (!response.ok) throw new Error("Fallback AI failed");

          const responseText = await response.text();

          setChat((items) => [...items, { role: "assistant", text: responseText }]);
        } catch (e) {
          console.error("Fallback AI error:", e);
          setChat((items) => [
            ...items,
            {
              role: "assistant",
              text:
                language === "te"
                  ? "క్షమించండి, సర్వర్ బిజీగా ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి."
                  : "I'm sorry, the AI service is currently busy. Please try again in a moment.",
            },
          ]);
        }
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `You are the GramMitra AI Assistant, a helpful and deeply knowledgeable guide for villages in India.
Your goal is to assist villagers with agriculture, government schemes, local services, and weather.
The user is located in ${profile.village || "an unknown village"}${profile.district ? `, ${profile.district}` : ""}${profile.state ? `, ${profile.state}` : ""}.
Current weather in their village: ${weatherDetails}.
The user prefers to speak in ${language === "te" ? "Telugu" : language === "hi" ? "Hindi" : "English"}.

CRITICAL RULES:
1. Always reply IN THE EXACT LANGUAGE the user types in, or their preferred language (${language}). If they type in Telugu, YOU MUST reply in Telugu perfectly without grammatical errors. If they type in English, reply in English.
2. Keep your answers concise, practical, and highly relevant to Indian agriculture or rural life.
3. Do not use complex markdown that is hard to read on mobile. Use simple bullet points if needed.
4. Always incorporate the provided village location and live weather into your advice if relevant (e.g., advising on crop watering based on rain alert).`;

      const history = chat.slice(1).map((c) => ({
        role: c.role === "user" ? "user" : "model",
        parts: [{ text: c.text }],
      }));

      const chatSession = model.startChat({
        history,
        systemInstruction: systemPrompt,
      });

      const result = await chatSession.sendMessage(text.trim());
      const response = result.response.text();

      setChat((items) => [...items, { role: "assistant", text: response }]);
    } catch (error) {
      console.error(error);
      setChat((items) => [
        ...items,
        {
          role: "assistant",
          text: "I'm sorry, I cannot connect to the AI service right now. Please check your internet connection and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
      title="GramMitra AI Village Assistant"
      subtitle="Voice and text support for farming, services, weather, and government schemes in Telugu, English, or Hindi."
      icon={<Bot className="size-6 text-primary" />}
      heroAction={
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={startVoice}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-primary/30 transition hover:scale-105"
          >
            <Mic className="size-5" />
            <span>
              {listening ? "🔴 Listening... Speak Now" : "⚡ Speak Your Question (Voice AI)"}
            </span>
          </button>
        </div>
      }
    >
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
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{weatherDetails}</p>
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
                    GramMitra AI
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
            <div className="flex gap-2 relative">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything about your village..."
                className="premium-input min-w-0 flex-1 rounded-[18px] px-4 text-sm h-12"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={startVoice}
                  className={`grid size-9 place-items-center rounded-full transition-all ${
                    listening
                      ? "bg-red-500/20 text-red-600 dark:bg-red-500/30 dark:text-red-400 animate-pulse"
                      : "bg-muted text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <Mic className="size-4" />
                </button>
                <button
                  type="submit"
                  onClick={() => send()}
                  disabled={!message.trim() || isLoading}
                  className="flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground transition-all hover:bg-secondary active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Thinking..." : "Send"} <Send className="size-3" />
                </button>
              </div>
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
