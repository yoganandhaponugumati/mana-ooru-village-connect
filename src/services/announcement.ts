import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Announcement = Tables<"announcements">;
export type AnnouncementInput = TablesInsert<"announcements">;
export type AnnouncementUpdate = TablesUpdate<"announcements">;

export async function createAnnouncement(values: AnnouncementInput): Promise<Announcement> {
  const { data, error } = await supabase.from("announcements").insert(values).select("*").single();
  if (error) throw error;
  return data;
}

export async function listAnnouncements(villageId?: string): Promise<Announcement[]> {
  let query = supabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false });

  if (villageId) query = query.eq("village_id", villageId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function updateAnnouncement(
  id: string,
  values: AnnouncementUpdate,
): Promise<Announcement> {
  const { data, error } = await supabase
    .from("announcements")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
