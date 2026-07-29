import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/post-work")({
  head: () => ({ meta: [{ title: "Post Work — ManaOoru" }] }),
  component: () => (
    <ProtectedRoute>
      <PageLayout
        title="Post Work"
        subtitle="Need workers? Post the job and the village will respond."
        icon={<Briefcase className="size-7" />}
      >
        <div className="mx-auto max-w-2xl">
          <SurfaceCard className="p-6 sm:p-8">
            <ListingForm
              type="work"
              title="Job details"
              redirectTo="/work"
              photoLabel="Add worksite photo"
              photoHint="Show the field, house, shop, or location where workers are needed."
              fields={[
                {
                  name: "title",
                  label: "Job title",
                  placeholder: "e.g. 5 workers needed for paddy harvest",
                  required: true,
                },
                {
                  name: "description",
                  label: "Job description",
                  placeholder: "Dates, hours, food provided, etc.",
                  textarea: true,
                  required: true,
                },
                { name: "price", label: "Wage / payment", placeholder: "e.g. ₹500/day" },
                { name: "location", label: "Work location", placeholder: "Field address / area" },
                {
                  name: "contact",
                  label: "Your phone",
                  placeholder: "10-digit mobile",
                  required: true,
                },
              ]}
            />
          </SurfaceCard>
        </div>
      </PageLayout>
    </ProtectedRoute>
  ),
});
