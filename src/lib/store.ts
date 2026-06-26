import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

export type ListingType = "worker" | "work" | "land" | "market" | "service" | "announcement";

export type Listing = {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  contact: string;
  location: string;
  price?: string;
  category?: string;
  createdAt: number;
  owner_id?: string;
};

type Row = {
  id: string;
  owner_id: string;
  type: ListingType;
  title: string;
  description: string | null;
  contact: string;
  location: string | null;
  price: string | null;
  category: string | null;
  created_at: string;
};

function toListing(r: Row): Listing {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    description: r.description ?? "",
    contact: r.contact,
    location: r.location ?? "",
    price: r.price ?? undefined,
    category: r.category ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
    owner_id: r.owner_id,
  };
}

export function useListings(type?: ListingType) {
  const qc = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["listings", type ?? "all"],
    queryFn: async () => {
      let q = supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return (data as Row[]).map(toListing);
    },
  });

  const add = useCallback(
    async (item: Omit<Listing, "id" | "createdAt" | "owner_id">) => {
      if (!user) {
        toast.error("Please sign in to post");
        throw new Error("not authenticated");
      }
      const { data, error } = await supabase
        .from("listings")
        .insert({
          owner_id: user.id,
          type: item.type,
          title: item.title,
          description: item.description || null,
          contact: item.contact,
          location: item.location || null,
          price: item.price || null,
          category: item.category || null,
        })
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing-stats"] });
      return toListing(data as Row);
    },
    [user, qc],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing-stats"] });
      toast.success("Removed");
    },
    [qc],
  );

  const items = query.data ?? [];
  return { items, add, remove, total: items.length, loading: query.isLoading };
}

export function useListingStats() {
  return useQuery({
    queryKey: ["listing-stats"],
    queryFn: async () => {
      const [listings, profiles, workers, land, recent] = await Promise.all([
        supabase.from("listings").select("type", { count: "exact", head: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("type", "worker"),
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("type", "land"),
        supabase.from("listings").select("*").order("created_at", { ascending: false }).limit(6),
      ]);
      const all = (listings.data as { type: ListingType }[] | null) ?? [];
      const byType = all.reduce<Record<string, number>>((acc, r) => {
        acc[r.type] = (acc[r.type] ?? 0) + 1;
        return acc;
      }, {});
      return {
        villagers: profiles.count ?? 0,
        workers: workers.count ?? 0,
        land: land.count ?? 0,
        total: listings.count ?? all.length,
        byType,
        recent: ((recent.data as Row[] | null) ?? []).map(toListing),
      };
    },
  });
}

export function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return `${Math.floor(s / 86400)} days ago`;
}

// keep referenced for backwards compat
export const __unused__ = useMutation;