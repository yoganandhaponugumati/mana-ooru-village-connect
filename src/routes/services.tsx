import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Cable,
  Camera,
  Cake,
  Hammer,
  HeartPulse,
  Plus,
  Router,
  Store,
  ShowerHead,
  Tractor,
  Truck,
  Waves,
  Wrench,
  CupSoda,
  Leaf,
  Sprout,
  Milk,
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
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/services")({
  validateSearch: (search: Record<string, unknown>) => ({
    kind: search.kind === "shops" ? "shops" : "services",
  }),
  head: () => ({ meta: [{ title: "Local Services — ManaOoru" }] }),
  component: ServicesPage,
});

const shopCategories = [
  { label: "Kirana", icon: Store },
  { label: "Medical", icon: HeartPulse },
  { label: "Bakery", icon: Cake },
  { label: "Hotel", icon: Building2 },
  { label: "Tea Stall", icon: CupSoda },
  { label: "Mobile Shop", icon: Router },
  { label: "Hardware", icon: Hammer },
  { label: "Fertilizer", icon: Leaf },
  { label: "Seeds", icon: Sprout },
  { label: "Dairy", icon: Milk },
] as const;

const serviceCategories = [
  { label: "Tractor", icon: Tractor },
  { label: "Transport", icon: Truck },
  { label: "Electrician", icon: Cable },
  { label: "Plumbing", icon: ShowerHead },
  { label: "Borewell", icon: Waves },
  { label: "Photography", icon: Camera },
  { label: "Catering", icon: Cake },
  { label: "Other service", icon: Wrench },
] as const;

const shopOptions = shopCategories.map((item) => item.label);
const serviceOptions = serviceCategories.map((item) => item.label);

function ServicesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { kind } = useSearch({ from: "/services" });
  const { items, remove } = useListings("service");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "service");
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"services" | "shops">(kind === "shops" ? "shops" : "services");
  const visibleCategories = mode === "shops" ? shopCategories : serviceCategories;
  const visibleOptions = (mode === "shops" ? shopOptions : serviceOptions) as string[];
  const shownItems = displayItems.filter((item) => visibleOptions.includes(item.category || ""));
  const hasShownItems = shownItems.length > 0;

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
      title="Local Services"
      subtitle="Tractors, repairs, transport — book trusted local providers."
      icon={<Wrench className="size-7" />}
    >
      <SectionHeader
        eyebrow={mode === "shops" ? "Village shops" : "Trusted help"}
        title={mode === "shops" ? "Shops and local businesses" : "Available specialists"}
        description={
          mode === "shops"
            ? "Find kirana, medical, bakery, hardware, seeds, dairy, and daily-use shops."
            : "Find workers and providers for repairs, transport, farming, events, and urgent needs."
        }
        actions={
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={handlePostClick}
          >
            {showForm ? "Cancel" : mode === "shops" ? "Add a shop" : "Offer a service"}
          </AppButton>
        }
      />
      <div className="mb-6 inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
        {[
          ["services", "Find Services"],
          ["shops", "Village Shops"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value as "services" | "shops");
              setShowForm(false);
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              mode === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCategories.map((service) => (
          <SurfaceCard key={service.label} className="p-4">
            <button
              className="flex w-full items-center gap-3 text-left"
              onClick={() => setShowForm(false)}
            >
              <FeatureIcon icon={<service.icon className="size-5" />} />
              <span>
                <span className="block font-semibold text-clay">{service.label}</span>
                <span className="text-xs text-muted-foreground">
                  {mode === "shops" ? "Open now, WhatsApp, directions" : "Call, WhatsApp, reviews"}
                </span>
              </span>
            </button>
          </SurfaceCard>
        ))}
      </div>
      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <ListingForm
            type="service"
            title={mode === "shops" ? "Shop details" : "Service details"}
            redirectTo="/services"
            photoLabel={mode === "shops" ? "Add shop photo" : "Add service photo"}
            photoHint={
              mode === "shops"
                ? "Show your shop front, logo, products, or counter clearly."
                : "Show your tools, vehicle, equipment, or recent completed work."
            }
            fields={[
              {
                name: "title",
                label: mode === "shops" ? "Shop name" : "Service title",
                placeholder:
                  mode === "shops" ? "e.g. Sri Lakshmi Kirana" : "e.g. Tractor for ploughing",
                required: true,
              },
              {
                name: "category",
                label: "Category",
                placeholder: "",
                options: visibleOptions,
                required: true,
              },
              {
                name: "description",
                label: "Description",
                placeholder:
                  mode === "shops"
                    ? "Opening hours, products available, owner name, WhatsApp, directions..."
                    : "Experience, availability, equipment, service area, WhatsApp, directions...",
                textarea: true,
                required: true,
              },
              {
                name: "price",
                label: mode === "shops" ? "Price / offer" : "Charges",
                placeholder: mode === "shops" ? "e.g. MRP / daily offers" : "e.g. ₹800/hr",
              },
              {
                name: "location",
                label: mode === "shops" ? "Shop location" : "Service area",
                placeholder: mode === "shops" ? "Street, landmark, village" : "Villages covered",
              },
              { name: "contact", label: "Phone", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </SurfaceCard>
      )}
      {!hasShownItems ? (
        <EmptyState
          icon={<Wrench className="size-6" />}
          title={mode === "shops" ? "No shops listed yet" : "No services listed yet"}
          description={
            mode === "shops"
              ? "Add the first shop so villagers can find daily needs quickly."
              : "Offer your expertise and make it easier for the community to find help nearby."
          }
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handlePostClick}
            >
              {mode === "shops" ? "Add a shop" : "Offer a service"}
            </AppButton>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shownItems.map((i) => (
            <ListingCard key={i.id} item={i} onDelete={items.length > 0 ? remove : undefined} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
