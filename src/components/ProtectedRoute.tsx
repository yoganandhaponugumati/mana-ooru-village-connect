import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { AppRole } from "@/lib/supabase/auth";
import { getDealerStatusDisplayName } from "@/lib/supabase/auth";

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: AppRole[];
  /** Set false only on the complete-profile page itself, to avoid a redirect loop. */
  requireCompleteProfile?: boolean;
  /** When true, dealers must have `dealer_status = 'approved'` to access this route. */
  dealerMustBeApproved?: boolean;
};

export function ProtectedRoute({
  children,
  roles,
  requireCompleteProfile = true,
  dealerMustBeApproved = true,
}: ProtectedRouteProps) {
  const { user, role, loading, needsProfileCompletion, profile } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-sm font-medium text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireCompleteProfile && needsProfileCompletion) {
    return <Navigate to="/complete-profile" replace />;
  }

  const effectiveRole = role ?? "citizen";
  if (roles && !roles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Dealer approval gate: if this route requires approved dealer status,
  // show a pending/suspended/rejected state instead of the route content.
  if (dealerMustBeApproved && effectiveRole === "dealer") {
    const dealerStatus = profile?.dealer_status;
    if (dealerStatus !== "approved") {
      return <DealerStatusGate status={dealerStatus} />;
    }
  }

  return children;
}

function DealerStatusGate({ status }: { status: string | null | undefined }) {
  const statusDisplay = getDealerStatusDisplayName(
    status as Parameters<typeof getDealerStatusDisplayName>[0],
  );

  const statusConfig: Record<string, { icon: string; color: string; message: string }> = {
    pending: {
      icon: "⏳",
      color: "text-amber-600",
      message:
        "Your dealer application is being reviewed by the Village Admin or Platform Admin. You'll be notified once it's approved.",
    },
    suspended: {
      icon: "⚠️",
      color: "text-red-600",
      message:
        "Your dealer account has been suspended. Please contact your Village Admin or Platform Admin for assistance.",
    },
    rejected: {
      icon: "❌",
      color: "text-red-600",
      message:
        "Your dealer application was not approved. Please contact your Village Admin or Platform Admin to understand the reason or reapply.",
    },
  };

  const config = statusConfig[status ?? ""] ?? {
    icon: "ℹ️",
    color: "text-muted-foreground",
    message: "Your dealer status is currently unavailable. Please try again later.",
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl">{config.icon}</div>
        <h1 className={`mt-4 text-xl font-semibold ${config.color}`}>{statusDisplay}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{config.message}</p>
        <a
          href="/timeline"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go to timeline
        </a>
      </div>
    </div>
  );
}
