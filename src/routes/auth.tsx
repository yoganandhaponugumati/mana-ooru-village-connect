import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SurfaceCard } from "@/components/design-system";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import {
  getAuthRedirectUrl,
  getRoleDashboardPath,
  normalizeRole,
  signInWithEmailPassword,
  signInWithOAuth,
  signUpWithEmailPassword,
  occupations,
  type Occupation,
} from "@/lib/supabase/auth";
import {
  defaultProfile,
  getDistricts,
  getMandals,
  getStates,
  getVillages,
  normalizeProfile,
  saveVillageProfilePreference,
  useVillagePreferences,
  type VillageProfile,
} from "@/lib/village-preferences";

const occupationOptions: {
  value: Occupation;
  label: string;
  description: string;
}[] = [
  {
    value: "Farmer",
    label: "Farmer",
    description: "Sell products, find services, and track agriculture updates.",
  },
  {
    value: "Worker",
    label: "Worker",
    description: "Offer local services and manage your worker profile.",
  },
  {
    value: "Other",
    label: "Other",
    description: "Join as a citizen and update your occupation later.",
  },
];

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — ManaOoru" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, profile: authProfile } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState<Occupation>("Other");
  const { profile, setProfile, hasProfile } = useVillagePreferences();
  const [villageProfile, setVillageProfile] = useState<VillageProfile>({
    ...profile,
    village: hasProfile ? profile.village : "",
  });
  const [busy, setBusy] = useState(false);
  const states = getStates();
  const districts = getDistricts(villageProfile.state);
  const mandals = getMandals(villageProfile.state, villageProfile.district);
  const villages = getVillages(
    villageProfile.state,
    villageProfile.district,
    villageProfile.mandal,
  );
  const selectedVillageLocation = [
    villageProfile.village,
    villageProfile.mandal,
    villageProfile.district,
    villageProfile.state,
  ]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    if (!user || busy) return;
    navigate({ to: getRoleDashboardPath(authProfile?.role) });
  }, [user, authProfile, busy, navigate]);

  useEffect(() => {
    setVillageProfile({ ...normalizeProfile(profile), village: hasProfile ? profile.village : "" });
  }, [hasProfile, profile]);

  const saveProfile = async (
    userId: string,
    nextProfile: VillageProfile,
    role: AppRole,
    displayName?: string,
  ) => {
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName || undefined,
      full_name: displayName || undefined,
      account_type: "villager",
      role,
      occupation,
      state: nextProfile.state,
      district: nextProfile.district,
      mandal: nextProfile.mandal,
      village: nextProfile.village,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  };

  const getFriendlyAuthError = (err: unknown) => {
    const message = err instanceof Error ? err.message : String(err || "");
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
      return "Email or password is incorrect. If you signed up with Google or OTP, use that method or reset your password.";
    }
    if (normalized.includes("email not confirmed")) {
      return "Please open the confirmation link in your email before signing in.";
    }
    if (normalized.includes("password should be at least")) {
      return "Password must be at least 6 characters.";
    }
    if (normalized.includes("rate limit") || normalized.includes("too many")) {
      return "Too many attempts. Please wait a minute and try again.";
    }

    return message || "Sign-in failed. Please try again.";
  };

  const loadSignedInProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("account_type,role,state,district,mandal,village")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (data?.state && data.district && data.mandal && data.village) {
      saveVillageProfilePreference({
        state: data.state,
        district: data.district,
        mandal: data.mandal,
        village: data.village,
      });
    }
    return data;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          setBusy(false);
          return;
        }
        if (!villageProfile.village.trim()) {
          toast.error("Please select or type your village name.");
          setBusy(false);
          return;
        }
        const selectedProfile = normalizeProfile(villageProfile);
        const { data, error } = await signUpWithEmailPassword({
          email,
          password,
          fullName: name,
          phone,
          occupation,
          metadata: {
            state: selectedProfile.state,
            district: selectedProfile.district,
            mandal: selectedProfile.mandal,
            village: selectedProfile.village,
          },
        });
        if (error) throw error;
        setProfile(selectedProfile);
        if (data.user && data.session) {
          await saveProfile(data.user.id, selectedProfile, "citizen", name);
        }
        if (!data.session) {
          toast.success(
            "Account created. Check your email and open the ManaOoru confirmation link.",
          );
          setMode("signin");
          setBusy(false);
          return;
        }
        toast.success("Welcome to ManaOoru!");
        navigate({ to: getRoleDashboardPath("citizen") });
      } else {
        if (password.length < 6) {
          toast.error("Enter the full password. It must be at least 6 characters.");
          return;
        }
        const { data, error } = await signInWithEmailPassword(email, password);
        if (error) throw error;
        const signedInProfile = data.user ? await loadSignedInProfile(data.user.id) : null;
        toast.success("Welcome back!");
        navigate({
          to: getRoleDashboardPath(
            normalizeRole(signedInProfile?.role ?? signedInProfile?.account_type),
          ),
        });
      }
    } catch (err) {
      toast.error(getFriendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const { error } = await signInWithOAuth("google");
    if (error) {
      const message = error.message || "Google sign-in failed";
      toast.error(
        message.toLowerCase().includes("provider")
          ? "Google sign-in is not enabled in Supabase. Enable Google provider and add this site URL in Supabase Auth settings."
          : message,
      );
      setBusy(false);
      return;
    }
    toast.loading("Opening Google sign-in...");
  };

  const sendMagicLink = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: getAuthRedirectUrl("/") },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("OTP / magic link sent to your email");
  };

  const sendPasswordReset = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl("/"),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset link sent");
  };

  const sendPhoneOtp = async () => {
    if (!phone) {
      toast.error("Enter your phone number with country code");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Phone OTP sent if phone login is enabled");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(46,125,50,0.16),_transparent_42%),linear-gradient(135deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-10">
      <SurfaceCard className="w-full max-w-2xl p-8 shadow-[var(--shadow-lift)]">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground">
            M
          </div>
          <span className="font-display text-xl font-semibold text-clay">ManaOoru</span>
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold text-clay">
              {mode === "signin" ? "Welcome back" : "Join your village"}
            </h1>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {mode === "signin"
                ? "Sign in with your saved ManaOoru account. Your village, role, and live weather will load automatically."
                : "Create your village identity once, then use it across workers, services, notices, and weather."}
            </p>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-xs font-semibold text-primary">
            {mode === "signin" ? "Saved profile login" : "Village setup required"}
          </div>
        </div>

        <button
          onClick={google}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary disabled:opacity-60"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38Z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              />
              <div className="grid gap-2 sm:grid-cols-3">
                {occupationOptions.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setOccupation(type.value)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      occupation === type.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{type.label}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
              <select
                aria-label="Occupation"
                value={occupation}
                onChange={(event) => setOccupation(event.target.value as Occupation)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {occupations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  aria-label="State"
                  value={villageProfile.state}
                  onChange={(e) => {
                    const state = e.target.value;
                    const district = getDistricts(state)[0] ?? defaultProfile.district;
                    const mandal = getMandals(state, district)[0] ?? defaultProfile.mandal;
                    setVillageProfile({ state, district, mandal, village: "" });
                  }}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {states.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
                <select
                  aria-label="District"
                  value={villageProfile.district}
                  onChange={(e) => {
                    const district = e.target.value;
                    const mandal = getMandals(villageProfile.state, district)[0] ?? "";
                    setVillageProfile({ ...villageProfile, district, mandal, village: "" });
                  }}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {districts.map((district) => (
                    <option key={district}>{district}</option>
                  ))}
                </select>
                <select
                  aria-label="Mandal"
                  value={villageProfile.mandal}
                  onChange={(e) => {
                    const mandal = e.target.value;
                    setVillageProfile({ ...villageProfile, mandal, village: "" });
                  }}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {mandals.map((mandal) => (
                    <option key={mandal}>{mandal}</option>
                  ))}
                </select>
                <input
                  aria-label="Village"
                  list="signup-village-options"
                  value={villageProfile.village}
                  onChange={(e) =>
                    setVillageProfile({ ...villageProfile, village: e.target.value })
                  }
                  placeholder="Select or type exact village name"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
                <datalist id="signup-village-options">
                  {villages.map((village) => (
                    <option key={village} value={village} />
                  ))}
                </datalist>
              </div>
              <div className="rounded-2xl border border-primary/15 bg-primary/10 p-4 text-sm text-primary">
                Selected village: <strong>{selectedVillageLocation}</strong>
              </div>
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={busy}
              className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary disabled:opacity-60"
            >
              Email OTP / Magic Link
            </button>
            <button
              type="button"
              onClick={sendPasswordReset}
              disabled={busy}
              className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-clay transition hover:border-primary disabled:opacity-60"
            >
              Forgot password
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone with country code, e.g. +919876543210"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={sendPhoneOtp}
              disabled={busy}
              className="rounded-2xl border border-primary/20 bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary disabled:opacity-60"
            >
              Phone OTP
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              required
              minLength={6}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 pr-12 text-sm text-foreground outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "New to ManaOoru?" : "Already have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
      </SurfaceCard>
    </div>
  );
}
