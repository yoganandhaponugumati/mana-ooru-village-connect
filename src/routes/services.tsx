import { createFileRoute } from "@tanstack/react-router";
import {
  Cable,
  Car,
  Drill,
  Hammer,
  Paintbrush,
  Plus,
  Router,
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
  head: () => ({ meta: [{ title: "Local Services — ManaOoru" }] }),
  component: ServicesPage,
});

const services = [
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
];

function ServicesPage() {
  const { items, remove } = useListings("service");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "service");
  const [showForm, setShowForm] = useState(false);
  return (
    <PageLayout
      title="Local Services"
      subtitle="Tractors, repairs, transport — book trusted local providers."
      icon={<Wrench className="size-7" />}
    >
      <SectionHeader
        eyebrow="Trusted help"
        title="Available specialists"
        description="Find nearby providers for repairs, transport, farming, and everyday needs."
        actions={
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? "Cancel" : "Offer a service"}
          </AppButton>
        }
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <SurfaceCard key={service.label} className="p-4">
            <button
              className="flex w-full items-center gap-3 text-left"
              onClick={() => setShowForm(false)}
            >
              <FeatureIcon icon={<service.icon className="size-5" />} />
              <span>
                <span className="block font-semibold text-clay">{service.label}</span>
                <span className="text-xs text-muted-foreground">Call, WhatsApp, chat, reviews</span>
              </span>
            </button>
          </SurfaceCard>
        ))}
      </div>
      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <ListingForm
            type="service"
            title="Service details"
            redirectTo="/services"
            photoLabel="Add service photo"
            photoHint="Show your tools, vehicle, equipment, shop, or recent completed work."
            fields={[
              {
                name: "title",
                label: "Service title",
                placeholder: "e.g. Tractor for ploughing",
                required: true,
              },
              {
                name: "category",
                label: "Category",
                placeholder: "",
                options: [
                  "Tractor",
                  "Plumber",
                  "Electrician",
                  "Transport",
                  "Mechanic",
                  "Repair",
                  "Other",
                ],
              },
              {
                name: "description",
                label: "Description",
                placeholder: "Availability, equipment, terms…",
                textarea: true,
              },
              { name: "price", label: "Charges", placeholder: "e.g. ₹800/hr" },
              { name: "location", label: "Service area", placeholder: "Villages covered" },
              { name: "contact", label: "Phone", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </SurfaceCard>
      )}
      {displayItems.length === 0 ? (
        <EmptyState
          icon={<Wrench className="size-6" />}
          title="No services listed yet"
          description="Offer your expertise and make it easier for the community to find help nearby."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={() => setShowForm(true)}
            >
              Offer a service
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
