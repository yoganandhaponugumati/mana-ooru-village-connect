import { Link, createFileRoute, useSearch } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { EmptyState, SectionHeader, SurfaceCard, StatusBadge } from "@/components/design-system";
import { expandSearchQuery, fallbackListings, getSearchableItems } from "@/lib/app-data";
import { useListings } from "@/lib/store";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search.q ?? "") }),
  head: () => ({ meta: [{ title: "Search - ManaOoru" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = useSearch({ from: "/search" });
  const { items } = useListings();
  const { profile } = useVillagePreferences();
  const allItems = getSearchableItems(items.length > 0 ? items : fallbackListings);
  const normalized = q.trim().toLowerCase();
  const expandedQuery = expandSearchQuery(q);
  const queryTerms = expandedQuery.split(/\s+/).filter(Boolean);
  const results = normalized
    ? allItems.filter((item) => {
        const haystack = [item.title, item.description, item.category, item.location, item.type]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalized) || queryTerms.some((term) => haystack.includes(term));
      })
    : allItems;

  return (
    <PageLayout
      title="Global Search"
      subtitle={`Search workers, land, products, services, notices, schemes, transport, and emergency support near ${profile.village}.`}
      icon={<Search className="size-7" />}
    >
      <SectionHeader
        eyebrow="One village search"
        title={q ? `Results for "${q}"` : "Explore everything"}
        description={`${results.length} usable result${results.length === 1 ? "" : "s"} found.`}
      />
      {results.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="No matching results"
          description="Try searching tractor, paddy, electrician, land, scheme, ambulance, or transport."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <SurfaceCard key={`${item.type}-${item.id}`} className="p-5">
              <StatusBadge
                tone={
                  item.type === "emergency"
                    ? "danger"
                    : item.type === "scheme"
                      ? "accent"
                      : "secondary"
                }
              >
                {item.type}
              </StatusBadge>
              <h3 className="mt-4 font-display text-xl font-semibold text-clay">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                <span className="rounded-full bg-muted px-3 py-1">{item.category}</span>
                <span className="rounded-full bg-muted px-3 py-1">
                  {item.location || profile.village}
                </span>
                {item.price && (
                  <span className="rounded-full bg-muted px-3 py-1">{item.price}</span>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                {item.contact ? (
                  <a
                    href={`tel:${item.contact.replace(/\s|-/g, "")}`}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Call
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Open details</span>
                )}
                <Link
                  to={item.to}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  View <ArrowRight className="size-4" />
                </Link>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
