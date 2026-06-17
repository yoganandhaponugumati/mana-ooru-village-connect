import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, Plus, Search } from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard } from "@/components/ListingForm";
import { useListings } from "@/lib/store";

export const Route = createFileRoute("/workers")({
  head: () => ({ meta: [{ title: "Find Workers — ManaOoru" }] }),
  component: WorkersPage,
});

function WorkersPage() {
  const { items, remove } = useListings("worker");
  const [q, setQ] = useState("");
  const filtered = items.filter((i) =>
    [i.title, i.description, i.category, i.location].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <PageLayout title="Find Workers" subtitle="Skilled hands from your village." icon={<Users className="size-7" />}>
      <div className="mb-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
          <Search className="size-4 text-muted-foreground" />
          <input placeholder="Search electrician, harvester, driver…" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <Link to="/post-worker" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
          <Plus className="size-4" /> Register as worker
        </Link>
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-clay">No workers found</p>
          <Link to="/post-worker" className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Be the first</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((i) => <ListingCard key={i.id} item={i} onDelete={remove} />)}
        </div>
      )}
    </PageLayout>
  );
}