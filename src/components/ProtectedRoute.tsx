import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { AppRole } from "@/lib/supabase/auth";

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: AppRole[];
  /** Set false only on the complete-profile page itself, to avoid a redirect loop. */
  requireCompleteProfile?: boolean;
};

export function ProtectedRoute({
  children,
  roles,
  requireCompleteProfile = true,
}: ProtectedRouteProps) {
  const { user, role, loading, needsProfileCompletion } = useAuth();

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

  return children;
}
