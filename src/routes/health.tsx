import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartPulse, Siren, Stethoscope } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/health")({
  head: () => ({ meta: [{ title: "Health - ManaOoru" }] }),
  component: HealthPage,
});

function HealthPage() {
  return (
    <PageLayout
      title="Health & Medical"
      subtitle="Health centre details, camps, and nearby medical contacts."
      icon={<HeartPulse className="size-7 text-red-500" />}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <Siren className="size-5 text-red-500" /> Emergency
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Quickly find emergency numbers like ambulance and local clinics.</p>
          <Link
            to="/emergency"
            className="inline-flex items-center gap-2 rounded-full border border-red-500 text-red-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-red-50"
          >
            Go to Emergency Contacts
          </Link>
        </SurfaceCard>
        
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" /> Health Announcements
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Stay updated with health camps, vaccine drives, and medical notices.</p>
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
