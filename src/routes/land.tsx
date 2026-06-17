import { createFileRoute } from "@tanstack/react-router";
import { Wheat, Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard, ListingForm } from "@/components/ListingForm";
import { useListings } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/land")({
  head: () => ({ meta: [{ title: "Land for Lease — ManaOoru" }] }),
  component: LandPage,
});

function LandPage() {
  const { items, remove } = useListings("land");
  const [showForm, setShowForm] = useState(false);
  return (
    <PageLayout title="Lease Farmland" subtitle="List your land or find fields available this season." icon={<Wheat className="size-7" />}>
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
          <Plus className="size-4" /> {showForm ? "Cancel" : "List your land"}
        </button>
      </div>
      {showForm && (
        <div className="mb-8 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          <ListingForm
            type="land"
            title="Land details"
            redirectTo="/land"
            fields={[
              { name: "title", label: "Title", placeholder: "e.g. 2 acres fertile land — East Canal", required: true },
              { name: "description", label: "Description", placeholder: "Soil type, water source, suitable crops…", textarea: true },
              { name: "price", label: "Lease price", placeholder: "e.g. ₹12,000/season" },
              { name: "location", label: "Location", placeholder: "Area / landmark" },
              { name: "contact", label: "Phone", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </div>
      )}
      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-clay">No land listed yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <ListingCard key={i.id} item={i} onDelete={remove} />)}
        </div>
      )}
    </PageLayout>
  );
}