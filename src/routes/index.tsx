import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
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
  Leaf,
  Landmark,
} from "lucide-react";
import { SiteNav } from "@/components/SiteNav";
import { Card3D } from "@/components/design-system";
import { Button } from "@/components/ui/button";
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

  const [tilt, setTilt] = useState({ x: 12, y: -18 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({
      x: 12 - y * 16,
      y: -18 + x * 24,
    });
  };
  const handleMouseLeave = () => {
    setTilt({ x: 12, y: -18 });
  };

  return (
    <div
      className="hero-3d-stage"
      aria-hidden="true"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          y: 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
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
          whileHover={{ translateZ: 220, scale: 1.05, y: -12 }}
          transition={{
            y: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
            default: { type: "spring", stiffness: 120, damping: 15 },
          }}
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
              <div
                key={metric.label}
                className="rounded-2xl bg-white/72 p-3 shadow-sm hover:bg-white transition-colors duration-200"
              >
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
          whileHover={{ translateZ: 260, scale: 1.06, y: 10 }}
          transition={{
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            default: { type: "spring", stiffness: 120, damping: 15 },
          }}
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
          whileHover={{ translateZ: 280, scale: 1.06, y: -9 }}
          transition={{
            y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
            default: { type: "spring", stiffness: 120, damping: 15 },
          }}
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
      {/* Nav */}
      <SiteNav />

      {/* Hero */}
      <CinemaHero
        heroTitle={heroTitle}
        villageName={villageName}
        heroWeather={heroWeather}
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        submitSearch={submitSearch}
        navigate={navigate}
        hasRealActivity={hasRealActivity}
        subtitle={`${t.subtitle1} ${t.subtitle2}`}
        searchPlaceholder={t.search}
        popularLabel={t.popular}
        exploreLabel={t.explore}
        postLabel={t.post}
        announcement={announcementItems[0]}
      />

      {/* Quick Actions */}
      <section
        id="actions"
        className="relative z-30 mx-auto -mt-20 max-w-[calc(100%-2rem)] overflow-hidden rounded-t-[32px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(232,247,239,0.82)_48%,rgba(255,246,222,0.8))] px-4 py-9 shadow-[0_-24px_80px_-50px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:px-6 lg:max-w-[calc(100%-3rem)] lg:rounded-t-[40px]"
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

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="overflow-hidden rounded-[24px] border border-primary/20 bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-5 p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                  <Megaphone className="size-3.5" /> Top notice
                </span>
                <Link
                  to="/announcements"
                  className="text-xs font-semibold text-white/80 hover:text-white"
                >
                  View all
                </Link>
              </div>
              {announcementItems[0] ? (
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end">
                  <div>
                    <p className="text-sm text-white/72">
                      {announcementItems[0].category || "Village Notice"}
                    </p>
                    <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">
                      {announcementItems[0].title}
                    </h2>
                    {announcementItems[0].description && (
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/82">
                        {announcementItems[0].description}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    {announcementItems[0].imageUrl ? (
                      <img
                        src={announcementItems[0].imageUrl}
                        alt={announcementItems[0].title}
                        className="aspect-[4/3] w-full rounded-2xl border border-white/15 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl border border-white/15 bg-white/10 text-white/80">
                        <Megaphone className="size-8" />
                      </div>
                    )}
                    <p className="rounded-full bg-white/15 px-4 py-2 text-center text-xs font-semibold text-white">
                      {timeAgo(announcementItems[0].createdAt)}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="font-display text-2xl font-semibold">No notice posted yet</h2>
                  <p className="mt-2 text-sm text-white/75">
                    Post a Panchayat, school, health, water, or power notice.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
                  Needs attention
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-clay">
                  Citizen problem reports
                </h2>
              </div>
              <Link
                to="/problems"
                className="inline-flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                aria-label="Report problem"
              >
                <ImagePlus className="size-5" />
              </Link>
            </div>
            {problemItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-muted/50 p-5 text-sm leading-7 text-muted-foreground">
                No road, drainage, water, or streetlight issues posted yet. Add a photo report to
                make it visible.
              </p>
            ) : (
              <div className="space-y-3">
                {problemItems.map((item) => (
                  <Link
                    key={item.id}
                    to="/problems"
                    className="flex gap-3 rounded-2xl border border-border bg-white p-3 transition hover:border-red-200 hover:bg-red-50/40"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="size-16 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="grid size-16 place-items-center rounded-xl bg-red-50 text-red-600">
                        <AlertTriangle className="size-5" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-clay">{item.title}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {item.location || item.category || "Village issue"} -{" "}
                        {timeAgo(item.createdAt)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
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
            <Link to="/delete-account" className="transition hover:text-primary text-red-600/90 font-medium">
              Data Safety
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
