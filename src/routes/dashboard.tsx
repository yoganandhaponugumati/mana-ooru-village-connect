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
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  Store,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DealerApprovalList } from "@/components/DealerApprovalList";
import { PageLayout } from "@/components/PageLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  AppLinkButton,
  Card3D,
  FeatureIcon,
  SectionHeader,
  SurfaceCard,
} from "@/components/design-system";
import { useAuth } from "@/lib/auth";
import { subscribeToPush } from "@/lib/push-notifications";
import { timeAgo, useListingStats } from "@/lib/store";
import { getRoleDisplayName } from "@/lib/supabase/auth";
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
  const { role: authRole, user, profile: authProfile } = useAuth();
  const pushAttemptedForUserRef = useRef<string | null>(null);
  const { profile, weather } = useVillagePreferences();
  const isSuper = authRole === "super_admin";
  const { data: stats } = useListingStats(
    isSuper
      ? undefined
      : {
          villageId: authProfile?.village_id,
          villageName: profile?.village || authProfile?.village,
        },
  );
  const role = authRole ?? "citizen";

  const roleTitle = (() => {
    switch (role) {
      case "super_admin":
        return "Platform Admin Dashboard";
      case "village_admin":
        return "Village Admin Dashboard";
      case "dealer":
        return "Dealer Dashboard";
      case "citizen":
      default:
        return "Citizen Dashboard";
    }
  })();

  const roleDescription = (() => {
    switch (role) {
      case "super_admin":
        return "Supervise platform health, village onboarding, dealer approvals, and cross-district activity.";
      case "village_admin":
        return `Operate complaints, notices, works, dealer approvals, and alerts for ${formatVillageProfile(profile)}.`;
      case "dealer":
        return `Manage your shop, upload products, publish offers, and track enquiries${authProfile?.shop_name ? ` for ${authProfile.shop_name}` : ""}.`;
      case "citizen":
      default:
        return "Track complaints, services, marketplace activity, and important community updates.";
    }
  })();

  const roleTasks = (() => {
    switch (role) {
      case "super_admin":
        return [
          "Approve village administrators and manage dealer applications.",
          "Monitor platform-wide complaints, notices, and live activity.",
          "Publish global announcements and enforce platform safety.",
        ];
      case "village_admin":
        return [
          "Review and update citizen complaints for your village.",
          "Approve dealer applications and verify local businesses.",
          "Publish official notices, works, and local alerts.",
        ];
      case "dealer":
        return [
          "Keep your shop profile, products, and stock up to date.",
          "Publish offers and respond to customer enquiries.",
          "Track your shop analytics and growth.",
        ];
      case "citizen":
      default:
        return [
          "Post work requests, find services, and hire trusted workers.",
          "Browse marketplace listings, land offers, and community updates.",
          "Report issues, join village conversations, and stay informed.",
        ];
    }
  })();

  const metrics = [
    { label: "Workers Available", value: stats?.workers ?? 0, icon: Users },
    { label: "Land Listings", value: stats?.land ?? 0, icon: LandPlot },
    { label: "Services", value: stats?.byType.service ?? 0, icon: Wrench },
    { label: "Marketplace Products", value: stats?.byType.market ?? 0, icon: ShoppingBasket },
    { label: "Trusted Users", value: stats?.villagers ?? 0, icon: BarChart3 },
  ];
  const dashboardWeatherText =
    weather.live && weather.temp !== null
      ? `${weather.temp}°C, ${weather.condition}. ${weather.rain}. Wind ${weather.wind ?? "--"} km/h.`
      : "Live weather is unavailable right now. Select or confirm your village on the Weather page.";

  useEffect(() => {
    if (!user || pushAttemptedForUserRef.current === user.id) return;
    pushAttemptedForUserRef.current = user.id;
    void subscribeToPush("dashboard").catch((error) => {
      console.error("[Push] Dashboard subscription failed:", error);
      pushAttemptedForUserRef.current = null;
    });
  }, [user]);

  return (
    <PageLayout
      title={roleTitle}
      subtitle="A clean home for village activity, notices, weather, and postings."
      icon={<Activity className="size-7" />}
    >
      <SectionHeader
        eyebrow={role === "citizen" ? "Overview" : role === "dealer" ? "Shop" : "Operations"}
        title={
          role === "super_admin"
            ? "Platform-wide controls"
            : role === "village_admin"
              ? "Manage public services"
              : role === "dealer"
                ? "Your shop at a glance"
                : "Everything happening in your village"
        }
        description={roleDescription}
        actions={
          role === "citizen" ? (
            <AppLinkButton to="/timeline" icon={<Activity className="size-4" />}>
              Open timeline
            </AppLinkButton>
          ) : role === "village_admin" ? (
            <AppLinkButton to="/official" icon={<Megaphone className="size-4" />}>
              Official workspace
            </AppLinkButton>
          ) : role === "dealer" ? (
            <AppLinkButton to="/marketplace" icon={<Store className="size-4" />}>
              View marketplace
            </AppLinkButton>
          ) : (
            <AppLinkButton to="/profile" icon={<UserCog className="size-4" />}>
              Review operators
            </AppLinkButton>
          )
        }
      />

      {/* ── Role hero card ── */}
      <SurfaceCard className="dashboard-hero-card mb-8 overflow-hidden p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Your role
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-clay">{getRoleDisplayName(role)}</h3>
            {role === "dealer" && authProfile?.dealer_status && (
              <span
                className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold ${
                  authProfile.dealer_status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : authProfile.dealer_status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {authProfile.dealer_status === "approved"
                  ? "✓ Approved"
                  : authProfile.dealer_status === "pending"
                    ? "⏳ Pending Approval"
                    : `⚠ ${authProfile.dealer_status}`}
              </span>
            )}
            {role === "village_admin" && authProfile?.designation && (
              <p className="mt-1 text-sm text-primary font-medium">
                Designation: {authProfile.designation}
              </p>
            )}
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
              {role === "super_admin"
                ? "You have full access to all villages, users, dealers, and platform settings."
                : role === "village_admin"
                  ? "You can manage village complaints, approve dealers, update local works, and share official announcements."
                  : role === "dealer"
                    ? "You can manage your shop profile, upload products, publish offers, and track enquiries."
                    : "You can browse village listings, post work requests, and stay updated on community activity."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roleTasks.map((task) => (
              <div
                key={task}
                className="rounded-3xl border border-white/70 bg-white/62 p-4 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl"
              >
                {task}
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      {/* ── Role-specific action cards ── */}
      {role === "super_admin" && <SuperAdminActions />}
      {role === "village_admin" && <VillageAdminActions />}
      {role === "dealer" && <DealerActions />}
      {role === "citizen" && <CitizenActions />}

      {/* ── Dealer approvals section (for admins) ── */}
      {(role === "super_admin" || role === "village_admin") && (
        <div className="mt-8">
          <SectionHeader
            eyebrow="Dealer Management"
            title="Dealer Applications"
            description="Review and manage dealer registrations."
          />
          <DealerApprovalSection />
        </div>
      )}

      {/* ── Metrics ── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <Card3D key={metric.label} intensity={8}>
            <SurfaceCard className="dashboard-metric-card h-full p-5" hover={false}>
              <div style={{ transform: "translateZ(20px)" }} className="flex flex-col h-full">
                <FeatureIcon icon={<metric.icon className="size-5" />} />
                <p className="mt-5 font-display text-3xl font-semibold text-clay">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
            </SurfaceCard>
          </Card3D>
        ))}
      </div>

      {/* ── Activity & Weather ── */}
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
                      : (item.type as string) === "complaint" || (item.type as string) === "problem"
                        ? "/problems"
                        : item.type === "market"
                          ? "/marketplace"
                          : item.type === "land"
                            ? "/land"
                            : item.type === "service"
                              ? "/services"
                              : "/workers"
                  }
                  className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/66 p-4 shadow-sm backdrop-blur-xl transition hover:border-primary/40 hover:bg-primary/5"
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
          <SurfaceCard className="dashboard-weather-card overflow-hidden bg-primary p-6 text-primary-foreground">
            <CloudSun className="size-8" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Live weather</h3>
            <p className="mt-2 text-sm leading-7 text-white/80">{dashboardWeatherText}</p>
            <Link
              to="/weather"
              className="mt-5 inline-flex rounded-[15px] bg-white/14 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/22"
            >
              Open weather
            </Link>
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
                ...(role === "citizen"
                  ? [{ label: "Become a Dealer", to: "/dealer-registration", icon: Store }]
                  : []),
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 rounded-full border border-white/70 bg-white/58 px-4 py-3 text-sm font-semibold text-clay shadow-sm backdrop-blur-xl transition hover:border-primary hover:text-primary"
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

// ── Role-specific action card sections ──────────────────────────────────────

function SuperAdminActions() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {[
        {
          label: "Manage Users & Admins",
          detail: "Review operator accounts, assign village admins, and manage all user roles.",
          icon: UserCog,
          to: "/official",
        },
        {
          label: "Monitor All Villages",
          detail:
            "Watch activity volume, listings, services, and notices across the entire platform.",
          icon: BarChart3,
          to: "/dashboard",
        },
        {
          label: "Platform Announcements",
          detail: "Publish global guidance, moderation policy, and critical service updates.",
          icon: Megaphone,
          to: "/announcements",
        },
      ].map((item) => (
        <Card3D key={item.label} intensity={8}>
          <Link
            to={item.to}
            className="premium-need-card block h-full rounded-[20px] p-5 transition hover:border-primary/50 hover:shadow-[var(--shadow-soft)]"
          >
            <div style={{ transform: "translateZ(15px)" }}>
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <p className="mt-4 font-display text-lg font-semibold text-clay">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          </Link>
        </Card3D>
      ))}
    </div>
  );
}

function VillageAdminActions() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {[
        {
          label: "Update Complaints",
          detail: "Review citizen complaints and publish status updates for resolution.",
          icon: ShieldCheck,
          to: "/official",
        },
        {
          label: "Manage Works & Notices",
          detail: "Post government works with progress photos for public transparency.",
          icon: Megaphone,
          to: "/official",
        },
        {
          label: "Village Support",
          detail: "Track contact issues, duplicate listings, and urgent requests for your village.",
          icon: CheckCircle2,
          to: "/services",
        },
      ].map((item) => (
        <Card3D key={item.label} intensity={8}>
          <Link
            to={item.to}
            className="premium-need-card block h-full rounded-[20px] p-5 transition hover:border-primary/50 hover:shadow-[var(--shadow-soft)]"
          >
            <div style={{ transform: "translateZ(15px)" }}>
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <p className="mt-4 font-display text-lg font-semibold text-clay">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          </Link>
        </Card3D>
      ))}
    </div>
  );
}

function DealerActions() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {[
        {
          label: "Manage Shop Profile",
          detail: "Update your shop name, address, description, and contact details.",
          icon: Store,
          to: "/profile",
        },
        {
          label: "Products & Stock",
          detail: "Upload products, manage inventory, and keep stock levels accurate.",
          icon: ShoppingBag,
          to: "/marketplace",
        },
        {
          label: "Publish Offers",
          detail: "Create special deals and seasonal promotions for your customers.",
          icon: Megaphone,
          to: "/marketplace",
        },
      ].map((item) => (
        <Card3D key={item.label} intensity={8}>
          <Link
            to={item.to}
            className="premium-need-card block h-full rounded-[20px] p-5 transition hover:border-primary/50 hover:shadow-[var(--shadow-soft)]"
          >
            <div style={{ transform: "translateZ(15px)" }}>
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <p className="mt-4 font-display text-lg font-semibold text-clay">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          </Link>
        </Card3D>
      ))}
    </div>
  );
}

function CitizenActions() {
  return null; // Citizens get quick actions in the sidebar already
}

function DealerApprovalSection() {
  const [tab, setTab] = useState<"pending" | "approved" | "all">("pending");
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["pending", "approved", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tab === t
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "pending" ? "Pending" : t === "approved" ? "Approved" : "All"}
          </button>
        ))}
      </div>
      <DealerApprovalList statusFilter={tab} />
    </div>
  );
}
