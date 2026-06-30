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
} from "@/lib/supabase/auth";
import { saveVillageProfilePreference } from "@/lib/village-preferences";

export type { AccountType, AppRole, LegacyAccountType };

type AuthProfile = {
  account_type: LegacyAccountType;
  role: AppRole;
  state: string | null;
  district: string | null;
  mandal: string | null;
  village: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  role: AppRole | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("account_type,role,state,district,mandal,village")
      .eq("id", userId)
      .maybeSingle();

    const role = normalizeRole(data?.role ?? data?.account_type);
    setProfile(
      data
        ? {
            account_type: roleToLegacyAccountType(role),
            role,
            state: data.state,
            district: data.district,
            mandal: data.mandal,
            village: data.village,
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

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        role: profile?.role ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
