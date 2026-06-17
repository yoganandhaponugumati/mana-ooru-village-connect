import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard, ListingForm } from "@/components/ListingForm";
import { useListings } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Local Services — ManaOoru" }] }),
  component: ServicesPage,
});

function ServicesPage() {
  const { items, remove } = useListings("service");
  const [showForm, setShowForm] = useState(false);
  return (
    <PageLayout title="Local Services" subtitle="Tractors, repairs, transport — book trusted local providers." icon={<Wrench className="size-7" />}>
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
          <Plus className="size-4" /> {showForm ? "Cancel" : "Offer a service"}
        </button>
      </div>
      {showForm && (
        <div className="mb-8 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          <ListingForm
            type="service"
            title="Service details"
            redirectTo="/services"
            fields={[
              { name: "title", label: "Service title", placeholder: "e.g. Tractor for ploughing", required: true },
              { name: "category", label: "Category", placeholder: "", options: ["Tractor", "Plumber", "Electrician", "Transport", "Mechanic", "Repair", "Other"] },
              { name: "description", label: "Description", placeholder: "Availability, equipment, terms…", textarea: true },
              { name: "price", label: "Charges", placeholder: "e.g. ₹800/hr" },
              { name: "location", label: "Service area", placeholder: "Villages covered" },
              { name: "contact", label: "Phone", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </div>
      )}
      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-clay">No services listed yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <ListingCard key={i.id} item={i} onDelete={remove} />)}
        </div>
      )}
    </PageLayout>
  );
}