import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import type { AppRole } from "@/lib/supabase/auth";

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: AppRole[];
};

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

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

  const effectiveRole = role ?? "citizen";
  if (roles && !roles.includes(effectiveRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
