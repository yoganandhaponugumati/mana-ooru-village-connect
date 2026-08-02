import { Loader2, ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { AppButton, FeatureIcon, SurfaceCard } from "@/components/design-system";

type ManagedRole = "citizen" | "village_admin" | "super_admin";

const roleLabels: Record<ManagedRole, string> = {
  citizen: "Citizen",
  village_admin: "Village Admin / Sarpanch",
  super_admin: "Super Admin",
};

function accountTypeForRole(role: ManagedRole) {
  if (role === "super_admin") return "app_admin";
  if (role === "village_admin") return "village_admin";
  return "villager";
}

export function AdminRoleManager() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ManagedRole>("village_admin");
  const [busy, setBusy] = useState(false);

  const updateRole = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error("Enter the user's email");
      return;
    }

    setBusy(true);
    try {
      const { data: profile, error: findError } = await supabase
        .from("profiles")
        .select("id,email,display_name,role")
        .ilike("email", trimmedEmail)
        .maybeSingle();

      if (findError) throw findError;
      if (!profile) {
        toast.error("No profile found. Ask them to create a normal account first.");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role,
          account_type: accountTypeForRole(role),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Log the action to audit_logs
      await (supabase as any).from("audit_logs").insert({
        action: "ROLE_CHANGE",
        actor_id: user?.id,
        target_id: profile.id,
        details: { old_role: profile.role || null, new_role: role, target_email: profile.email },
      });

      toast.success(
        `${profile.display_name || profile.email || "User"} is now ${roleLabels[role]}`,
      );
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update role");
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error("Enter the user's email to delete");
      return;
    }
    if (
      !window.confirm(
        `Are you sure you want to PERMANENTLY delete user ${trimmedEmail} and all their posts?`,
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const { data: profile, error: findError } = await supabase
        .from("profiles")
        .select("id,email,full_name")
        .ilike("email", trimmedEmail)
        .maybeSingle();

      if (findError) throw findError;
      if (!profile) {
        toast.error("No profile found with that email.");
        return;
      }

      // Delete user's posts, stories, complaints, and profile
      await (supabase as any).from("listings").delete().eq("owner_id", profile.id);
      await (supabase as any).from("complaints").delete().eq("citizen_id", profile.id);
      await (supabase as any).from("village_stories").delete().eq("author_id", profile.id);
      await (supabase as any).from("events").delete().eq("author_id", profile.id);
      const { error: deleteError } = await supabase.from("profiles").delete().eq("id", profile.id);

      if (deleteError) throw deleteError;

      // Log to audit logs
      await (supabase as any).from("audit_logs").insert({
        action: "DELETE_USER",
        actor_id: user?.id,
        target_id: profile.id,
        details: { target_email: profile.email },
      });

      toast.success(
        `User ${profile.full_name || profile.email} and all their posts deleted permanently.`,
      );
      setEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete user.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SurfaceCard className="p-6" hover={false}>
      <div className="flex items-start gap-4">
        <FeatureIcon icon={<UserCog className="size-5" />} />
        <div>
          <p className="font-display text-xl font-semibold text-clay">
            Manage Roles & Delete Users
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Assign admin roles (Sarpanch / Village Admin / Super Admin) or permanently delete spam
            accounts.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_200px_auto_auto]">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="user@example.com"
          className="h-12 rounded-2xl border border-border bg-card px-4 text-sm text-foreground outline-none focus:border-primary"
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as ManagedRole)}
          className="h-12 rounded-2xl border border-border bg-card px-4 text-sm font-semibold text-foreground outline-none focus:border-primary"
        >
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <AppButton
          type="button"
          onClick={updateRole}
          loading={busy}
          icon={<ShieldCheck className="size-4" />}
          iconPosition="left"
        >
          Assign role
        </AppButton>
        <AppButton
          type="button"
          onClick={deleteUser}
          variant="secondary"
          className="bg-red-500/10 border-red-500/20 text-red-600 hover:bg-red-500/20 hover:border-red-500/40"
        >
          Delete User
        </AppButton>
      </div>
      {busy && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Processing Supabase operation...
        </p>
      )}
    </SurfaceCard>
  );
}
