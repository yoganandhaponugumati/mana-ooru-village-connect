import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, Phone } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import { useListings, timeAgo } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — ManaOoru" }] }),
  component: AnnPage,
});

function AnnPage() {
  const { items, remove } = useListings("announcement");
  const [showForm, setShowForm] = useState(false);
  return (
    <PageLayout title="Village Notice Board" subtitle="Panchayat updates, government notices, community alerts." icon={<Megaphone className="size-7" />}>
      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowForm((v) => !v)} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
          <Plus className="size-4" /> {showForm ? "Cancel" : "Post a notice"}
        </button>
      </div>
      {showForm && (
        <div className="mb-8 rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9">
          <ListingForm
            type="announcement"
            title="Notice details"
            redirectTo="/announcements"
            fields={[
              { name: "title", label: "Notice title", placeholder: "e.g. Water tank cleaning Sunday", required: true },
              { name: "category", label: "Category", placeholder: "", options: ["Panchayat", "Agriculture", "Health", "Education", "Notice", "Event", "Emergency"] },
              { name: "description", label: "Details", placeholder: "Date, time, who it concerns…", textarea: true, required: true },
              { name: "location", label: "Location", placeholder: "Where it applies" },
              { name: "contact", label: "Posted by / contact", placeholder: "Name or phone", required: true },
            ]}
          />
        </div>
      )}
      {items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-lg font-semibold text-clay">No notices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <article key={a.id} className="hover-lift rounded-2xl border-l-4 border-accent bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{a.category || "Notice"}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
              </div>
              <h3 className="mt-1.5 font-display text-lg font-semibold text-clay">{a.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="size-3" /> {a.contact}
                </p>
                <button onClick={() => remove(a.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageLayout>
  );
}