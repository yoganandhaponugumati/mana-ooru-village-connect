import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Languages,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { AppLinkButton, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { fallbackListings } from "@/lib/app-data";
import {
  useContactLog,
  useNotificationSettings,
  useProfilePhoto,
  useSavedItems,
  useThemePreference,
} from "@/lib/local-actions";
import { timeAgo, useListings } from "@/lib/store";
import {
  formatVillageProfile,
  languageOptions,
  useVillagePreferences,
  type Language,
} from "@/lib/village-preferences";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile - ManaOoru" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { items } = useListings();
  const { saved, toggleSaved } = useSavedItems();
  const contactLog = useContactLog();
  const { profile, language, setLanguage } = useVillagePreferences();
  const { darkMode, setDarkMode } = useThemePreference();
  const { notificationsEnabled, setNotifications } = useNotificationSettings();
  const { photo, setPhoto } = useProfilePhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePanel, setActivePanel] = useState<
    "saved" | "posts" | "settings" | "language" | "theme" | "notifications"
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
  const profileImage = photo || myPosts.find((item) => item.imageUrl)?.imageUrl;

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
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result || ""));
      toast.success("Profile photo updated");
    };
    reader.readAsDataURL(file);
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
      id: "settings" as const,
      label: "Settings",
      detail: "Profile photo and privacy",
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
  ];

  return (
    <PageLayout
      title="Profile"
      subtitle="Manage your village identity, saved posts, settings, language, and dark mode."
      icon={<UserRound className="size-7" />}
    >
      <SectionHeader
        eyebrow="Village identity"
        title={user ? `Welcome, ${user.email?.split("@")[0]}` : "Create your ManaOoru profile"}
        description="Your profile builds trust across workers, land, marketplace, services, and notices."
        actions={!user && <AppLinkButton to="/auth">Sign in</AppLinkButton>}
      />
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <SurfaceCard className="p-6">
          <div className="relative mx-auto grid size-28 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary font-display text-3xl font-semibold text-white shadow-[var(--shadow-lift)]">
            {profileImage ? (
              <img
                src={profileImage}
                alt={user?.email || "Profile photo"}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              user?.email?.[0]?.toUpperCase() || "M"
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
              {user?.email || "Guest villager"}
            </h2>
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
        {activePanel === "settings" && (
          <div>
            <h3 className="font-display text-2xl font-semibold text-clay">Settings</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-2xl border border-border bg-background p-4 text-left transition hover:border-primary"
              >
                <Camera className="size-5 text-primary" />
                <p className="mt-3 font-semibold text-clay">Update profile photo</p>
                <p className="text-sm text-muted-foreground">Use any photo under 2 MB.</p>
              </button>
              <button
                type="button"
                onClick={() => toast.success("Privacy settings saved")}
                className="rounded-2xl border border-border bg-background p-4 text-left transition hover:border-primary"
              >
                <CheckCircle2 className="size-5 text-primary" />
                <p className="mt-3 font-semibold text-clay">Privacy</p>
                <p className="text-sm text-muted-foreground">
                  Your phone is shown only on listings.
                </p>
              </button>
            </div>
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
                  onClick={() => setLanguage(option.code as Language)}
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
