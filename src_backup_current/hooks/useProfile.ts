import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeRole } from "@/lib/supabase/auth";

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();

      if (error) throw error;

      return data
        ? {
            ...data,
            role: normalizeRole(data.role ?? data.account_type),
          }
        : null;
    },
  });
}
