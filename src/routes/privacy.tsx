import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  Camera,
  MapPin,
  Bell,
  Trash2,
  FileText,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { AppLinkButton, SectionHeader, SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy & Data Safety — ManaOoru" },
      {
        name: "description",
        content:
          "Official Privacy Policy and Google Play Data Safety disclosure for the ManaOoru Digital Village Ecosystem.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

export function PrivacyPolicyPage() {
  return (
    <PageLayout
      title="Privacy Policy & Data Safety"
      subtitle="Transparent documentation on how ManaOoru collects, secures, and honors your personal village data in compliance with Google Play Store rules."
      icon={<ShieldCheck className="size-7 text-primary" />}
    >
      <div className="mx-auto max-w-4xl space-y-10">
        <SurfaceCard className="p-6 sm:p-8 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/70 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <CheckCircle2 className="size-3.5" /> Google Play Compliant
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold text-clay sm:text-3xl">
                Data Controller & Scope
              </h2>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              Last Updated: July 16, 2026
            </p>
          </div>
          <p className="mt-6 text-sm sm:text-base leading-7 text-muted-foreground">
            Welcome to <strong className="text-foreground">ManaOoru</strong> (the
            &ldquo;Platform&rdquo;), India&rsquo;s living digital village ecosystem connecting rural
            citizens, farmers, local dealers, and Gram Panchayats. This Privacy Policy applies to
            our website, mobile application (`Android APK/AAB`), and Trusted Web Activities. By
            using ManaOoru, you trust us with your local identity. We never sell your personal data
            to third-party ad brokers or data aggregators.
          </p>
        </SurfaceCard>

        {/* Section 1: Information We Collect */}
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Data Inventory"
            title="What Information We Collect"
            description="We collect only what is strictly necessary to verify local trust and power direct peer-to-peer village trade."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SurfaceCard className="p-6">
              <div className="flex items-center gap-3 text-primary font-display font-semibold text-lg">
                <FileText className="size-5" />
                <span>Account & Profile Data</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                When you sign in (`/auth`), we store your{" "}
                <strong className="text-foreground">Name, Phone Number, Email, Occupation</strong>,
                and selected <strong className="text-foreground">Village / Mandal</strong> to verify
                your identity within your local community.
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <div className="flex items-center gap-3 text-primary font-display font-semibold text-lg">
                <Camera className="size-5" />
                <span>User-Generated Content</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                We store the text descriptions, pricing, and{" "}
                <strong className="text-foreground">Photos / Documents</strong> you upload when
                creating Marketplace listings (`/marketplace`), Land leases, or Citizen problem
                reports (`/problems`).
              </p>
            </SurfaceCard>
          </div>
        </div>

        {/* Section 2: Device Permissions Disclosure */}
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Google Play Safety"
            title="Device Permissions & Justifications"
            description="Our mobile app asks for minimal hardware access. Here is exactly why each permission is used."
          />
          <SurfaceCard className="overflow-hidden divide-y divide-border/60">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 font-bold">
                <Camera className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-clay">
                  Camera & Photo Gallery (`READ_EXTERNAL_STORAGE` / `CAMERA`)
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <strong className="text-foreground">Why required:</strong> Allows you to snap and
                  upload real-time pictures of crops, tractors, dairy products, or village
                  infrastructure issues directly into your listings. Photos are stored securely on
                  our cloud storage buckets and are never accessed without your explicit upload
                  action.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 font-bold">
                <MapPin className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-clay">
                  Location (`ACCESS_COORDS` / Village Preference)
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <strong className="text-foreground">Why required:</strong> Used exclusively to
                  auto-detect or filter local village data, connecting you with nearby workers,
                  local weather updates (`/weather`), and panchayat announcements within your exact
                  district and mandal.
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 items-start">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 font-bold">
                <Bell className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-clay">
                  Push Notifications (`POST_NOTIFICATIONS`)
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  <strong className="text-foreground">Why required:</strong> Delivers instant,
                  critical alerts regarding emergency calls, government schemes deadlines
                  (`/schemes`), weather warnings, and direct buyer inquiries on your active
                  listings.
                </p>
              </div>
            </div>
          </SurfaceCard>
        </div>

        {/* Section 3: Data Security & Zero-Brokerage Policy */}
        <SurfaceCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3 text-clay font-display font-bold text-xl">
            <Lock className="size-6 text-primary" />
            <span>Row-Level Security (`RLS`) & Zero-Brokerage Commerce</span>
          </div>
          <p className="mt-3 text-sm sm:text-base leading-7 text-muted-foreground">
            All user profiles and listings are protected by strict{" "}
            <strong className="text-foreground">Postgres Row-Level Security (`RLS`)</strong>{" "}
            policies directly at the database layer (`Supabase`). Only signed-in users can publish
            content, and you can only update or delete your own records.
            <br />
            <br />
            Because ManaOoru operates as a{" "}
            <strong className="text-foreground">100% Zero-Brokerage (`0% commission`)</strong>{" "}
            digital commons, when you post a listing with your contact number, your neighbours
            contact you directly. We do not intercept transactions, charge commission cuts, or share
            your contact data with outside telemarketers.
          </p>
        </SurfaceCard>

        {/* Section 4: Data Retention & User Rights (Delete Account) */}
        <SurfaceCard className="p-6 sm:p-8 border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3 text-red-600 font-display font-bold text-xl">
            <Trash2 className="size-6" />
            <span>Your Right to Wiping Data & Account Deletion</span>
          </div>
          <p className="mt-3 text-sm sm:text-base leading-7 text-muted-foreground">
            In compliance with{" "}
            <strong className="text-foreground">Google Play Store policies (2024–2026)</strong>, you
            retain complete sovereignty over your account. You can request or execute permanent
            deletion of your profile at any time:
          </p>
          <ul className="mt-4 list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">In-App Deletion:</strong> Open your{" "}
              <strong className="text-foreground">Profile (`/profile`)</strong>, scroll to Account
              Settings, enter your password, and click &ldquo;Delete Account & All Data&rdquo;.
            </li>
            <li>
              <strong className="text-foreground">Web Deletion Portal (No App Required):</strong>{" "}
              Visit our dedicated{" "}
              <strong className="text-foreground">Account Deletion Page (`/delete-account`)</strong>{" "}
              from any browser to initiate instant wiping.
            </li>
          </ul>
          <p className="mt-4 text-xs font-semibold text-red-600/90">
            Note: Deleting your account immediately cascades (`ON DELETE CASCADE`) to erase your
            authentication row, profile details, active listings, complaint photos, and push
            subscriptions permanently.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <AppLinkButton to="/delete-account" variant="secondary" size="sm">
              Visit Account Deletion Portal
            </AppLinkButton>
            <AppLinkButton to="/profile" variant="ghost" size="sm">
              Go to Profile Settings
            </AppLinkButton>
          </div>
        </SurfaceCard>

        {/* Section 5: Contact Information */}
        <SurfaceCard className="p-6 sm:p-8">
          <div className="flex items-center gap-3 text-clay font-display font-bold text-xl">
            <Mail className="size-6 text-primary" />
            <span>Contact & Grievance Officer</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            If you have any questions, privacy concerns, or requests regarding this Privacy Policy
            or your personal data across the ManaOoru network, please reach out directly to our
            dedicated support desk:
          </p>
          <div className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm space-y-1">
            <p>
              <strong className="text-foreground">Grievance Email:</strong> privacy@manaooru.org
            </p>
            <p>
              <strong className="text-foreground">Support Desk:</strong> hello@manaooru.org
            </p>
            <p>
              <strong className="text-foreground">Platform Scope:</strong> Rural India Digital
              Village Ecosystem
            </p>
          </div>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
