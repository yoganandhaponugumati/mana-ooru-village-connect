import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Store, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { VillageLocationPicker } from "@/components/VillageLocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import {
  getPasswordError,
  getRoleDashboardPath,
  normalizeRole,
  signInWithEmailPassword,
  signInWithOAuth,
  signUpWithEmailPassword,
  occupations,
  dealerCategories,
  type Occupation,
  type DealerCategory,
} from "@/lib/supabase/auth";
import {
  normalizeProfile,
  useVillagePreferences,
  type VillageProfile,
} from "@/lib/village-preferences";

type AuthSearch = {
  redirect?: string;
  message?: string;
};

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — ManaOoru" }] }),
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
      message: typeof search.message === "string" ? search.message : undefined,
    };
  },
  component: AuthPage,
});

const roleOptions: { id: AppRole; label: string; icon: typeof User }[] = [
  { id: "citizen", label: "Citizen", icon: User },
  { id: "dealer", label: "Dealer", icon: Store },
  { id: "village_admin", label: "Admin", icon: ShieldCheck },
];

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, message } = Route.useSearch();
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<AppRole>("citizen");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState<Occupation>("Other");

  const [shopName, setShopName] = useState("");
  const [shopCategory, setShopCategory] = useState<DealerCategory>("Grocery");
  const [shopAddress, setShopAddress] = useState("");

  const { profile, setProfile, hasProfile } = useVillagePreferences();
  const [villageProfile, setVillageProfile] = useState<VillageProfile>({
    ...profile,
    village: hasProfile ? profile.village : "",
  });

  const [busy, setBusy] = useState(false);
  const [dealerPending, setDealerPending] = useState(false);

  useEffect(() => {
    if (!user || busy || dealerPending) return;
    const resolvedRole = normalizeRole(authProfile?.role ?? authProfile?.account_type);
    const targetPath = redirect || getRoleDashboardPath(resolvedRole);
    if (location.pathname === "/auth") {
      navigate({ to: targetPath });
    }
  }, [user, authProfile, busy, dealerPending, navigate, redirect]);

  const loadSignedInProfile = async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data;
  };

  const saveProfile = async (
    userId: string,
    nextProfile: VillageProfile,
    targetRole?: AppRole | null,
    fullName?: string,
  ) => {
    const payload: Record<string, unknown> = {
      id: userId,
      state: nextProfile.state || undefined,
      district: nextProfile.district || undefined,
      mandal: nextProfile.mandal || undefined,
      village: nextProfile.village || undefined,
      full_name: fullName || undefined,
      display_name: fullName || undefined,
      phone: phone || undefined,
      profile_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (targetRole === "dealer") {
      payload.dealer_status = "pending";
      payload.dealer_category = shopCategory;
      payload.shop_name = shopName || undefined;
      payload.shop_address = shopAddress || undefined;
    }

    const { error } = await supabase.from("profiles").upsert(payload as never);
    if (error) throw error;
    await refreshProfile();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const passwordError = getPasswordError(password);
        if (passwordError) { toast.error(passwordError); setBusy(false); return; }
        if (password !== confirmPassword) { toast.error("Passwords do not match."); setBusy(false); return; }
        if (!villageProfile.village.trim()) { toast.error("Please select or type your village name."); setBusy(false); return; }
        if (role === "dealer") {
          if (!shopName.trim()) { toast.error("Shop Name is required."); setBusy(false); return; }
          if (!shopAddress.trim()) { toast.error("Shop Address is required."); setBusy(false); return; }
        }

        const selectedProfile = normalizeProfile(villageProfile);
        const { data, error } = await signUpWithEmailPassword({
          email, password, fullName: name, phone,
          occupation: role === "dealer" ? "Business" : occupation,
          metadata: {
            state: selectedProfile.state,
            district: selectedProfile.district,
            mandal: selectedProfile.mandal,
            village: selectedProfile.village,
            role,
            dealer_status: role === "dealer" ? "pending" : undefined,
            dealer_category: role === "dealer" ? shopCategory : undefined,
            shop_name: role === "dealer" ? shopName : undefined,
            shop_address: role === "dealer" ? shopAddress : undefined,
          },
        });
        if (error) throw error;
        setProfile(selectedProfile);

        if (data.user) await saveProfile(data.user.id, selectedProfile, role, name);

        if (role === "dealer") {
          setDealerPending(true);
          toast.success("Dealer application registered! Pending Village Admin approval.");
          setBusy(false);
          return;
        }

        if (!data.session) {
          toast.success("Account created! Please check your email to confirm.");
          setMode("signin");
          setBusy(false);
          return;
        }
        toast.success("Welcome to ManaOoru!");
        navigate({ to: redirect || getRoleDashboardPath("citizen") });
      } else {
        // Sign In
        if (!password) { toast.error("Please enter your password."); setBusy(false); return; }
        const { data, error } = await signInWithEmailPassword(email, password);
        if (error) throw error;

        const signedInProfile = data.user ? await loadSignedInProfile(data.user.id) : null;
        const resolvedRole = normalizeRole(signedInProfile?.role ?? signedInProfile?.account_type);

        toast.success("Welcome back!");
        await refreshProfile();

        let targetPath = redirect || getRoleDashboardPath(resolvedRole);
        if (role === "dealer" && resolvedRole === "citizen" && signedInProfile?.dealer_status === "pending") {
          targetPath = "/dealer-registration";
        }
        navigate({ to: targetPath });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await signInWithOAuth("google");
    if (error) { toast.error(error.message); setBusy(false); }
  };

  // ─── Dealer pending screen ──────────────────────────────────────────────────
  if (dealerPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Application Submitted</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your dealer account is pending Village Admin approval. You'll be notified once reviewed.
          </p>
          <button
            onClick={() => setDealerPending(false)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110 transition"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ─── Already signed in ──────────────────────────────────────────────────────
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Signed in as {authProfile?.full_name || user.email?.split("@")[0]}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground capitalize">
            Role: {authProfile?.role?.replace("_", " ") || "citizen"} · Village: {authProfile?.village || "—"}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate({ to: getRoleDashboardPath(authProfile?.role) })}
              className="rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:brightness-110 transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out."); }}
              className="rounded-xl border border-border py-3 text-sm font-bold text-muted-foreground hover:bg-muted/50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main auth form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/" })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <span className="font-bold text-lg text-foreground">ManaOoru</span>
        </div>

        {message === "signin_to_post" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            🔒 Sign in required to post.
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
          {/* Mode tabs */}
          <div className="mb-6 flex rounded-xl border border-border overflow-hidden">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-bold transition ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            {roleOptions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-bold transition ${
                  role === r.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                <r.icon className="size-5" />
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Signup-only fields */}
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Full Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    required
                    className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                  />
                </div>

                {role === "citizen" && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Occupation</label>
                    <select
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value as Occupation)}
                      className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                    >
                      {occupations.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* Village picker */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2">Your Village Location *</label>
                  <VillageLocationPicker
                    value={villageProfile}
                    onChange={setVillageProfile}
                    idPrefix="auth-picker"
                  />
                  {villageProfile.village && (
                    <p className="mt-2 text-xs text-primary font-semibold">
                      ✓ {[villageProfile.village, villageProfile.mandal, villageProfile.district].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>

                {/* Dealer shop fields */}
                {role === "dealer" && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 space-y-3">
                    <p className="text-xs font-bold text-indigo-700">🏪 Shop Details</p>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Shop Name *</label>
                      <input
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Sri Venkateswara Kirana"
                        required
                        className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Category *</label>
                      <select
                        value={shopCategory}
                        onChange={(e) => setShopCategory(e.target.value as DealerCategory)}
                        className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                      >
                        {dealerCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Shop Address *</label>
                      <input
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="e.g. Main Road, near Panchayat Office"
                        required
                        className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
              />
            </div>

            {/* Phone (signup only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone Number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Password * {mode === "signup" && <span className="text-emerald-600">(min 4 characters)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a password (e.g. 1234)" : "Enter your password"}
                  required
                  className="premium-input w-full rounded-xl px-3 py-2.5 pr-10 text-sm bg-background text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Confirm Password *</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background text-foreground"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:brightness-110 disabled:opacity-50 mt-2"
            >
              {busy ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition flex items-center justify-center gap-2"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83Z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38Z" />
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Super admin link */}
          {role === "village_admin" && mode === "signin" && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate({ to: "/super-admin/login" })}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Super Admin Portal →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
