import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Brush, Cable, Car, Drill, Hammer, HardHat, Paintbrush, Pickaxe, Plus, Search, Shovel, Tractor, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard } from "@/components/ListingForm";
import { AppLinkButton, EmptyState, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
import { useListings } from "@/lib/store";

export const Route = createFileRoute("/workers")({
  head: () => ({ meta: [{ title: "Find Workers — ManaOoru" }] }),
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
  const { items, remove } = useListings("worker");
  const displayItems = items.length > 0 ? items : fallbackListings.filter((item) => item.type === "worker");
  const [q, setQ] = useState("");
  const filtered = displayItems.filter((i) =>
    [i.title, i.description, i.category, i.location].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PageLayout title="Find Workers" subtitle="Skilled hands from your village." icon={<Users className="size-7" />}>
      <SectionHeader
        eyebrow="Village network"
        title="Browse trusted workers"
        description="Search by skill, area, or availability and connect with people nearby."
        actions={<AppLinkButton to="/post-worker" icon={<Plus className="size-4" />} variant="primary">Register as worker</AppLinkButton>}
      />
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
                <span className="text-xs text-muted-foreground">{category.count} nearby workers</span>
              </span>
            </button>
          </SurfaceCard>
        ))}
      </div>
      <div className="mb-8 rounded-[2rem] border border-border/70 bg-gradient-to-br from-background via-card to-muted/40 p-3 shadow-sm">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-3 shadow-sm">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="Search electrician, harvester, driver…" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="size-6" />}
          title="No workers found"
          description="Be the first to list your skills and help the village connect faster."
          action={<AppLinkButton to="/post-worker" icon={<Plus className="size-4" />} variant="primary">Be the first</AppLinkButton>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <ListingCard key={i.id} item={i} onDelete={items.length > 0 ? remove : undefined} />)}
        </div>
      )}
    </PageLayout>
  );
}
