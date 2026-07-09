import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Languages,
  Loader2,
  LogOut,
  Mail,
  Moon,
  Settings,
  ShieldAlert,
  Sun,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLinkButton, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { VillageLocationPicker } from "@/components/VillageLocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fallbackListings } from "@/lib/app-data";
import {
  deleteMyAccount,
  getUsernameError,
  isUsernameAvailable,
  occupations,
  resendEmailVerification,
  type Occupation,
} from "@/lib/supabase/auth";
import { uploadUserFile } from "@/lib/supabase/storage";
import {
  useContactLog,
  useNotificationSettings,
  useSavedItems,
  useThemePreference,
} from "@/lib/local-actions";
import { timeAgo, useListings } from "@/lib/store";
import {
  formatVillageProfile,
  languageOptions,
  normalizeProfile,
  saveVillageProfilePreference,
  useVillagePreferences,
  type Language,
  type VillageProfile,
} from "@/lib/village-preferences";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile - ManaOoru" }] }),
  component: () => (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  ),
});

type UsernameCheckState = "idle" | "checking" | "available" | "taken" | "invalid";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile: authProfile, needsEmailVerification, signOut, refreshProfile } = useAuth();
  const { items } = useListings();
  const { saved, toggleSaved } = useSavedItems();
  const contactLog = useContactLog();
  const { profile, language, setLanguage } = useVillagePreferences();
  const { darkMode, setDarkMode } = useThemePreference();
  const { notificationsEnabled, setNotifications } = useNotificationSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePanel, setActivePanel] = useState<
    "saved" | "posts" | "edit" | "language" | "theme" | "notifications" | "account"
  >("saved");
  const myPosts = items.filter((item) => item.owner_id === user?.id);
  const allListings = useMemo(() => {
    const seen = new Set<string>();
    return [...items, ...fallbackListings].filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [items]);
  const savedPosts = allListings.filter((item) => saved.includes(item.id));

  // Edit-profile form state, seeded from the loaded auth profile.
  const [photoPreview, setPhotoPreview] = useState(authProfile?.photo_url || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState(authProfile?.full_name || "");
  const [username, setUsername] = useState(authProfile?.username || "");
  const [usernameState, setUsernameState] = useState<UsernameCheckState>("idle");
  const [occupation, setOccupation] = useState<Occupation>(authProfile?.occupation || "Other");
  const [villageProfile, setVillageProfile] = useState<VillageProfile>(profile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm">("idle");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setFullName(authProfile?.full_name || "");
    setUsername(authProfile?.username || "");
    setOccupation(authProfile?.occupation || "Other");
    setPhotoPreview(authProfile?.photo_url || "");
  }, [authProfile]);

  useEffect(() => {
    setVillageProfile(profile);
  }, [profile]);

  useEffect(() => {
    if (username === authProfile?.username) {
      setUsernameState("idle");
      return;
    }
    const formatError = getUsernameError(username);
    if (formatError) {
      setUsernameState(username.trim() ? "invalid" : "idle");
      return;
    }
    setUsernameState("checking");
    const timer = setTimeout(async () => {
      try {
        const available = await isUsernameAvailable(username, user?.id);
        setUsernameState(available ? "available" : "taken");
      } catch {
        setUsernameState("idle");
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [username, user?.id, authProfile?.username]);

  const chooseProfilePhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be under 2 MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!user) return;
    const usernameError = getUsernameError(username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }
    if (usernameState === "taken") {
      toast.error("That username is already taken.");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!villageProfile.village.trim()) {
      toast.error("Please select or type your village name.");
      return;
    }

    setSavingProfile(true);
    try {
      const stillAvailable = await isUsernameAvailable(username, user.id);
      if (!stillAvailable) {
        setUsernameState("taken");
        toast.error("That username was just taken. Please choose another.");
        return;
      }

      let photoUrl = authProfile?.photo_url || undefined;
      if (photoFile) {
        const uploaded = await uploadUserFile("profile-images", user.id, photoFile);
        photoUrl = uploaded.url;
      }

      const selectedProfile = normalizeProfile(villageProfile);
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim().toLowerCase(),
          full_name: fullName.trim(),
          display_name: fullName.trim(),
          occupation,
          photo_url: photoUrl,
          state: selectedProfile.state,
          district: selectedProfile.district,
          mandal: selectedProfile.mandal,
          village: selectedProfile.village,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      if (error) throw error;

      saveVillageProfilePreference(selectedProfile);
      setPhotoFile(null);
      await refreshProfile();
      toast.success("Profile updated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update your profile.";
      toast.error(
        message.toLowerCase().includes("duplicate") ? "That username is already taken." : message,
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    if (user) {
      supabase
        .from("profiles")
        .update({ preferred_language: next, updated_at: new Date().toISOString() })
        .eq("id", user.id)
        .then(({ error }) => {
          if (error) toast.error("Could not save language preference to your account.");
        });
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingVerification(true);
    try {
      const { error } = await resendEmailVerification(user.email);
      if (error) throw error;
      toast.success("Verification email sent. Check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not resend verification email.");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMyAccount();
      toast.success("Your account has been deleted.");
      await signOut();
      navigate({ to: "/" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete your account. Please try again.",
      );
      setDeleting(false);
    }
  };

  const settingCards = [
    {
      id: "saved" as const,
      label: "Saved Posts",
      detail: "Workers, land, products, services",
      icon: Bookmark,
    },
    {
      id: "posts" as const,
      label: "My Posts",
      detail: "Manage all active listings",
      icon: BriefcaseBusiness,
    },
    {
      id: "edit" as const,
      label: "Edit Profile",
      detail: "Name, username, photo, village",
      icon: Settings,
    },
    {
      id: "language" as const,
      label: "Language",
      detail: "Telugu, English, Hindi",
      icon: Languages,
    },
    { id: "theme" as const, label: "Dark Mode", detail: "Comfortable night interface", icon: Moon },
    {
      id: "notifications" as const,
      label: "Notifications",
      detail: "Calls, notices, weather alerts",
      icon: Bell,
    },
    {
      id: "account" as const,
      label: "Account",
      detail: "Sign out or delete account",
      icon: ShieldAlert,
    },
  ];

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your village identity, saved posts, settings, language, and dark mode."
      icon={<UserRound className="size-7" />}
    >
      <SectionHeader
        eyebrow="Village identity"
        title={
          user
            ? `Welcome, ${authProfile?.full_name || user.email?.split("@")[0]}`
            : "Create your ManaOoru profile"
        }
        description="Your profile builds trust across workers, land, marketplace, services, and notices."
        actions={!user && <AppLinkButton to="/auth">Sign in</AppLinkButton>}
      />
      {needsEmailVerification && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Mail className="size-4 shrink-0" />
            <span>Please verify your email address to secure your account.</span>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="shrink-0 rounded-full border border-amber-300 bg-white px-4 py-1.5 text-xs font-semibold text-amber-900 transition hover:border-amber-400 disabled:opacity-60"
          >
            {resendingVerification ? "Sending…" : "Resend email"}
          </button>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <SurfaceCard className="p-6">
          <div className="relative mx-auto grid size-28 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-3xl font-semibold text-white shadow-[var(--shadow-lift)]">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={user?.email || "Profile photo"}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              (authProfile?.full_name || user?.email)?.[0]?.toUpperCase() || "M"
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full border border-white bg-white text-primary shadow-sm"
              aria-label="Update photo"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => chooseProfilePhoto(event.target.files?.[0])}
            />
          </div>
          <div className="mt-6 text-center">
            <h2 className="font-display text-2xl font-semibold text-clay">
              {authProfile?.full_name || user?.email || "Guest villager"}
            </h2>
            {authProfile?.username && (
              <p className="text-sm font-medium text-primary">@{authProfile.username}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{formatVillageProfile(profile)}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted/60 p-4 text-center">
              <p className="font-display text-2xl font-semibold text-clay">{myPosts.length}</p>
              <p className="text-xs text-muted-foreground">My Posts</p>
            </div>
            <div className="rounded-2xl bg-muted/60 p-4 text-center">
              <p className="font-display text-2xl font-semibold text-clay">{saved.length}</p>
              <p className="text-xs text-muted-foreground">Saved Posts</p>
            </div>
          </div>
        </SurfaceCard>
        <div className="grid gap-4 sm:grid-cols-2">
          {settingCards.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePanel(item.id)}
              className="text-left"
            >
              <SurfaceCard
                className={`h-full p-5 ${activePanel === item.id ? "border-primary bg-primary/5" : ""}`}
              >
                <FeatureIcon icon={<item.icon className="size-5" />} />
                <p className="mt-4 font-semibold text-clay">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </SurfaceCard>
            </button>
          ))}
        </div>
      </div>
      <SurfaceCard className="mt-8 p-6">
        {activePanel === "saved" && (
          <>
            <h3 className="font-display text-2xl font-semibold text-clay">Saved posts</h3>
            <div className="mt-4 divide-y divide-border">
              {savedPosts.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No saved posts yet. Use the Save button on workers, land, marketplace, services,
                  and notices.
                </p>
              ) : (
                savedPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-semibold text-clay">{post.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {post.type} · {post.location || "Village"} · {timeAgo(post.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSaved(post)}
                      className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:border-destructive hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {activePanel === "posts" && (
          <>
            <h3 className="font-display text-2xl font-semibold text-clay">My posts</h3>
            <div className="mt-4 divide-y divide-border">
              {myPosts.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  No posts yet.{" "}
                  <Link to="/post-work" className="font-semibold text-primary">
                    Post a requirement
                  </Link>
                  .
                </p>
              ) : (
                myPosts.slice(0, 8).map((post) => (
                  <div key={post.id} className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-semibold text-clay">{post.title}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {post.type}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Live
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        {activePanel === "edit" && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-clay">Edit profile</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-fullname" className="text-sm font-semibold text-foreground">
                  Full name
                </label>
                <input
                  id="edit-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="edit-username" className="text-sm font-semibold text-foreground">
                  Username
                </label>
                <div className="relative mt-1">
                  <input
                    id="edit-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    aria-invalid={usernameState === "taken" || usernameState === "invalid"}
                    className={`w-full rounded-2xl border bg-background px-4 py-3 pr-10 text-sm text-foreground outline-none ${
                      usernameState === "taken" || usernameState === "invalid"
                        ? "border-destructive"
                        : usernameState === "available"
                          ? "border-[#15803d]"
                          : "border-border focus:border-primary"
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameState === "checking" && (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    )}
                    {usernameState === "available" && (
                      <CheckCircle2 className="size-4 text-[#15803d]" />
                    )}
                    {(usernameState === "taken" || usernameState === "invalid") && (
                      <XCircle className="size-4 text-destructive" />
                    )}
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-foreground">Occupation</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {occupations.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setOccupation(item)}
                      className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                        occupation === item
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-foreground">Village</p>
                <div className="mt-2">
                  <VillageLocationPicker
                    value={villageProfile}
                    onChange={setVillageProfile}
                    idPrefix="edit-profile"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {savingProfile && <Loader2 className="size-4 animate-spin" />}
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        )}
        {activePanel === "language" && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-clay">Language</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => changeLanguage(option.code as Language)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                    language === option.code
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {activePanel === "theme" && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-clay">Appearance</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`rounded-2xl border p-4 text-left transition ${
                  !darkMode ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                <Sun className="size-5 text-primary" />
                <p className="mt-3 font-semibold text-clay">Light mode</p>
              </button>
              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`rounded-2xl border p-4 text-left transition ${
                  darkMode ? "border-primary bg-primary/10" : "border-border bg-background"
                }`}
              >
                <Moon className="size-5 text-primary" />
                <p className="mt-3 font-semibold text-clay">Dark mode</p>
              </button>
            </div>
          </div>
        )}
        {activePanel === "notifications" && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-clay">Notifications</h3>
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-clay">Village alerts</p>
                <p className="text-sm text-muted-foreground">
                  Enable notices, saved-post updates, and weather alert reminders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(!notificationsEnabled)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  notificationsEnabled
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground"
                }`}
              >
                {notificationsEnabled ? "On" : "Off"}
              </button>
            </div>
          </div>
        )}
        {activePanel === "account" && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-clay">Account</h3>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-clay">Signed in as</p>
                <p className="text-sm text-muted-foreground">{user?.email || user?.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                <p className="font-display text-lg font-semibold">Danger zone</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Deleting your account permanently removes your profile, posts, complaints, saved
                items, and scheme applications. This cannot be undone.
              </p>
              {deleteStep === "idle" ? (
                <button
                  type="button"
                  onClick={() => setDeleteStep("confirm")}
                  className="mt-4 flex items-center justify-center gap-2 rounded-full border border-destructive bg-white px-5 py-2.5 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" /> Delete my account
                </button>
              ) : (
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-destructive">
                    Are you absolutely sure? This is permanent.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleteStep("idle")}
                      disabled={deleting}
                      className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {deleting && <Loader2 className="size-4 animate-spin" />}
                      {deleting ? "Deleting…" : "Yes, delete permanently"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SurfaceCard>
      <SurfaceCard className="mt-8 p-6">
        <h3 className="font-display text-2xl font-semibold text-clay">Recent contact activity</h3>
        <div className="mt-4 divide-y divide-border">
          {contactLog.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No calls, WhatsApp, chat, or map actions yet.
            </p>
          ) : (
            contactLog.slice(0, 8).map((log, index) => (
              <div
                key={`${log.id}-${log.at}-${index}`}
                className="flex items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-clay">{log.title}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {log.action}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </SurfaceCard>
    </PageLayout>
  );
}
