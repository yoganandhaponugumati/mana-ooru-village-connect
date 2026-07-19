import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { useListingStats, timeAgo } from "@/lib/store";
import { useVillagePreferences } from "@/lib/village-preferences";
import {
  Search,
  Users,
  Briefcase,
  Wheat,
  ShoppingBasket,
  Wrench,
  Megaphone,
  Tractor,
  Sprout,
  Bike,
  Phone,
  Siren,
  MapPin,
  ArrowRight,
  Star,
  Quote,
  CheckCircle2,
  Zap,
  Building2,
  HandHeart,
  ShieldCheck,
  Activity,
  CloudSun,
  GraduationCap,
  HeartPulse,
  Compass,
  Plus,
  AlertTriangle,
  ImagePlus,
  Landmark,
  Leaf,
} from "lucide-react";
import heroVillage from "@/assets/hero-village-premium.jpg";
import { SiteNav } from "@/components/SiteNav";
import { Card3D } from "@/components/design-system";
import { Button } from "@/components/ui/button";
import { ConceptShowcase } from "@/components/ConceptShowcase";
import { citizenServices, fallbackListings, schemes } from "@/lib/app-data";
import workersImg from "@/assets/workers-premium.jpg";
import voice1 from "@/assets/voice-1.jpg";
import voice2 from "@/assets/voice-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ManaOoru — A Digital Home for Every Village" },
      {
        name: "description",
        content:
          "Find workers, lease land, buy local produce, hire services, and stay updated with village announcements — all in one place.",
      },
      { property: "og:title", content: "ManaOoru — A Digital Home for Every Village" },
      {
        property: "og:description",
        content: "One platform for farmers, workers, services, and villagers. మా ఊరు, మన చేతుల్లో.",
      },
    ],
  }),
  component: Index,
});

const quickActions = [
  {
    icon: Users,
    label: "Need Workers",
    te: "పనివారు",
    description: "Daily wage, farm, drivers, and skilled workers",
    tint: "bg-primary/10 text-primary",
    to: "/workers" as const,
  },
  {
    icon: Wrench,
    label: "Find Services",
    te: "సేవలు",
    description: "Mechanics, electricians, tractors, tent house",
    tint: "bg-secondary/10 text-secondary",
    to: "/services" as const,
    search: { kind: "services" as const },
  },
  {
    icon: Building2,
    label: "Village Shops",
    te: "దుకాణాలు",
    description: "Kirana, medical, bakery, hotel, hardware",
    tint: "bg-accent/20 text-clay",
    to: "/services" as const,
    search: { kind: "shops" as const },
  },
  {
    icon: ShoppingBasket,
    label: "Buy & Sell",
    te: "కొనుగోలు అమ్మకం",
    description: "Crops, milk, seeds, tools, and local goods",
    tint: "bg-primary/10 text-primary",
    to: "/marketplace" as const,
  },
  {
    icon: Megaphone,
    label: "Village Notices",
    te: "గ్రామ నోటీసులు",
    description: "Water, power, school, health, and events",
    tint: "bg-primary/10 text-primary",
    to: "/announcements" as const,
  },
  {
    icon: AlertTriangle,
    label: "Report Problem",
    te: "సమస్య చెప్పండి",
    description: "Road, drainage, water, lights, garbage",
    tint: "bg-red-50 text-red-600",
    to: "/problems" as const,
  },
];

const categoryRoutes: Record<string, "/marketplace" | "/services"> = {
  Tractors: "/services",
  Seeds: "/marketplace",
  Livestock: "/marketplace",
  Grain: "/marketplace",
  Tools: "/marketplace",
  Transport: "/services",
  Repairs: "/services",
  "Daily Goods": "/marketplace",
};

const categoryDefs = [
  { icon: ShoppingBasket, label: "Marketplace", type: "market" as const },
  { icon: Sprout, label: "Agriculture", type: "market" as const },
  { icon: Wrench, label: "Services", type: "service" as const },
  { icon: Building2, label: "Government", type: "announcement" as const },
  { icon: Bike, label: "Transport", type: "service" as const },
  { icon: GraduationCap, label: "Education", type: "announcement" as const },
  { icon: HeartPulse, label: "Health", type: "announcement" as const },
  { icon: Tractor, label: "Machinery", type: "service" as const },
];

const villageNeeds = [
  {
    icon: ShoppingBasket,
    label: "Marketplace",
    to: "/marketplace" as const,
    description: "Buy and sell crops, produce, and everyday goods with neighbours.",
  },
  {
    icon: Sprout,
    label: "Agriculture",
    to: "/schemes" as const,
    description: "Government farm schemes, subsidies, and crop support programs.",
  },
  {
    icon: Wrench,
    label: "Services",
    to: "/services" as const,
    description: "Electricians, plumbers, tutors, and local service pros.",
  },
  {
    icon: Building2,
    label: "Government",
    to: "/schemes" as const,
    description: "Certificates, records, and official village scheme updates.",
  },
  {
    icon: Bike,
    label: "Transport",
    to: "/transport" as const,
    description: "Shared rides, bus timings, and local transport options.",
  },
  {
    icon: GraduationCap,
    label: "Education",
    to: "/announcements" as const,
    description: "School notices, scholarships, and learning updates.",
  },
  {
    icon: HeartPulse,
    label: "Health",
    to: "/emergency" as const,
    description: "Health centre details and nearby medical contacts.",
  },
  {
    icon: Siren,
    label: "Emergency",
    to: "/emergency" as const,
    description: "Police, ambulance, fire, and other emergency numbers.",
  },
];

const steps = [
  {
    n: "01",
    icon: HandHeart,
    title: "Join your village",
    body: "Sign up in seconds with your phone number. Pick your village and role.",
  },
  {
    n: "02",
    icon: Search,
    title: "Post or search",
    body: "Need workers? Have land? Selling produce? Post once, reach the whole village.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Connect & verify",
    body: "Call directly or chat in-app. Every member is vouched for by neighbours.",
  },
];

const voices = [
  {
    img: voice1,
    name: "Lakshmi Devi",
    role: "Dairy farmer · Kothur",
    quote:
      "I leased two acres in one week. Earlier this would have taken a whole season of asking around.",
    rating: 5,
  },
  {
    img: voice2,
    name: "Suresh Reddy",
    role: "Farmer · Pedda Kallepalli",
    quote: "I sold 400 kg of paddy directly to my neighbour. No middleman, fair price.",
    rating: 5,
  },
];

const typeIcon: Record<string, typeof Briefcase> = {
  worker: Users,
  work: Briefcase,
  land: Wheat,
  market: ShoppingBasket,
  service: Wrench,
  announcement: Megaphone,
  complaint: AlertTriangle,
};
const typeTint: Record<string, string> = {
  worker: "text-primary",
  work: "text-secondary",
  land: "text-accent-foreground",
  market: "text-primary",
  service: "text-secondary",
  announcement: "text-primary",
  complaint: "text-red-600",
};
const contacts = [
  { name: "Ambulance", role: "Primary Health Center", num: "108", urgent: true },
  { name: "Police Station", role: "Local Sub-Inspector", num: "100" },
  { name: "Sarpanch Office", role: "Mr. Venkatesh R.", num: "0841-23456" },
  { name: "Agriculture Officer", role: "Crop & Subsidy Help", num: "98481 12443" },
];

function HeroFeatureCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselItems = [
    {
      icon: AlertTriangle,
      title: "Report Problem",
      telugu: "సమస్య చెప్పండి",
      desc: "Road damage, water leaks & streetlights photo proof",
      to: "/problems",
      badge: "Citizen Action",
      gradient: "from-red-600 to-rose-700",
      accentBg: "bg-red-400/25 text-red-100",
    },
    {
      icon: Megaphone,
      title: "Post Notice",
      telugu: "గ్రామ నోటీసు",
      desc: "Panchayat announcements, power cuts & local updates",
      to: "/announcements",
      badge: "Official Notice",
      gradient: "from-emerald-600 to-teal-700",
      accentBg: "bg-emerald-400/25 text-emerald-100",
    },
    {
      icon: Users,
      title: "Hire Workers",
      telugu: "పనివారు కావలెను",
      desc: "Daily wage, tractor drivers & skilled farm helpers",
      to: "/workers",
      badge: "Labour & Work",
      gradient: "from-amber-600 to-orange-700",
      accentBg: "bg-amber-400/25 text-amber-100",
    },
    {
      icon: ShoppingBasket,
      title: "Village Marketplace",
      telugu: "కొనుగోలు అమ్మకం",
      desc: "Buy & sell crops, milk, seeds & store products",
      to: "/marketplace",
      badge: "Local Trade",
      gradient: "from-teal-600 to-cyan-700",
      accentBg: "bg-teal-400/25 text-teal-100",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 2500); // 2.5s duration
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const activeItem = carouselItems[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/25 bg-black/40 p-1.5 backdrop-blur-xl shadow-2xl w-full max-w-sm sm:max-w-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => navigate({ to: activeItem.to })}
          className={`cursor-pointer rounded-[20px] bg-gradient-to-r ${activeItem.gradient} p-4 text-white shadow-lg flex items-center justify-between gap-3 transition hover:scale-[1.01]`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${activeItem.accentBg}`}>
                {activeItem.badge}
              </span>
              <span className="text-[11px] font-semibold text-white/80">{activeItem.telugu}</span>
            </div>
            <h4 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
              <activeItem.icon className="size-5 shrink-0" />
              {activeItem.title}
            </h4>
            <p className="mt-1 text-xs text-white/90 truncate">{activeItem.desc}</p>
          </div>
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur-md">
            <ArrowRight className="size-4 text-white" />
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex justify-center gap-1.5 pt-2 pb-0.5">
        {carouselItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/35"
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function NoticeCarouselCard({ items }: { items: typeof fallbackListings }) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000); // 4-second auto cycle
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-[28px] border-2 border-primary/30 bg-gradient-to-br from-primary via-primary/95 to-emerald-900 p-6 text-white shadow-xl">
        <h3 className="font-display text-2xl font-bold">No official notices posted yet</h3>
        <p className="mt-2 text-sm text-white/80">
          Be the first to post a Panchayat, school, health, power, or water update for your village.
        </p>
      </div>
    );
  }

  const current = items[index];

  return (
    <div className="relative overflow-hidden rounded-[28px] border-2 border-primary/30 bg-gradient-to-br from-primary via-primary/95 to-emerald-900 text-primary-foreground shadow-xl transition hover:shadow-2xl">
      <div className="flex flex-col gap-4 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-md text-white">
              <Megaphone className="size-3.5" /> Latest Notice
            </span>
            {items.length > 1 && (
              <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-200">
                {index + 1} of {items.length} Notices
              </span>
            )}
          </div>
          <Link
            to="/announcements"
            className="text-xs font-bold text-white/90 underline hover:text-white"
          >
            All Notices ({items.length}) →
          </Link>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer"
            onClick={() => navigate({ to: "/announcements" })}
          >
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_12rem] md:items-end">
              <div>
                <span className="rounded-full bg-emerald-400/20 px-3 py-0.5 text-xs font-semibold text-emerald-200">
                  {current.category || "Panchayat Notice"}
                </span>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl text-white">
                  {current.title}
                </h3>
                {current.description && (
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85 line-clamp-3">
                    {current.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {current.imageUrl ? (
                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="aspect-[4/3] w-full rounded-2xl border border-white/20 object-cover shadow-md"
                  />
                ) : (
                  <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl border border-white/20 bg-white/10 text-white/80">
                    <Megaphone className="size-8" />
                  </div>
                )}
                <p className="rounded-full bg-white/15 px-3 py-1.5 text-center text-xs font-bold text-white">
                  {timeAgo(current.createdAt)}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {items.length > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/15">
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                  aria-label={`Notice ${i + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev - 1 + items.length) % items.length)}
                className="grid size-7 place-items-center rounded-full bg-white/15 hover:bg-white/30 text-xs font-bold transition"
                aria-label="Previous notice"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev + 1) % items.length)}
                className="grid size-7 place-items-center rounded-full bg-white/15 hover:bg-white/30 text-xs font-bold transition"
                aria-label="Next notice"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Hero3DVillage({
  villageName,
  heroWeather,
  stats,
}: {
  villageName: string;
  heroWeather: string;
  stats?: ReturnType<typeof useListingStats>["data"];
}) {
  const heroMetrics = [
    { label: "Workers", value: stats?.workers ? `${stats.workers}+` : "0", icon: Users },
    { label: "Land", value: stats?.land ? `${stats.land}+` : "0", icon: Wheat },
    {
      label: "Services",
      value: stats?.byType.service ? `${stats.byType.service}+` : "0",
      icon: Wrench,
    },
  ];

  return (
    <div className="hero-3d-stage" aria-hidden="true">
      <motion.div
        initial={{ opacity: 0, rotateX: 18, rotateY: -22, y: 30 }}
        animate={{ opacity: 1, rotateX: 12, rotateY: -18, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="hero-3d-world"
      >
        <div className="hero-3d-orbit hero-3d-orbit-one" />
        <div className="hero-3d-orbit hero-3d-orbit-two" />

        <div className="hero-3d-base">
          <div className="hero-3d-field hero-3d-field-a" />
          <div className="hero-3d-field hero-3d-field-b" />
          <div className="hero-3d-field hero-3d-field-c" />
          <div className="hero-3d-road" />
          <div className="hero-3d-house hero-3d-house-a">
            <span />
          </div>
          <div className="hero-3d-house hero-3d-house-b">
            <span />
          </div>
          <div className="hero-3d-tower">
            <span />
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="hero-3d-panel hero-3d-panel-main"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/70">
                Live village OS
              </p>
              <p className="mt-1 font-display text-xl font-bold text-clay">
                {villageName || "Choose your village"}
              </p>
            </div>
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-[var(--shadow-glow)]">
              <Leaf className="size-6" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-white/72 p-3 shadow-sm">
                <metric.icon className="size-4 text-primary" />
                <p className="mt-2 font-display text-lg font-bold text-clay">{metric.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {metric.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0], rotateZ: [0, -1.5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hero-3d-panel hero-3d-panel-weather"
        >
          <CloudSun className="size-6 text-accent" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
              Weather
            </p>
            <p className="font-display text-lg font-bold text-white">{heroWeather}</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -9, 0], rotateZ: [0, 2, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          className="hero-3d-panel hero-3d-panel-action"
        >
          <ShieldCheck className="size-5 text-primary" />
          <span>Verified village network</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Index() {
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuth();
  const { t, profile, weather, hasProfile } = useVillagePreferences();
  const { data: stats } = useListingStats({
    villageId: authProfile?.village_id,
    villageName: profile?.village || authProfile?.village,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const showSignedInVillage = Boolean(user && hasProfile && profile.village);
  const heroWeather = showSignedInVillage
    ? weather.live && weather.temp !== null
      ? `${weather.temp}°C · ${weather.condition}`
      : "Live weather unavailable"
    : "Select village for live weather";
  const recentItems = stats?.recent ?? fallbackListings;
  const hasRealActivity = Boolean(stats && stats.total > 0);
  const liveActivity = recentItems.slice(0, 4);
  const announcementItems = recentItems.filter((r) => r.type === "announcement").slice(0, 3);
  const problemItems = recentItems.filter((r) => r.type === "complaint").slice(0, 3);
  const featured = recentItems
    .filter((r) => r.type !== "announcement" && r.type !== "complaint")
    .slice(0, 3);
  const villageName = showSignedInVillage ? profile.village : "";
  const heroTitle = villageName ? `Welcome to ManaOoru - ${villageName}` : "Welcome to ManaOoru";
  const submitSearch = (event?: FormEvent) => {
    event?.preventDefault();
    navigate({ to: "/search", search: { q: searchQuery } });
  };
  return (
    <div className="village-site-bg min-h-screen text-foreground">
      {/* Hero */}
      <header className="relative min-h-screen overflow-hidden bg-[#06140d]">
        <img
          src={heroVillage}
          alt="Beautiful Indian village with green fields at sunrise"
          loading="eager"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_72%_28%,rgba(24,169,153,0.36),transparent_30%),radial-gradient(circle_at_18%_16%,rgba(242,184,75,0.34),transparent_25%),linear-gradient(90deg,rgba(4,18,10,0.92)_0%,rgba(8,31,18,0.72)_45%,rgba(8,41,33,0.28)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-52 bg-gradient-to-t from-[#eef8ed] via-[#eef8ed]/78 to-transparent" />
        <div className="pointer-events-none absolute left-0 top-28 z-10 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="hero-life-layer pointer-events-none absolute inset-0 z-10" />

        <div className="relative z-20 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 pb-32 pt-28 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:pb-28">
          <div className="max-w-3xl text-left">
            {/* Small Animated Pinned Notice Card inside 1st Hero Page */}
            {announcementItems[0] && (
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.04 }}
                onClick={() => navigate({ to: "/announcements" })}
                className="mb-4 inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-emerald-400/40 bg-emerald-950/80 px-4 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] backdrop-blur-md transition hover:border-emerald-300 hover:scale-[1.02] active:scale-95"
              >
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                </span>
                <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                  📌 Pinned Notice
                </span>
                <span className="max-w-[200px] truncate font-semibold text-white/95 sm:max-w-[320px]">
                  {announcementItems[0].title}
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-emerald-300" />
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
              className="max-w-4xl text-balance font-display text-5xl font-black leading-[0.95] text-white drop-shadow-[0_16px_48px_rgba(0,0,0,0.48)] sm:text-7xl lg:text-8xl"
            >
              ManaOoru
              <span className="block bg-gradient-to-r from-accent via-white to-secondary bg-clip-text text-transparent">
                Village in your hands
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
              className="mt-6 max-w-2xl text-pretty text-lg font-medium leading-8 text-white/84 sm:text-xl"
            >
              {heroTitle}. {t.subtitle1} {t.subtitle2}
            </motion.p>

            <motion.form
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24, ease: "easeOut" }}
              onSubmit={submitSearch}
              className="mt-8 w-full max-w-2xl"
            >
              <div className="group flex items-center gap-2 rounded-[24px] border border-white/22 bg-white/92 p-2 shadow-[0_34px_110px_-42px_rgba(0,0,0,0.72)] backdrop-blur-2xl transition focus-within:ring-4 focus-within:ring-secondary/25">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Search className="size-5" />
                </div>
                <input
                  id="hero-search"
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t.search}
                  className="min-w-0 flex-1 bg-transparent text-base font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="rounded-[18px] bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5 hover:bg-secondary sm:px-8"
                >
                  Search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white">
                <span className="font-semibold">{t.popular}</span>
                {["Tractor Driver", "Paddy Land", "Electrician", "Milk", "Harvesting"].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setSearchQuery(t);
                      navigate({ to: "/search", search: { q: t } });
                    }}
                    className="rounded-full border border-white/22 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </motion.form>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <Link
                to="/timeline"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-[20px] bg-primary px-7 text-base font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:-translate-y-1 hover:bg-secondary shrink-0"
              >
                <Compass className="size-5" /> {t.explore}
              </Link>
              <HeroFeatureCarousel />
            </motion.div>

            {!hasRealActivity && (
              <p className="mt-8 max-w-xl rounded-2xl border border-white/14 bg-white/10 px-4 py-3 text-sm font-semibold text-white/78 backdrop-blur-xl">
                New village workspace: post first, connect faster, and make local activity visible.
              </p>
            )}
          </div>

          <Hero3DVillage villageName={villageName} heroWeather={heroWeather} stats={stats} />
        </div>
      </header>

      <SiteNav />

      {/* Prominent Eye-Catching Showcase: Notices & Citizen Complaints */}
      <section className="relative z-30 mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Megaphone className="size-3.5" /> Village Pulse & Civic Accountability
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-clay">
              Official Notices & Citizen Problems
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-black text-primary-foreground shadow-md transition hover:scale-[1.03] active:scale-95"
            >
              <Plus className="size-4 animate-bounce" />
              <span>+ Post Official Notice</span>
            </Link>
            <Link
              to="/problems"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-red-300 bg-red-50 dark:bg-red-950/40 px-5 py-2.5 text-xs font-black text-red-700 dark:text-red-300 shadow-md transition hover:scale-[1.03] active:scale-95"
            >
              <AlertTriangle className="size-4 animate-pulse text-red-600" />
              <span>+ Report Problem</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Multi-Notice Auto Carousel Card */}
          <NoticeCarouselCard
            items={
              announcementItems.length > 0
                ? announcementItems
                : fallbackListings.filter((i) => i.type === "announcement")
            }
          />

          {/* Citizen Problem Reports Card */}
          <div className="rounded-[28px] border-2 border-red-200/80 bg-card p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.18em] text-red-600">
                    <AlertTriangle className="size-3.5" /> Action Required
                  </span>
                  <h3 className="mt-1 font-display text-2xl font-bold text-clay">
                    Citizen Problem Reports
                  </h3>
                </div>
                <Link
                  to="/problems"
                  className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-200 transition"
                >
                  View All ({problemItems.length}) →
                </Link>
              </div>

              {problemItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6 text-center text-sm text-muted-foreground">
                  <AlertTriangle className="mx-auto mb-2 size-8 text-red-400" />
                  No road, drainage, or water problems posted yet.
                  <p className="mt-2">
                    <Link to="/problems" className="font-bold text-red-600 hover:underline">
                      + Report a problem with photo proof
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {problemItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      to="/problems"
                      className="flex gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm transition hover:border-red-300 hover:bg-red-50/40"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="size-16 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-red-100 text-red-600 font-bold">
                          <AlertTriangle className="size-6" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-clay text-base">{item.title}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          📍 {item.location || item.category || "Village issue"} · {timeAgo(item.createdAt)}
                        </span>
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          {item.status === "completed" ? "✅ Resolved" : item.status === "in_progress" ? "🛠️ In Progress" : "⏳ Pending"}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <ConceptShowcase />

      {/* Quick Actions */}
      <section
        id="actions"
        className="relative z-30 mx-auto mt-8 max-w-[calc(100%-2rem)] overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(232,247,239,0.82)_48%,rgba(255,246,222,0.8))] px-4 py-9 shadow-[0_16px_56px_-24px_rgba(20,49,32,0.3)] backdrop-blur-2xl sm:px-6 lg:max-w-[calc(100%-3rem)] lg:rounded-[40px]"
      >
        <div className="pointer-events-none absolute inset-0 village-pattern opacity-80" />
        <div className="mx-auto mb-7 max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Start here</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
            What do you need today?
          </h2>
        </div>
        <div className="stage-3d mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((a, i) =>
            a.to.startsWith("#") ? (
              <Card3D key={a.label} className="clay-extrude animate-fade-up" intensity={16}>
                <a
                  href={a.to}
                  className="premium-action-card group flex min-h-44 items-center gap-5 rounded-[22px] p-6 text-left"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="premium-action-icon grid size-16 shrink-0 place-items-center rounded-2xl text-primary transition-transform group-hover:scale-110">
                    <a.icon className="size-9" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0" style={{ transform: "translateZ(40px)" }}>
                    <p className="font-display text-xl font-semibold text-foreground">{a.label}</p>
                    <p className="mt-1 text-xs font-semibold text-primary">{a.te}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.description}</p>
                  </div>
                </a>
              </Card3D>
            ) : (
              <Card3D key={a.label} className="clay-extrude animate-fade-up" intensity={16}>
                <Link
                  to={a.to as Exclude<(typeof quickActions)[number]["to"], "#contacts">}
                  search={"search" in a ? a.search : undefined}
                  className="premium-action-card group flex min-h-44 items-center gap-5 rounded-[22px] p-6 text-left"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="premium-action-icon grid size-16 shrink-0 place-items-center rounded-2xl text-primary transition-transform group-hover:scale-110">
                    <a.icon className="size-9" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0" style={{ transform: "translateZ(40px)" }}>
                    <p className="font-display text-xl font-semibold text-foreground">{a.label}</p>
                    <p className="mt-1 text-xs font-semibold text-primary">{a.te}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{a.description}</p>
                  </div>
                </Link>
              </Card3D>
            ),
          )}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Government help desk
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
              Aadhaar, schemes, cards, and documents in one place
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
              Useful official services villagers need before applying for support, work, health, and
              farming schemes.
            </p>
          </div>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:-translate-y-0.5 hover:bg-secondary"
          >
            View all schemes <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {citizenServices.slice(0, 4).map((service, index) => {
              const Icon = [ShieldCheck, Building2, GraduationCap, HeartPulse][index];
              return (
                <a
                  key={service.id}
                  href={service.apply}
                  target="_blank"
                  rel="noreferrer"
                  className="premium-need-card hover-lift group rounded-[22px] p-5"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-secondary/12 text-secondary shadow-sm transition group-hover:rotate-[-4deg] group-hover:scale-105">
                      <Icon className="size-6" strokeWidth={1.8} />
                    </span>
                    <ArrowRight className="size-4 text-primary/50 transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="font-display text-xl font-semibold text-clay">{service.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                  <p className="mt-4 rounded-2xl bg-muted/60 px-3 py-2 text-xs font-semibold leading-5 text-clay">
                    Keep ready: {service.documents.slice(0, 3).join(", ")}
                  </p>
                </a>
              );
            })}
          </div>
          <div className="rounded-[24px] bg-clay p-6 text-background shadow-[var(--shadow-lift)]">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-white/10 text-accent">
                <Landmark className="size-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Farmer schemes
                </p>
                <h3 className="font-display text-2xl font-semibold">Popular official portals</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {schemes.slice(0, 5).map((scheme) => (
                <a
                  key={scheme.id}
                  href={scheme.apply}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                >
                  <span className="min-w-0">
                    <span className="block truncate">{scheme.title}</span>
                    <span className="mt-0.5 block text-xs font-medium text-white/62">
                      {scheme.category}
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-accent" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="pointer-events-none absolute inset-x-4 -top-10 h-48 rounded-[36px] bg-[linear-gradient(135deg,rgba(24,169,153,0.16),rgba(242,184,75,0.14))] blur-2xl" />
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">
            Village categories
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
            Built for every village need
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {villageNeeds.map((item, index) => (
            <Link
              key={item.label}
              to={item.to}
              className="premium-need-card hover-lift animate-fade-up group rounded-[22px] p-5"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary shadow-sm transition group-hover:rotate-[-4deg] group-hover:scale-105">
                  <item.icon className="size-6" strokeWidth={1.8} />
                </span>
                <ArrowRight className="size-4 text-primary/50 transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="font-display text-xl font-semibold text-clay">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:mt-28 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">
            How ManaOoru works
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
            Three simple steps. No paperwork, no middlemen.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="premium-step-card hover-lift animate-fade-up relative overflow-hidden rounded-3xl p-7"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="absolute right-5 top-5 font-display text-5xl font-semibold text-primary/15">
                {s.n}
              </span>
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary shadow-sm">
                <s.icon className="size-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-clay">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-secondary">
                <CheckCircle2 className="size-4" /> Takes less than a minute
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace Category Marquee */}
      <section id="marketplace" className="mt-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">
                Village marketplace
              </span>
              <h2 className="font-display text-3xl font-semibold text-clay sm:text-4xl">
                Browse the village market
              </h2>
              <p className="mt-2 text-muted-foreground">
                From fresh produce to farm equipment — direct from neighbours.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
            >
              See all <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Category visual grid */}
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categoryDefs.map((c, i) => (
              <Link
                key={c.label}
                to={categoryRoutes[c.label] || "/marketplace"}
                className="premium-market-tile hover-lift animate-fade-up group flex aspect-square flex-col items-start justify-between rounded-2xl p-4 text-left"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/25 text-primary transition-transform group-hover:rotate-[-6deg]">
                  <c.icon className="size-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats?.byType[c.type] ?? 0} listings
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Subtle marquee strip for variety */}
        <div className="relative mt-10 border-y border-border/60 bg-clay py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max animate-marquee gap-10 text-background/80">
            {[...Array(2)].flatMap((_, k) =>
              [
                "🌾 Fresh harvest daily",
                "🤝 Verified neighbours only",
                "📞 Direct phone connect",
                "💸 No commission, ever",
                "🚜 Same-day equipment rental",
                "🌱 Seeds from local farmers",
              ].map((t, i) => (
                <span key={`${k}-${i}`} className="flex-none text-sm font-medium tracking-wide">
                  {t}
                </span>
              )),
            )}
          </div>
        </div>

        {/* Featured listings */}
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="font-display text-2xl font-semibold text-clay">Featured this week</h3>
            <Link to="/marketplace" className="text-sm font-semibold text-primary hover:underline">
              View all listings →
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
              No listings yet.{" "}
              <Link to="/auth" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{" "}
              to be the first to post.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {featured.map((s, i) => (
                <article
                  key={s.id}
                  className="hover-lift animate-fade-up group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {s.imageUrl ? (
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary/10 via-white to-accent/20 text-primary">
                        <div className="text-center">
                          <ImagePlus className="mx-auto size-10" />
                          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-clay">
                            Photo pending
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-clay shadow-sm">
                      <Star className="size-3 fill-accent text-accent" /> {s.type}
                    </span>
                  </div>
                  <div className="p-6">
                    {s.price && (
                      <span className="inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {s.price}
                      </span>
                    )}
                    <h3 className="mt-3 font-display text-xl font-semibold text-clay">{s.title}</h3>
                    {s.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" /> {s.location}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
                      <span className="text-xs text-muted-foreground">{timeAgo(s.createdAt)}</span>
                      <a
                        href={`tel:${s.contact.replace(/\s|-/g, "")}`}
                        className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                      >
                        <Phone className="size-3" /> Contact
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Voices from the village + Live activity */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          {/* Voices */}
          <div className="overflow-hidden rounded-[28px] bg-primary text-primary-foreground shadow-[var(--shadow-lift)]">
            <div className="relative min-h-[540px] p-7 sm:p-9">
              <img
                src={workersImg}
                alt="Trusted village workers"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/72 to-primary/10" />
              <div className="relative flex h-full min-h-[470px] flex-col justify-end">
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
                  Community trust
                </span>
                <h2 className="mt-3 max-w-lg font-display text-4xl font-bold leading-tight sm:text-5xl">
                  Real people. Real village progress.
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/82">
                  Farmers, workers, sellers, and service providers connect directly with neighbours
                  they can trust.
                </p>
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {[
                    ["4.9", "Avg rating"],
                    ["18k+", "Trusted users"],
                    ["24/7", "Village access"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md"
                    >
                      <p className="font-display text-2xl font-semibold">{value}</p>
                      <p className="mt-1 text-[11px] font-medium text-white/75">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              Voices from the village
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
              Proof from neighbours who use ManaOoru.
            </h2>
            <div className="mt-8 grid gap-4">
              {voices.map((v, i) => (
                <figure
                  key={v.name}
                  className="hover-lift animate-fade-up relative overflow-hidden rounded-[24px] border border-border/70 bg-card p-6 shadow-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Quote className="absolute right-5 top-5 size-12 rotate-180 text-primary/10" />
                  <div className="relative flex gap-5">
                    <img
                      src={v.img}
                      alt={v.name}
                      loading="lazy"
                      className="size-16 shrink-0 rounded-2xl object-cover ring-4 ring-accent/20"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: v.rating }).map((_, k) => (
                          <Star key={k} className="size-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <blockquote className="mt-3 text-lg font-semibold leading-8 text-clay">
                        "{v.quote}"
                      </blockquote>
                      <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-display text-xl font-semibold text-foreground">
                          {v.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{v.role}</p>
                      </figcaption>
                    </div>
                  </div>
                </figure>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-[24px] border border-border/60 bg-gradient-to-br from-card to-muted/60 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative grid size-2.5 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                    <span className="size-2 rounded-full bg-primary" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-clay">
                    Live in your village
                  </h3>
                </div>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              {liveActivity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No activity yet — be the first to post!
                </p>
              ) : (
                <ul className="space-y-4">
                  {liveActivity.map((a, i) => {
                    const Icon = typeIcon[a.type] ?? Activity;
                    return (
                      <li
                        key={a.id}
                        className="animate-fade-up flex gap-3 border-l-2 border-border pl-4"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div
                          className={`mt-0.5 grid size-8 flex-none place-items-center rounded-lg bg-background ${typeTint[a.type] ?? "text-primary"}`}
                        >
                          <Icon className="size-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug text-foreground line-clamp-2">
                            {a.title}
                          </p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                            {a.type} · {timeAgo(a.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link
                to="/announcements"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary"
              >
                <Zap className="size-4" /> See full activity feed
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements + Contacts */}
      <section id="announcements" className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Announcements */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-secondary/15 text-secondary">
                <Megaphone className="size-5" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-clay sm:text-3xl">
                Village notice board
              </h2>
            </div>
            <div className="space-y-3">
              {announcementItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                  No notices yet.{" "}
                  <Link to="/announcements" className="font-semibold text-primary hover:underline">
                    Post the first one
                  </Link>
                  .
                </p>
              ) : (
                announcementItems.map((a, i) => (
                  <article
                    key={a.id}
                    className="hover-lift animate-fade-up rounded-2xl border-l-4 border-accent bg-card p-5 shadow-sm"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {a.imageUrl && (
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        loading="lazy"
                        className="mb-4 aspect-[16/7] w-full rounded-xl object-cover"
                      />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        {a.category || "Notice"}
                      </span>
                      <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 font-medium text-foreground">{a.title}</p>
                    {a.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>

          {/* Contacts */}
          <div id="contacts">
            <div className="rounded-3xl bg-clay p-7 text-background shadow-[var(--shadow-lift)] sm:p-9">
              <div className="mb-7 flex items-center gap-3">
                <div className="relative grid size-11 place-items-center rounded-xl bg-background/10">
                  <Siren className="size-5" />
                  <span className="absolute inset-0 animate-pulse-ring rounded-xl" />
                </div>
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                  Important contacts
                </h2>
              </div>
              <ul className="divide-y divide-background/10">
                {contacts.map((c) => (
                  <li key={c.name} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm opacity-70">{c.role}</p>
                    </div>
                    <a
                      href={`tel:${c.num.replace(/\s|-/g, "")}`}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        c.urgent
                          ? "bg-primary text-primary-foreground hover:brightness-110"
                          : "bg-background/10 hover:bg-background/20"
                      }`}
                    >
                      <Phone className="size-4" /> {c.num}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-7xl px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">FAQ</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
            Questions villagers ask first
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Is ManaOoru free?",
              "Yes, villagers can browse and post local needs without commission.",
            ],
            [
              "Can I call directly?",
              "Every listing supports phone and WhatsApp contact for quick coordination.",
            ],
            [
              "Does it support Telugu?",
              "The platform is designed for Telugu, English, and Hindi workflows.",
            ],
          ].map(([q, a]) => (
            <div key={q} className="rounded-[20px] border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-semibold text-clay">{q}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 shadow-[var(--shadow-soft)] sm:p-14">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-accent/20 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-primary/15 blur-3xl animate-float-slow [animation-delay:-3s]" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-clay sm:text-5xl">
              Bring your village online.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
              Whether you grow rice, fix motors, drive tractors, or run a small shop — there's a
              place for you on ManaOoru. Free for every villager, forever.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/post-worker" className="px-6 py-3 text-sm font-semibold">
                  Create your profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/marketplace" className="px-6 py-3 text-sm font-semibold">
                  Browse the village
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground font-display italic">
              M
            </div>
            <span className="font-display text-lg font-semibold text-clay">ManaOoru</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground text-center">
            © {new Date().getFullYear()} ManaOoru · Built with care for our villages.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
            <Link to="/announcements" className="transition hover:text-primary">
              Notices
            </Link>
            <Link
              to="/services"
              search={{ kind: "services" }}
              className="transition hover:text-primary"
            >
              Support
            </Link>
            <Link to="/privacy" className="transition hover:text-primary">
              Privacy
            </Link>
            <Link to="/terms" className="transition hover:text-primary">
              Terms
            </Link>
            <Link
              to="/delete-account"
              className="transition hover:text-primary text-red-600/90 font-medium"
            >
              Data Safety
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
