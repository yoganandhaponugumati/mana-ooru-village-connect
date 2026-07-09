import { createFileRoute } from "@tanstack/react-router";
import { Phone, Siren } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { emergencyContacts } from "@/lib/app-data";
import { logContact } from "@/lib/local-actions";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/emergency")({
  head: () => ({ meta: [{ title: "Emergency Contacts - ManaOoru" }] }),
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
            className={`p-5 ${item.urgent ? "border-red-200 bg-red-50/80" : ""}`}
          >
            <FeatureIcon
              icon={<item.icon className="size-5" />}
              className={item.urgent ? "bg-red-100 text-red-700" : ""}
            />
            <h3 className="mt-4 font-display text-xl font-semibold text-clay">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.role}</p>
            <a
              href={`tel:${item.contact}`}
              onClick={() => logContact(item, "call")}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${item.urgent ? "bg-red-600 text-white" : "bg-primary text-primary-foreground"}`}
            >
              <Phone className="size-4" /> Call {item.contact}
            </a>
          </SurfaceCard>
        ))}
      </div>
    </PageLayout>
  );
}
