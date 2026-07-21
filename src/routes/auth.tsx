import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, ShieldCheck, Store, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { VillageLocationPicker } from "@/components/VillageLocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/lib/auth";
import {
  getAuthRedirectUrl,
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

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, message } = Route.useSearch();
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");
  const [signInRole, setSignInRole] = useState<AppRole | null>(null);
  const [signUpRole, setSignUpRole] = useState<AppRole | null>(null);

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
  const [shopDescription, setShopDescription] = useState("");

  const { profile, setProfile, hasProfile, t } = useVillagePreferences();
  const [villageProfile, setVillageProfile] = useState<VillageProfile>({
    ...profile,
    village: hasProfile ? profile.village : "",
  });

  const [busy, setBusy] = useState(false);
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
    const resolvedRole = normalizeRole(authProfile?.role ?? authProfile?.account_type);
    const targetPath = redirect || getRoleDashboardPath(resolvedRole);
    if (location.pathname === "/auth") {
      navigate({ to: targetPath });
    }
  }, [user, authProfile, busy, dealerRegisteredPending, navigate, redirect]);

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
      payload.shop_description = shopDescription || undefined;
    }

    const { error } = await supabase.from("profiles").upsert(payload);
    if (error) throw error;
    await refreshProfile();
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
            dealer_status: activeRole === "dealer" ? "pending" : undefined,
            dealer_category: activeRole === "dealer" ? shopCategory : undefined,
            shop_name: activeRole === "dealer" ? shopName : undefined,
            shop_address: activeRole === "dealer" ? shopAddress : undefined,
            shop_description: activeRole === "dealer" ? shopDescription : undefined,
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
          toast.error("Please select your portal type to sign in.");
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

        toast.success("Welcome back!");
        await refreshProfile();

        let targetPath = redirect || getRoleDashboardPath(resolvedRole);
        if (activeRole === "dealer") {
          if (resolvedRole === "citizen" && signedInProfile?.dealer_status === "pending") {
            targetPath = "/dealer-registration";
          }
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

  const google = async () => {
    setBusy(true);
    const { error } = await signInWithOAuth("google");
    if (error) {
      toast.error(error.message);
      setBusy(false);
    }
  };

  if (dealerRegisteredPending) {
    return (
      <div className="premium-page-bg relative grid min-h-screen place-items-center px-4 py-10">
        <div className="w-full max-w-lg text-center rounded-3xl border border-border bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-5xl mb-4">⏳</div>
          <h2 className="font-display text-2xl font-black text-clay">Application Registered</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Your dealer account setup is complete. It is currently pending Village Admin approval.
          </p>
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={() => setDealerRegisteredPending(false)}
              className="rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:brightness-110"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-page-bg relative min-h-screen overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
      {/* Visual background glow accents */}
      <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 size-96 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Top Header Bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between pb-8">
        <button
          onClick={() => navigate({ to: "/" })}
          className="group flex items-center gap-2.5 text-left transition"
        >
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
            <User className="size-5" />
          </div>
          <div>
            <span className="font-display text-xl font-black tracking-tight text-clay">
              ManaOoru
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Smart Village Portal
            </span>
          </div>
        </button>
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-1.5 rounded-2xl border border-border bg-background/80 px-4 py-2 text-xs font-bold text-clay backdrop-blur-md transition hover:border-primary hover:bg-white"
        >
          <ArrowLeft className="size-4 text-primary" /> Back to Home
        </button>
      </div>

      <div className="mx-auto max-w-6xl">
        {message === "signin_to_post" && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-500/10 p-4 text-left">
            <h4 className="font-display text-sm font-bold text-amber-700 dark:text-amber-400">
              🔒 Sign in required to post
            </h4>
            <p className="mt-1 text-xs font-medium leading-relaxed text-amber-800 dark:text-amber-300">
              Only registered village members can post requirements, listings, or services. Please sign in or register below.
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {user && !dealerRegisteredPending ? (
            /* ALREADY SIGNED IN STATE */
            <motion.div
              key="already-signed-in"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/90 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
              <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 mb-4">
                <User className="size-8" />
              </div>
              <h2 className="font-display text-2xl font-black text-clay">
                {t.alreadySignedIn || "You are signed in as"}{" "}
                {authProfile?.full_name || authProfile?.username || user.email?.split("@")[0]}
              </h2>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                Role: <span className="text-primary capitalize">{authProfile?.role ? authProfile.role.replace("_", " ") : "citizen"}</span> • Village: <span className="text-clay font-bold">{authProfile?.village || profile.village || "Selected"}</span>
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    if (authProfile?.role === "citizen" && authProfile?.dealer_status === "pending") {
                      navigate({ to: "/dealer-registration" });
                    } else {
                      navigate({ to: getRoleDashboardPath(authProfile?.role) });
                    }
                  }}
                  className="rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
                >
                  {t.goToDashboard || "Go to Portal Dashboard"}
                </button>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    toast.success("Signed out successfully.");
                  }}
                  className="rounded-2xl border border-destructive/30 bg-destructive/10 px-8 py-3.5 text-sm font-bold text-destructive hover:bg-destructive/20 transition"
                >
                  {t.switchAccount || "Sign out & Switch Account"}
                </button>
              </div>
            </motion.div>
          ) : mode === "landing" ? (
            /* LANDING MODE: 3 Modern Side-by-Side Portal Cards */
            <motion.div
              key="landing-3-cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 py-4"
            >
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <span className="rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                  Select Your Portal
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-clay tracking-tight">
                  Welcome to ManaOoru Gateway
                </h1>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Choose your portal below to sign in or register for your village in Telangana, Andhra Pradesh, or India.
                </p>
              </div>

              {/* 3 Interactive Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* CARD 1: CITIZEN */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-background to-background p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-emerald-500 hover:shadow-2xl">
                  <div className="space-y-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                      <User className="size-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                        For All Villagers
                      </span>
                      <h3 className="font-display text-2xl font-bold text-clay">Citizen Portal</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Access local news, hire workers, lease land, report problems, and get live weather & Panchayat updates.
                    </p>
                  </div>
                  <div className="mt-8 space-y-2.5 pt-4 border-t border-border/60">
                    <button
                      onClick={() => {
                        setMode("signin");
                        setSignInRole("citizen");
                      }}
                      className="w-full min-h-[44px] py-3 rounded-2xl bg-emerald-600 font-bold text-xs text-white shadow-md shadow-emerald-600/20 hover:brightness-110 transition flex items-center justify-center"
                    >
                      Sign In as Citizen
                    </button>
                    <button
                      onClick={() => {
                        setMode("signup");
                        setSignUpRole("citizen");
                      }}
                      className="w-full min-h-[44px] py-3 rounded-2xl border border-emerald-600/40 bg-emerald-50/50 font-bold text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60 transition flex items-center justify-center"
                    >
                      Create Citizen Account
                    </button>
                  </div>
                </div>

                {/* CARD 2: DEALER */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 via-background to-background p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-2xl">
                  <div className="space-y-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                      <Store className="size-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                        Shops & Traders
                      </span>
                      <h3 className="font-display text-2xl font-bold text-clay">Dealer Storefront</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Register your Kirana, Fertilizer, Rice Mill, or Medical shop. List products and receive orders from villagers.
                    </p>
                  </div>
                  <div className="mt-8 space-y-2.5 pt-4 border-t border-border/60">
                    <button
                      onClick={() => {
                        setMode("signin");
                        setSignInRole("dealer");
                      }}
                      className="w-full py-3 rounded-2xl bg-indigo-600 font-bold text-xs text-white shadow-md shadow-indigo-600/20 hover:brightness-110 transition"
                    >
                      Dealer Sign In
                    </button>
                    <button
                      onClick={() => {
                        setMode("signup");
                        setSignUpRole("dealer");
                      }}
                      className="w-full py-3 rounded-2xl border border-indigo-600/40 bg-indigo-50/50 font-bold text-xs text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100/60 transition"
                    >
                      Register Shop / Dealer
                    </button>
                  </div>
                </div>

                {/* CARD 3: VILLAGE ADMIN */}
                <div className="group relative flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-background to-background p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-amber-500 hover:shadow-2xl">
                  <div className="space-y-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/30">
                      <ShieldCheck className="size-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                        Sarpanch & Panchayat
                      </span>
                      <h3 className="font-display text-2xl font-bold text-clay">Village Admin</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Panchayat administration portal to publish notices, manage complaints, approve local dealers, and govern operations.
                    </p>
                  </div>
                  <div className="mt-8 space-y-2.5 pt-4 border-t border-border/60">
                    <button
                      onClick={() => {
                        setMode("signin");
                        setSignInRole("village_admin");
                      }}
                      className="w-full py-3 rounded-2xl bg-amber-600 font-bold text-xs text-white shadow-md shadow-amber-600/20 hover:brightness-110 transition"
                    >
                      Village Admin Sign In
                    </button>
                    <button
                      onClick={() => navigate({ to: "/super-admin/login" })}
                      className="w-full py-3 rounded-2xl border border-amber-600/40 bg-amber-50/50 font-bold text-xs text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 transition"
                    >
                      Super Admin Portal
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* FORM MODE: Clean Centered Full Container */
            <motion.div
              key="auth-form-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between pb-6 border-b border-border/60">
                <button
                  onClick={() => {
                    setMode("landing");
                    setSignInRole(null);
                    setSignUpRole(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition"
                >
                  <ArrowLeft className="size-4" /> Back to Portal Options
                </button>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                  {mode === "signin" ? "Sign In" : "Registration"}
                </span>
              </div>

              <div className="my-6">
                <h2 className="font-display text-2xl font-black text-clay">
                  {mode === "signin" ? "Sign In to Your Account" : "Register Village Profile"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Select your role type and enter your details below.
                </p>
              </div>

              {/* Role selection tab row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: "citizen", label: "Citizen", icon: User },
                  { id: "dealer", label: "Dealer", icon: Store },
                  { id: "village_admin", label: "Village Admin", icon: ShieldCheck },
                ].map((item) => {
                  const activeRole = mode === "signin" ? signInRole : signUpRole;
                  const isSelected = activeRole === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (mode === "signin") setSignInRole(item.id as AppRole);
                        else setSignUpRole(item.id as AppRole);
                      }}
                      className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-md"
                          : "border-border bg-background hover:border-primary/40 text-foreground"
                      }`}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={submit} className="space-y-4">
                {mode === "signup" && (
                  <>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-primary/80 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        required
                        className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                      />
                    </div>

                    {signUpRole === "citizen" && (
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-primary/80 mb-1.5">
                          Occupation
                        </label>
                        <select
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
                      <label className="block text-xs font-black uppercase tracking-wider text-primary/80">
                        Select Village Location (Telangana & Andhra Pradesh)
                      </label>
                      <VillageLocationPicker
                        value={villageProfile}
                        onChange={setVillageProfile}
                        idPrefix="auth-full-screen-picker"
                      />
                      {selectedVillageLocation && (
                        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-xs text-primary font-bold">
                          Selected: {selectedVillageLocation}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Dealer specific fields */}
                {mode === "signup" && signUpRole === "dealer" && (
                  <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                      🏪 Shop Information
                    </h4>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Shop Name *</label>
                      <input
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="e.g. Sri Venkateswara Kirana & Fertilizers"
                        required
                        className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">Category *</label>
                      <select
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
                      <label className="block text-xs font-bold text-foreground mb-1">Shop Address *</label>
                      <input
                        value={shopAddress}
                        onChange={(e) => setShopAddress(e.target.value)}
                        placeholder="e.g. Main Road, near Panchayat Office"
                        required
                        className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                      />
                    </div>
                  </div>
                )}

                {/* Email address */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-primary/80 mb-1.5">
                    Email Address *
                  </label>
                  <input
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
                  <label className="block text-xs font-black uppercase tracking-wider text-primary/80 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                  />
                </div>

                {/* Simple Password Input */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-primary/80 mb-1">
                    Simple Password / PIN *
                  </label>
                  <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">
                    ✓ Use any simple password (minimum 4 characters, e.g. 1234 or simple text)
                  </p>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter simple password (e.g. 1234)"
                      required
                      className="premium-input w-full rounded-2xl px-4 py-3 pr-12 text-sm text-foreground bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-primary/80 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      required
                      className="premium-input w-full rounded-2xl px-4 py-3 text-sm text-foreground bg-background"
                    />
                  </div>
                )}

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full py-4 rounded-2xl bg-primary font-bold text-sm text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:opacity-50"
                  >
                    {busy
                      ? "Processing..."
                      : mode === "signin"
                        ? "Sign In Now"
                        : "Complete Registration"}
                  </button>

                  <button
                    type="button"
                    onClick={google}
                    disabled={busy}
                    className="w-full py-3.5 rounded-2xl border border-border bg-background font-bold text-xs text-foreground hover:bg-muted/50 transition flex items-center justify-center gap-2"
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
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
