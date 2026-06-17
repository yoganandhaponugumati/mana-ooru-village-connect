import { createFileRoute } from "@tanstack/react-router";
import { ShoppingBasket, Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard, ListingForm } from "@/components/ListingForm";
import { useListings } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — ManaOoru" }] }),
  component: MarketPage,
});

const CATS = ["All", "Vegetables", "Grain", "Dairy", "Livestock", "Seeds", "Tools", "Other"];

function MarketPage() {
  const { items, remove } = useListings("market");
  const [showForm, setShowForm] = useState(false);
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? items : items.filter((i) => i.category === cat);
  return (
    <PageLayout title="Village Marketplace" subtitle="Buy & sell directly with neighbours — no middlemen." icon={<ShoppingBasket className="size-7" />}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"}`}>{c}</button>
          ))}
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
          <Plus className="size-4" /> {showForm ? "Cancel" : "Sell something"}
        </button>
      </div>
      {showForm && (
        <div className="mb-8 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          <ListingForm
            type="market"
            title="Item details"
            redirectTo="/marketplace"
            fields={[
              { name: "title", label: "Item name & quantity", placeholder: "e.g. Fresh tomatoes — 30 kg", required: true },
              { name: "category", label: "Category", placeholder: "", options: CATS.filter((c) => c !== "All") },
              { name: "description", label: "Description", placeholder: "Freshness, quality, terms…", textarea: true },
              { name: "price", label: "Price", placeholder: "e.g. ₹25/kg" },
              { name: "location", label: "Pickup location", placeholder: "Your village / shop" },
              { name: "contact", label: "Phone", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </div>
      )}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-clay">Nothing here yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <ListingCard key={i.id} item={i} onDelete={remove} />)}
        </div>
      )}
    </PageLayout>
  );
}