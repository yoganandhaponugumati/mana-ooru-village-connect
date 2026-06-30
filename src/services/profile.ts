import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return null;
  return getProfile(userData.user.id);
}

export async function updateProfile(userId: string, values: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function listVillageProfiles(villageId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("village_id", villageId)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
