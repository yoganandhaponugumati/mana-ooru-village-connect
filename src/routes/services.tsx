import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  Ambulance,
  Building2,
  Cable,
  Camera,
  Car,
  Cake,
  Drill,
  Hammer,
  HeartPulse,
  Landmark,
  Paintbrush,
  Plus,
  Router,
  School,
  Store,
  ShowerHead,
  Tractor,
  Truck,
  Waves,
  Wrench,
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
  { label: "Tea Stall", icon: Store },
  { label: "Mobile Shop", icon: Router },
  { label: "Hardware", icon: Hammer },
  { label: "Fertilizer", icon: ShowerHead },
  { label: "Seeds", icon: Tractor },
  { label: "Dairy", icon: Store },
];

const serviceCategories = [
  { label: "Tent House", icon: Building2 },
  { label: "Catering", icon: Cake },
  { label: "DJ", icon: Router },
  { label: "Photographer", icon: Camera },
  { label: "Electrician", icon: Cable },
  { label: "Plumber", icon: Drill },
  { label: "Mechanic", icon: Wrench },
  { label: "Mason", icon: Hammer },
  { label: "Painter", icon: Paintbrush },
  { label: "Carpenter", icon: Hammer },
  { label: "Vehicle Repair", icon: Car },
  { label: "Water Tank", icon: ShowerHead },
  { label: "Borewell", icon: Waves },
  { label: "Internet Services", icon: Router },
  { label: "Tractor Rental", icon: Tractor },
  { label: "Transport", icon: Truck },
  { label: "Health", icon: HeartPulse },
  { label: "Education", icon: School },
  { label: "Panchayat", icon: Landmark },
  { label: "Emergency", icon: Ambulance },
];

const shopOptions = shopCategories.map((item) => item.label);
const serviceOptions = serviceCategories.map((item) => item.label);

function ServicesPage() {
  const { kind } = useSearch({ from: "/services" });
  const { items, remove } = useListings("service");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "service");
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode] = useState<"services" | "shops">(kind === "shops" ? "shops" : "services");
  const visibleCategories = mode === "shops" ? shopCategories : serviceCategories;
  const visibleOptions = mode === "shops" ? shopOptions : serviceOptions;
  const shownItems = displayItems.filter((item) => visibleOptions.includes(item.category || ""));
  const hasShownItems = shownItems.length > 0;

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
            onClick={() => setShowForm((v) => !v)}
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
              onClick={() => setShowForm(true)}
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
