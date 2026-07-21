import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  CloudSun,
  Leaf,
  MapPin,
  Megaphone,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  Sprout,
  Tractor,
  Wheat,
  Wrench,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter, SiteNav } from "./SiteNav";

type SceneKind =
  | "workers"
  | "land"
  | "market"
  | "services"
  | "weather"
  | "ai"
  | "problems"
  | "announcements"
  | "emergency"
  | "default";

type SceneMeta = {
  label: string;
  icon: typeof Leaf;
  chips: string[];
  stat: string;
  statLabel: string;
  action: string;
};

const sceneMeta: Record<SceneKind, SceneMeta> = {
  workers: {
    label: "Worker network",
    icon: Tractor,
    chips: ["Skilled", "Nearby", "Verified"],
    stat: "42",
    statLabel: "available hands",
    action: "Hire today",
  },
  land: {
    label: "Field intelligence",
    icon: Wheat,
    chips: ["Water", "Soil", "Access"],
    stat: "18",
    statLabel: "lease-ready plots",
    action: "Inspect field",
  },
  market: {
    label: "Village trade",
    icon: Sprout,
    chips: ["Fresh", "Direct", "Local"],
    stat: "24",
    statLabel: "fresh listings",
    action: "Trade direct",
  },
  services: {
    label: "Service fleet",
    icon: Wrench,
    chips: ["Repair", "Tools", "Booking"],
    stat: "12",
    statLabel: "service types",
    action: "Book support",
  },
  weather: {
    label: "Live forecast",
    icon: CloudSun,
    chips: ["Rain", "Wind", "Crop"],
    stat: "Live",
    statLabel: "weather signal",
    action: "Plan work",
  },
  ai: {
    label: "Village AI",
    icon: Bot,
    chips: ["Voice", "Weather", "Schemes"],
    stat: "3",
    statLabel: "languages",
    action: "Ask assistant",
  },
  problems: {
    label: "Issue command",
    icon: AlertTriangle,
    chips: ["Report", "Track", "Resolve"],
    stat: "24h",
    statLabel: "tracking loop",
    action: "Report issue",
  },
  announcements: {
    label: "Notice board",
    icon: Megaphone,
    chips: ["Official", "Alerts", "Public"],
    stat: "Now",
    statLabel: "village updates",
    action: "Read notice",
  },
  emergency: {
    label: "Rapid support",
    icon: Siren,
    chips: ["Call", "Nearest", "Fast"],
    stat: "108",
    statLabel: "priority access",
    action: "Call fast",
  },
  default: {
    label: "Village module",
    icon: Leaf,
    chips: ["Clear", "Local", "Trusted"],
    stat: "Live",
    statLabel: "village activity",
    action: "Open module",
  },
};

function getSceneKind(title: string): SceneKind {
  const text = title.toLowerCase();
  if (text.includes("worker")) return "workers";
  if (text.includes("land") || text.includes("farm")) return "land";
  if (text.includes("market")) return "market";
  if (text.includes("service")) return "services";
  if (text.includes("weather")) return "weather";
  if (text.includes("ai")) return "ai";
  if (text.includes("problem")) return "problems";
  if (text.includes("announcement") || text.includes("notice")) return "announcements";
  if (text.includes("emergency")) return "emergency";
  return "default";
}

function FeatureSceneObjects({ kind }: { kind: SceneKind }) {
  if (kind === "workers") {
    return (
      <>
        <motion.div
          className="feature-person feature-person-a"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-person feature-person-b"
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-tool feature-tool-shovel"
          animate={{ rotateZ: [-8, 5, -8] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-mini-tractor"
          animate={{ x: [-18, 18, -18] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span />
          <i />
        </motion.div>
      </>
    );
  }

  if (kind === "land") {
    return (
      <>
        <div className="feature-field-strip feature-field-strip-a" />
        <div className="feature-field-strip feature-field-strip-b" />
        <div className="feature-water-channel" />
        <motion.div
          className="feature-sprout feature-sprout-a"
          animate={{ y: [0, -6, 0], rotateZ: [-2, 3, -2] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-sprout feature-sprout-b"
          animate={{ y: [0, -9, 0], rotateZ: [2, -3, 2] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </>
    );
  }

  if (kind === "market") {
    return (
      <>
        <motion.div
          className="feature-crate feature-crate-a"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-crate feature-crate-b"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="feature-basket">
          <span />
          <span />
          <span />
        </div>
        <motion.div
          className="feature-price-tag"
          animate={{ rotateZ: [-4, 4, -4] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        >
          Fair price
        </motion.div>
      </>
    );
  }

  if (kind === "services") {
    return (
      <>
        <motion.div
          className="feature-service-tractor"
          animate={{ x: [-12, 18, -12] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span />
          <i />
        </motion.div>
        <motion.div
          className="feature-wrench"
          animate={{ rotateZ: [-18, 16, -18] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="feature-service-card feature-service-card-a" />
        <div className="feature-service-card feature-service-card-b" />
      </>
    );
  }

  if (kind === "weather") {
    return (
      <>
        <motion.div
          className="feature-sun"
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="feature-cloud feature-cloud-a"
          animate={{ x: [-18, 16, -18] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-cloud feature-cloud-b"
          animate={{ x: [12, -18, 12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="feature-rain-lines" />
      </>
    );
  }

  if (kind === "ai") {
    return (
      <>
        <motion.div
          className="feature-ai-core"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-ai-orbit feature-ai-orbit-a"
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="feature-ai-orbit feature-ai-orbit-b"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <div className="feature-chat-bubble feature-chat-a" />
        <div className="feature-chat-bubble feature-chat-b" />
      </>
    );
  }

  if (kind === "problems" || kind === "emergency" || kind === "announcements") {
    return (
      <>
        <motion.div
          className={`feature-alert-tower ${kind}`}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-signal-ring feature-signal-ring-a"
          animate={{ scale: [0.85, 1.16, 0.85], opacity: [0.7, 0.18, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="feature-signal-ring feature-signal-ring-b"
          animate={{ scale: [0.8, 1.28, 0.8], opacity: [0.55, 0.12, 0.55] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="feature-notice-panel" />
      </>
    );
  }

  return (
    <>
      <div className="feature-field-strip feature-field-strip-a" />
      <motion.div
        className="feature-sprout feature-sprout-a"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="feature-mini-tractor"
        animate={{ x: [-12, 14, -12] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <span />
        <i />
      </motion.div>
    </>
  );
}

function InternalPage3DScene({ title, icon }: { title: string; icon?: ReactNode }) {
  const kind = getSceneKind(title);
  const meta = sceneMeta[kind];
  const SceneIcon = meta.icon;

  return (
    <div className="internal-3d-stage" data-scene={kind} aria-hidden="true">
      <motion.div
        initial={{ opacity: 0, rotateX: 16, rotateY: -18, y: 28 }}
        animate={{ opacity: 1, rotateX: 10, rotateY: -14, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="internal-3d-world"
      >
        <div className="internal-3d-grid">
          <FeatureSceneObjects kind={kind} />
        </div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          className="internal-3d-card internal-3d-card-main"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/70">
                {meta.label}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-clay">{title}</p>
            </div>
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-white shadow-[var(--shadow-glow)]">
              {icon || <SceneIcon className="size-6" />}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {meta.chips.map((label, index) => {
              const ChipIcon = [Sparkles, MapPin, ShieldCheck][index] ?? Sparkles;
              return (
                <div key={label} className="rounded-2xl bg-white/72 p-3 shadow-sm">
                  <ChipIcon className="size-4 text-primary" />
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-clay">
                    {label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 9, 0], rotateZ: [0, 1.5, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          className="internal-3d-card internal-3d-card-side"
        >
          <Zap className="size-5 text-accent" />
          <span>
            {kind === "workers"
              ? "Worker match live"
              : kind === "services"
                ? "Book local tools"
                : "Fast village actions"}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FeatureHeroShowcase({ title }: { title: string }) {
  const kind = getSceneKind(title);
  const meta = sceneMeta[kind];
  const SceneIcon = meta.icon;
  const detail =
    kind === "workers"
      ? "Workers, tools, and tractors moving in sync"
      : kind === "land"
        ? "Fields, water access, and crop growth"
        : kind === "market"
          ? "Fresh produce, crates, and direct pricing"
          : kind === "services"
            ? "Tools, tractor rental, and repair support"
            : kind === "weather"
              ? "Live sun, cloud, rain, and crop signals"
              : kind === "ai"
                ? "Voice, chat, weather, and scheme guidance"
                : kind === "emergency"
                  ? "Fast call signals and nearby support"
                  : kind === "problems"
                    ? "Report, track, and resolve village issues"
                    : kind === "announcements"
                      ? "Official notices and alert signals"
                      : "Village actions moving in real time";

  return (
    <div className="feature-hero-showcase" data-scene={kind} aria-hidden="true">
      <motion.div
        className="feature-hero-plane"
        initial={{ opacity: 0, rotateX: 62, rotateZ: -34, y: 30 }}
        animate={{ opacity: 1, rotateX: [62, 58, 62], rotateZ: [-34, -31, -34], y: 0 }}
        transition={{ duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
      >
        <FeatureSceneObjects kind={kind} />
      </motion.div>

      <motion.div
        className="feature-hero-panel feature-hero-panel-main"
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary/70">
          {meta.label}
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-clay">{detail}</p>
        <div className="mt-5 grid grid-cols-[0.8fr_1fr] gap-3">
          <div className="feature-hero-mini-stat">
            <strong>{meta.stat}</strong>
            <span>{meta.statLabel}</span>
          </div>
          <div className="feature-hero-mini-action">
            <Zap className="size-4" />
            <span>{meta.action}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="feature-hero-panel feature-hero-panel-side"
        animate={{ y: [0, 12, 0], rotateZ: [0, 1.5, 0] }}
        transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {meta.chips.map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </motion.div>

      <motion.div
        className="feature-hero-live-card"
        animate={{ y: [0, -10, 0], rotateZ: [0, -1.5, 0] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <SceneIcon className="size-5 text-primary" />
        <div>
          <p>{meta.label}</p>
          <strong>{meta.action}</strong>
        </div>
      </motion.div>
    </div>
  );
}

function FullScreenFeatureBackground({ title }: { title: string }) {
  const kind = getSceneKind(title);

  return (
    <div className="feature-background-stage" data-scene={kind} aria-hidden="true">
      <div className="feature-background-haze feature-background-haze-a" />
      <div className="feature-background-haze feature-background-haze-b" />
      <div className="feature-background-plane">
        <FeatureSceneObjects kind={kind} />
      </div>
      <div className="feature-background-chip feature-background-chip-a" />
      <div className="feature-background-chip feature-background-chip-b" />
    </div>
  );
}

export function PageLayout({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="premium-page-bg village-site-bg min-h-screen text-foreground">
      <FullScreenFeatureBackground title={title} />
      <SiteNav />
      <header className="page-village-hero relative overflow-hidden border-b border-white/45 pt-14 shadow-[0_24px_90px_-62px_rgba(20,49,32,0.78)] backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.58)_36%,rgba(255,255,255,0.18)_68%,rgba(255,255,255,0.06)),linear-gradient(246deg,rgba(24,169,153,0.18),transparent_46%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        {/* On mobile: simple text header. On lg+: card + 3D scene */}
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:grid lg:min-h-[380px] lg:grid-cols-[0.62fr_1.18fr] lg:items-center lg:gap-6 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-10 flex flex-col gap-4 rounded-2xl border border-white/78 bg-white/85 p-4 shadow-md backdrop-blur-2xl sm:flex-row sm:items-center sm:gap-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              {icon && (
                <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/65 bg-white/60 text-primary shadow-sm backdrop-blur-xl">
                  {icon}
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/78 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary shadow-sm backdrop-blur-xl">
                  <Sparkles className="size-3" />
                  ManaOoru
                </div>
                <h1 className="mt-2 text-balance font-display text-2xl font-semibold text-clay sm:text-3xl lg:text-4xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
          {/* 3D showcase only on large screens */}
          <div className="hidden lg:block">
            <FeatureHeroShowcase title={title} />
            <InternalPage3DScene title={title} icon={icon} />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 pb-20 lg:pb-10">
        <nav
          className="village-quick-nav mb-6 grid grid-cols-2 gap-2 rounded-2xl p-2 shadow-sm backdrop-blur-2xl sm:grid-cols-4 sm:gap-3"
          aria-label="Page quick actions"
        >
          {[
            { label: "Search", to: "/search", icon: Search },
            { label: "Timeline", to: "/timeline", icon: Activity },
            { label: "Weather", to: "/weather", icon: CloudSun },
            { label: "Emergency", to: "/emergency", icon: Siren },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-clay transition hover:bg-white hover:shadow-sm"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="size-4" />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
