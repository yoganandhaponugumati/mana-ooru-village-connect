import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  Brush,
  Cable,
  Car,
  Drill,
  Hammer,
  HardHat,
  Paintbrush,
  Pickaxe,
  Plus,
  Search,
  Shovel,
  Tractor,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard } from "@/components/ListingForm";
import { AppLinkButton, FeatureIcon, SurfaceCard } from "@/components/design-system";
import { EmptyState } from "@/components/EmptyState";

import { useListings } from "@/lib/store";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/workers")({
  head: () => ({ meta: [{ title: "Find Workers — GramMitra" }] }),
  component: WorkersPage,
});

const workerCategories = [
  { label: "Farm Labour", icon: Shovel, count: "42" },
  { label: "Harvesting", icon: Pickaxe, count: "28" },
  { label: "Plantation", icon: BadgeCheck, count: "17" },
  { label: "Weeding", icon: Brush, count: "31" },
  { label: "Tractor Driver", icon: Tractor, count: "14" },
  { label: "Harvester Driver", icon: HardHat, count: "8" },
  { label: "Electrician", icon: Cable, count: "12" },
  { label: "Mechanic", icon: Wrench, count: "9" },
  { label: "Plumber", icon: Drill, count: "11" },
  { label: "Mason", icon: Hammer, count: "16" },
  { label: "Carpenter", icon: Car, count: "10" },
  { label: "Painter", icon: Paintbrush, count: "7" },
];

function WorkersPage() {
  const { t } = useVillagePreferences();
  const { items, remove } = useListings("worker");
  const displayItems = items;
  const [q, setQ] = useState("");
  const filtered = displayItems.filter((i) =>
    [i.title, i.description, i.category, i.location]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <PageLayout
      title={(t as any).workersTitle || "Village Workers Directory"}
      subtitle={
        (t as any).workersSubtitle ||
        "Find daily wage workers, farm labor, electricians, mechanics, and skilled labor nearby."
      }
      icon={<Users className="size-6 text-primary" />}
      heroAction={
        <AppLinkButton
          to="/post-worker"
          icon={<Plus className="size-5" />}
          variant="primary"
          className="rounded-2xl px-8 py-4 text-base font-extrabold shadow-xl shadow-primary/30 hover:scale-105 transition"
        >
          ⚡ Register as Village Worker +
        </AppLinkButton>
      }
    >
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {workerCategories.map((category) => (
          <SurfaceCard key={category.label} className="p-4" hover>
            <button
              onClick={() => setQ(category.label)}
              className="flex w-full items-center gap-3 text-left"
              aria-label={`Browse ${category.label}`}
            >
              <FeatureIcon icon={<category.icon className="size-5" />} className="rounded-2xl" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-clay">{category.label}</span>
                <span className="text-xs text-muted-foreground">
                  {category.count} nearby workers
                </span>
              </span>
            </button>
          </SurfaceCard>
        ))}
      </div>
      <div className="mb-8 rounded-[2rem] border border-border/70 bg-gradient-to-br from-background via-card to-muted/40 p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="size-4 text-muted-foreground" />
          <input
            aria-label="Search workers"
            placeholder="Search electrician, harvester, driver…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No workers found matching search"
          description="Be the first to list your skills or clear search filters to view all workers."
          actionLabel="Register as Worker"
          actionTo="/post-worker"
          secondaryActionLabel="Clear Search"
          onSecondaryActionClick={() => setQ("")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => (
            <ListingCard key={i.id} item={i} onDelete={items.length > 0 ? remove : undefined} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
