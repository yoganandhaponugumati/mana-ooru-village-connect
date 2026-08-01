import { createFileRoute, Link } from "@tanstack/react-router";
import { Sprout, Tractor, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/agriculture")({
  head: () => ({ meta: [{ title: "Agriculture - ManaOoru" }] }),
  component: AgriculturePage,
});

function AgriculturePage() {
  return (
    <PageLayout
      title="Agriculture & Farming"
      subtitle="Government schemes, subsidies, and crop support for farmers."
      icon={<Sprout className="size-7" />}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <Tractor className="size-5 text-primary" /> Machinery & Services
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Find local tractors, harvesters, and mechanics.</p>
          <Link
            to="/services"
            search={{ kind: "services" }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-secondary"
          >
            <Search className="size-4" /> Browse Machinery
          </Link>
        </SurfaceCard>

        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <Sprout className="size-5 text-primary" /> Schemes & Subsidies
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">View the latest agriculture government schemes and subsidies.</p>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/5"
          >
            <Search className="size-4" /> View Schemes
          </Link>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
