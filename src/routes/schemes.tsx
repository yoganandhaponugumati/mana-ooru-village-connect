import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, FileText, Landmark } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SectionHeader, SurfaceCard, StatusBadge } from "@/components/design-system";
import { schemes } from "@/lib/app-data";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [{ title: "Government Schemes - ManaOoru" }] }),
  component: SchemesPage,
});

function SchemesPage() {
  const { profile } = useVillagePreferences();

  return (
    <PageLayout title="Government Schemes" subtitle="Eligibility, benefits, documents, and official application links in one place." icon={<Landmark className="size-7" />}>
      <SectionHeader eyebrow="Village benefits" title={`Schemes relevant to ${profile.district}`} description="Use this page as a practical checklist before applying." />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {schemes.map((scheme) => (
          <SurfaceCard key={scheme.id} className="p-6">
            <StatusBadge tone="accent">{scheme.category}</StatusBadge>
            <h3 className="mt-4 font-display text-2xl font-semibold text-clay">{scheme.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{scheme.benefit}</p>
            <div className="mt-5 rounded-2xl bg-muted/60 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-clay"><FileText className="size-4 text-primary" /> Documents required</p>
              <p className="mt-2 text-sm text-muted-foreground">{scheme.documents.join(", ")}</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground"><strong className="text-clay">Eligibility:</strong> {scheme.eligibility}</p>
            <a href={scheme.apply} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
              Apply / Check status <ExternalLink className="size-4" />
            </a>
          </SurfaceCard>
        ))}
      </div>
    </PageLayout>
  );
}
