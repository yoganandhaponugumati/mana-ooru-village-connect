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
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLinkButton, FeatureIcon, SectionHeader, SurfaceCard } from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { timeAgo, useListingStats } from "@/lib/store";
import { formatVillageProfile, useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - ManaOoru" }] }),
  component: () => (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
});

function DashboardPage() {
  const { role: authRole } = useAuth();
  const { profile } = useVillagePreferences();
  const { data: stats } = useListingStats();
  const role = authRole ?? "citizen";
  const roleTitle =
    role === "super_admin"
      ? "App operations dashboard"
      : role === "village_admin"
        ? "Village admin dashboard"
        : "Citizen dashboard";
  const roleDescription =
    role === "super_admin"
      ? "Supervise platform health, village onboarding, admin approval, and cross-district activity."
      : role === "village_admin"
        ? `Operate complaints, notices, works, and alerts for ${formatVillageProfile(profile)}.`
        : "Track complaints, services, marketplace activity, and important community updates.";

  const roleTasks =
    role === "super_admin"
      ? [
          "Approve village administrators and oversee onboarding.",
          "Monitor platform-wide complaints, notices, and live activity.",
          "Publish global announcements and enforce platform safety.",
        ]
      : role === "village_admin"
        ? [
            "Review and update citizen complaints for your village.",
            "Publish official notices, works, and local alerts.",
            "Keep village services, listings, and assignments current.",
          ]
        : [
            "Post work requests, find services, and hire trusted workers.",
            "Browse marketplace listings, land offers, and community updates.",
            "Report issues, join village conversations, and stay informed.",
          ];

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
        eyebrow={role === "citizen" ? "Overview" : "Operations"}
        title={
          role === "super_admin"
            ? "Platform-wide controls"
            : role === "village_admin"
              ? "Manage public services"
              : "Everything happening in your village"
        }
        description={roleDescription}
        actions={
          role === "citizen" ? (
            <AppLinkButton to="/post-work" icon={<Plus className="size-4" />}>
              Post requirement
            </AppLinkButton>
          ) : role === "village_admin" ? (
            <AppLinkButton to="/official" icon={<Megaphone className="size-4" />}>
              Official workspace
            </AppLinkButton>
          ) : (
            <AppLinkButton to="/profile" icon={<UserCog className="size-4" />}>
              Review operators
            </AppLinkButton>
          )
        }
      />
      <SurfaceCard className="mb-8 p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Your role</p>
            <h3 className="mt-2 text-2xl font-semibold text-clay capitalize">{role.replace("_", " ")}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {role === "super_admin"
                ? "You can manage platform operations, approve village admins, and publish global notices."
                : role === "village_admin"
                  ? "You can manage village complaints, update local works, and share official announcements."
                  : "You can browse village listings, post work requests, and stay updated on community activity."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roleTasks.map((task) => (
              <div key={task} className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                {task}
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>
      {role !== "citizen" && (
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {(role === "village_admin"
            ? [
                {
                  label: "Update complaints",
                  detail: "Review citizen complaints and publish status updates for resolution.",
                  icon: ShieldCheck,
                  to: "/official",
                },
                {
                  label: "Upload work photos",
                  detail: "Post government works with progress photos for public transparency.",
                  icon: Megaphone,
                  to: "/official",
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
                  label: role === "super_admin" ? "Approve village admins" : "Manage profile",
                  detail:
                    role === "super_admin"
                      ? "Review operator accounts and assign responsibility village by village."
                      : "Keep your local services, products, and contact information current.",
                  icon: UserCog,
                  to: role === "super_admin" ? "/official" : "/profile",
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
