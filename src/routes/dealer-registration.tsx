import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Loader2, MapPin, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { applyAsDealer, dealerCategories, type DealerCategory } from "@/lib/supabase/auth";

export const Route = createFileRoute("/dealer-registration")({
  head: () => ({ meta: [{ title: "Become a Dealer — ManaOoru" }] }),
  component: () => (
    <ProtectedRoute>
      <DealerRegistrationPage />
    </ProtectedRoute>
  ),
});

function DealerRegistrationPage() {
  const navigate = useNavigate();
  const { user, profile, isDealerPending, isDealerApproved, refreshProfile } = useAuth();

  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [category, setCategory] = useState<DealerCategory>("Grocery");
  const [busy, setBusy] = useState(false);

  // If already a dealer, show status
  if (isDealerApproved) {
    return (
      <PageLayout title="Dealer Status">
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <div className="text-5xl">✅</div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-clay">
            You're an approved dealer!
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You can manage your shop from the dealer dashboard.
          </p>
          <Link
            to="/dashboard"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
          >
            Go to Dashboard
          </Link>
        </div>
      </PageLayout>
    );
  }

  if (isDealerPending) {
    return (
      <PageLayout title="Dealer Status">
        <div className="mx-auto max-w-lg px-4 py-12 text-center">
          <div className="text-5xl">⏳</div>
          <h2 className="mt-4 font-display text-2xl font-semibold text-amber-600">
            Application Pending
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your dealer application is being reviewed. You'll be notified once it's approved by your
            Village Admin or Platform Admin.
          </p>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm">
            <p className="font-semibold text-amber-800">Application Details:</p>
            <ul className="mt-2 space-y-1 text-amber-700">
              <li>Shop: {profile?.shop_name || "N/A"}</li>
              <li>Category: {profile?.dealer_category || "N/A"}</li>
            </ul>
          </div>
          <Link
            to="/timeline"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="size-4" /> Back to Timeline
          </Link>
        </div>
      </PageLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopName.trim()) {
      toast.error("Please enter your shop name.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in.");
      return;
    }

    setBusy(true);
    try {
      await applyAsDealer({
        userId: user.id,
        shopName: shopName.trim(),
        shopDescription: shopDescription.trim() || undefined,
        shopAddress: shopAddress.trim() || undefined,
        dealerCategory: category,
        villageId: profile?.village_id || undefined,
      });
      await refreshProfile();
      toast.success("Dealer application submitted! You'll be notified once approved.");
      navigate({ to: "/timeline" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageLayout title="Become a Dealer">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          to="/timeline"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to Timeline
        </Link>

        <SurfaceCard className="p-6 shadow-[var(--shadow-lift)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
              <Store className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-clay">
                Register as a Dealer
              </h1>
              <p className="text-sm text-muted-foreground">
                Set up your shop profile and start selling on ManaOoru
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-primary">
            <strong>How it works:</strong> After submitting your application, your Village Admin or
            Platform Admin will review and approve your dealer account. Once approved, you can
            manage your shop, upload products, and publish offers.
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Shop Name */}
            <div>
              <label
                htmlFor="dealer-shop-name"
                className="mb-1.5 block text-sm font-semibold text-clay"
              >
                <Building2 className="mr-1.5 inline size-4 text-primary" />
                Shop Name *
              </label>
              <input
                id="dealer-shop-name"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Sri Lakshmi Fertilizers"
                required
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="dealer-category"
                className="mb-1.5 block text-sm font-semibold text-clay"
              >
                <ShoppingBag className="mr-1.5 inline size-4 text-primary" />
                Dealer Category *
              </label>
              <select
                id="dealer-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as DealerCategory)}
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground"
              >
                {dealerCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="dealer-description"
                className="mb-1.5 block text-sm font-semibold text-clay"
              >
                Shop Description
              </label>
              <textarea
                id="dealer-description"
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                placeholder="Briefly describe what you sell or services you offer..."
                rows={3}
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="dealer-address"
                className="mb-1.5 block text-sm font-semibold text-clay"
              >
                <MapPin className="mr-1.5 inline size-4 text-primary" />
                Shop Address
              </label>
              <input
                id="dealer-address"
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                placeholder="e.g. Near Bus Stand, Main Road"
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground"
              />
            </div>

            {/* Village info */}
            {profile?.village && (
              <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                <span className="font-semibold text-clay">Village: </span>
                <span className="text-muted-foreground">
                  {[profile.village, profile.mandal, profile.district, profile.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Submitting..." : "Submit Dealer Application"}
            </button>
          </form>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
