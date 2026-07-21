import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";
import {
  sendDirectUserPushNotification,
  sendNewPostPushNotifications,
} from "@/lib/api/notification.functions";

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
  villageId?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  storagePath?: string;
  isPinned?: boolean;
  status?:
    | "active"
    | "completed"
    | "pending"
    | "accepted"
    | "in_progress"
    | "resolved"
    | "rejected"
    | "escalated";
  createdAt: number;
  owner_id?: string;
  localOnly?: boolean;
  officialResponse?: string;
};

type Row = {
  id: string;
  owner_id: string;
  type: ListingType;
  title: string;
  description: string | null;
  contact: string;
  location: string | null;
  village_id?: string | null;
  price: string | null;
  category: string | null;
  image_url?: string | null;
  storage_path?: string | null;
  is_pinned?: boolean | null;
  status?: string | null;
  official_response?: string | null;
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
    villageId: r.village_id ?? undefined,
    price: r.price ?? undefined,
    category: r.category ?? undefined,
    imageUrl: r.image_url ?? undefined,
    storagePath: r.storage_path ?? undefined,
    isPinned: Boolean(r.is_pinned),
    status: (r.status as Listing["status"]) ?? "active",
    officialResponse: r.official_response ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
    owner_id: r.owner_id,
  };
}

export function useListings(type?: ListingType) {
  const qc = useQueryClient();
  const { user, profile } = useAuth();

  const query = useQuery({
    queryKey: ["listings", type ?? "all", profile?.village_id ?? "all"],
    queryFn: async () => {
      let q = supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (type) q = q.eq("type", type);
      if (profile?.village_id) q = q.eq("village_id", profile.village_id);
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
        console.error("[posting] insert:blocked:not-authenticated");
        throw new Error("Please sign in before posting. Posts are saved only to Supabase.");
      }

      console.info("[posting] insert:start", {
        type: item.type,
        title: item.title,
        hasImage: Boolean(item.imageUrl),
        storagePath: item.storagePath,
        villageId: item.villageId || profile?.village_id,
      });
      const { data, error } = await supabase
        .from("listings")
        .insert({
          owner_id: user.id,
          type: item.type,
          title: item.title,
          description: item.description || null,
          contact: item.contact,
          location: item.location || null,
          village_id: item.villageId || profile?.village_id || null,
          price: item.price || null,
          category: item.category || null,
          image_url: item.imageUrl || null,
          storage_path: item.storagePath || null,
          is_pinned: item.isPinned ?? false,
          status: item.status ?? "active",
        })
        .select()
        .single();
      if (error) {
        console.error("[posting] insert:error", { error, item });
        throw new Error(`Post could not be saved: ${error.message}`);
      }
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing-stats"] });
      qc.invalidateQueries({ queryKey: ["timeline-activities"] });
      const listing = toListing(data as Row);
      console.info("[posting] insert:success", { id: listing.id, type: listing.type });
      void sendNewPostPushNotifications({ data: { postId: listing.id } }).catch((err) => {
        console.error("Could not send push notifications", err);
      });
      return listing;
    },
    [user, profile?.village_id, qc],
  );

  const remove = useCallback(
    async (id: string) => {
      if (id.startsWith("local-")) {
        toast.error("This legacy local post is not stored in Supabase and cannot be managed.");
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
    async (id: string, patch: Partial<Pick<Listing, "isPinned" | "status" | "officialResponse">>) => {
      if (id.startsWith("local-")) {
        toast.error("This legacy local post is not stored in Supabase and cannot be updated.");
        return;
      }

      const dbPatch: Record<string, boolean | string> = {};
      if (typeof patch.isPinned === "boolean") dbPatch.is_pinned = patch.isPinned;
      if (patch.status) dbPatch.status = patch.status;
      if (patch.officialResponse !== undefined) dbPatch.official_response = patch.officialResponse;

      const { error } = await supabase
        .from("listings")
        .update(dbPatch as never)
        .eq("id", id);
      if (error) {
        toast.error(error.message || "Could not update listing");
        return;
      }
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["listing-stats"] });
      toast.success("Civic report updated successfully");

      if (patch.status || patch.officialResponse !== undefined) {
        const item = (query.data ?? []).find((i) => i.id === id);
        if (item?.owner_id) {
          const newStatus = patch.status || item.status;
          const statusLabel =
            newStatus === "completed" || newStatus === "resolved"
              ? "✅ Resolved"
              : newStatus === "in_progress"
                ? "🛠️ In Progress"
                : newStatus === "escalated"
                  ? "⚠️ Escalated / Pending Funds"
                  : "⏳ Pending Review";
          const noteText = patch.officialResponse
            ? ` Note from Panchayat: "${patch.officialResponse}".`
            : item.officialResponse
              ? ` Note: "${item.officialResponse}".`
              : "";
          void sendDirectUserPushNotification({
            data: {
              targetUserId: item.owner_id,
              title: "ManaOoru • Complaint Status Updated",
              body: `Update: Your civic report "${item.title}" is marked: ${statusLabel}.${noteText} Tap to open & verify.`,
              url: "/problems",
              tag: `complaint_status:${id}`,
              notificationId: id,
            },
          }).catch((err) => {
            console.error("[store] push status update error:", err);
          });
        }
      }
    },
    [qc, query.data],
  );

  const items = [...(query.data ?? [])].sort(
    (a, b) => Number(b.isPinned) - Number(a.isPinned) || b.createdAt - a.createdAt,
  );
  return { items, add, remove, update, total: items.length, loading: query.isLoading };
}

export function useListingStats(filter?: {
  villageId?: string | null;
  villageName?: string | null;
}) {
  return useQuery({
    queryKey: ["listing-stats", filter?.villageId, filter?.villageName],
    queryFn: async () => {
      let activeVillageId = filter?.villageId;

      // If only village name is provided, try to resolve its UUID from the database
      if (!activeVillageId && filter?.villageName) {
        const { data: vData } = await supabase
          .from("villages")
          .select("id")
          .eq("name", filter.villageName)
          .limit(1)
          .maybeSingle();
        if (vData) {
          activeVillageId = vData.id;
        }
      }

      let qAll = supabase.from("listings").select("type", { count: "exact", head: false });
      let qWorkers = supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("type", "worker");
      let qLand = supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("type", "land");
      let qRecent = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      let qProfiles = supabase.from("profiles").select("id", { count: "exact", head: true });

      if (activeVillageId) {
        qAll = qAll.eq("village_id", activeVillageId);
        qWorkers = qWorkers.eq("village_id", activeVillageId);
        qLand = qLand.eq("village_id", activeVillageId);
        qRecent = qRecent.eq("village_id", activeVillageId);
        qProfiles = qProfiles.eq("village_id", activeVillageId);
      }

      const [listings, profiles, workers, land, recent] = await Promise.all([
        qAll,
        qProfiles,
        qWorkers,
        qLand,
        qRecent,
      ]);

      const all = ((listings.data as { type: ListingType }[] | null) ?? []) as Listing[];
      const byType = all.reduce<Record<string, number>>((acc, r) => {
        acc[r.type] = (acc[r.type] ?? 0) + 1;
        return acc;
      }, {});

      return {
        villagers: profiles.count ?? 0,
        workers: workers.count ?? 0,
        land: land.count ?? 0,
        total: listings.count ?? 0,
        byType,
        recent: [...((recent.data as Row[] | null) ?? []).map(toListing)].sort(
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
