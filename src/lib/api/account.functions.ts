import { createServerFn } from "@tanstack/react-start";
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
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) {
      throw new Error(error.message || "Could not delete account. Please try again.");
    }
    return { success: true as const };
  });
