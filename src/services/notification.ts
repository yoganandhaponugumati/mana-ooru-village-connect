import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Notification = Tables<"notifications">;
export type NotificationInput = TablesInsert<"notifications">;

export async function createNotification(values: NotificationInput): Promise<Notification> {
  const { data, error } = await supabase.from("notifications").insert(values).select("*").single();
  if (error) throw error;
  return data;
}

export async function listNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
