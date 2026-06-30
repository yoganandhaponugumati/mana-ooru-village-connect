import { Loader2, ShieldCheck, UserCog } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
        .select("id,email,display_name")
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

  return (
    <SurfaceCard className="p-6" hover={false}>
      <div className="flex items-start gap-4">
        <FeatureIcon icon={<UserCog className="size-5" />} />
        <div>
          <p className="font-display text-xl font-semibold text-clay">Verify Sarpanch / official</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            First ask the person to create a normal account. Then enter that email here and assign
            the correct trusted role.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="official@example.com"
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
          {busy ? "Updating" : "Assign role"}
        </AppButton>
      </div>
      {busy && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Loader2 className="size-3 animate-spin" /> Updating Supabase profile role
        </p>
      )}
    </SurfaceCard>
  );
}
