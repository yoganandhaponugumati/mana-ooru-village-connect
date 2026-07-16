import { createFileRoute } from "@tanstack/react-router";
import { Scale, Handshake, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SectionHeader, SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service & Community Guidelines — ManaOoru" },
      {
        name: "description",
        content:
          "Official Terms of Service, Zero-Brokerage rules, and Community Guidelines for the ManaOoru Digital Village Platform.",
      },
    ],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
  return (
    <PageLayout
      title="Terms of Service & Community Guidelines"
      subtitle="Clear, fair rules governing our digital village commons, direct zero-brokerage trade, and community conduct."
      icon={<Scale className="size-7 text-primary" />}
    >
      <div className="mx-auto max-w-4xl space-y-10">
        <SurfaceCard className="p-6 sm:p-8 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <CheckCircle2 className="size-3.5" /> Community Covenant
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-clay sm:text-3xl">
                Our Digital Village Compact
              </h2>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              Effective Date: July 16, 2026
            </p>
          </div>
          <p className="mt-6 text-sm sm:text-base leading-7 text-muted-foreground">
            By creating an account (`/auth`) or accessing <strong className="text-foreground">ManaOoru</strong> across our web portal or mobile apps (`Android APK/AAB`), you agree to abide by these Terms of Service. ManaOoru is built to empower rural India with trustworthy, direct commerce. We treat every participant as a respected neighbour.
          </p>
        </SurfaceCard>

        {/* Section 1: Zero-Brokerage & Direct Peer-to-Peer Trade */}
        <SurfaceCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3 text-primary font-display font-bold text-xl">
            <Handshake className="size-6" />
            <span>100% Zero-Brokerage (`0% Commission`) Disclaimer</span>
          </div>
          <p className="mt-3 text-sm sm:text-base leading-7 text-muted-foreground">
            ManaOoru operates strictly as an open digital directory and communication portal. 
            <br /><br />
            1. <strong className="text-foreground">No Intermediary Cuts:</strong> We never charge commission fees on land leases (`/land`), agricultural produce sales (`/marketplace`), worker daily wages (`/workers`), or local service bookings (`/services`).
            <br />
            2. <strong className="text-foreground">Direct Peer-to-Peer Verification:</strong> All transactions, financial exchanges, crop quality inspections, and wage agreements occur directly between the buyer and seller or citizen and service provider. ManaOoru does not escrow funds or act as a financial guarantor.
          </p>
        </SurfaceCard>

        {/* Section 2: User Code of Conduct & Acceptable Use */}
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Rules of Conduct"
            title="Acceptable Use & Community Standards"
            description="We preserve village harmony and trust. The following behaviors are strictly enforced across our platform."
          />
          <SurfaceCard className="overflow-hidden divide-y divide-border/60">
            <div className="p-5 sm:p-6 flex gap-4 items-start">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold">1</div>
              <div>
                <h3 className="font-display font-bold text-lg text-clay">Authentic & Truthful Listings</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Every marketplace item, land lease description, worker profile, and pricing estimate must be truthful and accurate. Misleading pictures or intentionally false crop quantities will result in listing removal.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex gap-4 items-start">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold">2</div>
              <div>
                <h3 className="font-display font-bold text-lg text-clay">Respectful Village Communication</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Hate speech, political harassment, caste-based discrimination, obscene uploads, or abusive language in citizen problem reports (`/problems`) or timeline announcements (`/announcements`) is prohibited and leads to instant account suspension.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex gap-4 items-start">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary font-bold">3</div>
              <div>
                <h3 className="font-display font-bold text-lg text-clay">Dealer & Merchant Responsibilities</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Registered commercial dealers (`/dealer-registration`) must honor posted prices, maintain valid local shop permits where applicable, and respect consumer warranty laws on seeds, fertilizers, and hardware.
                </p>
              </div>
            </div>
          </SurfaceCard>
        </div>

        {/* Section 3: Account Suspension & Termination */}
        <SurfaceCard className="p-6 sm:p-8 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 text-amber-700 font-display font-bold text-xl">
            <AlertTriangle className="size-6" />
            <span>Moderation & Account Termination</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Gram Panchayat officials, Sarpanch administrators, and platform moderators reserve the right to flag, hide, or delete listings that violate these community standards. If an account repeatedly abuses community trust or engages in fraud, we reserve the right to revoke access without notice.
          </p>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
