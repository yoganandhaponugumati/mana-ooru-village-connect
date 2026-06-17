import { createFileRoute } from "@tanstack/react-router";
import {
  Search, Users, Briefcase, Wheat, ShoppingBasket, Wrench, Megaphone,
  Tractor, Sprout, Beef, Hammer, Bike, Phone, Siren, MapPin, ArrowRight,
  Sparkles, Sun, Droplets, Wind, Star, Quote, CheckCircle2, Zap, Building2,
  HandHeart, ShieldCheck, Activity,
} from "lucide-react";
import heroVillage from "@/assets/hero-village.jpg";
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
  { icon: Users, label: "Find Workers", te: "పనివారు", tint: "bg-primary/10 text-primary" },
  { icon: Briefcase, label: "Post Work", te: "పని ఇవ్వండి", tint: "bg-secondary/10 text-secondary" },
  { icon: Wheat, label: "Lease Land", te: "భూమి కౌలు", tint: "bg-accent/20 text-clay" },
  { icon: ShoppingBasket, label: "Marketplace", te: "సంత", tint: "bg-primary/10 text-primary" },
  { icon: Wrench, label: "Local Services", te: "స్థానిక సేవలు", tint: "bg-secondary/10 text-secondary" },
  { icon: Megaphone, label: "Announcements", te: "ప్రకటనలు", tint: "bg-accent/20 text-clay" },
];

const categories = [
  { icon: Tractor, label: "Tractors", count: "24 listings" },
  { icon: Sprout, label: "Seeds", count: "61 listings" },
  { icon: Beef, label: "Livestock", count: "18 listings" },
  { icon: Wheat, label: "Grain", count: "42 listings" },
  { icon: Hammer, label: "Tools", count: "29 listings" },
  { icon: Bike, label: "Transport", count: "12 listings" },
  { icon: Wrench, label: "Repairs", count: "33 services" },
  { icon: ShoppingBasket, label: "Daily Goods", count: "57 items" },
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

const liveActivity = [
  { icon: Briefcase, text: "Ramesh posted 5 workers needed for paddy harvest", time: "Just now", tint: "text-primary" },
  { icon: ShoppingBasket, text: "Padma listed 30kg of fresh tomatoes — ₹25/kg", time: "12 min", tint: "text-secondary" },
  { icon: Tractor, text: "Tractor available for ploughing tomorrow", time: "1 hr", tint: "text-accent-foreground" },
  { icon: Megaphone, text: "New panchayat notice posted about water supply", time: "2 hr", tint: "text-primary" },
];

const services = [
  { title: "Master Electrician", who: "Babu Rao · 15 yrs", img: workersImg, tag: "Available now" },
  { title: "2 Acres Fertile Land", who: "Savitri Amma · East Canal", img: farmlandImg, tag: "₹12,000 / season" },
  { title: "Organic Produce", who: "Ravi Kumar · North Fields", img: marketplaceImg, tag: "₹40 / kg" },
];

const announcements = [
  { tag: "Panchayat", time: "2h ago", title: "Livestock vaccination drive this Saturday", te: "పశువుల వ్యాక్సినేషన్ శనివారం ఉదయం 9 గంటలకు." },
  { tag: "Agriculture", time: "Yesterday", title: "New subsidy for micro-irrigation announced", te: "బిందు సేద్యం పరికరాలకు కొత్త రాయితీలు." },
  { tag: "Notice", time: "2 days ago", title: "Scheduled power maintenance, 10 AM – 4 PM", te: "విద్యుత్ నిర్వహణ పని కారణంగా అంతరాయం." },
];

const contacts = [
  { name: "Ambulance", role: "Primary Health Center", num: "108", urgent: true },
  { name: "Police Station", role: "Local Sub-Inspector", num: "100" },
  { name: "Sarpanch Office", role: "Mr. Venkatesh R.", num: "0841-23456" },
  { name: "Agriculture Officer", role: "Crop & Subsidy Help", num: "98481 12443" },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground font-display text-lg font-semibold italic shadow-sm">
              M
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-clay">
              ManaOoru
            </span>
          </a>
          <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#actions" className="hover:text-primary transition-colors">Services</a>
            <a href="#marketplace" className="hover:text-primary transition-colors">Marketplace</a>
            <a href="#announcements" className="hover:text-primary transition-colors">Announcements</a>
            <a href="#contacts" className="hover:text-primary transition-colors">Contacts</a>
          </div>
          <button className="rounded-full bg-clay px-5 py-2 text-sm font-medium text-background transition hover:opacity-90">
            Join Village
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroVillage}
            alt="Village paddy fields at sunrise"
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/0 to-background/0" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 md:pb-28 md:pt-32">
          <div className="max-w-2xl">
            <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <Sparkles className="size-3.5" />
              Digital Village Initiative
            </span>
            <h1 className="animate-fade-up mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] text-clay sm:text-6xl md:text-7xl">
              Everything for your <em className="italic text-primary">village</em>, in one place.
            </h1>
            <p className="animate-fade-up mt-6 max-w-xl text-pretty text-lg text-muted-foreground [animation-delay:120ms]">
              Find workers, lease farmland, sell produce, hire local services, and never
              miss a village notice — all from one simple app.
            </p>
            <p className="animate-fade-up mt-2 font-medium text-secondary [animation-delay:160ms]">
              మా ఊరు — అందరి ఊరు.
            </p>

            {/* Search */}
            <div className="animate-fade-up mt-8 [animation-delay:240ms]">
              <div className="group flex items-center gap-2 rounded-2xl border border-border/60 bg-card p-2 shadow-[var(--shadow-soft)] focus-within:ring-2 focus-within:ring-primary/20">
                <div className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <Search className="size-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search workers, seeds, tractors, services…"
                  className="flex-1 bg-transparent px-1 text-base text-foreground outline-none placeholder:text-muted-foreground/70"
                />
                <button className="hidden rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 sm:block">
                  Search
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="opacity-70">Popular:</span>
                {["Electrician", "Paddy seeds", "Tractor on rent", "Plumber", "Dairy"].map((t) => (
                  <button
                    key={t}
                    className="rounded-full border border-border/60 bg-card px-3 py-1 transition hover:border-primary hover:text-primary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-fade-up mt-10 grid max-w-md grid-cols-3 gap-4 [animation-delay:320ms]">
              {[
                { k: "1,200+", v: "Villagers" },
                { k: "340+", v: "Workers" },
                { k: "85+", v: "Acres listed" },
              ].map((s) => (
                <div key={s.v}>
                  <p className="font-display text-2xl font-semibold text-clay">{s.k}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section id="actions" className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {quickActions.map((a, i) => (
            <button
              key={a.label}
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
            </button>
          ))}
        </div>
      </section>

      {/* Marketplace Category Marquee */}
      <section id="marketplace" className="mt-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold text-clay sm:text-4xl">
                Browse the village market
              </h2>
              <p className="mt-2 text-muted-foreground">From fresh produce to farm equipment — direct from neighbours.</p>
            </div>
            <a href="#" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex">
              See all <ArrowRight className="size-4" />
            </a>
          </div>
        </div>

        <div className="relative mt-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex w-max animate-marquee gap-3 px-4">
            {[...categories, ...categories].map((c, i) => (
              <div
                key={i}
                className="flex flex-none items-center gap-3 rounded-full border border-border/60 bg-card px-5 py-3 shadow-sm"
              >
                <c.icon className="size-5 text-primary" strokeWidth={1.75} />
                <span className="text-sm font-medium">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Featured listings */}
        <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((s, i) => (
              <article
                key={s.title}
                className="hover-lift animate-fade-up group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="inline-block rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                    {s.tag}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-semibold text-clay">{s.title}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {s.who}
                  </p>
                </div>
              </article>
            ))}
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
              {announcements.map((a, i) => (
                <article
                  key={a.title}
                  className="hover-lift animate-fade-up rounded-2xl border-l-4 border-accent bg-card p-5 shadow-sm"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{a.tag}</span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="mt-1.5 font-medium text-foreground">{a.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{a.te}</p>
                </article>
              ))}
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
              <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
                Create your profile
              </button>
              <button className="rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
                Watch how it works
              </button>
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
