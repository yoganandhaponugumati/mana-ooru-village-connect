import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type GovernmentWork = Tables<"government_works">;
export type GovernmentWorkInput = TablesInsert<"government_works">;
export type GovernmentWorkUpdate = TablesUpdate<"government_works">;

export async function createGovernmentWork(values: GovernmentWorkInput): Promise<GovernmentWork> {
  const { data, error } = await supabase.from("government_works").insert(values).select("*").single();
  if (error) throw error;
  return data;
}

export async function listGovernmentWorks(villageId?: string): Promise<GovernmentWork[]> {
  let query = supabase
    .from("government_works")
    .select("*")
    .order("created_at", { ascending: false });

  if (villageId) query = query.eq("village_id", villageId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateGovernmentWork(
  id: string,
  values: GovernmentWorkUpdate,
): Promise<GovernmentWork> {
  const { data, error } = await supabase
    .from("government_works")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
