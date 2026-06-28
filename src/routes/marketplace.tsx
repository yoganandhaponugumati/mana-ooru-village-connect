import { createFileRoute } from "@tanstack/react-router";
import { Apple, Beef, Milk, Plus, Shovel, ShoppingBasket, SprayCan, Tractor, Trees, Wheat } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard, ListingForm } from "@/components/ListingForm";
import { AppButton, EmptyState, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
import { useListings } from "@/lib/store";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — ManaOoru" }] }),
  component: MarketPage,
});

const CATS = ["All", "Vegetables", "Fruits", "Rice", "Seeds", "Milk", "Machinery", "Fertilizers", "Pesticides", "Animals", "Tools", "Other"];
const categoryIcons = {
  Vegetables: ShoppingBasket,
  Fruits: Apple,
  Rice: Wheat,
  Seeds: Trees,
  Milk: Milk,
  Machinery: Tractor,
  Fertilizers: Shovel,
  Pesticides: SprayCan,
  Animals: Beef,
  Tools: Shovel,
  Other: ShoppingBasket,
};

function MarketPage() {
  const { items, remove } = useListings("market");
  const displayItems = items.length > 0 ? items : fallbackListings.filter((item) => item.type === "market");
  const [showForm, setShowForm] = useState(false);
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? displayItems : displayItems.filter((i) => i.category === cat);
  return (
    <PageLayout title="Village Marketplace" subtitle="Buy & sell directly with neighbours — no middlemen." icon={<ShoppingBasket className="size-7" />}>
      <SectionHeader
        eyebrow="Local exchange"
        title="Fresh everyday listings"
        description="Switch categories and find what the village needs right now."
        actions={<AppButton variant="primary" icon={<Plus className="size-4" />} onClick={() => setShowForm((v) => !v)}>{showForm ? "Cancel" : "Sell something"}</AppButton>}
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {CATS.filter((c) => c !== "All").slice(0, 10).map((c) => {
          const Icon = categoryIcons[c as keyof typeof categoryIcons] ?? ShoppingBasket;
          return (
            <SurfaceCard key={c} className="p-4">
              <button onClick={() => setCat(c)} className="flex w-full items-center gap-3 text-left">
                <FeatureIcon icon={<Icon className="size-5" />} />
                <span>
                  <span className="block font-semibold text-clay">{c}</span>
                  <span className="text-xs text-muted-foreground">Seller, village, price, quantity</span>
                </span>
              </button>
            </SurfaceCard>
          );
        })}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"}`}>{c}</button>
        ))}
      </div>
      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
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
        </SurfaceCard>
      )}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket className="size-6" />}
          title="Nothing here yet"
          description="Add the first listing and make local trade easier for your neighbours."
          action={<AppButton variant="primary" icon={<Plus className="size-4" />} onClick={() => setShowForm(true)}>Sell something</AppButton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <ListingCard key={i.id} item={i} onDelete={items.length > 0 ? remove : undefined} />)}
        </div>
      )}
    </PageLayout>
  );
}
