import { createFileRoute } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { AppLinkButton } from "@/components/design-system";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({ meta: [{ title: "Unauthorized — ManaOoru" }] }),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <PageLayout
      title="Access denied"
      subtitle="You do not have permission to view this page."
      icon={<ShieldOff className="size-7" />}
    >
      <div className="rounded-[32px] border border-border bg-card p-10 text-center shadow-sm">
        <div className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldOff className="size-10" />
        </div>
        <h2 className="mt-8 text-3xl font-semibold text-clay">Unauthorized</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          This section is reserved for village administrators or platform operators. If you believe
          this is a mistake, contact support or sign in with a different account.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <AppLinkButton to="/dashboard">Return to dashboard</AppLinkButton>
          <AppLinkButton variant="secondary" to="/">
            Go to homepage
          </AppLinkButton>
        </div>
      </div>
    </PageLayout>
  );
}
