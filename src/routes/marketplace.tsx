import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Apple,
  Beef,
  Milk,
  Plus,
  Shovel,
  ShoppingBasket,
  Tractor,
  Trees,
  Wheat,
  Phone,
  MessageCircle,
  MapPin,
  Tag,
  ShieldCheck,
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
import { useListings, timeAgo } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/marketplace")({
  head: () => ({ meta: [{ title: "Village Marketplace & 0% Brokerage Trade — ManaOoru" }] }),
  component: MarketPage,
});

const CATS = [
  "All",
  "Vegetables",
  "Fruits",
  "Rice & Grains",
  "Seeds & Plants",
  "Milk & Dairy",
  "Tractors & Machinery",
  "Fertilizers & Manure",
  "Cattle & Livestock",
  "Tools & Hardware",
  "Handicrafts",
] as const;

const categoryIcons: Record<string, any> = {
  Vegetables: ShoppingBasket,
  Fruits: Apple,
  "Rice & Grains": Wheat,
  "Seeds & Plants": Trees,
  "Milk & Dairy": Milk,
  "Tractors & Machinery": Tractor,
  "Fertilizers & Manure": Shovel,
  "Cattle & Livestock": Beef,
  "Tools & Hardware": Shovel,
  Handicrafts: ShoppingBasket,
};

function MarketPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { items, remove } = useListings("market");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "market");
  const [showForm, setShowForm] = useState(false);
  const [cat, setCat] = useState("All");
  const filtered = cat === "All" ? displayItems : displayItems.filter((i) => i.category === cat || (cat === "Rice & Grains" && i.category === "Rice") || (cat === "Cattle & Livestock" && i.category === "Animals") || (cat === "Tractors & Machinery" && i.category === "Machinery"));
  const canManage = role === "village_admin" || role === "super_admin";

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

  const contactWhatsApp = (phone: string, title: string, price: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const msg = `🙏 Namaste! I saw your ManaOoru listing:\n*Item:* ${title}\n*Price:* ${price || "As listed"}\n\nIs this currently available for immediate trade?`;
    window.open(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <PageLayout
      title="Village Marketplace & Bazaar"
      subtitle="Direct peer-to-peer trade with zero commission. Buy and sell crops, cattle, tractors, seeds, and local goods directly with neighbours."
      icon={<ShoppingBasket className="size-7 text-emerald-600" />}
    >
      <SectionHeader
        eyebrow="Zero Brokerage Trade"
        title="100% Direct Village Haat"
        description="Filter by category below or list your own harvest, livestock, or machinery in 30 seconds."
        actions={
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={handlePostClick}
          >
            {showForm ? "Cancel" : "Sell Item Right Now"}
          </AppButton>
        }
      />

      {/* Zero Brokerage Banner */}
      <SurfaceCard hover={false} className="mb-8 p-5 bg-gradient-to-r from-emerald-600/15 via-emerald-500/10 to-card border-emerald-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-clay">Zero Middlemen · Zero Commission (`0% Brokerage`)</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              ManaOoru connects buyers and sellers directly. Call or WhatsApp the seller directly to agree on price and pickup.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-600/15 text-emerald-800 px-3.5 py-1 text-xs font-extrabold shrink-0">
          ✓ Verified Local Trade
        </span>
      </SurfaceCard>

      {/* Category selection grid */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {CATS.filter((c) => c !== "All")
          .slice(0, 10)
          .map((c) => {
            const Icon = categoryIcons[c] ?? ShoppingBasket;
            const active = cat === c;
            return (
              <SurfaceCard
                key={c}
                hover={false}
                className={`p-3.5 transition-all cursor-pointer ${
                  active
                    ? "border-2 border-emerald-600 bg-emerald-50/50 shadow-sm"
                    : "border-border hover:border-emerald-600/50 bg-card"
                }`}
                onClick={() => setCat(c)}
              >
                <div className="flex items-center gap-3">
                  <FeatureIcon icon={<Icon className={`size-5 ${active ? "text-emerald-700" : "text-primary"}`} />} />
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${active ? "text-emerald-900" : "text-clay"}`}>{c}</p>
                    <p className="text-[11px] text-muted-foreground truncate">Instant inquiry</p>
                  </div>
                </div>
              </SurfaceCard>
            );
          })}
      </div>

      {/* Category pill row */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
              cat === c
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-border bg-card text-muted-foreground hover:border-emerald-600 hover:text-emerald-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8 border-2 border-emerald-600/30 bg-card shadow-md">
          <ListingForm
            type="market"
            title="Item Details & Direct Contact"
            redirectTo="/marketplace"
            photoLabel="Add Product / Harvest Photo"
            photoHint="Clear photos of grain bags, cattle, or tractors help buyers trust and contact you faster."
            fields={[
              {
                name: "title",
                label: "Item Name & Quantity",
                placeholder: "e.g. Sona Masoori Rice — 10 Bags (25kg each)",
                required: true,
              },
              {
                name: "category",
                label: "Category",
                placeholder: "",
                options: CATS.filter((c) => c !== "All").map(String),
              },
              {
                name: "description",
                label: "Quality & Details",
                placeholder: "Explain crop freshness, tractor model year, or cattle breed & daily milk yield...",
                textarea: true,
              },
              { name: "price", label: "Price / Unit", placeholder: "e.g. ₹1,200/Bag or ₹45,000 Total" },
              { name: "location", label: "Pickup Location / Village", placeholder: "Exact village or farm address" },
              { name: "contact", label: "Direct Phone / WhatsApp", placeholder: "10-digit mobile number", required: true },
            ]}
          />
        </SurfaceCard>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBasket className="size-6" />}
          title="No items currently listed in this category"
          description="List your harvest, equipment, or goods today and connect with local buyers directly."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handlePostClick}
            >
              Sell Something Now
            </AppButton>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <SurfaceCard
              key={i.id}
              hover={false}
              className="p-5 flex flex-col justify-between rounded-[1.5rem] border-border/80 bg-card/95 shadow-sm transition-all hover:shadow-md"
            >
              <div>
                {i.imageUrl ? (
                  <div className="mb-4 overflow-hidden rounded-2xl border border-border/80 relative group">
                    <img
                      src={i.imageUrl}
                      alt={i.title}
                      className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {i.price && (
                      <div className="absolute bottom-3 left-3 rounded-full bg-emerald-700/90 backdrop-blur-md px-3.5 py-1 text-xs font-extrabold text-white shadow">
                        {i.price}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 aspect-[16/6] w-full rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-dashed border-emerald-500/30">
                    <p className="text-sm font-bold text-emerald-800">{i.price || "Direct Trade Item"}</p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-bold text-emerald-800">
                    <Tag className="size-3 text-emerald-700" /> {i.category || "General Goods"}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {timeAgo(i.createdAt)}
                  </span>
                </div>

                <h3 className="mt-3 font-display text-lg font-bold text-clay">
                  {i.title}
                </h3>
                {i.description && (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-2">
                    {i.description}
                  </p>
                )}
                {i.location && (
                  <p className="mt-2 text-xs font-semibold text-clay flex items-center gap-1">
                    <MapPin className="size-3.5 text-emerald-600" /> Pickup: {i.location}
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-border/70 pt-4 space-y-3">
                {/* Dual action contact buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${i.contact}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-muted px-3 py-2.5 text-xs font-bold text-clay hover:bg-emerald-100 hover:text-emerald-900 transition"
                  >
                    <Phone className="size-3.5 text-emerald-700" /> Call Seller
                  </a>
                  <button
                    type="button"
                    onClick={() => contactWhatsApp(i.contact, i.title, i.price || "")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-600 text-white px-3 py-2.5 text-xs font-bold shadow-sm hover:brightness-110 transition"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp
                  </button>
                </div>

                {/* Admin or Owner removal */}
                {(canManage || i.localOnly || (!!user && user.id === i.owner_id)) && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => remove(i.id)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove Listing
                    </button>
                  </div>
                )}
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
