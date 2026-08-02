import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function logAdminAction(
  userId: string,
  villageId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  oldValues: any,
  newValues: any,
  reason: string,
) {
  const { data: userResp } = await supabaseAdmin.auth.admin.getUserById(userId);
  const adminId = userResp.user?.id;

  if (!adminId) {
    throw new Error("Admin user not found for audit log");
  }

  return (supabaseAdmin as any).from("audit_logs").insert({
    village_id: villageId,
    admin_id: adminId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    reason,
  });
}
