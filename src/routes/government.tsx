import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Megaphone, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/government")({
  head: () => ({ meta: [{ title: "Government - ManaOoru" }] }),
  component: GovernmentPage,
});

function GovernmentPage() {
  return (
    <PageLayout
      title="Government Services"
      subtitle="Certificates, records, and official village scheme updates."
      icon={<Building2 className="size-7" />}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" /> Schemes
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">View Government Schemes available for the village.</p>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/5"
          >
            Go to Schemes
          </Link>
        </SurfaceCard>
        
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <Megaphone className="size-5 text-primary" /> Official Announcements
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Stay updated with the latest official panchayat notices.</p>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/5"
          >
            View Announcements
          </Link>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
