import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const pushKeysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable().optional(),
  keys: pushKeysSchema,
});

const pushPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().optional(),
  badge: z.string().optional(),
  url: z.string().optional(),
  tag: z.string().optional(),
  notificationId: z.string().optional(),
});

const newPostSchema = z.object({
  postId: z.string().uuid(),
});

function listingUrl(type: string, id: string) {
  const base =
    type === "worker"
      ? "/workers"
      : type === "work"
        ? "/work"
        : type === "land"
          ? "/land"
          : type === "market"
            ? "/marketplace"
            : type === "service"
              ? "/services"
              : type === "announcement"
                ? "/announcements"
                : type === "complaint"
                  ? "/problems"
                  : "/";
  return `${base}?post=${id}`;
}

async function sendFcmPush(
  tokens: string[],
  payload: z.infer<typeof pushPayloadSchema>,
) {
  const { sendFcmNotification } = await import("@/lib/firebase-admin.server");
  const result = await sendFcmNotification(tokens, payload);

  if (result.failedTokens && result.failedTokens.length > 0) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    console.log("[Push Server] Cleaning up invalid FCM tokens:", result.failedTokens);
    await supabaseAdmin
      .from("profiles")
      .update({ fcm_token: null })
      .in("fcm_token", result.failedTokens);
  }

  return {
    attempted: result.attempted,
    sent: result.sent,
    failed: result.failed,
  };
}

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(pushSubscriptionSchema)
  .handler(async () => {
    // Deprecated for 100% FCM migration
    console.log("[Push Server] savePushSubscription is deprecated and ignored.");
    return { success: true as const };
  });

export const deletePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ endpoint: z.string().url() }))
  .handler(async () => {
    // Deprecated for 100% FCM migration
    console.log("[Push Server] deletePushSubscription is deprecated and ignored.");
    return { success: true as const };
  });

export const sendLoginNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message || "Could not load user profile.");

    const delivery = await sendFcmPush(profile?.fcm_token ? [profile.fcm_token] : [], {
      title: "ManaOoru • Security & Login",
      body: "You successfully signed in to ManaOoru. Tap to view your civic profile.",
      icon: "/site-icon.svg",
      badge: "/notification-badge.svg",
      url: "/profile",
      tag: `login:${context.userId}`,
    });

    return { success: true as const, delivery };
  });

export const sendTestPushNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", context.userId)
      .maybeSingle();

    if (error) throw new Error(error.message || "Could not load user profile.");

    const delivery = await sendFcmPush(profile?.fcm_token ? [profile.fcm_token] : [], {
      title: "ManaOoru • Push Verification",
      body: "Excellent! Your device is connected to ManaOoru instant alerts. Tap to open dashboard.",
      icon: "/site-icon.svg",
      badge: "/notification-badge.svg",
      url: "/dashboard",
      tag: `test:${context.userId}:${Date.now()}`,
    });

    return { success: true as const, delivery };
  });

const villagePushSchema = z.object({
  villageId: z.string().nullable().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.string().optional(),
  tag: z.string().optional(),
  notificationId: z.string().optional(),
});

const directPushSchema = z.object({
  targetUserId: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  url: z.string().optional(),
  tag: z.string().optional(),
  notificationId: z.string().optional(),
});

export const sendVillagePushNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(villagePushSchema)
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let targetUserIds: string[] = [];
    if (data.villageId) {
      const { data: villageProfiles, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("village_id", data.villageId);

      if (!profileError && villageProfiles) {
        targetUserIds = villageProfiles
          .map((p) => p.id)
          .filter((id) => id !== context.userId);
      }
    }

    if (data.villageId && targetUserIds.length === 0) {
      console.warn("[Push Server] No target users found in village:", data.villageId);
      return { success: true as const, delivery: { attempted: 0, sent: 0, failed: 0 } };
    }

    let profileQuery = supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .not("fcm_token", "is", null);

    if (data.villageId && targetUserIds.length > 0) {
      profileQuery = profileQuery.in("id", targetUserIds);
    } else {
      profileQuery = profileQuery.neq("id", context.userId);
    }

    const { data: profiles, error: profileError } = await profileQuery;
    if (profileError) {
      throw new Error(profileError.message || "Could not load FCM profiles.");
    }

    const tokens = (profiles ?? []).map((p) => p.fcm_token).filter(Boolean) as string[];

    const delivery = await sendFcmPush(tokens, {
      title: data.title,
      body: data.body,
      icon: "/site-icon.svg",
      badge: "/notification-badge.svg",
      url: data.url || "/",
      tag: data.tag || `village_push:${Date.now()}`,
      notificationId: data.notificationId,
    });

    return { success: true as const, delivery };
  });

export const sendDirectUserPushNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(directPushSchema)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", data.targetUserId)
      .maybeSingle();

    if (profileError) {
      throw new Error(profileError.message || "Could not load target user profile.");
    }

    const tokens = profile?.fcm_token ? [profile.fcm_token] : [];

    const delivery = await sendFcmPush(tokens, {
      title: data.title,
      body: data.body,
      icon: "/site-icon.svg",
      badge: "/notification-badge.svg",
      url: data.url || "/",
      tag: data.tag || `direct_push:${data.targetUserId}:${Date.now()}`,
      notificationId: data.notificationId,
    });

    return { success: true as const, delivery };
  });

export const sendNewPostPushNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(newPostSchema)
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: listing, error: listingError } = await supabaseAdmin
      .from("listings")
      .select("id,title,owner_id,type,village_id")
      .eq("id", data.postId)
      .single();

    if (listingError || !listing) throw new Error("Post not found.");
    if (listing.owner_id !== context.userId)
      throw new Error("Forbidden: You can only notify for your own post.");

    const eventKey = `new_post:${listing.id}`;
    const { error: eventError } = await supabaseAdmin.from("push_events").insert({
      event_key: eventKey,
      created_by: context.userId,
    });

    if (eventError) {
      if (eventError.code === "23505") return { success: true as const, duplicate: true as const };
      throw new Error(eventError.message || "Could not record push notification event.");
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username,full_name,village_id")
      .eq("id", context.userId)
      .maybeSingle();

    const targetVillageId = listing.village_id || profile?.village_id || null;
    let targetUserIds: string[] = [];
    if (targetVillageId) {
      const { data: villageProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("village_id", targetVillageId);
      if (villageProfiles) {
        targetUserIds = villageProfiles
          .map((p) => p.id)
          .filter((id) => id !== context.userId);
      }
    }

    let profileQuery = supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .not("fcm_token", "is", null);

    if (targetVillageId && targetUserIds.length > 0) {
      profileQuery = profileQuery.in("id", targetUserIds);
    } else if (targetVillageId && targetUserIds.length === 0) {
      return { success: true as const, delivery: { attempted: 0, sent: 0, failed: 0 } };
    } else {
      profileQuery = profileQuery.neq("id", context.userId);
    }

    const { data: profiles, error: profileError } = await profileQuery;

    if (profileError) {
      throw new Error(profileError.message || "Could not load FCM profiles.");
    }

    const tokens = (profiles ?? []).map((p) => p.fcm_token).filter(Boolean) as string[];

    const actionUrl = listingUrl(listing.type, listing.id);
    const username = profile?.username || profile?.full_name || "Someone";

    const typeLabels: Record<string, string> = {
      complaint: "Citizen Complaint Reported",
      announcement: "Official Sarpanch Notice",
      worker: "Village Worker Profile",
      work: "Work & Labor Opportunity",
      land: "Village Real Estate & Land",
      market: "Marketplace Item Listed",
      service: "Local Service Offered",
    };
    const titleLabel = typeLabels[listing.type] || "Village Timeline Update";

    const delivery = await sendFcmPush(tokens, {
      title: `ManaOoru • ${titleLabel}`,
      body: `${username} posted: "${listing.title}". Tap to open & inspect details.`,
      icon: "/site-icon.svg",
      badge: "/notification-badge.svg",
      url: actionUrl,
      tag: `new_post:${listing.id}`,
      notificationId: listing.id,
    });

    return { success: true as const, delivery };
  });

export const saveFcmToken = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ fcmToken: z.string().min(1) }).parse(data))
  .handler(async ({ data, request }) => {
    const context = await requireSupabaseAuth(request);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ fcm_token: data.fcmToken, updated_at: new Date().toISOString() })
      .eq("id", context.userId);

    if (error) {
      console.warn("[Push Server] Could not update profile fcm_token:", error.message);
    }

    return { success: true as const };
  });

