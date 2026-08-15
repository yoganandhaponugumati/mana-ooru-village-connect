import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
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
import { type Language, saveVillageProfilePreference } from "@/lib/village-preferences";

export type { AccountType, AppRole, DealerStatus, LegacyAccountType };

declare global {
  interface Window {
    __handleNativeAuthSession?: (tokens: {
      access_token: string;
      refresh_token: string;
    }) => Promise<boolean>;
  }
}

/**
 * Represents the normalized profile of the currently logged-in user.
 * This is fetched from the 'profiles' table after a successful session is established.
 */
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

  dealer_status: DealerStatus | null;
  dealer_category: string | null;
  shop_name: string | null;
  shop_description: string | null;
  shop_address: string | null;
  approved_by: string | null;
  approved_at: string | null;

  designation: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: AppRole | null;

  needsProfileCompletion: boolean;
  needsEmailVerification: boolean;

  isDealerApproved: boolean;
  isDealerPending: boolean;
  isDealerSuspended: boolean;

  loading: boolean;

  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

/**
 * The default context state before initialization is complete.
 */
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

/**
 * AuthProvider wraps the root of the application to provide global access to the current
 * user's session, profile, and authentication state (like loading and email verification).
 * It listens to Supabase's `onAuthStateChange` to automatically keep the UI in sync with the backend.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient();

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();

    const role = normalizeRole(data?.role ?? data?.account_type);

    if (data && (data.village || data.mandal)) {
      saveVillageProfilePreference({
        state: data.state || "Telangana",
        district: data.district || "Khammam",
        mandal: data.mandal || "Kallur",
        village: data.village || "",
      });
    }

    setProfile(
      data
        ? {
            account_type: roleToLegacyAccountType(role),
            role,
            username: data.username,
            full_name: data.full_name,
            photo_url: data.photo_url,
            occupation: (data.occupation as Occupation | null) ?? null,
            state: data.state,
            district: data.district,
            mandal: data.mandal,
            village: data.village,
            village_id: data.village_id,
            preferred_language: (data.preferred_language as Language) ?? "en",
            profileCompletedAt: data.profile_completed_at,

            dealer_status: (data.dealer_status as DealerStatus | null) ?? null,
            dealer_category: data.dealer_category ?? null,
            shop_name: data.shop_name ?? null,
            shop_description: data.shop_description ?? null,
            shop_address: data.shop_address ?? null,
            approved_by: data.approved_by ?? null,
            approved_at: data.approved_at ?? null,

            designation: data.designation ?? null,
          }
        : null,
    );
  }, []);

  /**
   * Effect to synchronize the local state with Supabase's authentication state.
   * This handles initial page load and any login/logout events dynamically.
   */
  useEffect(() => {
    const syncSession = async (s: Session | null) => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("manaooru-mock-session");
      }

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

    if (typeof window !== "undefined") {
      window.__handleNativeAuthSession = async (tokens: {
        access_token: string;
        refresh_token: string;
      }) => {
        try {
          if (!tokens?.access_token || !tokens?.refresh_token) return false;
          const { data, error } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          });
          if (error) {
            console.error("Native auth session bridge failed:", error.message);
            return false;
          }
          if (data.session) {
            await syncSession(data.session);
            return true;
          }
          return false;
        } catch (err) {
          console.error("Native auth session bridge error:", err);
          return false;
        }
      };
    }

    return () => {
      sub.subscription.unsubscribe();
      if (typeof window !== "undefined") {
        delete window.__handleNativeAuthSession;
      }
    };
  }, [loadProfile]);

  /**
   * Signs the user out locally and on the Supabase backend.
   * Clears the React Query cache to prevent data leaks between accounts.
   */
  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("manaooru-mock-session");
    }

    await signOutFromSupabase();

    queryClient.clear();
    setProfile(null);
  };

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  }, [session, loadProfile]);

  const user = session?.user ?? null;

  const needsProfileCompletion = Boolean(user) && Boolean(profile) && !profile?.profileCompletedAt;

  const hasPasswordIdentity = Boolean(
    user?.identities?.some((identity) => identity.provider === "email"),
  );

  const needsEmailVerification = hasPasswordIdentity && !user?.email_confirmed_at;

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

/**
 * Custom hook to consume the authentication context anywhere in the application.
 */
export const useAuth = () => useContext(Ctx);
