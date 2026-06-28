import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Clock, Phone, Truck } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { transportOptions } from "@/lib/app-data";
import { logContact } from "@/lib/local-actions";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/transport")({
  head: () => ({ meta: [{ title: "Transport - ManaOoru" }] }),
  component: TransportPage,
});

function TransportPage() {
  const { profile } = useVillagePreferences();

  return (
    <PageLayout title="Transport & Machines" subtitle="Book tractors, autos, mini trucks, harvest machines, rotavators, and JCB support locally." icon={<Truck className="size-7" />}>
      <SectionHeader eyebrow="Village mobility" title={`Book transport near ${profile.village}`} description="Every option supports one-click call and a simple booking calendar view." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {transportOptions.map((item) => (
          <SurfaceCard key={item.id} className="p-5">
            <FeatureIcon icon={<item.icon className="size-5" />} />
            <h3 className="mt-4 font-display text-xl font-semibold text-clay">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">Available around {profile.village}. Confirm timing directly with the provider.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-3">
                <Clock className="size-4 text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Availability</p>
                <p className="font-semibold text-clay">Today</p>
              </div>
              <div className="rounded-2xl bg-muted p-3">
                <CalendarDays className="size-4 text-primary" />
                <p className="mt-2 text-xs text-muted-foreground">Rate</p>
                <p className="font-semibold text-clay">{item.price}</p>
              </div>
            </div>
            <a href={`tel:${item.contact}`} onClick={() => logContact(item, "call")} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
              <Phone className="size-4" /> Book by call
            </a>
          </SurfaceCard>
        ))}
      </div>
    </PageLayout>
  );
}
