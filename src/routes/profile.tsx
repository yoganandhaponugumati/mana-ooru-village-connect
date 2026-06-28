import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Camera,
  Languages,
  Moon,
  Settings,
  UserRound,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { AppLinkButton, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { useContactLog, useSavedItems } from "@/lib/local-actions";
import { useListings } from "@/lib/store";
import { formatVillageProfile, useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile - ManaOoru" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const { items } = useListings();
  const { saved } = useSavedItems();
  const contactLog = useContactLog();
  const { profile } = useVillagePreferences();
  const myPosts = items.filter((item) => item.owner_id === user?.id);

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
            {user?.email?.[0]?.toUpperCase() || "M"}
            <button
              className="absolute bottom-0 right-0 grid size-10 place-items-center rounded-full border border-white bg-white text-primary shadow-sm"
              aria-label="Update photo"
            >
              <Camera className="size-4" />
            </button>
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
          {[
            { label: "Saved Posts", detail: "Workers, land, products, services", icon: Bookmark },
            { label: "My Posts", detail: "Manage all active listings", icon: BriefcaseBusiness },
            { label: "Settings", detail: "Notifications and privacy", icon: Settings },
            { label: "Language", detail: "Telugu, English, Hindi", icon: Languages },
            { label: "Dark Mode", detail: "Comfortable night interface", icon: Moon },
            { label: "Notifications", detail: "Calls, notices, weather alerts", icon: Bell },
          ].map((item) => (
            <SurfaceCard key={item.label} className="p-5">
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <p className="mt-4 font-semibold text-clay">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </SurfaceCard>
          ))}
        </div>
      </div>
      <SurfaceCard className="mt-8 p-6">
        <h3 className="font-display text-2xl font-semibold text-clay">Recent posts</h3>
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
            myPosts.slice(0, 5).map((post) => (
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
      </SurfaceCard>
      <SurfaceCard className="mt-8 p-6">
        <h3 className="font-display text-2xl font-semibold text-clay">Recent contact activity</h3>
        <div className="mt-4 divide-y divide-border">
          {contactLog.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">No calls, WhatsApp, chat, or map actions yet.</p>
          ) : (
            contactLog.slice(0, 8).map((log, index) => (
              <div key={`${log.id}-${log.at}-${index}`} className="flex items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold text-clay">{log.title}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{log.action}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(log.at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </SurfaceCard>
    </PageLayout>
  );
}
