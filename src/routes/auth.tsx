import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Store, User, ArrowLeft, Sun } from "lucide-react";
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
  signUpWithEmailPassword,
  signInWithOtp,
  verifyPhoneOtp,
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

/**
 * The main Authentication Page for ManaOoru.
 * 
 * Handles three primary workflows:
 * 1. Citizen / Admin Sign In (Email+Password or Phone OTP)
 * 2. Citizen Sign Up (Creates a profile and links to a village)
 * 3. Dealer Sign Up (Requires additional shop details and goes into 'pending' status)
 * 
 * Upon successful authentication, it redirects users to their appropriate dashboard 
 * based on their role (`getRoleDashboardPath`).
 */
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
  
  // Auth methods
  const [authMethod, setAuthMethod] = useState<"password" | "phone">("password");
  const [otpToken, setOtpToken] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  /**
   * Effect: Auto-redirect signed-in users.
   * If a user visits `/auth` but is already authenticated and has no pending dealer status,
   * they are automatically redirected to their dashboard or the requested `redirect` path.
   */
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

  /**
   * Core form submission handler.
   * Branches logic between Sign Up, Email Sign In, and Phone OTP Sign In.
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (!email) { toast.error("Please enter your email address."); setBusy(false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email address."); setBusy(false); return; }

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
        if (authMethod === "phone") {
          if (!phone) { toast.error("Please enter your phone number (+91...)."); setBusy(false); return; }
          if (!otpSent) {
            const { error } = await signInWithOtp(phone);
            if (error) throw error;
            setOtpSent(true);
            toast.success("OTP sent via SMS!");
            setBusy(false);
            return;
          } else {
            const { data, error } = await verifyPhoneOtp(phone, otpToken);
            if (error) throw error;
            if (!data.session) {
               toast.error("Invalid OTP");
               setBusy(false);
               return;
            }
            // Proceed to session load
          }
        }

        if (authMethod === "password") {
          if (!password) { toast.error("Please enter your password."); setBusy(false); return; }
          const passwordError = getPasswordError(password);
          if (passwordError) { toast.error(passwordError); setBusy(false); return; }

          const { error } = await signInWithEmailPassword(email, password);
          if (error) throw error;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
           setBusy(false);
           return; // Waiting for phone OTP
        }

        const signedInProfile = sessionData.session.user ? await loadSignedInProfile(sessionData.session.user.id) : null;
        const resolvedRole = normalizeRole(signedInProfile?.role ?? signedInProfile?.account_type);

        // Strict role validation
        if (role === "village_admin" && resolvedRole !== "village_admin" && resolvedRole !== "super_admin") {
          await supabase.auth.signOut();
          toast.error("Access denied. You are not an Admin.");
          setBusy(false);
          return;
        }

        if (role === "dealer" && resolvedRole !== "dealer") {
          if (signedInProfile?.dealer_status !== "pending") {
            await supabase.auth.signOut();
            toast.error("Access denied. You do not have an active Dealer account.");
            setBusy(false);
            return;
          }
        }

        toast.success("Welcome back!");
        await refreshProfile();

        let targetPath = redirect || getRoleDashboardPath(resolvedRole);
        if (role === "dealer" && resolvedRole !== "dealer" && signedInProfile?.dealer_status === "pending") {
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
    try {
      const { signInWithOAuth } = await import("@/lib/supabase/auth");
      const { error } = await signInWithOAuth("google");
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google Sign-In failed.";
      toast.error(msg);
      setBusy(false);
    }
  };

  // ─── Dealer pending screen ──────────────────────────────────────────────────
  if (dealerPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-lg">
          <div className="text-4xl mb-4 animate-bounce">⏳</div>
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
            <User className="size-7 animate-pulse" />
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
              onClick={async () => { 
                localStorage.removeItem("manaooru-mock-session");
                await supabase.auth.signOut(); 
                toast.success("Signed out."); 
                window.location.reload();
              }}
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
    <div className="colorful-gradient-bg min-h-screen flex items-center justify-center bg-background px-4 py-10 relative overflow-hidden">
      {/* Glow Backdrops */}
      <div className="pointer-events-none absolute -left-24 top-8 size-72 rounded-full bg-primary/10 blur-3xl animate-pulse duration-[8000ms]" />
      <div className="pointer-events-none absolute -right-24 bottom-8 size-80 rounded-full bg-secondary/10 blur-3xl animate-pulse duration-[6000ms]" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Form Glow Card */}
        <div className="w-full lg:col-span-7 max-w-md mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate({ to: "/" })}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-foreground transition"
            >
              <ArrowLeft className="size-4 animate-pulse" /> Back to Home
            </button>
            <span className="font-extrabold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ManaOoru Village Connect</span>
          </div>

          {message === "signin_to_post" && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              🔒 Sign in required to post.
            </div>
          )}

          <div className="colorful-glow-card rounded-[32px] border-2 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Mode tabs */}
            <div className="mb-6 flex rounded-2xl border border-border overflow-hidden p-1 bg-background/50">
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setAuthMethod("password"); setOtpSent(false); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition ${
                    mode === m
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            {mode === "signin" && (
              <div className="mb-6 flex flex-wrap gap-2 justify-center">
                <button type="button" onClick={() => { setAuthMethod("password"); setOtpSent(false); }} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${authMethod === "password" ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>Email + Password</button>
                <button type="button" onClick={() => { setAuthMethod("phone"); setOtpSent(false); }} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${authMethod === "phone" ? "bg-primary/10 border-primary text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>Phone OTP</button>
              </div>
            )}

            {/* Role selector */}
            <div className={`mb-5 grid gap-2 ${mode === "signup" ? "grid-cols-2" : "grid-cols-3"}`}>
              {roleOptions.map((r) => {
                if (mode === "signup" && r.id === "village_admin") return null;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-bold transition-all ${
                      role === r.id
                        ? "border-primary bg-primary/10 text-primary scale-105 shadow-sm"
                        : "border-border bg-background/60 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    <r.icon className="size-5" />
                    {r.label}
                  </button>
                );
              })}
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
                      className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
                    />
                  </div>

                  {role === "citizen" && (
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Occupation</label>
                      <select
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value as Occupation)}
                        className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
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
                    <div className="rounded-2xl border border-indigo-150 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 space-y-3">
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400">🏪 Shop Details</p>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Shop Name *</label>
                        <input
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          placeholder="e.g. Sri Venkateswara Kirana"
                          required
                          className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Category *</label>
                        <select
                          value={shopCategory}
                          onChange={(e) => setShopCategory(e.target.value as DealerCategory)}
                          className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
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
                          className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              {(mode === "signup" || authMethod === "password") && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
                  />
                </div>
              )}

              {/* Phone */}
              {(mode === "signup" || authMethod === "phone") && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone Number {authMethod === "phone" && "*"}</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91..."
                    required={authMethod === "phone"}
                    className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
                  />
                </div>
              )}

              {authMethod === "phone" && otpSent && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Enter OTP *</label>
                  <input
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="6-digit code"
                    required
                    className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground tracking-widest text-center font-bold"
                  />
                </div>
              )}

              {/* Password */}
              {(mode === "signup" || authMethod === "password") && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Password * {mode === "signup" && <span className="text-emerald-600">(min 4 characters)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                      required
                      className="premium-input w-full rounded-xl px-3 py-2.5 pr-10 text-sm bg-background/70 text-foreground"
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
              )}

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
                    className="premium-input w-full rounded-xl px-3 py-2.5 text-sm bg-background/70 text-foreground"
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {busy ? "Processing..." : mode === "signup" ? "Create Account" : (authMethod === "phone" && !otpSent ? "Send OTP" : "Sign In")}
              </button>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={busy}
                className="w-full rounded-xl border-2 border-primary/20 bg-background py-2.5 text-sm font-bold text-foreground hover:bg-muted/50 transition flex items-center justify-center gap-2 cursor-pointer"
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
              <div className="mt-4 text-center border-t border-border/40 pt-3">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/super-admin/login" })}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition underline"
                >
                  Super Admin Portal →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Floating 3D Showcase */}
        <div className="hidden lg:flex flex-col gap-6 lg:col-span-5 relative pl-4">
          <div className="space-y-3.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-black uppercase tracking-[0.2em] text-primary">
              ⚡ Digital Village OS
            </span>
            <h2 className="font-display text-4xl font-black text-clay leading-tight">
              Connecting Villages,<br/>Empowering Citizens.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Direct communication with Sarpanch, transparent public works, agricultural weather forecasts, and commission-free dealer marketplaces.
            </p>
          </div>

          <div className="relative h-[320px] w-full mt-6">
            {/* Card 1: Weather */}
            <div className="absolute top-0 left-0 w-[240px] p-4 rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-emerald-200/40 shadow-xl animate-float-1">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 shrink-0">
                  <Sun className="size-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Field weather</p>
                  <p className="text-sm font-bold text-clay truncate">31°C · Partly Cloudy</p>
                </div>
              </div>
            </div>

            {/* Card 2: Workers */}
            <div className="absolute top-[90px] right-2 w-[220px] p-4 rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-blue-200/40 shadow-xl animate-float-2">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
                  <User className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Workers Active</p>
                  <p className="text-sm font-bold text-clay truncate">28 local profiles</p>
                </div>
              </div>
            </div>

            {/* Card 3: Notice */}
            <div className="absolute bottom-2 left-6 w-[250px] p-4 rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-pink-200/40 shadow-xl animate-float-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-pink-100 text-pink-600 shrink-0">
                  <ShieldCheck className="size-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Official notice</p>
                  <p className="text-xs font-bold text-clay truncate">Gram Sabha Meeting at 10:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
