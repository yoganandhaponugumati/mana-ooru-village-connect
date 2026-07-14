import { createFileRoute } from "@tanstack/react-router";
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
  head: () => ({ meta: [{ title: "Government Schemes - ManaOoru" }] }),
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

function SchemesPage() {
  const { profile } = useVillagePreferences();
  const { user, role } = useAuth();
  const canManage = role === "village_admin" || role === "super_admin";

  const { data: villageSchemes, isLoading } = useVillageSchemes();
  const { data: myApplications } = useMyApplications();
  const applyMutation = useApplyToScheme();
  const createMutation = useCreateScheme();
  const [showForm, setShowForm] = useState(false);

  return (
    <PageLayout
      title="Government Schemes"
      subtitle="Eligibility, benefits, documents, and official application links in one place."
      icon={<Landmark className="size-7" />}
    >
      {/* Live, DB-backed schemes posted by this village's admin */}
      <SectionHeader
        eyebrow="Apply through ManaOoru"
        title="Schemes your village admin is running"
        description="Apply here and track your application status without visiting an office."
        actions={
          canManage && (
            <AppButton
              variant="secondary"
              icon={showForm ? <X className="size-4" /> : <Plus className="size-4" />}
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Close" : "Post a scheme"}
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
          title="No schemes posted yet"
          description={
            canManage
              ? "Post your first scheme so citizens can apply and track status right here."
              : "Your Village Admin hasn't posted any schemes yet. Check back soon, or see nationwide schemes below."
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {villageSchemes.map((scheme) => {
            const myApplication = myApplications?.[scheme.id];
            const StatusIcon = myApplication ? statusIcon[myApplication.status] : null;
            return (
              <SurfaceCard key={scheme.id} className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <StatusBadge tone="accent">
                    {schemeCategoryLabels[scheme.category as SchemeCategory]}
                  </StatusBadge>
                  {scheme.status !== "active" && (
                    <StatusBadge tone="secondary">{scheme.status}</StatusBadge>
                  )}
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-clay">
                  {scheme.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{scheme.description}</p>
                {scheme.eligibility && (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    <strong className="text-clay">Eligibility:</strong> {scheme.eligibility}
                  </p>
                )}
                {scheme.benefit_amount ? (
                  <p className="mt-2 text-sm font-semibold text-primary">
                    Benefit: ₹{scheme.benefit_amount.toLocaleString("en-IN")}
                  </p>
                ) : null}
                {scheme.deadline && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deadline: {new Date(scheme.deadline).toLocaleDateString("en-IN")}
                  </p>
                )}

                {myApplication ? (
                  <div
                    className={`mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${
                      statusTone[myApplication.status] === "success"
                        ? "bg-[#dcfce7] text-[#15803d]"
                        : statusTone[myApplication.status] === "danger"
                          ? "bg-[#fee2e2] text-[#b91c1c]"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {StatusIcon && <StatusIcon className="size-4" />}
                    Your application: {applicationStatusLabels[myApplication.status]}
                  </div>
                ) : (
                  <AppButton
                    className="mt-5 w-full"
                    disabled={!user || applyMutation.isPending}
                    loading={applyMutation.isPending}
                    onClick={() => applyMutation.mutate(scheme.id)}
                  >
                    {user ? "Apply now" : "Sign in to apply"}
                  </AppButton>
                )}
              </SurfaceCard>
            );
          })}
        </div>
      )}

      <SectionHeader
        eyebrow="Useful services"
        title="Aadhaar, documents, ration, worker cards, and more"
        description="Fast official links villagers often need before applying for schemes."
        compact
        className="mt-16"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {citizenServices.map((service, index) => {
          const Icon = [Fingerprint, FileText, SearchCheck, ShieldCheck][index % 4];
          return (
            <SurfaceCard key={service.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-secondary/12 text-secondary ring-1 ring-secondary/15">
                  <Icon className="size-5" />
                </div>
                <StatusBadge tone="secondary">{service.category}</StatusBadge>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold text-clay">
                {service.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{service.description}</p>
              <div className="mt-5 rounded-2xl bg-muted/60 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-clay">
                  <FileText className="size-4 text-primary" /> Keep ready
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{service.documents.join(", ")}</p>
              </div>
              <a
                href={service.apply}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Open official service <ExternalLink className="size-4" />
              </a>
            </SurfaceCard>
          );
        })}
      </div>

      {/* Static reference list of major national/state schemes */}
      <SectionHeader
        eyebrow="Reference"
        title={`Important government schemes for ${profile.district || "your district"}`}
        description="General schemes you apply for directly on the official government portal."
        compact
        className="mt-16"
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme) => (
          <SurfaceCard key={scheme.id} className="p-6">
            <StatusBadge tone="accent">{scheme.category}</StatusBadge>
            <h3 className="mt-4 font-display text-2xl font-semibold text-clay">{scheme.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{scheme.benefit}</p>
            <div className="mt-5 rounded-2xl bg-muted/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-clay">
                <FileText className="size-4 text-primary" /> Documents required
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{scheme.documents.join(", ")}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              <strong className="text-clay">Eligibility:</strong> {scheme.eligibility}
            </p>
            <a
              href={scheme.apply}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Apply / Check status <ExternalLink className="size-4" />
            </a>
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
    <SurfaceCard className="mb-8 p-6">
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Scheme title"
          required
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary sm:col-span-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this scheme for, and how do citizens benefit?"
          required
          rows={3}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary sm:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SchemeCategory)}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        >
          {Object.entries(schemeCategoryLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={benefitAmount}
          onChange={(e) => setBenefitAmount(e.target.value)}
          placeholder="Benefit amount in ₹ (optional)"
          type="number"
          min="0"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          value={eligibility}
          onChange={(e) => setEligibility(e.target.value)}
          placeholder="Eligibility (optional)"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <input
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          type="date"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <AppButton
          type="submit"
          className="sm:col-span-2"
          loading={busy}
          disabled={busy}
          icon={<Plus className="size-4" />}
        >
          Publish scheme
        </AppButton>
      </form>
    </SurfaceCard>
  );
}
