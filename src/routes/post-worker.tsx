import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/post-worker")({
  head: () => ({ meta: [{ title: "Register as Worker — ManaOoru" }] }),
  component: () => (
    <PageLayout title="Register as a Worker" subtitle="Let the village know what you can do." icon={<UserPlus className="size-7" />}>
      <div className="mx-auto max-w-2xl">
        <SurfaceCard className="p-6 sm:p-8">
          <ListingForm
            type="worker"
            title="Your details"
            redirectTo="/workers"
            fields={[
              { name: "title", label: "Your name & skill", placeholder: "e.g. Ravi — Electrician", required: true },
              { name: "category", label: "Type of work", placeholder: "", options: ["Electrician", "Plumber", "Farm Labour", "Driver", "Mason", "Carpenter", "Painter", "Other"] },
              { name: "description", label: "About you", placeholder: "Years of experience, specialities…", textarea: true },
              { name: "price", label: "Daily rate", placeholder: "e.g. ₹500/day" },
              { name: "location", label: "Village / area", placeholder: "e.g. Kothur" },
              { name: "contact", label: "Phone number", placeholder: "10-digit mobile", required: true },
            ]}
          />
        </SurfaceCard>
      </div>
    </PageLayout>
  ),
});