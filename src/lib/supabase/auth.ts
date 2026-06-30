import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "village_admin" | "citizen";
export type Occupation =
  | "Farmer"
  | "Worker"
  | "Teacher"
  | "Student"
  | "Electrician"
  | "Mechanic"
  | "Doctor"
  | "Business"
  | "Other";
export type LegacyAccountType = "villager" | "village_admin" | "app_admin";
export type AccountType = AppRole | LegacyAccountType;

export const appRoles: AppRole[] = ["super_admin", "village_admin", "citizen"];
export const occupations: Occupation[] = [
  "Farmer",
  "Worker",
  "Teacher",
  "Student",
  "Electrician",
  "Mechanic",
  "Doctor",
  "Business",
  "Other",
];

export const dashboardRouteByRole: Record<AppRole, string> = {
  super_admin: "/dashboard",
  village_admin: "/dashboard",
  citizen: "/dashboard",
};

export function normalizeRole(value: string | null | undefined): AppRole {
  if (value === "super_admin" || value === "admin" || value === "app_admin") {
    return "super_admin";
  }
  if (value === "village_admin" || value === "official") return "village_admin";
  return "citizen";
}

export function roleToLegacyAccountType(role: AppRole): LegacyAccountType {
  if (role === "super_admin") return "app_admin";
  if (role === "village_admin") return "village_admin";
  return "villager";
}

export function getRoleDashboardPath(role: AppRole | null | undefined) {
  return dashboardRouteByRole[role ?? "citizen"];
}

export function getAuthRedirectUrl(path = "/") {
  const configuredUrl =
    import.meta.env.VITE_AUTH_REDIRECT_URL ||
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL;

  if (configuredUrl) {
    return new URL(path, configuredUrl).toString();
  }

  return typeof window !== "undefined" ? `${window.location.origin}${path}` : undefined;
}

export async function signInWithEmailPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmailPassword({
  email,
  password,
  fullName,
  phone,
  occupation,
  metadata,
}: {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  occupation?: Occupation;
  metadata?: Record<string, string | undefined>;
}) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      data: {
        full_name: fullName,
        display_name: fullName,
        phone,
        occupation,
        role: "citizen",
        account_type: "villager",
        ...metadata,
      },
    },
  });
}

export async function signInWithOAuth(provider: Provider) {
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: getAuthRedirectUrl("/"),
    },
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}
