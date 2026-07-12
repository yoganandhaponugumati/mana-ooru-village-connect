import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Permanently deletes the signed-in user's account.
 *
 * Deleting the `auth.users` row cascades (ON DELETE CASCADE) through
 * `profiles`, and from there through every table that references
 * `profiles.id` (listings, complaints, announcements, scheme applications,
 * blood donor entries, poll votes, etc.) — see the migration files for the
 * full cascade chain. This is a hard delete: there is no recovery.
 *
 * This must run server-side because deleting an auth user requires the
 * service-role key, which never ships to the client. `requireSupabaseAuth`
 * verifies the caller's bearer token first, so only the account owner can
 * ever trigger this for their own `userId` — there is no id parameter
 * accepted from the client, which would otherwise let one user delete another.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ password: z.string().min(1, "Current password is required.") }))
  .handler(async ({ context, data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createClient } = await import("@supabase/supabase-js");
    const { createSupabaseFetch } = await import("@/integrations/supabase/supabase-fetch.server");
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Account deletion is not configured.");
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      context.userId,
    );
    const email = userData.user?.email;
    if (userError || !email) {
      throw new Error("Could not verify your account before deletion.");
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data: verified, error: verifyError } = await authClient.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (verifyError || verified.user?.id !== context.userId) {
      throw new Error("Incorrect password. Your account was not deleted.");
    }

    await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", context.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) {
      throw new Error(error.message || "Could not delete account. Please try again.");
    }
    return { success: true as const };
  });
