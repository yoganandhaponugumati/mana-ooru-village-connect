import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Complaint = Tables<"complaints">;
export type ComplaintInput = TablesInsert<"complaints">;
export type ComplaintUpdate = TablesUpdate<"complaints">;

export async function createComplaint(values: ComplaintInput): Promise<Complaint> {
  const { data, error } = await supabase.from("complaints").insert(values).select("*").single();
  if (error) throw error;
  return data;
}

export async function getComplaint(id: string): Promise<Complaint | null> {
  const { data, error } = await supabase.from("complaints").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listComplaints(filters: { villageId?: string; citizenId?: string } = {}) {
  let query = supabase.from("complaints").select("*").order("created_at", { ascending: false });

  if (filters.villageId) query = query.eq("village_id", filters.villageId);
  if (filters.citizenId) query = query.eq("citizen_id", filters.citizenId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateComplaint(id: string, values: ComplaintUpdate): Promise<Complaint> {
  const { data, error } = await supabase
    .from("complaints")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
