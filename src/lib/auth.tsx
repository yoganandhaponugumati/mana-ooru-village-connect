import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizeRole,
  signOut as signOutFromSupabase,
  roleToLegacyAccountType,
  type AccountType,
  type AppRole,
  type DealerStatus,
  type LegacyAccountType,
  type Occupation,
} from "@/lib/supabase/auth";
import { type Language } from "@/lib/village-preferences";

export type { AccountType, AppRole, DealerStatus, LegacyAccountType };

type AuthProfile = {
  account_type: LegacyAccountType;
  role: AppRole;
  username: string | null;
  full_name: string | null;
  photo_url: string | null;
  occupation: Occupation | null;
  state: string | null;
  district: string | null;
  mandal: string | null;
  village: string | null;
  village_id: string | null;
  preferred_language: Language;
  profileCompletedAt: string | null;
  // ── Dealer fields ──
  dealer_status: DealerStatus | null;
  dealer_category: string | null;
  shop_name: string | null;
  shop_description: string | null;
  shop_address: string | null;
  approved_by: string | null;
  approved_at: string | null;
  // ── Village Admin fields ──
  designation: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: AppRole | null;
  /** True once a profile row exists AND has a username + completion timestamp. */
  needsProfileCompletion: boolean;
  /** True for password accounts whose email hasn't been confirmed yet. Google/phone accounts don't need this. */
  needsEmailVerification: boolean;
  /** True if the user is an approved dealer. */
  isDealerApproved: boolean;
  /** True if the user has applied as a dealer and is awaiting approval. */
  isDealerPending: boolean;
  /** True if the user is a suspended dealer. */
  isDealerSuspended: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  role: null,
  needsProfileCompletion: false,
  needsEmailVerification: false,
  isDealerApproved: false,
  isDealerPending: false,
  isDealerSuspended: false,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

const PROFILE_COLUMNS =
  "account_type,role,username,full_name,photo_url,occupation,state,district,mandal,village,village_id,preferred_language,profile_completed_at,dealer_status,dealer_category,shop_name,shop_description,shop_address,approved_by,approved_at,designation";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    console.log("AUTH USER ID:", userId);

    const { data, error } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    console.log("PROFILE DATA:", data);
    console.log("PROFILE ERROR:", error);

    const role = normalizeRole(data?.role ?? data?.account_type);

    setProfile(
      data
        ? {
            account_type: roleToLegacyAccountType(role),
            role,
            username: data.username,
            full_name: data.full_name,
            photo_url: data.photo_url,
            occupation: data.occupation,
            state: data.state,
            district: data.district,
            mandal: data.mandal,
            village: data.village,
            village_id: data.village_id,
            preferred_language: data.preferred_language,
            profileCompletedAt: data.profile_completed_at,
            // ── Dealer fields ──
            dealer_status: data.dealer_status ?? null,
            dealer_category: data.dealer_category ?? null,
            shop_name: data.shop_name ?? null,
            shop_description: data.shop_description ?? null,
            shop_address: data.shop_address ?? null,
            approved_by: data.approved_by ?? null,
            approved_at: data.approved_at ?? null,
            // ── Village Admin fields ──
            designation: data.designation ?? null,
          }
        : null,
    );
  }, []);

  useEffect(() => {
    const syncSession = async (s: Session | null) => {
      setSession(s);
      if (s?.user) {
        await loadProfile(s.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      void syncSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = async () => {
    await signOutFromSupabase();
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const user = session?.user ?? null;
  const needsProfileCompletion = Boolean(user) && Boolean(profile) && !profile?.profileCompletedAt;
  // Only password-based sign-ins have a meaningful confirmation step here; Google
  // accounts arrive pre-verified and phone accounts are verified via OTP itself.
  const hasPasswordIdentity = Boolean(
    user?.identities?.some((identity) => identity.provider === "email"),
  );
  const needsEmailVerification = hasPasswordIdentity && !user?.email_confirmed_at;

  // Dealer status computed properties
  const isDealerApproved = profile?.role === "dealer" && profile?.dealer_status === "approved";
  const isDealerPending = profile?.dealer_status === "pending";
  const isDealerSuspended = profile?.role === "dealer" && profile?.dealer_status === "suspended";

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        needsProfileCompletion,
        needsEmailVerification,
        isDealerApproved,
        isDealerPending,
        isDealerSuspended,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
