import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Droplets, Map, Milestone, Plus, Sprout, SunMedium, Wheat } from "lucide-react";
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
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/land")({
  head: () => ({ meta: [{ title: "Land for Lease — ManaOoru" }] }),
  component: LandPage,
});

function LandPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items, remove } = useListings("land");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "land");
  const [showForm, setShowForm] = useState(false);

  const handlePostClick = () => {
    if (!user) {
      toast.error("Sign in required to post.");
      navigate({
        to: "/auth",
        search: {
          redirect: window.location.pathname,
          message: "signin_to_post",
        },
      });
      return;
    }
    setShowForm((v) => !v);
  };

  return (
    <PageLayout
      title="Lease Farmland"
      subtitle="List your land or find fields available this season."
      icon={<Wheat className="size-7" />}
    >
      <SectionHeader
        eyebrow="Seasonal opportunities"
        title="Available farmland"
        description="Post your field or browse plots that match your crop plans."
        actions={
          <AppButton variant="primary" icon={<Plus className="size-4" />} onClick={handlePostClick}>
            {showForm ? "Cancel" : "List your land"}
          </AppButton>
        }
      />
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[
          { label: "Canal water", value: "18 plots", icon: Droplets },
          { label: "Road access", value: "24 plots", icon: Milestone },
          { label: "Black soil", value: "12 plots", icon: Sprout },
          { label: "Map verified", value: "Google Maps", icon: Map },
        ].map((item) => (
          <SurfaceCard key={item.label} className="p-5">
            <FeatureIcon icon={<item.icon className="size-5" />} />
            <p className="mt-4 font-semibold text-clay">{item.label}</p>
            <p className="text-sm text-muted-foreground">{item.value}</p>
          </SurfaceCard>
        ))}
      </div>
      <SurfaceCard className="mb-8 overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.3fr]">
          <div className="bg-primary p-7 text-primary-foreground">
            <SunMedium className="size-8" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Lease-ready field insights</h3>
            <p className="mt-2 text-sm leading-7 text-white/80">
              Compare water source, soil type, access roads, nearby landmarks, and owner contact
              before calling.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {["Owner verified", "Water source", "Road access"].map((label) => (
              <div key={label} className="rounded-2xl border border-border bg-muted/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {label}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Shown on every land card</p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>
      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <ListingForm
            type="land"
            title="Land details"
            redirectTo="/land"
            photoLabel="Add land photo"
            photoHint="Show the field, water source, access road, or boundary landmark."
            fields={[
              {
                name: "title",
                label: "Title",
                placeholder: "e.g. 2 acres fertile land — East Canal",
                required: true,
              },
              {
                name: "description",
                label: "Description",
                placeholder: "Soil type, water source, suitable crops…",
                textarea: true,
              },
              { name: "price", label: "Lease price", placeholder: "e.g. ₹12,000/season" },
              { name: "location", label: "Location", placeholder: "Area / landmark" },
              { name: "contact", label: "Phone", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </SurfaceCard>
      )}
      {displayItems.length === 0 ? (
        <EmptyState
          icon={<Wheat className="size-6" />}
          title="No land listed yet"
          description="Start the conversation by posting the first lease opportunity for your village."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handlePostClick}
            >
              List your land
            </AppButton>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((i) => (
            <ListingCard key={i.id} item={i} onDelete={items.length > 0 ? remove : undefined} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
