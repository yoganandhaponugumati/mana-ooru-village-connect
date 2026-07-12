import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";
import { sendNewPostPushNotifications } from "@/lib/api/notification.functions";

export type ListingType =
  | "worker"
  | "work"
  | "land"
  | "market"
  | "service"
  | "announcement"
  | "complaint";

export type Listing = {
  id: string;
  type: ListingType;
  title: string;
  description: string;
  contact: string;
  location: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  storagePath?: string;
  isPinned?: boolean;
  status?: "active" | "completed" | "pending" | "accepted" | "in_progress" | "resolved" | "rejected";
  createdAt: number;
  owner_id?: string;
  localOnly?: boolean;
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
  image_url?: string | null;
  storage_path?: string | null;
  is_pinned?: boolean | null;
  status?: string | null;
  created_at: string;
};

const LOCAL_LISTINGS_KEY = "manaooru.local.listings.v1";
const LOCAL_OWNER_KEY = "manaooru.local.owner.v1";

function getLocalOwnerId() {
  if (typeof window === "undefined") return "local";
  const existing = window.localStorage.getItem(LOCAL_OWNER_KEY);
  if (existing) return existing;
  const next = `local-${crypto.randomUUID()}`;
  window.localStorage.setItem(LOCAL_OWNER_KEY, next);
  return next;
}

function readLocalListings(type?: ListingType) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LOCAL_LISTINGS_KEY) || "[]") as Listing[];
    return parsed
      .filter((item) => !type || item.type === type)
      .map((item) => ({ ...item, localOnly: true }));
  } catch {
    return [];
  }
}

function writeLocalListings(items: Listing[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_LISTINGS_KEY, JSON.stringify(items));
}

function saveLocalListing(item: Omit<Listing, "id" | "createdAt" | "owner_id" | "localOnly">) {
  const ownerId = getLocalOwnerId();
  const listing: Listing = {
    ...item,
    id: `local-${crypto.randomUUID()}`,
    createdAt: Date.now(),
    owner_id: ownerId,
    localOnly: true,
  };
  writeLocalListings([listing, ...readLocalListings()]);
  window.dispatchEvent(new Event("manaooru:listings-changed"));
  return listing;
}

function removeLocalListing(id: string) {
  const current = readLocalListings();
  writeLocalListings(current.filter((item) => item.id !== id));
  window.dispatchEvent(new Event("manaooru:listings-changed"));
}

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
    imageUrl: r.image_url ?? undefined,
    storagePath: r.storage_path ?? undefined,
    isPinned: Boolean(r.is_pinned),
    status: (r.status as Listing["status"]) ?? "active",
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
      if (error) {
        return [];
      }
      return (data as Row[]).map(toListing);
    },
  });

  const add = useCallback(
    async (item: Omit<Listing, "id" | "createdAt" | "owner_id" | "localOnly">) => {
      if (!user) {
        const local = saveLocalListing(item);
        qc.invalidateQueries({ queryKey: ["listings"] });
        qc.invalidateQueries({ queryKey: ["listing-stats"] });
        return local;
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
          image_url: item.imageUrl || null,
          storage_path: item.storagePath || null,
          is_pinned: item.isPinned ?? false,
          status: item.status ?? "active",
        } as never)
        .select()
        .single();
      if (error) {
        const local = saveLocalListing(item);
        toast.warning(
          "Saved on this device. Apply the latest database migration to share it live.",
        );
        qc.invalidateQueries({ queryKey: ["listings"] });
        qc.invalidateQueries({ queryKey: ["listing-stats"] });
        return local;
      }
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing-stats"] });
      const listing = toListing(data as Row);
      void sendNewPostPushNotifications({ data: { postId: listing.id } }).catch((err) => {
        console.error("Could not send push notifications", err);
      });
      return listing;
    },
    [user, qc],
  );

  const remove = useCallback(
    async (id: string) => {
      if (id.startsWith("local-")) {
        removeLocalListing(id);
        qc.invalidateQueries({ queryKey: ["listings"] });
        qc.invalidateQueries({ queryKey: ["listing-stats"] });
        toast.success("Removed");
        return;
      }
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

  const update = useCallback(
    async (id: string, patch: Partial<Pick<Listing, "isPinned" | "status">>) => {
      if (id.startsWith("local-")) {
        const current = readLocalListings();
        writeLocalListings(
          current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
        window.dispatchEvent(new Event("manaooru:listings-changed"));
        qc.invalidateQueries({ queryKey: ["listings"] });
        qc.invalidateQueries({ queryKey: ["listing-stats"] });
        toast.success("Updated");
        return;
      }

      const dbPatch: Record<string, boolean | string> = {};
      if (typeof patch.isPinned === "boolean") dbPatch.is_pinned = patch.isPinned;
      if (patch.status) dbPatch.status = patch.status;

      const { error } = await supabase.from("listings").update(dbPatch as never).eq("id", id);
      if (error) {
        toast.error(error.message || "Could not update listing");
        return;
      }
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing-stats"] });
      toast.success("Updated");
    },
    [qc],
  );

  const items = [...(query.data ?? []), ...readLocalListings(type)].sort(
    (a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt,
  );
  return { items, add, remove, update, total: items.length, loading: query.isLoading };
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
      const local = readLocalListings();
      const all = [
        ...(((listings.data as { type: ListingType }[] | null) ?? []) as Listing[]),
        ...local,
      ];
      const byType = all.reduce<Record<string, number>>((acc, r) => {
        acc[r.type] = (acc[r.type] ?? 0) + 1;
        return acc;
      }, {});
      return {
        villagers: profiles.count ?? 0,
        workers: workers.count ?? 0,
        land: land.count ?? 0,
        total: (listings.count ?? 0) + local.length,
        byType,
        recent: [...((recent.data as Row[] | null) ?? []).map(toListing), ...local].sort(
          (a, b) => b.createdAt - a.createdAt,
        ),
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
