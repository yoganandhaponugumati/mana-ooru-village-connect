import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Megaphone, BookOpen } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/education")({
  head: () => ({ meta: [{ title: "Education - ManaOoru" }] }),
  component: EducationPage,
});

function EducationPage() {
  return (
    <PageLayout
      title="Education & Learning"
      subtitle="School notices, scholarships, and learning updates."
      icon={<GraduationCap className="size-7" />}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <Megaphone className="size-5 text-primary" /> Educational Notices
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Stay updated with the latest school and college announcements.</p>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/5"
          >
            View Announcements
          </Link>
        </SurfaceCard>
        
        <SurfaceCard className="p-6 sm:p-8">
          <h2 className="mb-4 font-display text-xl font-semibold text-clay flex items-center gap-2">
            <BookOpen className="size-5 text-primary" /> Schemes & Scholarships
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">Find education-related government schemes and scholarships.</p>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 text-sm font-semibold transition hover:bg-primary/5"
          >
            Go to Schemes
          </Link>
        </SurfaceCard>
      </div>
    </PageLayout>
  );
}
