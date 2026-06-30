import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Church,
  Droplets,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Megaphone,
  PartyPopper,
  Phone,
  Plus,
  School,
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import {
  AppButton,
  EmptyState,
  FeatureIcon,
  SectionHeader,
  SurfaceCard,
} from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
import { useAuth } from "@/lib/auth";
import { useListings, timeAgo } from "@/lib/store";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — ManaOoru" }] }),
  component: AnnPage,
});

function AnnPage() {
  const { items, remove } = useListings("announcement");
  const { user } = useAuth();
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "announcement");
  const [showForm, setShowForm] = useState(false);
  return (
    <PageLayout
      title="Village Notice Board"
      subtitle="Panchayat updates, government notices, community alerts."
      icon={<Megaphone className="size-7" />}
    >
      <SectionHeader
        eyebrow="Community alerts"
        title="Stay on top of local updates"
        description="Share important notices and keep everyone informed without friction."
        actions={
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "Post a notice"}
          </AppButton>
        }
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Temple", icon: Church },
          { label: "School", icon: School },
          { label: "Panchayat", icon: Building2 },
          { label: "Government", icon: GraduationCap },
          { label: "Water", icon: Droplets },
          { label: "Electricity", icon: Lightbulb },
          { label: "Medical Camp", icon: HeartPulse },
          { label: "Festival", icon: PartyPopper },
        ].map((item) => (
          <SurfaceCard key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <div>
                <p className="font-semibold text-clay">{item.label}</p>
                <p className="text-xs text-muted-foreground">Village notice category</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <ListingForm
            type="announcement"
            title="Notice details"
            redirectTo="/announcements"
            photoLabel="Add notice photo"
            photoHint="Attach a poster, official paper, event image, or place photo when useful."
            fields={[
              {
                name: "title",
                label: "Notice title",
                placeholder: "e.g. Water tank cleaning Sunday",
                required: true,
              },
              {
                name: "category",
                label: "Category",
                placeholder: "",
                options: [
                  "Panchayat",
                  "Agriculture",
                  "Health",
                  "Education",
                  "Notice",
                  "Event",
                  "Emergency",
                ],
              },
              {
                name: "description",
                label: "Details",
                placeholder: "Date, time, who it concerns…",
                textarea: true,
                required: true,
              },
              { name: "location", label: "Location", placeholder: "Where it applies" },
              {
                name: "contact",
                label: "Posted by / contact",
                placeholder: "Name or phone",
                required: true,
              },
            ]}
          />
        </SurfaceCard>
      )}
      {displayItems.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-6" />}
          title="No notices yet"
          description="Post the first announcement so the whole village stays informed."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setShowForm(true)}
            >
              Post a notice
            </AppButton>
          }
        />
      ) : (
        <div className="space-y-3">
          {displayItems.map((a) => (
            <SurfaceCard
              key={a.id}
              hover={false}
              className="rounded-[1.5rem] border-l-4 border-accent bg-card/95 p-5"
            >
              {a.imageUrl && (
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="mb-4 aspect-[16/7] w-full rounded-2xl object-cover"
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                  {a.category || "Notice"}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold text-clay">{a.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{a.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3.5" /> {a.contact}
                </p>
                {(a.localOnly || (!!user && user.id === a.owner_id)) && (
                  <button
                    onClick={() => remove(a.id)}
                    className="text-xs font-semibold text-muted-foreground transition hover:text-destructive"
                  >
                    Remove
                  </button>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
