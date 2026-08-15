import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Leaf,
  ShieldCheck,
  Sparkles,
  Bot,
  Users,
  Megaphone,
  AlertTriangle,
  Camera,
  Globe2,
  Heart,
  ArrowRight,
  Star,
  Zap,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GramMitra — India's Village Digital OS" },
      {
        name: "description",
        content:
          "GramMitra is India's most complete digital village platform — built for rural communities, Gram Panchayats, farmers, workers, and citizens. Free, zero-brokerage, and Telugu-first.",
      },
    ],
  }),
  component: AboutPage,
});

const APP_VERSION = "2.0.0";

const features = [
  {
    icon: Camera,
    title: "Village Stories (24h)",
    description:
      "WhatsApp-style 24-hour stories from village officials. Report road damage, share community events, and keep every villager informed in real time.",
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-950/50",
    unique: true,
  },
  {
    icon: AlertTriangle,
    title: "Civic Problem Reporting",
    description:
      "Report broken roads, drainage overflows, or streetlight failures with photo proof. Track status from Pending → In Progress → Resolved.",
    color: "text-red-600",
    bg: "bg-red-100 dark:bg-red-950/50",
  },
  {
    icon: Bot,
    title: "GramMitra AI Assistant",
    description:
      "Get instant answers on crop advice, government schemes, farming techniques, and scheme eligibility — in Telugu, Hindi, or English.",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-950/50",
    unique: true,
  },
  {
    icon: Megaphone,
    title: "Panchayat Announcements",
    description:
      "Official Gram Panchayat notices, scheme deadlines, and community events delivered as push notifications.",
    color: "text-emerald-600",
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  {
    icon: Users,
    title: "Zero-Brokerage Marketplace",
    description:
      "Sell crops, tools, livestock, and services directly to your village neighbours. No middleman. No commission. 100% free.",
    color: "text-amber-600",
    bg: "bg-amber-100 dark:bg-amber-950/50",
    unique: true,
  },
  {
    icon: Globe2,
    title: "Telugu Voice Search",
    description:
      "Search for workers, services, and listings using your voice — in Telugu, Hindi, or English. Village-first language support.",
    color: "text-indigo-600",
    bg: "bg-indigo-100 dark:bg-indigo-950/50",
    unique: true,
  },
];

const stats = [
  { value: "100%", label: "Free to use" },
  { value: "0%", label: "Commission charged" },
  { value: "24h", label: "Story updates" },
  { value: "3", label: "Languages supported" },
];

function AboutPage() {
  return (
    <PageLayout
      title="About GramMitra"
      subtitle="India's first complete digital village operating system — built for Gram Panchayats, farmers, workers, and every citizen."
      icon={<Leaf className="size-7 text-primary" />}
    >
      <div className="mx-auto max-w-4xl space-y-12">
        {/* Mission */}
        <SurfaceCard className="p-6 sm:p-10 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 text-center">
          <div className="mx-auto size-16 grid place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 mb-5">
            <Leaf className="size-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-clay dark:text-zinc-100">
            Our Mission
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
            GramMitra exists to bring every Indian village online — with trust, transparency, and
            zero exploitation. We believe every farmer, worker, and citizen deserves free, direct
            access to their panchayat, neighbours, and government benefits.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-primary/10 p-4 text-center">
                <p className="font-display text-2xl font-black text-primary">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* What Makes Us Different */}
        <div>
          <div className="mb-6 flex items-center gap-2">
            <Star className="size-5 text-amber-500" />
            <h2 className="font-display text-xl font-extrabold text-clay dark:text-zinc-100">
              What Makes GramMitra Different
            </h2>
            <span className="ml-1 rounded-full bg-amber-100 dark:bg-amber-950/50 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              vs other village apps
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <SurfaceCard key={f.title} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${f.bg}`}>
                      <Icon className={`size-5 ${f.color}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-display text-sm font-bold text-clay dark:text-zinc-100">
                          {f.title}
                        </p>
                        {f.unique && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary uppercase tracking-wider">
                            <Zap className="size-2.5" /> Unique
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                  </div>
                </SurfaceCard>
              );
            })}
          </div>
        </div>

        {/* Security & Trust */}
        <SurfaceCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="font-display text-xl font-bold text-clay dark:text-zinc-100">
              Security & Trust
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
            {[
              "Village-isolated data — your village data stays in your village only",
              "Row-Level Security (RLS) enforced at the database layer",
              "Zero personal data sold to advertisers or data brokers",
              "Content moderation via Google Perspective API + local filters",
              "Rate limiting on all user actions to prevent spam",
              "All file uploads restricted by type and size",
              "Play Store compliant privacy policy and data deletion portal",
              "HTTPS enforced with HSTS + Content Security Policy headers",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* App Info */}
        <SurfaceCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="grid size-10 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600">
              <Sparkles className="size-5" />
            </div>
            <h2 className="font-display text-xl font-bold text-clay dark:text-zinc-100">
              App Information
            </h2>
          </div>
          <div className="grid gap-2 text-sm">
            {[
              ["App Name", "GramMitra — Smart Village Ecosystem"],
              ["Version", APP_VERSION],
              ["Platform", "Web (PWA) + Android (Play Store)"],
              ["Languages", "Telugu · Hindi · English"],
              ["Developer", "GramMitra Team"],
              ["Support Email", "hello@grammitra.org"],
              ["Privacy Email", "privacy@grammitra.org"],
              ["Website", "https://grammitra-app.vercel.app"],
            ].map(([key, val]) => (
              <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-border/50 last:border-0">
                <span className="font-semibold text-foreground shrink-0">{key}</span>
                <span className="text-muted-foreground text-right">{val}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/privacy"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground hover:border-primary hover:text-primary transition"
          >
            Privacy Policy <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/support"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground hover:border-primary hover:text-primary transition"
          >
            Support & Help <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/25 hover:brightness-110 transition"
          >
            <Heart className="size-4" /> Back to GramMitra
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
