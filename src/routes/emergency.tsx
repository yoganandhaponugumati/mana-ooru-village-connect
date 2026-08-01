import { createFileRoute } from "@tanstack/react-router";
import { Phone, Siren } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { emergencyContacts } from "@/lib/app-data";
import { logContact } from "@/lib/local-actions";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/emergency")({
  head: () => ({ meta: [{ title: "Emergency Contacts - DigiMitra" }] }),
  component: EmergencyPage,
});

function EmergencyPage() {
  const { profile } = useVillagePreferences();

  return (
    <PageLayout
      title="Emergency Contacts"
      subtitle="One-click call support for police, ambulance, fire, health, veterinary, electricity, and village officers."
      icon={<Siren className="size-7" />}
    >
      <SectionHeader
        eyebrow="Safety first"
        title={`Important numbers for ${profile.village}`}
        description="Tap call immediately during urgent situations."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {emergencyContacts.map((item) => (
          <SurfaceCard
            key={item.id}
            className={`p-4 flex flex-row items-center gap-4 border-l-4 rounded-[1.25rem] shadow-sm hover:shadow-md transition ${
              item.urgent ? "border-red-500 bg-red-50/80 dark:bg-red-950/20" : "border-primary bg-card/95"
            }`}
          >
            <FeatureIcon
              icon={<item.icon className="size-5" />}
              className={`shrink-0 ${item.urgent ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" : ""}`}
            />
            <div className="flex flex-col flex-1 min-w-0">
              <h3 className="truncate font-display text-base font-bold text-clay leading-tight">{item.title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.role}</p>
            </div>
            <a
              href={`tel:${item.contact}`}
              onClick={() => logContact(item, "call")}
              className={`shrink-0 inline-flex items-center justify-center rounded-full p-3 shadow-sm transition hover:scale-105 active:scale-95 ${
                item.urgent ? "bg-red-600 text-white" : "bg-primary text-primary-foreground"
              }`}
            >
              <Phone className="size-4" />
            </a>
          </SurfaceCard>
        ))}
      </div>
    </PageLayout>
  );
}
