import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useListingStats, timeAgo } from "@/lib/store";
import {
  Search, Users, Briefcase, Wheat, ShoppingBasket, Wrench, Megaphone,
  Tractor, Sprout, Beef, Hammer, Bike, Phone, Siren, MapPin, ArrowRight,
  Sparkles, Sun, Droplets, Wind, Star, Quote, CheckCircle2, Zap, Building2,
  HandHeart, ShieldCheck, Activity, LogIn, LogOut, User as UserIcon,
} from "lucide-react";
import heroVillage from "@/assets/hero-village.jpg";
import heroVideo from "@/assets/hero-village.mp4.asset.json";
import marketplaceImg from "@/assets/marketplace.jpg";
import farmlandImg from "@/assets/farmland.jpg";
import workersImg from "@/assets/workers.jpg";
import handsPaddy from "@/assets/hands-paddy.jpg";
import tractorImg from "@/assets/tractor.jpg";
import voice1 from "@/assets/voice-1.jpg";
import voice2 from "@/assets/voice-2.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ManaOoru — A Digital Home for Every Village" },
      { name: "description", content: "Find workers, lease land, buy local produce, hire services, and stay updated with village announcements — all in one place." },
      { property: "og:title", content: "ManaOoru — A Digital Home for Every Village" },
      { property: "og:description", content: "One platform for farmers, workers, services, and villagers. మా ఊరు, మన చేతుల్లో." },
    ],
  }),
  component: Index,
});

const quickActions = [
  { icon: Users, label: "Find Workers", te: "పనివారు", tint: "bg-primary/10 text-primary", to: "/workers" as const },
  { icon: Briefcase, label: "Post Work", te: "పని ఇవ్వండి", tint: "bg-secondary/10 text-secondary", to: "/post-work" as const },
  { icon: Wheat, label: "Lease Land", te: "భూమి కౌలు", tint: "bg-accent/20 text-clay", to: "/land" as const },
  { icon: ShoppingBasket, label: "Marketplace", te: "సంత", tint: "bg-primary/10 text-primary", to: "/marketplace" as const },
  { icon: Wrench, label: "Local Services", te: "స్థానిక సేవలు", tint: "bg-secondary/10 text-secondary", to: "/services" as const },
  { icon: Megaphone, label: "Announcements", te: "ప్రకటనలు", tint: "bg-accent/20 text-clay", to: "/announcements" as const },
];

const categoryRoutes: Record<string, "/marketplace" | "/services"> = {
  Tractors: "/services", Seeds: "/marketplace", Livestock: "/marketplace", Grain: "/marketplace",
  Tools: "/marketplace", Transport: "/services", Repairs: "/services", "Daily Goods": "/marketplace",
};

const categoryDefs = [
  { icon: Tractor, label: "Tractors", type: "service" as const },
  { icon: Sprout, label: "Seeds", type: "market" as const },
  { icon: Beef, label: "Livestock", type: "market" as const },
  { icon: Wheat, label: "Grain", type: "market" as const },
  { icon: Hammer, label: "Tools", type: "market" as const },
  { icon: Bike, label: "Transport", type: "service" as const },
  { icon: Wrench, label: "Repairs", type: "service" as const },
  { icon: ShoppingBasket, label: "Daily Goods", type: "market" as const },
];

const steps = [
  { n: "01", icon: HandHeart, title: "Join your village", body: "Sign up in seconds with your phone number. Pick your village and role." },
  { n: "02", icon: Search, title: "Post or search", body: "Need workers? Have land? Selling produce? Post once, reach the whole village." },
  { n: "03", icon: ShieldCheck, title: "Connect & verify", body: "Call directly or chat in-app. Every member is vouched for by neighbours." },
];

const voices = [
  {
    img: voice1,
    name: "Lakshmi Devi",
    role: "Dairy farmer · Kothur",
    quote: "I leased two acres in one week. Earlier this would have taken a whole season of asking around.",
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
  worker: Users, work: Briefcase, land: Wheat, market: ShoppingBasket, service: Wrench, announcement: Megaphone,
};
const typeTint: Record<string, string> = {
  worker: "text-primary", work: "text-secondary", land: "text-accent-foreground",
  market: "text-primary", service: "text-secondary", announcement: "text-primary",
};

const featuredImages = [workersImg, farmlandImg, marketplaceImg];

const contacts = [
  { name: "Ambulance", role: "Primary Health Center", num: "108", urgent: true },
  { name: "Police Station", role: "Local Sub-Inspector", num: "100" },
  { name: "Sarpanch Office", role: "Mr. Venkatesh R.", num: "0841-23456" },
  { name: "Agriculture Officer", role: "Crop & Subsidy Help", num: "98481 12443" },
];

function Index() {
  const { user, signOut } = useAuth();
  const { data: stats } = useListingStats();
  const liveActivity = stats?.recent.slice(0, 4) ?? [];
  const announcementItems = stats?.recent.filter((r) => r.type === "announcement").slice(0, 3) ?? [];
  const featured = stats?.recent.filter((r) => r.type !== "announcement").slice(0, 3) ?? [];
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg font-semibold italic shadow-sm">
              M
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-clay">
              ManaOoru
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/workers" className="hover:text-primary transition-colors">Workers</Link>
            <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
            <Link to="/services" className="hover:text-primary transition-colors">Services</Link>
            <Link to="/announcements" className="hover:text-primary transition-colors">Notices</Link>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground sm:inline-flex">
                <UserIcon className="size-3.5" /> {user.email?.split("@")[0]}
              </span>
              <button onClick={() => signOut()} aria-label="Sign out" className="grid size-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary">
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="inline-flex items-center gap-1.5 rounded-full bg-clay px-5 py-2 text-sm font-medium text-background transition hover:opacity-90">
              <LogIn className="size-4" /> Sign in
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Decorative kolam dot pattern */}
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-primary/15"
        >
          <defs>
            <pattern id="kolam" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#kolam)" />
        </svg>
        <div className="pointer-events-none absolute -right-32 -top-32 -z-10 size-[28rem] rounded-full bg-accent/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-40 -z-10 size-[28rem] rounded-full bg-secondary/15 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-28 lg:pt-20">
          {/* Left: copy */}
          <div>
            <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" />
              Digital Village Initiative
            </span>
            <h1 className="animate-fade-up mt-5 text-balance font-display text-[2.75rem] font-semibold leading-[1.02] text-clay sm:text-6xl md:text-7xl">
              Everything for your <em className="italic text-primary">village</em>, in one place.
            </h1>
            <p className="animate-fade-up mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg [animation-delay:120ms]">
              Find workers, lease farmland, sell produce, hire local services, and never
              miss a village notice — all from one simple app.
            </p>
            <p className="animate-fade-up mt-2 font-medium text-secondary [animation-delay:160ms]">
              మా ఊరు — అందరి ఊరు.
            </p>

            {/* Search */}
            <div className="animate-fade-up mt-7 [animation-delay:240ms]">
              <div className="group flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-[var(--shadow-soft)] focus-within:ring-2 focus-within:ring-primary/20">
                <div className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground sm:size-12">
                  <Search className="size-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search workers, seeds, tractors…"
                  className="min-w-0 flex-1 bg-transparent px-1 text-base text-foreground outline-none placeholder:text-muted-foreground/70"
                />
                <button className="hidden rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 sm:block">
                  Search
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="opacity-70">Popular:</span>
                {["Electrician", "Paddy seeds", "Tractor", "Plumber", "Dairy"].map((t) => (
                  <button
                    key={t}
                    className="rounded-full border border-border/60 bg-card px-3 py-1 transition hover:border-primary hover:text-primary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-fade-up mt-8 grid max-w-md grid-cols-3 gap-4 [animation-delay:320ms]">
              {[
                { k: stats?.villagers ?? 0, v: "Villagers" },
                { k: stats?.workers ?? 0, v: "Workers" },
                { k: stats?.land ?? 0, v: "Land posts" },
              ].map((s) => (
                <div key={s.v} className="border-l-2 border-primary/40 pl-3">
                  <p className="font-display text-2xl font-semibold text-clay sm:text-3xl">{s.k}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: image collage */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="animate-fade-up relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-muted shadow-[var(--shadow-lift)] [animation-delay:200ms]">
              <video
                src={heroVideo.url}
                poster={heroVillage}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-label="Village paddy fields at sunrise"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clay/40 via-transparent to-transparent" />
              {/* Weather chip */}
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/85 px-3 py-1.5 backdrop-blur-md">
                <Sun className="size-4 text-accent-foreground" />
                <span className="text-xs font-semibold text-clay">28° · Clear sky</span>
              </div>
              {/* Location badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-background/90 px-4 py-3 backdrop-blur-md">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Today in</p>
                  <p className="font-display text-base font-semibold text-clay">Kothur Village</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Droplets className="size-3.5 text-secondary" />64%</span>
                  <span className="flex items-center gap-1"><Wind className="size-3.5 text-secondary" />8 km/h</span>
                </div>
              </div>
            </div>

            {/* Floating hands card */}
            <div className="absolute -bottom-6 -left-4 hidden w-44 rotate-[-6deg] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-lift)] animate-float-slow sm:block">
              <img src={handsPaddy} alt="Paddy seedlings" loading="lazy" className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-secondary">Crop watch</p>
                <p className="text-xs font-medium text-clay">Paddy · ready in 14 days</p>
              </div>
            </div>

            {/* Floating stat pill */}
            <div className="absolute -right-2 top-6 hidden items-center gap-2 rounded-full bg-clay px-4 py-2 text-background shadow-[var(--shadow-lift)] animate-float-slow [animation-delay:-2s] sm:flex">
              <span className="relative grid size-2.5 place-items-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent/70" />
                <span className="size-2 rounded-full bg-accent" />
              </span>
              <span className="text-xs font-semibold">{stats?.total ?? 0} live listings</span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section id="actions" className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((a, i) => (
            <Link
              key={a.label}
              to={a.to}
              className="hover-lift animate-fade-up group flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 text-left shadow-sm"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`grid size-12 place-items-center rounded-xl ${a.tint} transition-transform group-hover:scale-110`}>
                <a.icon className="size-6" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-foreground">{a.label}</p>
                <p className="text-xs text-muted-foreground">{a.te}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:mt-28 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-secondary">How ManaOoru works</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
            Three simple steps. No paperwork, no middlemen.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="hover-lift animate-fade-up relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 shadow-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="absolute right-5 top-5 font-display text-5xl font-semibold text-primary/15">{s.n}</span>
              <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
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
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Village marketplace</span>
              <h2 className="font-display text-3xl font-semibold text-clay sm:text-4xl">
                Browse the village market
              </h2>
              <p className="mt-2 text-muted-foreground">From fresh produce to farm equipment — direct from neighbours.</p>
            </div>
            <Link to="/marketplace" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
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
                className="hover-lift animate-fade-up group flex aspect-square flex-col items-start justify-between rounded-2xl border border-border/60 bg-card p-4 text-left shadow-sm"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/25 text-primary transition-transform group-hover:rotate-[-6deg]">
                  <c.icon className="size-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.label}</p>
                  <p className="text-[10px] text-muted-foreground">{stats?.byType[c.type] ?? 0} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Subtle marquee strip for variety */}
        <div className="relative mt-10 border-y border-border/60 bg-clay py-4 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
          <div className="flex w-max animate-marquee gap-10 text-background/80">
            {[...Array(2)].flatMap((_, k) => [
              "🌾 Fresh harvest daily",
              "🤝 Verified neighbours only",
              "📞 Direct phone connect",
              "💸 No commission, ever",
              "🚜 Same-day equipment rental",
              "🌱 Seeds from local farmers",
            ].map((t, i) => (
              <span key={`${k}-${i}`} className="flex-none text-sm font-medium tracking-wide">{t}</span>
            )))}
          </div>
        </div>

        {/* Featured listings */}
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <h3 className="font-display text-2xl font-semibold text-clay">Featured this week</h3>
            <Link to="/marketplace" className="text-sm font-semibold text-primary hover:underline">View all listings →</Link>
          </div>
          {featured.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
              No listings yet. <Link to="/auth" className="font-semibold text-primary hover:underline">Sign in</Link> to be the first to post.
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
                    <img
                      src={featuredImages[i % featuredImages.length]}
                      alt={s.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
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
                      <a href={`tel:${s.contact.replace(/\s|-/g, "")}`} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground">
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
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Voices */}
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Voices from the village</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-clay sm:text-4xl">
              Real neighbours. Real results.
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {voices.map((v, i) => (
                <figure
                  key={v.name}
                  className="hover-lift animate-fade-up relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Quote className="absolute right-4 top-4 size-10 rotate-180 text-primary/15" />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: v.rating }).map((_, k) => (
                      <Star key={k} className="size-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="font-display text-lg italic leading-snug text-clay">
                    “{v.quote}”
                  </blockquote>
                  <figcaption className="mt-auto flex items-center gap-3">
                    <img src={v.img} alt={v.name} loading="lazy" className="size-12 rounded-full object-cover ring-2 ring-accent/40" />
                    <div>
                      <p className="font-semibold text-foreground">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {/* Live activity */}
          <div>
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card to-muted/60 p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative grid size-2.5 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/60" />
                    <span className="size-2 rounded-full bg-primary" />
                  </span>
                  <h3 className="font-display text-xl font-semibold text-clay">Live in your village</h3>
                </div>
                <Activity className="size-4 text-muted-foreground" />
              </div>
              {liveActivity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No activity yet — be the first to post!</p>
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
                        <div className={`mt-0.5 grid size-8 flex-none place-items-center rounded-lg bg-background ${typeTint[a.type] ?? "text-primary"}`}>
                          <Icon className="size-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug text-foreground line-clamp-2">{a.title}</p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">{a.type} · {timeAgo(a.createdAt)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              <Link to="/announcements" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-semibold text-muted-foreground hover:border-primary hover:text-primary">
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
              <h2 className="font-display text-2xl font-semibold text-clay sm:text-3xl">Village notice board</h2>
            </div>
            <div className="space-y-3">
              {announcementItems.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
                  No notices yet. <Link to="/announcements" className="font-semibold text-primary hover:underline">Post the first one</Link>.
                </p>
              ) : (
                announcementItems.map((a, i) => (
                  <article
                    key={a.id}
                    className="hover-lift animate-fade-up rounded-2xl border-l-4 border-accent bg-card p-5 shadow-sm"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{a.category || "Notice"}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 font-medium text-foreground">{a.title}</p>
                    {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
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
                <h2 className="font-display text-2xl font-semibold sm:text-3xl">Important contacts</h2>
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
      <section className="mx-auto mt-24 max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-10 shadow-[var(--shadow-soft)] sm:p-14">
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-accent/20 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-20 -left-10 size-72 rounded-full bg-primary/15 blur-3xl animate-float-slow [animation-delay:-3s]" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-clay sm:text-5xl">
              Bring your village online.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
              Whether you grow rice, fix motors, drive tractors, or run a small shop — there's
              a place for you on ManaOoru. Free for every villager, forever.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/post-worker" className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
                Create your profile
              </Link>
              <Link to="/marketplace" className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                Browse the village
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground font-display italic">M</div>
            <span className="font-display text-lg font-semibold text-clay">ManaOoru</span>
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} ManaOoru · Built with care for our villages.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Support</a>
            <a href="#" className="hover:text-primary">తెలుగు</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
