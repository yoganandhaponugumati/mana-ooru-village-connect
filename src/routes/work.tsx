import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Plus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingCard } from "@/components/ListingForm";
import { useListings } from "@/lib/store";

export const Route = createFileRoute("/work")({
  head: () => ({ meta: [{ title: "Available Jobs — ManaOoru" }] }),
  component: WorkPage,
});

function WorkPage() {
  const { items, remove } = useListings("work");
  return (
    <PageLayout
      title="Jobs in your village"
      subtitle="Find paid work nearby."
      icon={<Briefcase className="size-7" />}
    >
      <div className="mb-6 flex justify-end">
        <Link
          to="/post-work"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          <Plus className="size-4" /> Post a job
        </Link>
      </div>
      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-clay">No jobs posted yet</p>
          <Link
            to="/post-work"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Post the first job
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <ListingCard key={i.id} item={i} onDelete={remove} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}
