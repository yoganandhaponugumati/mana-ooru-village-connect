import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SurfaceCard } from "@/components/design-system";
import { signInWithEmailPassword, normalizeRole } from "@/lib/supabase/auth";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/super-admin/login")({
  head: () => ({ meta: [{ title: "Platform Administration — ManaOoru" }] }),
  component: SuperAdminLoginPage,
});

function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === "super_admin") {
        navigate({ to: "/dashboard" });
      } else {
        toast.error("Access denied. You are not a Platform Admin.");
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await signInWithEmailPassword(email, password);
      if (error) throw error;

      // Verify the user's role in the DB profile
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const role = normalizeRole(profileData?.role);
        if (role !== "super_admin") {
          // Sign out immediately if not platform admin
          await supabase.auth.signOut();
          toast.error("Access denied. This portal is for Platform Admins only.");
          setBusy(false);
          return;
        }

        toast.success("Welcome, Platform Administrator.");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="premium-page-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-red-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <SurfaceCard className="p-8 shadow-[var(--shadow-lift)] border border-red-500/20 bg-background/80 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-red-500/10 text-red-500 mb-4">
              <ShieldCheck className="size-6" />
            </div>
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-clay">
                ManaOoru Ops Portal
              </span>
            </Link>
            <p className="mt-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Platform Administration
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ops@manaooru.com"
                required
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
              >
                Passphrase
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="premium-input w-full rounded-2xl px-4 py-3 pr-12 text-sm text-foreground bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 shadow-lg shadow-red-600/10"
            >
              {busy && <Loader2 className="size-4 animate-spin" />}
              {busy ? "Authenticating..." : "Authorize Session"}
            </button>
          </form>
        </SurfaceCard>
      </div>
    </div>
  );
}
