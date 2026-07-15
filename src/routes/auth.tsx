import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck, Store, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SurfaceCard } from "@/components/design-system";
import { VillageLocationPicker } from "@/components/VillageLocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import {
  getAuthRedirectUrl,
  getPasswordError,
  getPasswordStrength,
  getRoleDashboardPath,
  normalizeRole,
  signInWithEmailPassword,
  signInWithOAuth,
  signUpWithEmailPassword,
  verifyPhoneOtp,
  occupations,
  dealerCategories,
  type Occupation,
  type DealerCategory,
} from "@/lib/supabase/auth";
import {
  normalizeProfile,
  saveVillageProfilePreference,
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

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, message } = Route.useSearch();
  const { user, profile: authProfile, refreshProfile } = useAuth();

  // Auth state: 'landing' (no choice made), 'signin', or 'signup'
  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");

  // Selected roles
  const [signInRole, setSignInRole] = useState<AppRole | null>(null);
  const [signUpRole, setSignUpRole] = useState<AppRole | null>(null);

  // General details
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState<Occupation>("Other");

  // Shop details for Dealer registration
  const [shopName, setShopName] = useState("");
  const [shopCategory, setShopCategory] = useState<DealerCategory>("Grocery");
  const [shopAddress, setShopAddress] = useState("");
  const [shopDescription, setShopDescription] = useState("");

  const { profile, setProfile, hasProfile, t } = useVillagePreferences();
  const [villageProfile, setVillageProfile] = useState<VillageProfile>({
    ...profile,
    village: hasProfile ? profile.village : "",
  });

  const [busy, setBusy] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpCode, setPhoneOtpCode] = useState("");
  const [dealerRegisteredPending, setDealerRegisteredPending] = useState(false);

  const selectedVillageLocation = [
    villageProfile.village,
    villageProfile.mandal,
    villageProfile.district,
    villageProfile.state,
  ]
    .filter(Boolean)
    .join(", ");

  useEffect(() => {
    if (!user || busy || dealerRegisteredPending) return;
    // We do not force redirect on /auth so users can switch accounts or verify login status
  }, [user, authProfile, busy, navigate, dealerRegisteredPending]);

  useEffect(() => {
    setVillageProfile({ ...normalizeProfile(profile), village: hasProfile ? profile.village : "" });
  }, [hasProfile, profile]);

  const saveProfile = async (
    userId: string,
    nextProfile: VillageProfile,
    role: AppRole,
    displayName?: string,
  ) => {
    const isDealer = role === "dealer";
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName || undefined,
      full_name: displayName || undefined,
      account_type: "villager",
      role,
      occupation: isDealer ? "Business" : occupation,
      state: nextProfile.state,
      district: nextProfile.district,
      mandal: nextProfile.mandal,
      village: nextProfile.village,
      phone: phone || null,
      dealer_status: isDealer ? "pending" : null,
      dealer_category: isDealer ? shopCategory : null,
      shop_name: isDealer ? shopName : null,
      shop_address: isDealer ? shopAddress : null,
      shop_description: isDealer ? shopDescription : null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  };

  const getFriendlyAuthError = (err: unknown) => {
    const message =
      err && typeof err === "object" && "message" in err && typeof err.message === "string"
        ? err.message
        : err instanceof Error
          ? err.message
          : String(err || "");
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login credentials")) {
      return "Incorrect email or password for the selected role portal.";
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

    return message || "Auth failed. Please try again.";
  };

  const loadSignedInProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("account_type,role,state,district,mandal,village,dealer_status")
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

  const handleDemoLogin = async (targetRole: AppRole) => {
    if (!import.meta.env.DEV) {
      toast.error("Demo login is only available in development mode.");
      return;
    }
    setBusy(true);
    const demoEmails = {
      citizen: "citizen@manaooru.com",
      dealer: "dealer@manaooru.com",
      village_admin: "admin@manaooru.com",
      super_admin: "superadmin@manaooru.com",
    };
    const demoNames = {
      citizen: "Ramesh Kumar (Citizen)",
      dealer: "Laxman Rao (Kirana Dealer)",
      village_admin: "Venkatesh R. (Sarpanch)",
      super_admin: "Super Admin",
    };
    const email = demoEmails[targetRole];
    const password = "password123";

    try {
      console.info("[demo-login] trying sign in", { email });
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          console.info("[demo-login] account not found, registering on-the-fly", { email });

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: demoNames[targetRole],
                display_name: demoNames[targetRole],
                phone: "9876543210",
                occupation: targetRole === "dealer" ? "Business" : "Other",
                role: targetRole,
                state: "Telangana",
                district: "Rangareddy",
                mandal: "Kandukur",
                village: "Kothur",
                account_type:
                  targetRole === "village_admin"
                    ? "village_admin"
                    : targetRole === "super_admin"
                      ? "app_admin"
                      : "villager",
              },
            },
          });

          if (signUpError) throw signUpError;

          const userId = signUpData.user?.id;
          if (userId) {
            await supabase.from("profiles").upsert({
              id: userId,
              full_name: demoNames[targetRole],
              display_name: demoNames[targetRole],
              role: targetRole,
              account_type:
                targetRole === "village_admin"
                  ? "village_admin"
                  : targetRole === "super_admin"
                    ? "app_admin"
                    : "villager",
              state: "Telangana",
              district: "Rangareddy",
              mandal: "Kandukur",
              village: "Kothur",
              phone: "9876543210",
              dealer_status: targetRole === "dealer" ? "approved" : null,
              profile_completed_at: new Date().toISOString(),
            });
          }

          const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
          if (retryError) throw retryError;

          toast.success(`Demo ${getRoleLabel(targetRole)} account created and logged in!`);
          await refreshProfile();
          navigate({ to: redirect || getRoleDashboardPath(targetRole) });
          return;
        }
        throw error;
      }

      toast.success("Logged in successfully!");
      await refreshProfile();
      navigate({ to: redirect || getRoleDashboardPath(targetRole) });
    } catch (err) {
      console.error("[demo-login] failed", err);
      toast.error(getFriendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const activeRole = mode === "signin" ? signInRole : signUpRole;
    try {
      if (mode === "signup") {
        if (!activeRole) {
          toast.error("Please select a role to register.");
          setBusy(false);
          return;
        }

        const passwordError = getPasswordError(password);
        if (passwordError) {
          toast.error(passwordError);
          setBusy(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          setBusy(false);
          return;
        }
        if (!villageProfile.village.trim()) {
          toast.error("Please select or type your village name.");
          setBusy(false);
          return;
        }

        if (activeRole === "dealer") {
          if (!shopName.trim()) {
            toast.error("Shop Name is required.");
            setBusy(false);
            return;
          }
          if (!shopAddress.trim()) {
            toast.error("Shop Address is required.");
            setBusy(false);
            return;
          }
        }

        const selectedProfile = normalizeProfile(villageProfile);
        const { data, error } = await signUpWithEmailPassword({
          email,
          password,
          fullName: name,
          phone,
          occupation: activeRole === "dealer" ? "Business" : occupation,
          metadata: {
            state: selectedProfile.state,
            district: selectedProfile.district,
            mandal: selectedProfile.mandal,
            village: selectedProfile.village,
            role: activeRole,
          },
        });
        if (error) throw error;
        setProfile(selectedProfile);

        if (data.user) {
          await saveProfile(data.user.id, selectedProfile, activeRole, name);
        }

        if (activeRole === "dealer") {
          setDealerRegisteredPending(true);
          toast.success("Dealer application registered!");
          setBusy(false);
          return;
        }

        if (!data.session) {
          toast.success("Account created. Please check your email to confirm.");
          setMode("signin");
          setSignInRole("citizen");
          setBusy(false);
          return;
        }

        toast.success("Welcome to ManaOoru!");
        navigate({ to: redirect || getRoleDashboardPath("citizen") });
      } else {
        // Sign In Flow
        if (!activeRole) {
          toast.error("Please select your role portal to sign in.");
          setBusy(false);
          return;
        }
        if (!password) {
          toast.error("Please enter your password.");
          setBusy(false);
          return;
        }

        const { data, error } = await signInWithEmailPassword(email, password);
        if (error) throw error;

        const signedInProfile = data.user ? await loadSignedInProfile(data.user.id) : null;
        const resolvedRole = normalizeRole(signedInProfile?.role ?? signedInProfile?.account_type);

        if (resolvedRole !== activeRole && resolvedRole !== "super_admin") {
          await supabase.auth.signOut();
          toast.error(`Account not authorized for ${activeRole.replace("_", " ")} access.`);
          setBusy(false);
          return;
        }

        if (resolvedRole === "dealer" && signedInProfile?.dealer_status !== "approved") {
          toast.info("Your dealer application is pending administrator approval.");
        }

        toast.success("Welcome back!");
        await refreshProfile();
        navigate({ to: redirect || getRoleDashboardPath(resolvedRole) });
      }
    } catch (err) {
      toast.error(getFriendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const roleTarget = mode === "signin" ? signInRole : signUpRole;
    if (!roleTarget) {
      toast.error("Please select a role card first.");
      return;
    }
    setBusy(true);
    const { error } = await signInWithOAuth("google");
    if (error) {
      toast.error(error.message);
      setBusy(false);
      return;
    }
    toast.loading("Redirecting to Google...");
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
    setPhoneOtpSent(true);
    toast.success("Verification code sent!");
  };

  const confirmPhoneOtp = async () => {
    const roleTarget = mode === "signin" ? signInRole : signUpRole;
    if (!roleTarget) {
      toast.error("Select your role first.");
      return;
    }
    if (phoneOtpCode.trim().length < 4) {
      toast.error("Enter the verification code");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await verifyPhoneOtp(phone, phoneOtpCode.trim());
      if (error) throw error;
      if (data.user) {
        const existing = await loadSignedInProfile(data.user.id);
        if (!existing) {
          await saveProfile(data.user.id, normalizeProfile(villageProfile), roleTarget);
        }
      }
      toast.success("Phone verified. Welcome!");
      setPhoneOtpSent(false);
      setPhoneOtpCode("");
    } catch (err) {
      toast.error(getFriendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  if (dealerRegisteredPending) {
    return (
      <div className="premium-page-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-secondary/18 blur-3xl" />
        <div className="relative w-full max-w-lg">
          <SurfaceCard className="p-8 text-center shadow-[var(--shadow-lift)]">
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="font-display text-2xl font-bold text-clay">Application Registered</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your dealer account setup is complete. It is currently pending Village Admin approval.
            </p>
            <div className="mt-6 border-t border-border pt-4">
              <button
                onClick={() => setDealerRegisteredPending(false)}
                className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
              >
                Go to Sign In
              </button>
            </div>
          </SurfaceCard>
        </div>
      </div>
    );
  }

  // Configuration settings for card animations & themes
  const roleCardConfig = {
    citizen: {
      bg: "from-emerald-50 to-teal-50",
      activeBg: "bg-emerald-600 text-white shadow-emerald-500/20",
      activeBorder: "border-emerald-600",
      iconColor: "text-emerald-600",
      glow: "shadow-emerald-100",
    },
    dealer: {
      bg: "from-indigo-50 to-violet-50",
      activeBg: "bg-indigo-600 text-white shadow-indigo-500/20",
      activeBorder: "border-indigo-600",
      iconColor: "text-indigo-600",
      glow: "shadow-indigo-100",
    },
    village_admin: {
      bg: "from-amber-50 to-orange-50",
      activeBg: "bg-amber-600 text-white shadow-amber-500/20",
      activeBorder: "border-amber-600",
      iconColor: "text-amber-600",
      glow: "shadow-amber-100",
    },
  };

  return (
    <div className="premium-page-bg relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      {/* Aurora visual accents */}
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-80 rounded-full bg-secondary/10 blur-3xl" />

      <div className="relative w-full max-w-4xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
        {/* Main interactive area */}
        <SurfaceCard className="w-full p-8 shadow-[var(--shadow-lift)] backdrop-blur-xl">
          {message === "signin_to_post" && (
            <div className="mb-6 rounded-2xl border border-amber-200/40 bg-amber-500/10 p-4 text-left">
              <h4 className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">
                🔒 Sign in required to post
              </h4>
              <p className="mt-1 text-xs font-medium leading-relaxed text-amber-700/90 dark:text-amber-400/80">
                Only signed-in village members can post jobs, listings, or register services. Please sign in or create an account to continue.
              </p>
            </div>
          )}
          <AnimatePresence mode="wait">
            {user && !dealerRegisteredPending ? (
              /* ALREADY SIGNED IN STATE */
              <motion.div
                key="already-signed-in"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center py-6"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground mb-6 shadow-lg shadow-primary/20">
                  <User className="size-6" />
                </div>
                <h2 className="font-display text-2xl font-bold text-clay mb-2">
                  {t.alreadySignedIn || "You are signed in as"} {authProfile?.full_name || authProfile?.username || user.email?.split("@")[0]}
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Role: {authProfile?.role ? authProfile.role.replace("_", " ") : "citizen"} • Village: {authProfile?.village || profile.village || "Not selected"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate({ to: getRoleDashboardPath(authProfile?.role) })}
                    className="flex-1 py-4 px-6 rounded-2xl bg-primary font-bold text-sm text-primary-foreground shadow-lg shadow-primary/15 transition hover:brightness-110"
                  >
                    {t.goToDashboard || "Go to Portal Dashboard"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast.success("Signed out successfully.");
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl border border-destructive/30 bg-destructive/5 font-bold text-sm text-destructive hover:bg-destructive/10 transition"
                  >
                    {t.switchAccount || "Sign out & Switch Account"}
                  </motion.button>
                </div>
              </motion.div>
            ) : mode === "landing" ? (
              /* LANDING STATE: Dual CTA entrance screen */
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center py-6"
              >
                {/* Logo */}
                <div className="grid size-14 place-items-center rounded-2xl bg-primary font-display text-2xl font-bold text-primary-foreground mb-6 shadow-lg shadow-primary/20">
                  M
                </div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-clay mb-3">
                  {t.welcomeToManaOoru || "Welcome to ManaOoru"}
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
                  Join the trusted digital gateway connecting farmers, local dealers, citizens, and
                  village administration all in one secure portal.
                </p>

                {/* Side-by-Side Dual CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMode("signin");
                      setSignInRole("citizen");
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl bg-primary font-bold text-sm text-primary-foreground shadow-lg shadow-primary/15 transition hover:brightness-110"
                  >
                    {t.signIn || "Sign In"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMode("signup");
                      setSignUpRole("citizen");
                    }}
                    className="flex-1 py-4 px-6 rounded-2xl border border-border bg-white/50 backdrop-blur-md font-bold text-sm text-clay hover:border-primary hover:bg-white transition"
                  >
                    {t.createAccount || "Create Account"}
                  </motion.button>
                </div>

                {import.meta.env.DEV && (
                  <>
                    {/* Visual Divider */}
                    <div className="relative my-6 w-full flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <span className="relative px-3 bg-card text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Or Quick Demo Login (Dev Only)
                      </span>
                    </div>

                    {/* 3 Clickable Demo Profiles */}
                    <div className="grid grid-cols-3 gap-2.5 w-full">
                      {[
                        {
                          id: "citizen",
                          label: "Citizen",
                          color:
                            "from-rose-500/10 to-orange-500/10 hover:border-orange-500/40 text-orange-700 hover:bg-orange-50/50",
                        },
                        {
                          id: "dealer",
                          label: "Dealer",
                          color:
                            "from-emerald-500/10 to-teal-500/10 hover:border-teal-500/40 text-teal-700 hover:bg-teal-50/50",
                        },
                        {
                          id: "village_admin",
                          label: "Sarpanch",
                          color:
                            "from-violet-500/10 to-purple-500/10 hover:border-purple-500/40 text-purple-700 hover:bg-purple-50/50",
                        },
                      ].map((item) => (
                        <motion.button
                          key={item.id}
                          type="button"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleDemoLogin(item.id as AppRole)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-border bg-gradient-to-b ${item.color} transition shadow-sm`}
                        >
                          <span className="text-xs font-black">{item.label}</span>
                          <span className="text-[9px] font-bold opacity-75 mt-0.5">One-click</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              /* FORM / PORTAL STATE */
              <motion.div
                key="auth-portal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back button to landing */}
                <button
                  onClick={() => {
                    setMode("landing");
                    setSignInRole(null);
                    setSignUpRole(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-6 transition"
                >
                  <ArrowLeft className="size-3.5" /> {t.backToWelcome || "Back to welcome screen"}
                </button>

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-clay tracking-tight">
                      {mode === "signin" ? t.portalSignIn || "Portal Sign In" : t.registerProfile || "Register Profile"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mode === "signin"
                        ? t.chooseDestination || "Choose your destination portal below."
                        : t.selectIdentity || "Select your village identity type below."}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {mode === "signin" ? "Authentication" : "Onboarding"}
                  </span>
                </div>

                {/* 3 Animated Role Cards for Sign In */}
                {mode === "signin" && (
                  <div className="grid gap-3 grid-cols-3 mb-6">
                    {[
                      { id: "citizen", label: t.citizen || "Citizen", icon: User, desc: t.accessNetwork || "Access network" },
                      { id: "dealer", label: t.dealer || "Dealer", icon: Store, desc: t.sellAndTrade || "Sell & trade" },
                      {
                        id: "village_admin",
                        label: t.villageAdmin || "Village Admin",
                        icon: ShieldCheck,
                        desc: t.manageOps || "Manage ops",
                      },
                    ].map((item) => {
                      const isSelected = signInRole === item.id;
                      const conf = roleCardConfig[item.id as keyof typeof roleCardConfig];
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ scale: 1.04, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSignInRole(item.id as AppRole)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                            isSelected
                              ? `${conf.activeBorder} ${conf.glow} bg-gradient-to-b ${conf.bg}`
                              : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl mb-2 transition-all ${isSelected ? conf.activeBg : "bg-muted/40"}`}
                          >
                            <item.icon className="size-5" />
                          </div>
                          <span
                            className={`block text-xs font-bold truncate w-full ${isSelected ? "text-clay" : "text-foreground"}`}
                          >
                            {item.label}
                          </span>
                          <span className="block text-[9px] text-muted-foreground mt-0.5">
                            {item.desc}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* 3 Animated Role Cards for Create Account */}
                {mode === "signup" && (
                  <div className="grid gap-3 grid-cols-3 mb-6">
                    {[
                      {
                        id: "citizen",
                        label: t.citizen || "Citizen",
                        icon: User,
                        desc: t.localUpdates || "Local updates",
                        disabled: false,
                      },
                      {
                        id: "dealer",
                        label: t.dealer || "Dealer",
                        icon: Store,
                        desc: t.registerShop || "Register shop",
                        disabled: false,
                      },
                      {
                        id: "village_admin",
                        label: t.villageAdmin || "Village Admin",
                        icon: ShieldCheck,
                        desc: t.officialOnly || "Official only",
                        disabled: true,
                      },
                    ].map((item) => {
                      const isSelected = signUpRole === item.id;
                      const conf = roleCardConfig[item.id as keyof typeof roleCardConfig];
                      return (
                        <motion.button
                          key={item.id}
                          disabled={item.disabled}
                          whileHover={item.disabled ? {} : { scale: 1.04, y: -3 }}
                          whileTap={item.disabled ? {} : { scale: 0.98 }}
                          onClick={() => setSignUpRole(item.id as AppRole)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all ${
                            item.disabled
                              ? "border-border bg-muted/20 opacity-40 cursor-not-allowed"
                              : isSelected
                                ? `${conf.activeBorder} ${conf.glow} bg-gradient-to-b ${conf.bg}`
                                : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <div
                            className={`p-2.5 rounded-xl mb-2 transition-all ${isSelected ? conf.activeBg : "bg-muted/40"}`}
                          >
                            <item.icon className="size-5" />
                          </div>
                          <span className="block text-xs font-bold truncate w-full">
                            {item.label}
                          </span>
                          <span className="block text-[9px] text-muted-foreground mt-0.5">
                            {item.desc}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Warning for Village Admin registration */}
                {mode === "signup" && signUpRole === "village_admin" && (
                  <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 leading-relaxed">
                    <strong>Panchayat Portal Notice:</strong> Village Admin permissions are
                    provisioned directly by the Platform Administration team and cannot be
                    registered publicly.
                  </div>
                )}

                {/* Active input form */}
                {((mode === "signin" && signInRole) ||
                  (mode === "signup" && signUpRole && signUpRole !== "village_admin")) && (
                  <form onSubmit={submit} className="space-y-4">
                    {/* Setup details for sign up */}
                    {mode === "signup" && (
                      <>
                        <div>
                          <label
                            htmlFor="auth-name"
                            className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                          >
                            {t.fullName || "Full Name"}
                          </label>
                          <input
                            id="auth-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Ramesh Kumar"
                            required
                            className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                          />
                        </div>

                        {signUpRole === "citizen" && (
                          <div>
                            <label
                              htmlFor="auth-occupation"
                              className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                            >
                              {t.occupation || "Occupation"}
                            </label>
                            <select
                              id="auth-occupation"
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value as Occupation)}
                              className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                            >
                              {occupations.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-clay uppercase tracking-wider">
                            {t.selectVillage || "Select Village"}
                          </label>
                          <VillageLocationPicker
                            value={villageProfile}
                            onChange={setVillageProfile}
                            idPrefix="animated-auth-signup"
                          />
                          {selectedVillageLocation && (
                            <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-xs text-primary font-semibold">
                              Selected: {selectedVillageLocation}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Integrated Dealer details */}
                    {mode === "signup" && signUpRole === "dealer" && (
                      <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-4">
                        <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Store className="size-4" /> Shop Profile Settings
                        </h3>

                        <div>
                          <label
                            htmlFor="dealer-shop"
                            className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                          >
                            Shop Name *
                          </label>
                          <input
                            id="dealer-shop"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            placeholder="e.g. Sri Venkateswara Fertilizers"
                            required
                            className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="dealer-cat"
                            className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                          >
                            Business Category *
                          </label>
                          <select
                            id="dealer-cat"
                            value={shopCategory}
                            onChange={(e) => setShopCategory(e.target.value as DealerCategory)}
                            className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                          >
                            {dealerCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="dealer-address"
                            className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                          >
                            Shop Address *
                          </label>
                          <input
                            id="dealer-address"
                            value={shopAddress}
                            onChange={(e) => setShopAddress(e.target.value)}
                            placeholder="e.g. Main Road, near post office"
                            required
                            className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="dealer-desc"
                            className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                          >
                            Shop Description
                          </label>
                          <textarea
                            id="dealer-desc"
                            value={shopDescription}
                            onChange={(e) => setShopDescription(e.target.value)}
                            placeholder="e.g. Quality seeds, fertilizer, and agricultural advisory."
                            rows={2}
                            className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                          />
                        </div>
                      </div>
                    )}

                    {/* Standard credentials */}
                    <div>
                      <label
                        htmlFor="auth-email-field"
                        className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                      >
                        {t.emailAddress || "Email Address"}
                      </label>
                      <input
                        id="auth-email-field"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                        className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                      />
                    </div>

                    {/* Phone field */}
                    <div>
                      <label
                        htmlFor="auth-phone-field"
                        className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                      >
                        {t.phoneNumber || "Phone Number"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="auth-phone-field"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setPhoneOtpSent(false);
                          }}
                          placeholder="+919876543210"
                          className="premium-input flex-1 rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                        />
                        <button
                          type="button"
                          onClick={sendPhoneOtp}
                          disabled={busy || !phone}
                          className="rounded-2xl border border-primary/20 bg-background px-4 text-xs font-semibold text-primary transition hover:border-primary disabled:opacity-50"
                        >
                          {t.sendOtp || "Send OTP"}
                        </button>
                      </div>
                    </div>

                    {phoneOtpSent && (
                      <div className="grid gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:grid-cols-[1fr_auto]">
                        <input
                          value={phoneOtpCode}
                          onChange={(e) => setPhoneOtpCode(e.target.value)}
                          placeholder={t.verificationCode || "Verification Code"}
                          className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                        />
                        <button
                          type="button"
                          onClick={confirmPhoneOtp}
                          disabled={busy}
                          className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
                        >
                          {t.verify || "Verify"}
                        </button>
                      </div>
                    )}

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="auth-password-field"
                        className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                      >
                        {t.password || "Password"}
                      </label>
                      <div className="relative">
                        <input
                          id="auth-password-field"
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
                          {showPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {mode === "signup" && password && (
                      <div className="flex items-center gap-2">
                        <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              getPasswordStrength(password) === "weak"
                                ? "bg-destructive"
                                : "bg-primary"
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              getPasswordStrength(password) === "weak"
                                ? "bg-muted"
                                : getPasswordStrength(password) === "fair"
                                  ? "bg-amber-500"
                                  : "bg-primary"
                            }`}
                          />
                          <div
                            className={`h-full flex-1 rounded-full transition-colors ${
                              getPasswordStrength(password) === "strong" ? "bg-primary" : "bg-muted"
                            }`}
                          />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground">
                          {getPasswordStrength(password)}
                        </span>
                      </div>
                    )}

                    {mode === "signup" && (
                      <div>
                        <label
                          htmlFor="auth-confirm-field"
                          className="block text-xs font-bold text-clay uppercase tracking-wider mb-1.5"
                        >
                          {t.confirmPassword || "Confirm Password"}
                        </label>
                        <input
                          id="auth-confirm-field"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                        />
                      </div>
                    )}

                    {/* Action button */}
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60 shadow-lg shadow-primary/10"
                    >
                      {busy && <Loader2 className="size-4 animate-spin" />}
                      {busy
                        ? mode === "signin"
                          ? t.authenticating || "Authenticating..."
                          : t.registering || "Registering..."
                        : mode === "signin"
                          ? `${t.signInAs || "Sign in:"} ${signInRole === "dealer" ? (t.dealer || "Dealer") : signInRole === "village_admin" ? (t.villageAdmin || "Village Admin") : (t.citizen || "Citizen")}`
                          : `${t.registerAs || "Register:"} ${signUpRole === "dealer" ? (t.dealer || "Dealer") : signUpRole === "village_admin" ? (t.villageAdmin || "Village Admin") : (t.citizen || "Citizen")}`}
                    </button>

                    {/* Auxiliary controls */}
                    {mode === "signin" && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={sendMagicLink}
                          disabled={busy}
                          className="flex-1 rounded-2xl border border-border bg-background py-2.5 text-xs font-bold text-clay hover:border-primary"
                        >
                          Magic Link
                        </button>
                        <button
                          type="button"
                          onClick={sendPasswordReset}
                          disabled={busy}
                          className="flex-1 rounded-2xl border border-border bg-background py-2.5 text-xs font-bold text-clay hover:border-primary"
                        >
                          Forgot Password
                        </button>
                      </div>
                    )}

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-[10px] uppercase font-bold bg-transparent">
                        <span className="px-2 text-muted-foreground bg-white">OR</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={google}
                      disabled={busy}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3 text-sm font-bold text-foreground transition hover:bg-muted/50 disabled:opacity-50"
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
                      Google Authentication
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </SurfaceCard>

        {/* Right side teaser panel */}
        <div className="auth-3d-preview hidden lg:block">
          <div className="auth-3d-tile auth-3d-tile-main border border-white/40">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-primary/70">
              ManaOoru Smart Portal
            </p>
            <h2 className="mt-3 font-display text-3xl font-black leading-tight text-clay">
              Bringing rural India online, beautifully.
            </h2>
            <div className="mt-6 space-y-3">
              {[
                "Instant local information & weather updates",
                "Secure, audited merchant and dealer workflows",
                "Citizen problem reporting & notice boards",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs font-bold text-clay shadow-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getRoleLabel(role: AppRole | null): string {
  if (!role) return "";
  switch (role) {
    case "super_admin":
      return "Platform Admin";
    case "village_admin":
      return "Village Admin";
    case "dealer":
      return "Dealer";
    case "citizen":
    default:
      return "Citizen";
  }
}
