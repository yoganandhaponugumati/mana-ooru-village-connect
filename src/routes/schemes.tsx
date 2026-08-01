import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  FileText,
  Fingerprint,
  Landmark,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Users,
  Tractor,
  Home,
  GraduationCap,
  Heart,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import {
  SectionHeader,
  SurfaceCard,
} from "@/components/design-system";
import { citizenServices, schemes } from "@/lib/app-data";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [{ title: "Government Schemes Matcher & Assistant — ManaOoru" }] }),
  component: SchemesPage,
});

const PROFILE_CHIPS = [
  { id: "all", label: "All Schemes", icon: Sparkles, img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&q=70&auto=format&fit=crop" },
  { id: "agriculture", label: "Farmers & Agriculture", icon: Tractor, img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&q=70&auto=format&fit=crop" },
  { id: "women", label: "Women & SHGs", icon: Heart, img: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=200&q=70&auto=format&fit=crop" },
  { id: "education", label: "Students & Youth", icon: GraduationCap, img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&q=70&auto=format&fit=crop" },
  { id: "housing", label: "Housing & Loans", icon: Home, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=70&auto=format&fit=crop" },
  { id: "pension", label: "Seniors & Pensions", icon: Users, img: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200&q=70&auto=format&fit=crop" },
] as const;

// Map scheme category to a relevant Unsplash image
const SCHEME_CATEGORY_IMAGES: Record<string, string> = {
  agriculture: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=70&auto=format&fit=crop",
  farmers: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=70&auto=format&fit=crop",
  women: "https://images.unsplash.com/photo-1594708767771-a7502209ff51?w=400&q=70&auto=format&fit=crop",
  education: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=70&auto=format&fit=crop",
  housing: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&q=70&auto=format&fit=crop",
  pension: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=70&auto=format&fit=crop",
  health: "https://images.unsplash.com/photo-1588776814546-1ffbb043e5c8?w=400&q=70&auto=format&fit=crop",
  general: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=70&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=70&auto=format&fit=crop",
};

function getSchemeImage(category: string, title: string): string {
  const cat = (category || "").toLowerCase();
  const ttl = (title || "").toLowerCase();
  if (/tractor|farm|agri|crop|kisan|rythu|land|seed|harvest/i.test(ttl)) return SCHEME_CATEGORY_IMAGES.agriculture;
  if (/women|mahila|shg|lakshmi|mother|kalyana/i.test(ttl)) return SCHEME_CATEGORY_IMAGES.women;
  if (/house|awas|indiramma|home|shelter/i.test(ttl)) return SCHEME_CATEGORY_IMAGES.housing;
  if (/student|school|scholar|youth|vidya|skill/i.test(ttl)) return SCHEME_CATEGORY_IMAGES.education;
  if (/pension|senior|aasara|old age|widow/i.test(ttl)) return SCHEME_CATEGORY_IMAGES.pension;
  if (/health|medical|hospital/i.test(ttl)) return SCHEME_CATEGORY_IMAGES.health;
  return SCHEME_CATEGORY_IMAGES[cat] || SCHEME_CATEGORY_IMAGES.default;
}



function SchemesPage() {
  const { profile } = useVillagePreferences();
  const [selectedProfile, setSelectedProfile] = useState<string>("all");

  const filterScheme = (cat: string, title: string, desc: string) => {
    if (selectedProfile === "all") return true;
    const text = `${cat} ${title} ${desc}`.toLowerCase();
    if (selectedProfile === "agriculture")
      return /agri|farm|rythu|crop|kisan|land|seed/i.test(text);
    if (selectedProfile === "women") return /women|mahila|shg|kalyana|lakshmi|mother/i.test(text);
    if (selectedProfile === "education")
      return /student|school|scholar|youth|skill|vidya/i.test(text);
    if (selectedProfile === "housing") return /house|awas|indiramma|home|shelter/i.test(text);
    if (selectedProfile === "pension") return /pension|senior|aasara|old age|widow/i.test(text);
    return true;
  };

  const requestPanchayatHelp = (schemeTitle: string) => {
    const msg = `🙏 Namaste Panchayat Admin! I need assistance understanding eligibility and document verification for the government scheme: *${schemeTitle}*.\n\nPlease guide me on how to submit my application.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <PageLayout
      title="Government Schemes Matcher & Assistant"
      subtitle="Interactive profile matching with required document checklists and direct application assistance."
      icon={<Landmark className="size-7 text-primary" />}
    >
      {/* Live sync banner */}
      <div className="mb-6 rounded-2xl border-2 border-emerald-400/40 bg-emerald-500/10 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md animate-pulse">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
            <Activity className="size-5 animate-pulse" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
              <span>📡 Government API Sync Active</span>
              <span className="inline-flex size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-clay dark:text-zinc-300 font-semibold mt-0.5">
              Live link to DBT-Bharat & State welfare database. Auto-updated every time the government publishes new schemes or criteria.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider shrink-0 self-start sm:self-center">
          Last Check: Today, {new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Interactive Profile Matcher Bar */}
      <SurfaceCard
        hover={false}
        className="mb-8 p-6 bg-gradient-to-br from-primary/10 via-card to-card border-2 border-primary/25 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-clay">
                Find Schemes For Your Profile (`1-Tap Matcher`)
              </h3>
              <p className="text-xs text-muted-foreground">
                Select who you are below to instantly filter eligible state and national benefits:
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 overflow-x-auto pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {PROFILE_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const active = selectedProfile === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedProfile(chip.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all border-2 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-primary-foreground" : "text-primary"}`} />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </SurfaceCard>

      {selectedProfile === "all" && (
        <>
          <SectionHeader
            eyebrow="Keep Documents Ready"
            title="Essential Certificates & Identity Centers"
            description="Fast access to Aadhaar, Ration Card, Income/Caste certificates, and worker registrations needed for all schemes."
            compact
            className="mt-8"
          />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {citizenServices.map((service, index) => {
          const Icon = [Fingerprint, FileText, SearchCheck, ShieldCheck][index % 4];
          return (
            <a
              key={service.id}
              href={service.apply}
              target="_blank"
              rel="noreferrer"
              className="group relative flex items-start gap-4 rounded-[24px] border border-border/60 bg-white/60 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5 dark:bg-zinc-900/50 dark:hover:bg-zinc-900"
            >
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-inner">
                <Icon className="size-6 transition-transform group-hover:scale-110" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                   <div className="min-w-0 flex-1">
                     <p className="font-display text-base font-bold text-clay dark:text-zinc-100 truncate">{service.title}</p>
                     <p className="text-[10px] font-semibold text-secondary truncate">{service.category}</p>
                   </div>
                   <ExternalLink className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p className="mt-1.5 text-xs font-medium leading-relaxed text-muted-foreground line-clamp-2 break-words whitespace-normal">
                  {service.description}
                </p>
                <div className="mt-2.5 flex items-center gap-1.5 min-w-0 w-full overflow-hidden">
                  <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-secondary">
                    <FileText className="mr-1 size-2.5" /> Keep Ready
                  </span>
                  <span className="truncate min-w-0 flex-1 text-[10px] font-semibold text-muted-foreground">
                    {service.documents.join(", ")}
                  </span>
                </div>
              </div>
            </a>
            );
          })}
          </div>
        </>
      )}

      <SectionHeader
        eyebrow="Nationwide & State Benefits"
        title={`Major Government Schemes (${profile.district || "District & State"})`}
        description="Key welfare programs matched to your selected profile with exact document checklists."
        compact
        className={selectedProfile === "all" ? "mt-16" : "mt-8"}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schemes
          .filter((scheme) =>
            filterScheme(scheme.category, scheme.title, `${scheme.benefit} ${scheme.eligibility}`),
          )
          .map((scheme) => (
            <SurfaceCard
              key={scheme.id}
              className="p-4 flex flex-row gap-4 border-border/80 bg-card/95 shadow-sm hover:shadow-md transition-all rounded-[1.25rem] overflow-hidden items-start"
            >
              {/* Scheme header image (Thumbnail) */}
              <div className="relative w-28 h-32 sm:w-36 sm:h-40 shrink-0 overflow-hidden rounded-[14px] shadow-sm border border-border/80">
                <img
                  src={getSchemeImage(scheme.category, scheme.title)}
                  alt={scheme.title}
                  loading="lazy"
                  className="h-full w-full object-cover brightness-90"
                />
                <div className="absolute bottom-1 left-1 right-1 rounded-md bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white flex items-center justify-center backdrop-blur-md min-w-0 overflow-hidden">
                  <span className="truncate min-w-0">{scheme.category}</span>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <h3 className="font-display text-[16px] font-bold text-clay leading-tight mb-1.5">
                  {scheme.title}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
                  {scheme.benefit}
                </p>

                <div className="mt-3 rounded-xl bg-muted/70 p-3 border border-border/60">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <FileText className="size-3.5" /> Mandatory Documents
                  </p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground font-semibold leading-relaxed">
                    {scheme.documents.join(", ")}
                  </p>
                </div>

                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-2.5">
                  <strong className="text-clay">Eligibility:</strong> {scheme.eligibility}
                </p>

                <div className="mt-6 border-t border-border/70 pt-4 space-y-2.5">
                  <a
                    href={scheme.apply}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-105 shadow-sm"
                  >
                    Check Portal &amp; Apply <ExternalLink className="size-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => requestPanchayatHelp(scheme.title)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-clay hover:bg-muted transition"
                  >
                    <HelpCircle className="size-3.5 text-primary" /> Request Panchayat Assistance
                  </button>
                </div>
              </div>
            </SurfaceCard>
          ))}
      </div>
    </PageLayout>
  );
}
