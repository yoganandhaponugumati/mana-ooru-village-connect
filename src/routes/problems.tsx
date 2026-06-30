import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Droplets,
  ImagePlus,
  Lightbulb,
  Milestone,
  Plus,
  Trash2,
  Waves,
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard, ListingForm } from "@/components/ListingForm";
import {
  AppButton,
  EmptyState,
  FeatureIcon,
  SectionHeader,
  SurfaceCard,
} from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
import { useListings } from "@/lib/store";

export const Route = createFileRoute("/problems")({
  head: () => ({ meta: [{ title: "Report Problem - ManaOoru" }] }),
  component: ProblemsPage,
});

const issueTypes = [
  { label: "Road damage", icon: Milestone },
  { label: "Drainage", icon: Waves },
  { label: "Water supply", icon: Droplets },
  { label: "Streetlight", icon: Lightbulb },
  { label: "Garbage", icon: Trash2 },
  { label: "Other issue", icon: AlertTriangle },
];

function ProblemsPage() {
  const { items, remove } = useListings("complaint");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "complaint");
  const [showForm, setShowForm] = useState(true);

  return (
    <PageLayout
      title="Report Village Problem"
      subtitle="Post a photo, describe the issue, and make it visible for local action."
      icon={<AlertTriangle className="size-7" />}
    >
      <SectionHeader
        eyebrow="Citizen reports"
        title="Photo proof makes problems clear"
        description="Road damage, drainage overflow, water leakage, broken streetlights, garbage, and other local issues."
        actions={
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "Hide form" : "Report issue"}
          </AppButton>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {issueTypes.map((issue) => (
          <SurfaceCard key={issue.label} className="p-4">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex w-full items-center gap-3 text-left"
            >
              <FeatureIcon icon={<issue.icon className="size-5" />} />
              <span>
                <span className="block font-semibold text-clay">{issue.label}</span>
                <span className="text-xs text-muted-foreground">
                  Add photo, location, and contact
                </span>
              </span>
            </button>
          </SurfaceCard>
        ))}
      </div>

      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <ListingForm
            type="complaint"
            title="Problem details"
            redirectTo="/problems"
            photoRequired
            photoLabel="Take problem photo"
            photoHint="Use camera for road, drainage, garbage, streetlight, or water issue proof."
            fields={[
              {
                name: "title",
                label: "Problem title",
                placeholder: "e.g. Drainage overflowing near school",
                required: true,
              },
              {
                name: "category",
                label: "Issue type",
                placeholder: "",
                options: issueTypes.map((item) => item.label),
                required: true,
              },
              {
                name: "description",
                label: "Description",
                placeholder: "What happened, how long, who is affected, and any urgency...",
                textarea: true,
                required: true,
              },
              {
                name: "location",
                label: "Exact location",
                placeholder: "Street, landmark, ward, or GPS-friendly landmark",
                required: true,
              },
              {
                name: "contact",
                label: "Your phone",
                placeholder: "10-digit mobile",
                required: true,
              },
            ]}
          />
        </SurfaceCard>
      )}

      {displayItems.length === 0 ? (
        <EmptyState
          icon={<ImagePlus className="size-6" />}
          title="No problems reported yet"
          description="Post the first issue with a clear photo and location."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setShowForm(true)}
            >
              Report issue
            </AppButton>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              onDelete={items.length > 0 ? remove : undefined}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
