import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Fingerprint,
  Landmark,
  Plus,
  SearchCheck,
  ShieldCheck,
  X,
  XCircle,
  Sparkles,
  HelpCircle,
  Users,
  Tractor,
  Home,
  GraduationCap,
  Heart,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageLayout } from "@/components/PageLayout";
import {
  AppButton,
  EmptyState,
  SectionHeader,
  SkeletonCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/design-system";
import { citizenServices, schemes } from "@/lib/app-data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  applicationStatusLabels,
  schemeCategoryLabels,
  useApplyToScheme,
  useCreateScheme,
  useMyApplications,
  useVillageSchemes,
  type ApplicationStatus,
  type SchemeCategory,
} from "@/lib/schemes";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [{ title: "Government Schemes Matcher & Assistant — ManaOoru" }] }),
  component: SchemesPage,
});

const statusTone: Record<ApplicationStatus, "primary" | "accent" | "success" | "danger"> = {
  submitted: "accent",
  under_review: "primary",
  approved: "success",
  rejected: "danger",
};

const statusIcon: Record<ApplicationStatus, typeof Clock3> = {
  submitted: Clock3,
  under_review: Clock3,
  approved: CheckCircle2,
  rejected: XCircle,
};

const PROFILE_CHIPS = [
  { id: "all", label: "All Schemes", icon: Sparkles },
  { id: "agriculture", label: "Farmers & Agriculture", icon: Tractor },
  { id: "women", label: "Women & SHGs", icon: Heart },
  { id: "education", label: "Students & Youth", icon: GraduationCap },
  { id: "housing", label: "Housing & Loans", icon: Home },
  { id: "pension", label: "Seniors & Pensions", icon: Users },
] as const;

function SchemesPage() {
  const navigate = useNavigate();
  const { profile } = useVillagePreferences();
  const { user, role } = useAuth();
  const canManage = role === "village_admin" || role === "super_admin";

  const { data: villageSchemes, isLoading } = useVillageSchemes();
  const { data: myApplications } = useMyApplications();
  const applyMutation = useApplyToScheme();
  const createMutation = useCreateScheme();
  const [showForm, setShowForm] = useState(false);
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

        <div className="flex flex-wrap gap-2.5 pt-2">
          {PROFILE_CHIPS.map((chip) => {
            const Icon = chip.icon;
            const active = selectedProfile === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSelectedProfile(chip.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-background border border-border text-muted-foreground hover:border-primary hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </SurfaceCard>

      {/* Live, DB-backed schemes posted by this village's admin */}
      <SectionHeader
        eyebrow="Apply directly on ManaOoru"
        title="Schemes Active in Our Gram Panchayat"
        description="Apply online right here with your village admin and track status step by step."
        actions={
          canManage && (
            <AppButton
              variant="secondary"
              icon={showForm ? <X className="size-4" /> : <Plus className="size-4" />}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Close Form" : "Post New Panchayat Scheme"}
            </AppButton>
          )
        }
      />

      {showForm && canManage && (
        <CreateSchemeForm
          onCreate={(input) =>
            createMutation.mutate(input, { onSuccess: () => setShowForm(false) })
          }
          busy={createMutation.isPending}
        />
      )}

      {isLoading ? (
        <SkeletonCard count={3} />
      ) : !villageSchemes || villageSchemes.length === 0 ? (
        <EmptyState
          icon={<Landmark className="size-6" />}
          title="No live village schemes active right now"
          description={
            canManage
              ? "Post your first scheme so citizens can apply and track status right here."
              : "Your Village Admin hasn't posted custom local schemes yet. Explore the major state & national schemes below!"
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {villageSchemes
            .filter((s) => filterScheme(s.category || "", s.title || "", s.description || ""))
            .map((scheme) => {
              const myApplication = myApplications?.[scheme.id];
              const StatusIcon = myApplication ? statusIcon[myApplication.status] : null;
              return (
                <SurfaceCard
                  key={scheme.id}
                  className="p-6 flex flex-col justify-between border-primary/20 bg-card/95 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge tone="accent">
                        {schemeCategoryLabels[scheme.category as SchemeCategory] || scheme.category}
                      </StatusBadge>
                      {scheme.status !== "active" && (
                        <StatusBadge tone="secondary">{scheme.status}</StatusBadge>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-bold text-clay">
                      {scheme.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {scheme.description}
                    </p>
                    {scheme.eligibility && (
                      <p className="mt-4 text-sm leading-6 text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/60">
                        <strong className="text-clay block mb-0.5">Eligibility Criteria:</strong>{" "}
                        {scheme.eligibility}
                      </p>
                    )}
                    {scheme.benefit_amount ? (
                      <p className="mt-4 inline-block rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-sm font-extrabold text-emerald-700">
                        Benefit: ₹{scheme.benefit_amount.toLocaleString("en-IN")}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-6 border-t border-border/70 pt-4 space-y-3">
                    {scheme.deadline && (
                      <p className="text-xs text-muted-foreground font-semibold">
                        ⏰ Application Deadline:{" "}
                        {new Date(scheme.deadline).toLocaleDateString("en-IN")}
                      </p>
                    )}

                    {myApplication ? (
                      <div
                        className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${
                          statusTone[myApplication.status] === "success"
                            ? "bg-[#dcfce7] text-[#15803d]"
                            : statusTone[myApplication.status] === "danger"
                              ? "bg-[#fee2e2] text-[#b91c1c]"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {StatusIcon && <StatusIcon className="size-4" />}
                        Status: {applicationStatusLabels[myApplication.status]}
                      </div>
                    ) : (
                      <AppButton
                        className="w-full"
                        disabled={applyMutation.isPending}
                        loading={applyMutation.isPending}
                        onClick={() => {
                          if (!user) {
                            toast.error("Sign in required to apply.");
                            navigate({
                              to: "/auth",
                              search: {
                                redirect: window.location.pathname,
                                message: "signin_to_post",
                              },
                            });
                            return;
                          }
                          applyMutation.mutate(scheme.id);
                        }}
                      >
                        {user ? "Apply Online Now" : "Sign in to Apply"}
                      </AppButton>
                    )}
                  </div>
                </SurfaceCard>
              );
            })}
        </div>
      )}

      {/* Citizen document services */}
      <SectionHeader
        eyebrow="Keep Documents Ready"
        title="Essential Certificates & Identity Centers"
        description="Fast access to Aadhaar, Ration Card, Income/Caste certificates, and worker registrations needed for all schemes."
        compact
        className="mt-16"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {citizenServices.map((service, index) => {
          const Icon = [Fingerprint, FileText, SearchCheck, ShieldCheck][index % 4];
          return (
            <SurfaceCard key={service.id} className="p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-secondary/12 text-secondary ring-1 ring-secondary/15">
                    <Icon className="size-5" />
                  </div>
                  <StatusBadge tone="secondary">{service.category}</StatusBadge>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-clay">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
                <div className="mt-5 rounded-2xl bg-muted/60 p-4 border border-border/60">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <FileText className="size-3.5" /> Required Documents
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                    {service.documents.join(", ")}
                  </p>
                </div>
              </div>
              <a
                href={service.apply}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-secondary-foreground transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Open Official Portal <ExternalLink className="size-4" />
              </a>
            </SurfaceCard>
          );
        })}
      </div>

      {/* Static reference list of major national/state schemes */}
      <SectionHeader
        eyebrow="Nationwide & State Benefits"
        title={`Major Government Schemes (${profile.district || "District & State"})`}
        description="Key welfare programs matched to your selected profile with exact document checklists."
        compact
        className="mt-16"
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {schemes
          .filter((scheme) =>
            filterScheme(scheme.category, scheme.title, `${scheme.benefit} ${scheme.eligibility}`),
          )
          .map((scheme) => (
            <SurfaceCard
              key={scheme.id}
              className="p-6 flex flex-col justify-between border-border/80 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <StatusBadge tone="accent">{scheme.category}</StatusBadge>
                <h3 className="mt-4 font-display text-2xl font-bold text-clay">{scheme.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{scheme.benefit}</p>

                <div className="mt-5 rounded-2xl bg-muted/70 p-4 border border-border/60">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    <FileText className="size-3.5" /> Mandatory Documents
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground font-medium">
                    {scheme.documents.join(", ")}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  <strong className="text-clay">Eligibility:</strong> {scheme.eligibility}
                </p>
              </div>

              <div className="mt-6 border-t border-border/70 pt-4 space-y-2.5">
                <a
                  href={scheme.apply}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-105 shadow-sm"
                >
                  Check Portal & Apply <ExternalLink className="size-4" />
                </a>
                <button
                  type="button"
                  onClick={() => requestPanchayatHelp(scheme.title)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold text-clay hover:bg-muted transition"
                >
                  <HelpCircle className="size-3.5 text-primary" /> Request Panchayat Assistance
                </button>
              </div>
            </SurfaceCard>
          ))}
      </div>
    </PageLayout>
  );
}

function CreateSchemeForm({
  onCreate,
  busy,
}: {
  onCreate: (input: {
    title: string;
    description: string;
    category: SchemeCategory;
    eligibility?: string;
    benefit_amount?: number;
    deadline?: string;
  }) => void;
  busy: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SchemeCategory>("general");
  const [eligibility, setEligibility] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim(),
      category,
      eligibility: eligibility.trim() || undefined,
      benefit_amount: benefitAmount ? Number(benefitAmount) : undefined,
      deadline: deadline || undefined,
    });
    setTitle("");
    setDescription("");
    setEligibility("");
    setBenefitAmount("");
    setDeadline("");
  };

  return (
    <SurfaceCard className="mb-8 p-6 border-2 border-primary/30 bg-card shadow-md">
      <h3 className="font-display text-xl font-bold text-clay mb-2">
        Publish New Panchayat Scheme
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Create a custom welfare scheme or local subsidy so citizens can apply and track status
        online.
      </p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Scheme Title (e.g. Free Seeds Subsidy for Small Farmers)"
          required
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed explanation of how citizens benefit, distribution schedule, and requirements..."
          required
          rows={3}
          className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:col-span-2"
        />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SchemeCategory)}
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary font-semibold"
          >
            {Object.entries(schemeCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Benefit Amount (₹)
          </label>
          <input
            value={benefitAmount}
            onChange={(e) => setBenefitAmount(e.target.value)}
            placeholder="e.g. 5000 (optional)"
            type="number"
            min="0"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Eligibility Criteria
          </label>
          <input
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            placeholder="e.g. Farmers with less than 3 acres of land"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
            Application Deadline
          </label>
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            type="date"
            className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        <AppButton
          type="submit"
          className="sm:col-span-2 mt-2"
          loading={busy}
          disabled={busy}
          icon={<Plus className="size-4" />}
        >
          Publish Scheme Online
        </AppButton>
      </form>
    </SurfaceCard>
  );
}
