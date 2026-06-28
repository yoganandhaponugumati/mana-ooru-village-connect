import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle2,
  CloudSun,
  LandPlot,
  Megaphone,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { AppLinkButton, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { timeAgo, useListingStats } from "@/lib/store";
import { formatVillageProfile, useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - ManaOoru" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { profile: authProfile } = useAuth();
  const { profile } = useVillagePreferences();
  const { data: stats } = useListingStats();
  const role = authProfile?.account_type ?? "villager";
  const roleTitle =
    role === "app_admin"
      ? "App operations dashboard"
      : role === "village_admin"
        ? "Village admin dashboard"
        : "Village dashboard";
  const roleDescription =
    role === "app_admin"
      ? "Supervise platform health, village onboarding, admin approval, and cross-district activity."
      : role === "village_admin"
        ? `Operate notices, listings, support, and verification for ${formatVillageProfile(profile)}.`
        : "Track listings, service demand, marketplace activity, and important community updates.";
  const metrics = [
    { label: "Workers Available", value: stats?.workers ?? 0, icon: Users },
    { label: "Land Listings", value: stats?.land ?? 0, icon: LandPlot },
    { label: "Services", value: stats?.byType.service ?? 0, icon: Wrench },
    { label: "Marketplace Products", value: stats?.byType.market ?? 0, icon: ShoppingBasket },
    { label: "Trusted Users", value: stats?.villagers ?? 0, icon: BarChart3 },
  ];

  return (
    <PageLayout
      title={roleTitle}
      subtitle="A command center for village activity, notices, weather, and postings."
      icon={<Activity className="size-7" />}
    >
      <SectionHeader
        eyebrow={role === "villager" ? "Overview" : "Operations"}
        title={
          role === "app_admin"
            ? "Platform-wide controls"
            : role === "village_admin"
              ? "Manage your village"
              : "Everything happening in your village"
        }
        description={roleDescription}
        actions={
          role === "villager" ? (
            <AppLinkButton to="/post-work" icon={<Plus className="size-4" />}>
              Post requirement
            </AppLinkButton>
          ) : role === "village_admin" ? (
            <AppLinkButton to="/announcements" icon={<Megaphone className="size-4" />}>
              Post village notice
            </AppLinkButton>
          ) : (
            <AppLinkButton to="/profile" icon={<UserCog className="size-4" />}>
              Review operators
            </AppLinkButton>
          )
        }
      />
      {role !== "villager" && (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {(role === "village_admin"
            ? [
                {
                  label: "Verify local posts",
                  detail:
                    "Review new worker, land, market, and service posts before promoting them.",
                  icon: ShieldCheck,
                  to: "/dashboard",
                },
                {
                  label: "Publish notices",
                  detail: "Share official village updates, alerts, events, and scheme information.",
                  icon: Megaphone,
                  to: "/announcements",
                },
                {
                  label: "Village support",
                  detail:
                    "Track contact issues, duplicate listings, and urgent requests for your village.",
                  icon: CheckCircle2,
                  to: "/services",
                },
              ]
            : [
                {
                  label: "Approve village admins",
                  detail: "Review operator accounts and assign responsibility village by village.",
                  icon: UserCog,
                  to: "/profile",
                },
                {
                  label: "Monitor all districts",
                  detail:
                    "Watch activity volume, listings, services, and notices across the platform.",
                  icon: BarChart3,
                  to: "/dashboard",
                },
                {
                  label: "Platform announcements",
                  detail: "Publish global guidance, moderation policy, and service updates.",
                  icon: Megaphone,
                  to: "/announcements",
                },
              ]
          ).map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-[20px] border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-[var(--shadow-soft)]"
            >
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <p className="mt-4 font-display text-lg font-semibold text-clay">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </Link>
          ))}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <SurfaceCard key={metric.label} className="p-5">
            <FeatureIcon icon={<metric.icon className="size-5" />} />
            <p className="mt-5 font-display text-3xl font-semibold text-clay">{metric.value}</p>
            <p className="text-sm text-muted-foreground">{metric.label}</p>
          </SurfaceCard>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard className="p-6">
          <h3 className="font-display text-2xl font-semibold text-clay">Live activity</h3>
          <div className="mt-5 space-y-4">
            {(stats?.recent ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              stats!.recent.map((item) => (
                <Link
                  key={item.id}
                  to={
                    item.type === "announcement"
                      ? "/announcements"
                      : item.type === "market"
                        ? "/marketplace"
                        : item.type === "land"
                          ? "/land"
                          : item.type === "service"
                            ? "/services"
                            : "/workers"
                  }
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-primary/40 hover:bg-primary/5"
                >
                  <FeatureIcon icon={<Bell className="size-5" />} className="size-10 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-clay">{item.title}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {item.type} - {timeAgo(item.createdAt)}
                    </span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </SurfaceCard>
        <div className="space-y-6">
          <SurfaceCard className="bg-primary p-6 text-primary-foreground">
            <CloudSun className="size-8" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Weather alert</h3>
            <p className="mt-2 text-sm leading-7 text-white/80">
              Light rain possible later this week. Plan spraying and harvest work early.
            </p>
          </SurfaceCard>
          <SurfaceCard className="p-6">
            <h3 className="font-display text-2xl font-semibold text-clay">Quick actions</h3>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Find workers", to: "/workers", icon: Users },
                { label: "List land", to: "/land", icon: LandPlot },
                { label: "Sell product", to: "/marketplace", icon: ShoppingBasket },
                { label: "Post notice", to: "/announcements", icon: Megaphone },
                { label: "Offer service", to: "/services", icon: Briefcase },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 rounded-full border border-border px-4 py-3 text-sm font-semibold text-clay transition hover:border-primary hover:text-primary"
                >
                  <item.icon className="size-4" /> {item.label}
                </Link>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageLayout>
  );
}
