import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeIndianRupee,
  Building2,
  Camera,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Megaphone,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoleManager } from "@/components/AdminRoleManager";
import {
  AppButton,
  AppLinkButton,
  EmptyState,
  FeatureIcon,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { useGovernmentWorks, type GovernmentWorkInput } from "@/lib/government-works";

export const Route = createFileRoute("/official")({
  head: () => ({ meta: [{ title: "Official Workspace - ManaOoru" }] }),
  component: () => (
    <ProtectedRoute roles={["village_admin", "super_admin"]}>
      <OfficialPage />
    </ProtectedRoute>
  ),
});

const statuses: GovernmentWorkInput["status"][] = [
  "planned",
  "active",
  "completed",
  "paused",
  "cancelled",
];

function OfficialPage() {
  const { role } = useAuth();
  const { works, loading, createWork } = useGovernmentWorks();
  const [values, setValues] = useState<Omit<GovernmentWorkInput, "photos">>({
    title: "",
    description: "",
    department: "",
    budget: "",
    status: "active",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const updateValue = (name: keyof Omit<GovernmentWorkInput, "photos">, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values.title.trim()) {
      toast.error("Add a work title");
      return;
    }

    setSubmitting(true);
    try {
      await createWork({ ...values, photos });
      setValues({
        title: "",
        description: "",
        department: "",
        budget: "",
        status: "active",
        startDate: "",
        endDate: "",
        location: "",
      });
      setPhotos([]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post update");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Official Workspace"
      subtitle="Post Panchayat works, upload progress photos, and manage verified village roles."
      icon={<ShieldCheck className="size-7" />}
    >
      <SectionHeader
        eyebrow="Sarpanch / Panchayat"
        title="Government work updates"
        description="Create public work records with photos so villagers can see what is planned, active, and completed."
        actions={
          <AppLinkButton
            to="/announcements"
            variant="secondary"
            icon={<Megaphone className="size-4" />}
          >
            Post notice
          </AppLinkButton>
        }
      />

      {role === "super_admin" && (
        <div className="mb-8">
          <AdminRoleManager />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SurfaceCard className="p-6 sm:p-8" hover={false}>
          <div className="flex items-start gap-4">
            <FeatureIcon icon={<UploadCloud className="size-5" />} />
            <div>
              <h2 className="font-display text-2xl font-semibold text-clay">Upload work photos</h2>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">
                Add road, water, drainage, school, health, or Panchayat progress updates.
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              value={values.title}
              onChange={(event) => updateValue("title", event.target.value)}
              placeholder="Work title, e.g. New drainage line"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={values.description}
              onChange={(event) => updateValue("description", event.target.value)}
              placeholder="Work details, progress, contractor, next step..."
              rows={4}
              className="min-h-32 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={values.department}
                onChange={(event) => updateValue("department", event.target.value)}
                placeholder="Department"
                className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
              <input
                type="number"
                min="0"
                value={values.budget}
                onChange={(event) => updateValue("budget", event.target.value)}
                placeholder="Budget amount"
                className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
              <select
                value={values.status}
                onChange={(event) =>
                  updateValue("status", event.target.value as GovernmentWorkInput["status"])
                }
                className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold outline-none focus:border-primary"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
              <input
                value={values.location}
                onChange={(event) => updateValue("location", event.target.value)}
                placeholder="Location"
                className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
              <input
                type="date"
                value={values.startDate}
                onChange={(event) => updateValue("startDate", event.target.value)}
                className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
              <input
                type="date"
                value={values.endDate}
                onChange={(event) => updateValue("endDate", event.target.value)}
                className="rounded-2xl border border-border bg-card px-4 py-3.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-primary/30 bg-primary/5 px-4 py-8 text-center transition hover:border-primary hover:bg-primary/10">
              <ImagePlus className="size-8 text-primary" />
              <span className="mt-3 text-sm font-semibold text-clay">Choose progress photos</span>
              <span className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, or WebP. Multiple photos allowed.
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => setPhotos(Array.from(event.target.files ?? []))}
              />
            </label>

            {photos.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-3">
                {photos.map((photo) => (
                  <div key={`${photo.name}-${photo.size}`} className="rounded-2xl bg-muted/60 p-3">
                    <Camera className="size-4 text-primary" />
                    <p className="mt-2 truncate text-xs font-semibold text-clay">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}

            <AppButton
              type="submit"
              className="w-full"
              loading={submitting}
              icon={<CheckCircle2 className="size-4" />}
              iconPosition="left"
            >
              {submitting ? "Uploading" : "Post work update"}
            </AppButton>
          </form>
        </SurfaceCard>

        <div className="space-y-4">
          {loading ? (
            <SurfaceCard className="grid min-h-48 place-items-center p-6" hover={false}>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading work updates
              </p>
            </SurfaceCard>
          ) : works.length === 0 ? (
            <EmptyState
              icon={<Building2 className="size-6" />}
              title="No government works yet"
              description="Post the first Panchayat work update with a photo."
            />
          ) : (
            works.map((work) => (
              <SurfaceCard key={work.id} className="overflow-hidden p-5" hover={false}>
                {work.government_work_images?.[0]?.image_url && (
                  <img
                    src={work.government_work_images[0].image_url}
                    alt={work.title}
                    className="mb-4 aspect-video w-full rounded-2xl object-cover"
                  />
                )}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <StatusBadge tone={work.status === "completed" ? "success" : "secondary"}>
                      {work.status}
                    </StatusBadge>
                    <h3 className="mt-3 font-display text-xl font-semibold text-clay">
                      {work.title}
                    </h3>
                  </div>
                  {work.budget !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <BadgeIndianRupee className="size-3.5" /> {work.budget}
                    </span>
                  )}
                </div>
                {work.description && (
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{work.description}</p>
                )}
                <div className="mt-4 grid gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-2">
                  <span>{work.department || "Panchayat"}</span>
                  <span>{work.location || "Village location"}</span>
                  <span>{new Date(work.created_at).toLocaleDateString()}</span>
                  <span>{work.government_work_images?.length ?? 0} photos</span>
                </div>
              </SurfaceCard>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
