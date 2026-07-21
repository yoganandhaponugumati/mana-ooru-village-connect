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

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@manaooru.org";

  if (!publicKey || !privateKey) {
    throw new Error(
      "Push notifications are not configured. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.",
    );
  }

  return { publicKey, privateKey, subject };
}

async function sendWebPush(
  subscriptions: Array<{ endpoint: string; p256dh: string; auth: string }>,
  payload: z.infer<typeof pushPayloadSchema>,
) {
  console.log("[Push Server] Preparing web push payload:", payload);
  console.log("[Push Server] Subscription count:", subscriptions.length);

  if (subscriptions.length === 0) {
    console.warn("[Push Server] No push subscriptions found; nothing was sent.");
    return { attempted: 0, sent: 0, failed: 0 };
  }

  const webPush = await import("web-push");
  const vapid = getVapidConfig();
  webPush.default.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const results = await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        console.log("[Push Server] Calling web-push.sendNotification():", {
          endpoint: subscription.endpoint,
          payload,
        });
        const result = await webPush.default.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload),
        );
        console.log("[Push Server] web-push.sendNotification() accepted:", {
          endpoint: subscription.endpoint,
          statusCode: result.statusCode,
          body: result.body,
        });
        return { endpoint: subscription.endpoint, ok: true, statusCode: result.statusCode };
      } catch (error) {
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number((error as { statusCode?: number }).statusCode)
            : 0;
        console.error("[Push Server] web-push.sendNotification() failed:", {
          endpoint: subscription.endpoint,
          statusCode,
          error,
        });
        if (statusCode === 404 || statusCode === 410) {
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", subscription.endpoint);
        }
        return { endpoint: subscription.endpoint, ok: false, statusCode };
      }
    }),
  );

  const summary = {
    attempted: results.length,
    sent: results.filter((result) => result.ok).length,
    failed: results.filter((result) => !result.ok).length,
  };
  console.log("[Push Server] Push delivery summary:", summary);
  return summary;
}

export const savePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(pushSubscriptionSchema)
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("push_subscriptions").upsert(
      {
        user_id: context.userId,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        user_agent: typeof navigator === "undefined" ? null : navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );

    if (error) throw new Error(error.message || "Could not save push subscription.");
    return { success: true as const };
  });

export const deletePushSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ endpoint: z.string().url() }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .eq("user_id", context.userId)
      .eq("endpoint", data.endpoint);

    if (error) throw new Error(error.message || "Could not delete push subscription.");
    return { success: true as const };
  });

export const sendLoginNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: subscriptions, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("user_id", context.userId);

    if (error) throw new Error(error.message || "Could not load push subscriptions.");

    const delivery = await sendWebPush(subscriptions ?? [], {
      title: "Login successful",
      body: "You signed in to ManaOoru.",
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
    const { data: subscriptions, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth")
      .eq("user_id", context.userId);

    if (error) throw new Error(error.message || "Could not load push subscriptions.");

    const delivery = await sendWebPush(subscriptions ?? [], {
      title: "ManaOoru test notification",
      body: "Browser push is connected successfully.",
      icon: "/site-icon.svg",
      badge: "/notification-badge.svg",
      url: "/dashboard",
      tag: `test:${context.userId}:${Date.now()}`,
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
      .select("id,title,owner_id,type")
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
      .select("username,full_name")
      .eq("id", context.userId)
      .maybeSingle();

    const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint,p256dh,auth");

    if (subscriptionError) {
      throw new Error(subscriptionError.message || "Could not load push subscriptions.");
    }

    const actionUrl = listingUrl(listing.type, listing.id);
    const username = profile?.username || profile?.full_name || "Someone";

    const delivery = await sendWebPush(subscriptions ?? [], {
      title: "📢 New Post",
      body: `${username} has posted: ${listing.title}`,
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

