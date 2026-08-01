import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Activity,
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
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLinkButton, SurfaceCard } from "@/components/design-system";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
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
  saveVillageProfilePreference,
  useVillagePreferences,
  type Language,
  type VillageProfile,
} from "@/lib/village-preferences";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile - DigiMitra" }] }),
  component: () => (
    <ProtectedRoute dealerMustBeApproved={false}>
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
    "saved" | "posts" | "edit" | "account" | "activity" | null
  >(null);
  
  const togglePanel = (panel: typeof activePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

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

  // Edit-profile form state
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
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (authProfile) {
      setFullName(authProfile.full_name || "");
      setUsername(authProfile.username || "");
      setOccupation((authProfile.occupation as Occupation) || "Other");
      setPhotoPreview(authProfile.photo_url || "");
    }
  }, [authProfile]);

  useEffect(() => {
    if (username === authProfile?.username || username.trim() === "") {
      setUsernameState("idle");
      return;
    }
    const check = async () => {
      setUsernameState("checking");
      try {
        const errorMsg = getUsernameError(username);
        if (errorMsg) {
          setUsernameState("invalid");
          return;
        }
        const available = await isUsernameAvailable(username);
        setUsernameState(available ? "available" : "taken");
      } catch {
        setUsernameState("invalid");
      }
    };
    const timer = setTimeout(check, 500);
    return () => clearTimeout(timer);
  }, [username, authProfile?.username]);

  const compressImage = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const img = new Image();
      const blobUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(blobUrl);
        const MAX_PX = 1000;
        const scale = Math.min(1, MAX_PX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.82
        );
      };
      img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(file); };
      img.src = blobUrl;
    });

  const chooseProfilePhoto = async (file?: File) => {
    if (!file || !user) return;
    
    toast.promise(
      async () => {
        // 1. Auto-compress photo client side
        const compressed = await compressImage(file);
        
        // 2. Show instant preview
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target?.result as string);
        reader.readAsDataURL(compressed);

        // 3. Upload to Supabase Storage
        const uploadResult = await uploadUserFile("profile-images", user.id, compressed);

        // 4. Instant DB update
        const { error } = await supabase
          .from("profiles")
          .update({
            photo_url: uploadResult.url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;

        // 5. Refresh Auth state
        await refreshProfile();
      },
      {
        loading: "Optimizing & updating profile picture...",
        success: "Profile picture updated successfully! ✓",
        error: "Failed to update profile picture."
      }
    );
  };

  const saveProfile = async () => {
    if (!user) return;
    if (usernameState === "taken" || usernameState === "invalid") {
      toast.error("Please choose a valid and available username before saving.");
      return;
    }
    setSavingProfile(true);
    try {
      let finalPhotoUrl = authProfile?.photo_url || null;
      if (photoFile) {
        const uploadResult = await uploadUserFile("profile-images", user.id, photoFile);
        finalPhotoUrl = uploadResult.url;
      }
      const selectedProfile = {
        state: villageProfile.state,
        district: villageProfile.district,
        mandal: villageProfile.mandal,
        village: villageProfile.village,
      };

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim() || null,
          username: username.trim() || null,
          occupation,
          photo_url: finalPhotoUrl,
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
      setActivePanel(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update your profile.";
      toast.error(
        message.toLowerCase().includes("duplicate") ? "That username is already taken." : message,
      );
    } finally {
      setSavingProfile(false);
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
    if (!deletePassword) {
      toast.error("Enter your current password to delete your account.");
      return;
    }
    setDeleting(true);
    try {
      await deleteMyAccount(deletePassword);
      toast.success("Your account has been deleted.");
      await signOut();
      navigate({ to: "/auth" });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not delete your account. Please try again.",
      );
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteNav />
      <main className="pb-24 pt-20 px-4 max-w-lg mx-auto flex-1 w-full">
        {!user && (
        <div className="mb-6 rounded-2xl bg-primary/10 p-5 border border-primary/20 flex flex-col items-center text-center">
          <ShieldAlert className="size-8 text-primary mb-3" />
          <h2 className="font-display font-bold text-lg text-clay">Create your profile</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Your profile builds trust across workers, land, marketplace, and services.</p>
          <AppLinkButton to="/auth" className="w-full">Sign In / Register</AppLinkButton>
        </div>
      )}
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
      <SurfaceCard className="p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-16 bg-primary/10"></div>
        <div className="relative mx-auto mt-4 size-24 rounded-full overflow-hidden border-4 border-card bg-gradient-to-br from-primary to-secondary font-display text-3xl font-semibold text-white shadow-md aspect-square flex items-center justify-center">
          {photoPreview || authProfile?.photo_url ? (
            <img
              src={(photoPreview || authProfile?.photo_url) ?? undefined}
              alt={user?.email || "Profile photo"}
              className="size-full rounded-full object-cover aspect-square"
            />
          ) : (
            (authProfile?.full_name || user?.email)?.[0]?.toUpperCase() || "M"
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 z-10 grid size-8 place-items-center rounded-full border border-white bg-white text-primary shadow-sm hover:bg-muted"
            aria-label="Update photo"
          >
            <Camera className="size-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => chooseProfilePhoto(event.target.files?.[0])}
          />
        </div>
        <div className="mt-4 text-center">
          <h2 className="font-display text-xl font-bold text-clay">
            {authProfile?.full_name || user?.email || "Guest villager"}
          </h2>
          {authProfile?.username && (
            <p className="text-xs font-semibold text-primary/80">@{authProfile.username}</p>
          )}
          <p className="mt-1 text-xs font-medium text-muted-foreground">{formatVillageProfile(profile)}</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 pt-5 border-t border-border">
          <div className="text-center" onClick={() => togglePanel('posts')}>
            <p className="font-display text-lg font-bold text-clay">{myPosts.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">My Posts</p>
          </div>
          <div className="text-center border-l border-border" onClick={() => togglePanel('saved')}>
            <p className="font-display text-lg font-bold text-clay">{saved.length}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saved</p>
          </div>
        </div>
      </SurfaceCard>

      <div className="mt-4 flex flex-col gap-3">
        {/* Instant Settings */}
        <SurfaceCard className="divide-y divide-border/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-secondary/10 text-secondary"><Moon className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">Dark Mode</p>
            </div>
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-secondary/10 text-secondary"><Bell className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">Notifications</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications(!notificationsEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
            >
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${notificationsEnabled ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-secondary/10 text-secondary"><Languages className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">Language</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold outline-none focus:border-primary"
            >
              {languageOptions.map(opt => <option key={opt.code} value={opt.code}>{opt.label}</option>)}
            </select>
          </div>
        </SurfaceCard>

        {/* Expandable Menus */}
        <SurfaceCard className="overflow-hidden">
          <button onClick={() => togglePanel('edit')} className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Settings className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">Edit Profile</p>
            </div>
          </button>
          {activePanel === "edit" && (
            <div className="p-4 border-t border-border/60 bg-muted/20">

            <div className="mt-2 grid gap-4 sm:grid-cols-2">
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
          
          <button onClick={() => togglePanel('saved')} className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Bookmark className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">Saved Posts</p>
            </div>
          </button>
          {activePanel === "saved" && (
            <div className="p-4 border-t border-border/60 bg-muted/20">
              {savedPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved posts yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {savedPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-clay line-clamp-1">{post.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {post.type} · {timeAgo(post.createdAt)}
                        </p>
                      </div>
                      <button onClick={() => toggleSaved(post)} className="text-[10px] font-bold text-destructive">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => togglePanel('posts')} className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><BriefcaseBusiness className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">My Posts</p>
            </div>
          </button>
          {activePanel === "posts" && (
            <div className="p-4 border-t border-border/60 bg-muted/20">
              {myPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No posts yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {myPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-clay line-clamp-1">{post.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{post.type}</p>
                      </div>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Live</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <button onClick={() => togglePanel('activity')} className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-primary"><Activity className="size-4" /></div>
              <p className="text-sm font-semibold text-clay">Recent Activity</p>
            </div>
          </button>
          {activePanel === "activity" && (
            <div className="p-4 border-t border-border/60 bg-muted/20">
              {contactLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                <div className="divide-y divide-border">
                  {contactLog.slice(0, 5).map((log, index) => (
                    <div key={`${log.id}-${log.at}-${index}`} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-sm font-semibold text-clay line-clamp-1">{log.title}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{log.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => togglePanel('account')} className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30 transition border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="grid size-8 place-items-center rounded-full bg-destructive/10 text-destructive"><ShieldAlert className="size-4" /></div>
              <p className="text-sm font-semibold text-destructive">Account Security</p>
            </div>
          </button>
          {activePanel === "account" && (
            <div className="p-4 border-t border-border/60 bg-muted/20">
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
                <div className="mt-4 rounded-2xl border border-destructive/40 bg-white p-4">
                  <p className="text-sm font-semibold text-destructive">
                    This action is permanent and cannot be undone. Are you sure you want to delete
                    your account?
                  </p>
                  <label
                    htmlFor="delete-password"
                    className="mt-4 block text-sm font-semibold text-foreground"
                  >
                    Current password
                  </label>
                  <input
                    id="delete-password"
                    type="password"
                    value={deletePassword}
                    onChange={(event) => setDeletePassword(event.target.value)}
                    className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                    autoComplete="current-password"
                  />
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteStep("idle");
                        setDeletePassword("");
                      }}
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
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
