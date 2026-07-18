import type { Provider } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// ── Role types ──────────────────────────────────────────────────────────────
export type AppRole = "super_admin" | "village_admin" | "dealer" | "citizen";

export type DealerStatus = "pending" | "approved" | "suspended" | "rejected";

export type DealerCategory =
  | "Grocery"
  | "Medical Shop"
  | "Fertilizer Shop"
  | "Rice Mill"
  | "Tractor Dealer"
  | "Dairy"
  | "Hardware"
  | "Restaurant"
  | "Clothing"
  | "Electronics"
  | "Automobile"
  | "Stationery"
  | "Veterinary"
  | "Seeds & Pesticides"
  | "Construction"
  | "Poultry & Feed"
  | "Other";

export type Designation =
  | "Sarpanch"
  | "Panchayat Secretary"
  | "VRO"
  | "Panchayat Officer"
  | "Ward Member"
  | "MPDO"
  | "Mandal Parishad"
  | "Other";

export type Occupation =
  | "Farmer"
  | "Worker"
  | "Teacher"
  | "Student"
  | "Electrician"
  | "Mechanic"
  | "Doctor"
  | "Business"
  | "Driver"
  | "Other";

export type LegacyAccountType = "villager" | "village_admin" | "app_admin";
export type AccountType = AppRole | LegacyAccountType;

// ── Constants ───────────────────────────────────────────────────────────────
export const appRoles: AppRole[] = ["super_admin", "village_admin", "dealer", "citizen"];

export const occupations: Occupation[] = [
  "Farmer",
  "Worker",
  "Teacher",
  "Student",
  "Electrician",
  "Mechanic",
  "Doctor",
  "Business",
  "Driver",
  "Other",
];

export const dealerCategories: DealerCategory[] = [
  "Grocery",
  "Medical Shop",
  "Fertilizer Shop",
  "Rice Mill",
  "Tractor Dealer",
  "Dairy",
  "Hardware",
  "Restaurant",
  "Clothing",
  "Electronics",
  "Automobile",
  "Stationery",
  "Veterinary",
  "Seeds & Pesticides",
  "Construction",
  "Poultry & Feed",
  "Other",
];

export const designations: Designation[] = [
  "Sarpanch",
  "Panchayat Secretary",
  "VRO",
  "Panchayat Officer",
  "Ward Member",
  "MPDO",
  "Mandal Parishad",
  "Other",
];

// ── Dashboard routing ───────────────────────────────────────────────────────
export const dashboardRouteByRole: Record<AppRole, string> = {
  super_admin: "/dashboard",
  village_admin: "/dashboard",
  dealer: "/dashboard",
  citizen: "/timeline",
};

// ── Role utilities ──────────────────────────────────────────────────────────
export function normalizeRole(value: string | null | undefined): AppRole {
  if (value === "super_admin" || value === "admin" || value === "app_admin") {
    return "super_admin";
  }
  if (value === "village_admin" || value === "official") return "village_admin";
  if (value === "dealer" || value === "merchant") return "dealer";
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

export function getRoleDisplayName(role: AppRole): string {
  switch (role) {
    case "super_admin":
      return "Platform Admin";
    case "village_admin":
      return "Village Admin";
    case "dealer":
      return "Dealer";
    case "citizen":
      return "Citizen";
  }
}

export function getDealerStatusDisplayName(status: DealerStatus | null | undefined): string {
  switch (status) {
    case "pending":
      return "Pending Approval";
    case "approved":
      return "Approved";
    case "suspended":
      return "Suspended";
    case "rejected":
      return "Rejected";
    default:
      return "Unknown";
  }
}

// ── Auth redirect ───────────────────────────────────────────────────────────
export function getAuthRedirectUrl(path = "/") {
  if (typeof window !== "undefined") {
    // In local development, dynamically redirect to the active page origin
    // to prevent port mismatch issues (e.g. running on 8080 vs configured 5173).
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return `${window.location.origin}${path}`;
    }
  }

  const configuredUrl =
    import.meta.env.VITE_AUTH_REDIRECT_URL ||
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.VITE_APP_URL;

  if (configuredUrl) {
    return new URL(path, configuredUrl).toString();
  }

  return typeof window !== "undefined" ? `${window.location.origin}${path}` : undefined;
}

// ── Sign-in methods ─────────────────────────────────────────────────────────
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

// ── Dealer registration ─────────────────────────────────────────────────────
export async function applyAsDealer({
  userId,
  shopName,
  shopDescription,
  shopAddress,
  dealerCategory,
  villageId,
}: {
  userId: string;
  shopName: string;
  shopDescription?: string;
  shopAddress?: string;
  dealerCategory: DealerCategory;
  villageId?: string;
}) {
  // Step 1: Update the profile to request dealer role
  // The role change to 'dealer' must be done by an admin via the
  // protect_profile_role_changes trigger. So we update dealer-specific
  // fields first and set dealer_status to 'pending'.
  // A super_admin or village_admin will later approve and set role = 'dealer'.
  const { error } = await supabase
    .from("profiles")
    .update({
      dealer_status: "pending",
      dealer_category: dealerCategory,
      shop_name: shopName,
      shop_description: shopDescription || null,
      shop_address: shopAddress || null,
      village_id: villageId || undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

// ── Dealer approval (for admins) ────────────────────────────────────────────
export async function approveDealerApplication(dealerId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      role: "dealer",
      dealer_status: "approved",
      account_type: "villager",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealerId);

  if (error) throw error;
}

export async function rejectDealerApplication(dealerId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      dealer_status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealerId);

  if (error) throw error;
}

export async function suspendDealer(dealerId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({
      dealer_status: "suspended",
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealerId);

  if (error) throw error;
}

// ── Password utilities ──────────────────────────────────────────────────────
export function getPasswordError(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-zA-Z]/.test(password)) return "Password must include at least one letter.";
  if (!/[0-9]/.test(password)) return "Password must include at least one number.";
  return null;
}

export function getPasswordStrength(password: string): "weak" | "fair" | "strong" {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

// ── Phone OTP ───────────────────────────────────────────────────────────────
export async function verifyPhoneOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}

// ── Username ────────────────────────────────────────────────────────────────
// Keep in sync with the DB constraint `profiles_username_format_check`
// (supabase/migrations/20260708130000_auth_username_profile_completion.sql).
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function getUsernameError(username: string): string | null {
  const value = username.trim();
  if (!value) return "Username is required.";
  if (value.length < 3) return "Username must be at least 3 characters.";
  if (value.length > 20) return "Username must be 20 characters or fewer.";
  if (!USERNAME_PATTERN.test(value)) {
    return "Use only lowercase letters, numbers, and underscores.";
  }
  return null;
}

/**
 * Checks whether a username is free. Case-insensitive, matching the DB's
 * unique index on lower(username). Pass `currentUserId` when editing an
 * existing profile so the user's own current username doesn't flag as taken.
 */
export async function isUsernameAvailable(username: string, currentUserId?: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username.trim())
    .maybeSingle();

  if (error) throw error;
  if (!data) return true;
  return data.id === currentUserId;
}

// ── Email verification ──────────────────────────────────────────────────────
export async function resendEmailVerification(email: string) {
  return supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: getAuthRedirectUrl("/") },
  });
}

/** Hard-deletes the signed-in user's account and everything that cascades from it. */
export async function deleteMyAccount(password: string) {
  const { deleteMyAccount: deleteMyAccountFn } = await import("@/lib/api/account.functions");
  return deleteMyAccountFn({ data: { password } });
}
