import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizeRole,
  signOut as signOutFromSupabase,
  roleToLegacyAccountType,
  type AccountType,
  type AppRole,
  type LegacyAccountType,
  type Occupation,
} from "@/lib/supabase/auth";
import {
  saveLanguagePreference,
  saveVillageProfilePreference,
  type Language,
} from "@/lib/village-preferences";

export type { AccountType, AppRole, LegacyAccountType };

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
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

const PROFILE_COLUMNS =
  "account_type,role,username,full_name,photo_url,occupation,state,district,mandal,village,village_id,preferred_language,profile_completed_at";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

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
          }
        : null,
    );
    if (data?.state && data.district && data.mandal && data.village) {
      saveVillageProfilePreference({
        state: data.state,
        district: data.district,
        mandal: data.mandal,
        village: data.village,
      });
    }
    if (data?.preferred_language) {
      saveLanguagePreference(data.preferred_language);
    }
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

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        profile,
        role: profile?.role ?? null,
        needsProfileCompletion,
        needsEmailVerification,
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
