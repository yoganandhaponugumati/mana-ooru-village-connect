import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { saveVillageProfilePreference } from "@/lib/village-preferences";

export type AccountType = "villager" | "village_admin" | "app_admin";

type AuthProfile = {
  account_type: AccountType;
  state: string | null;
  district: string | null;
  mandal: string | null;
  village: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: AuthProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

function toAccountType(value: string | null | undefined): AccountType {
  return value === "village_admin" || value === "app_admin" ? value : "villager";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("account_type,state,district,mandal,village")
      .eq("id", userId)
      .maybeSingle();

    setProfile(
      data
        ? {
            account_type: toAccountType(data.account_type),
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
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <Ctx.Provider value={{ user: session?.user ?? null, session, profile, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
