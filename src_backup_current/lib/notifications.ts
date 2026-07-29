import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export type AppNotification = {
  id: string;
  recipient_id: string | null;
  village_id: string | null;
  created_by: string | null;
  title: string;
  body: string;
  type: string;
  read_at: string | null;
  created_at: string;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  dedupe_key: string | null;
};

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user?.id),
    refetchInterval: 30000,
    queryFn: async (): Promise<AppNotification[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) return [];
      return (data ?? []) as AppNotification[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, user]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .eq("recipient_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .is("read_at", null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await supabase.from("notifications").delete().eq("id", id).eq("recipient_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").delete().eq("recipient_id", user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    },
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((item) => !item.read_at).length;

  return {
    notifications,
    unreadCount,
    loading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
    deleteNotification: deleteNotification.mutate,
    clearAll: clearAll.mutate,
  };
}
