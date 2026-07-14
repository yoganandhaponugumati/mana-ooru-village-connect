import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Church,
  CloudRain,
  Droplets,
  Flag,
  GraduationCap,
  Hammer,
  Heart,
  HeartPulse,
  Landmark,
  Lightbulb,
  MapPin,
  Megaphone,
  MessageCircle,
  Pin,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
  ThumbsUp,
  Tractor,
  Users,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageLayout } from "@/components/PageLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppButton, EmptyState, SectionHeader, SurfaceCard } from "@/components/design-system";
import { supabase } from "@/integrations/supabase/client";
import { fallbackListings } from "@/lib/app-data";
import { useAuth } from "@/lib/auth";
import { useGovernmentWorks } from "@/lib/government-works";
import { useSavedItems } from "@/lib/local-actions";
import { type Listing, timeAgo, useListings } from "@/lib/store";
import { formatVillageProfile, useVillagePreferences } from "@/lib/village-preferences";

type TimelineType =
  | "government_work"
  | "announcement"
  | "complaint"
  | "complaint_resolved"
  | "marketplace"
  | "worker"
  | "service"
  | "village_shop"
  | "festival"
  | "emergency"
  | "lost_found"
  | "agriculture"
  | "weather_alert"
  | "meeting"
  | "event"
  | "education"
  | "healthcare"
  | "volunteer"
  | "road_work"
  | "water"
  | "electricity"
  | "temple"
  | "general_update";

type TimelineActivity = {
  id: string;
  type: TimelineType;
  title: string;
  body: string;
  village: string;
  author: string;
  createdAt: number;
  href: string;
  imageUrl?: string;
  isPinned?: boolean;
  isEmergency?: boolean;
  verified?: boolean;
  source?: string;
};

type TimelineRow = {
  id: string;
  activity_type: TimelineType;
  title: string;
  body: string | null;
  image_url: string | null;
  action_url: string | null;
  author_id: string | null;
  is_pinned: boolean | null;
  is_emergency: boolean | null;
  verified: boolean | null;
  created_at: string;
  source_table: string;
  villages?: { name: string | null } | null;
  profiles?: { username: string | null; full_name: string | null } | null;
};

const shopCategories = new Set([
  "Kirana",
  "Medical",
  "Bakery",
  "Hotel",
  "Tea Stall",
  "Mobile Shop",
  "Hardware",
  "Fertilizer",
  "Seeds",
  "Dairy",
]);

const activityMeta: Record<
  TimelineType,
  { label: string; icon: typeof Bell; tone: string; glow: string }
> = {
  government_work: {
    label: "Government Work",
    icon: Landmark,
    tone: "bg-emerald-100 text-emerald-800",
    glow: "from-emerald-500/20",
  },
  announcement: {
    label: "Announcement",
    icon: Megaphone,
    tone: "bg-sky-100 text-sky-800",
    glow: "from-sky-500/20",
  },
  complaint: {
    label: "Complaint",
    icon: AlertTriangle,
    tone: "bg-amber-100 text-amber-800",
    glow: "from-amber-500/20",
  },
  complaint_resolved: {
    label: "Complaint Resolved",
    icon: CheckCircle2,
    tone: "bg-green-100 text-green-800",
    glow: "from-green-500/20",
  },
  marketplace: {
    label: "Marketplace",
    icon: ShoppingBasket,
    tone: "bg-lime-100 text-lime-800",
    glow: "from-lime-500/20",
  },
  worker: {
    label: "Worker",
    icon: Users,
    tone: "bg-teal-100 text-teal-800",
    glow: "from-teal-500/20",
  },
  service: {
    label: "Service",
    icon: Wrench,
    tone: "bg-cyan-100 text-cyan-800",
    glow: "from-cyan-500/20",
  },
  village_shop: {
    label: "Village Shop",
    icon: Store,
    tone: "bg-orange-100 text-orange-800",
    glow: "from-orange-500/20",
  },
  festival: {
    label: "Festival",
    icon: Church,
    tone: "bg-fuchsia-100 text-fuchsia-800",
    glow: "from-fuchsia-500/20",
  },
  emergency: {
    label: "Emergency",
    icon: AlertTriangle,
    tone: "bg-red-100 text-red-800",
    glow: "from-red-500/20",
  },
  lost_found: {
    label: "Lost & Found",
    icon: Flag,
    tone: "bg-violet-100 text-violet-800",
    glow: "from-violet-500/20",
  },
  agriculture: {
    label: "Agriculture",
    icon: Tractor,
    tone: "bg-green-100 text-green-800",
    glow: "from-green-500/20",
  },
  weather_alert: {
    label: "Weather Alert",
    icon: CloudRain,
    tone: "bg-blue-100 text-blue-800",
    glow: "from-blue-500/20",
  },
  meeting: {
    label: "Meeting",
    icon: CalendarDays,
    tone: "bg-indigo-100 text-indigo-800",
    glow: "from-indigo-500/20",
  },
  event: {
    label: "Event",
    icon: Sparkles,
    tone: "bg-purple-100 text-purple-800",
    glow: "from-purple-500/20",
  },
  education: {
    label: "Education",
    icon: GraduationCap,
    tone: "bg-yellow-100 text-yellow-800",
    glow: "from-yellow-500/20",
  },
  healthcare: {
    label: "Healthcare",
    icon: HeartPulse,
    tone: "bg-rose-100 text-rose-800",
    glow: "from-rose-500/20",
  },
  volunteer: {
    label: "Volunteer",
    icon: Heart,
    tone: "bg-pink-100 text-pink-800",
    glow: "from-pink-500/20",
  },
  road_work: {
    label: "Road Work",
    icon: Hammer,
    tone: "bg-stone-100 text-stone-800",
    glow: "from-stone-500/20",
  },
  water: {
    label: "Water",
    icon: Droplets,
    tone: "bg-cyan-100 text-cyan-800",
    glow: "from-cyan-500/20",
  },
  electricity: {
    label: "Electricity",
    icon: Lightbulb,
    tone: "bg-amber-100 text-amber-800",
    glow: "from-amber-500/20",
  },
  temple: {
    label: "Temple",
    icon: Church,
    tone: "bg-orange-100 text-orange-800",
    glow: "from-orange-500/20",
  },
  general_update: {
    label: "General Update",
    icon: Bell,
    tone: "bg-slate-100 text-slate-800",
    glow: "from-slate-500/20",
  },
};

const filters = [
  "Today",
  "Government",
  "Complaints",
  "Workers",
  "Marketplace",
  "Services",
  "Emergency",
  "Festivals",
  "Agriculture",
  "Shops",
  "Events",
  "Health",
  "Education",
] as const;

const historyFilters = ["This Month", "Last Month", "Last Year"] as const;

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title: "Village Timeline - ManaOoru" }] }),
  component: () => (
    <ProtectedRoute>
      <TimelinePage />
    </ProtectedRoute>
  ),
});

function inferType(item: Listing): TimelineType {
  const text = `${item.title} ${item.description} ${item.category}`.toLowerCase();
  if (item.type === "worker") return "worker";
  if (item.type === "market") return "marketplace";
  if (item.type === "complaint")
    return item.status === "resolved" ? "complaint_resolved" : "complaint";
  if (item.type === "service")
    return shopCategories.has(item.category || "") ? "village_shop" : "service";
  if (item.type === "announcement") {
    if (/emergency|urgent|danger|missing|flood|failure/i.test(text)) return "emergency";
    if (/water|tank|drainage/i.test(text)) return "water";
    if (/power|electricity|current|streetlight/i.test(text)) return "electricity";
    if (/temple|festival|jatara/i.test(text)) return "temple";
    if (/school|holiday|education|exam/i.test(text)) return "education";
    if (/health|camp|vaccination|blood/i.test(text)) return "healthcare";
    if (/meeting|gram sabha/i.test(text)) return "meeting";
    return "announcement";
  }
  return "general_update";
}

function listingVerb(item: Listing, type: TimelineType) {
  if (type === "village_shop") return "New shop opened";
  if (type === "worker") return "Worker available";
  if (type === "marketplace") return "Marketplace item added";
  if (type === "complaint_resolved") return "Complaint resolved";
  if (type === "complaint") return "Complaint reported";
  if (type === "service") return "Service registered";
  return item.type === "announcement" ? "Official notice posted" : "Village update";
}

function groupTitle(createdAt: number) {
  const ageDays = Math.floor((Date.now() - createdAt) / 86400000);
  if (ageDays <= 0) return "Today";
  if (ageDays === 1) return "Yesterday";
  if (ageDays <= 7) return "Last Week";
  return "Older";
}

function inHistoryWindow(createdAt: number, filter: (typeof historyFilters)[number]) {
  const date = new Date(createdAt);
  const now = new Date();
  if (filter === "This Month") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (filter === "Last Month") {
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return (
      date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear()
    );
  }
  return date.getFullYear() === now.getFullYear() - 1;
}

function matchesFilter(item: TimelineActivity, filter: (typeof filters)[number]) {
  if (filter === "Today") return groupTitle(item.createdAt) === "Today";
  if (filter === "Government") return item.type === "government_work" || item.verified;
  if (filter === "Complaints")
    return item.type === "complaint" || item.type === "complaint_resolved";
  if (filter === "Workers") return item.type === "worker";
  if (filter === "Marketplace") return item.type === "marketplace";
  if (filter === "Services") return item.type === "service";
  if (filter === "Emergency") return item.isEmergency || item.type === "emergency";
  if (filter === "Festivals") return item.type === "festival" || item.type === "temple";
  if (filter === "Agriculture") return item.type === "agriculture";
  if (filter === "Shops") return item.type === "village_shop";
  if (filter === "Events") return ["event", "meeting", "volunteer"].includes(item.type);
  if (filter === "Health") return item.type === "healthcare";
  if (filter === "Education") return item.type === "education";
  return true;
}

function sameVillage(activity: TimelineActivity, village: string, isSuperAdmin: boolean) {
  if (isSuperAdmin || !village) return true;
  const text = `${activity.village} ${activity.body} ${activity.title}`.toLowerCase();
  return text.includes(village.toLowerCase()) || activity.village === "Your village";
}

function toTimelineActivity(row: TimelineRow, fallbackVillage: string): TimelineActivity {
  return {
    id: row.id,
    type: row.activity_type,
    title: row.title,
    body: row.body || "Village timeline activity updated.",
    village: row.villages?.name || fallbackVillage || "Your village",
    author: row.profiles?.full_name || row.profiles?.username || "Village administration",
    createdAt: new Date(row.created_at).getTime(),
    href: row.action_url || "/timeline",
    imageUrl: row.image_url || undefined,
    isPinned: Boolean(row.is_pinned),
    isEmergency: Boolean(row.is_emergency),
    verified: Boolean(row.verified),
    source: row.source_table,
  };
}

function TimelinePage() {
  const { role, profile: authProfile } = useAuth();
  const { profile, weather } = useVillagePreferences();
  const { items } = useListings();
  const { works } = useGovernmentWorks();
  const { isSaved, toggleSaved } = useSavedItems();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Today");
  const [historyFilter, setHistoryFilter] = useState<(typeof historyFilters)[number]>("This Month");
  const [commentOpen, setCommentOpen] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const villageName = authProfile?.village || profile.village || "";
  const isAdmin = role === "village_admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  const activeVillageId = authProfile?.village_id;

  const timelineQuery = useQuery({
    queryKey: ["timeline-activities", isSuperAdmin ? "all" : activeVillageId || "none"],
    queryFn: async () => {
      let request = supabase
        .from("timeline_activities" as never)
        .select(
          "id,activity_type,title,body,image_url,action_url,author_id,is_pinned,is_emergency,verified,created_at,source_table,villages(name),profiles(username,full_name)",
        )
        .order("is_emergency", { ascending: false })
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      if (!isSuperAdmin && activeVillageId) {
        request = request.eq("village_id", activeVillageId);
      }

      const { data, error } = await request;
      if (error) return [];
      return ((data ?? []) as unknown as TimelineRow[]).map((row) =>
        toTimelineActivity(row, villageName),
      );
    },
    enabled: isSuperAdmin || Boolean(activeVillageId),
  });

  useEffect(() => {
    if (!activeVillageId && !isSuperAdmin) return;

    const channel = supabase
      .channel(`timeline:${isSuperAdmin ? "all" : activeVillageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "timeline_activities",
          ...(isSuperAdmin ? {} : { filter: `village_id=eq.${activeVillageId}` }),
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["timeline-activities"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeVillageId, isSuperAdmin, queryClient]);

  const activities = useMemo<TimelineActivity[]>(() => {
    const officialActivities = timelineQuery.data ?? [];
    const sourceListings = items.length > 0 ? items : fallbackListings;
    const listingActivities = sourceListings.map((item) => {
      const type = inferType(item);
      return {
        id: `listing-${item.id}`,
        type,
        title: `${listingVerb(item, type)}: ${item.title}`,
        body: item.description || item.category || "New village activity was posted.",
        village: item.location || villageName || "Your village",
        author: item.owner_id ? "Village member" : "ManaOoru demo",
        createdAt: item.createdAt,
        href:
          item.type === "announcement"
            ? "/announcements"
            : item.type === "complaint"
              ? "/problems"
              : item.type === "market"
                ? "/marketplace"
                : item.type === "land"
                  ? "/land"
                  : item.type === "service"
                    ? "/services?kind=services"
                    : "/workers",
        imageUrl: item.imageUrl,
        isPinned: item.isPinned,
        isEmergency: type === "emergency",
        verified: item.type === "announcement",
        source: item.type,
      } satisfies TimelineActivity;
    });

    const workActivities = works.map((work) => ({
      id: `work-${work.id}`,
      type: /road/i.test(work.title) ? "road_work" : ("government_work" as const),
      title: `${work.status === "completed" ? "Government work completed" : "Government work update"}: ${work.title}`,
      body: work.description || `${work.department || "Panchayat"} work is ${work.status}.`,
      village: work.location || villageName || "Your village",
      author: "Village administration",
      createdAt: new Date(work.created_at).getTime(),
      href: "/official",
      imageUrl: work.government_work_images?.[0]?.image_url,
      isPinned: work.status === "active",
      isEmergency: false,
      verified: true,
      source: "government_work",
    })) satisfies TimelineActivity[];

    const weatherActivity: TimelineActivity[] =
      weather.live && villageName
        ? [
            {
              id: "weather-live",
              type: /rain|thunder|storm/i.test(`${weather.condition} ${weather.rain}`)
                ? "weather_alert"
                : "general_update",
              title: /rain|thunder|storm/i.test(`${weather.condition} ${weather.rain}`)
                ? "Rain alert for the village"
                : "Live weather updated",
              body: `${weather.condition}. ${weather.rain}. Temperature ${weather.temp ?? "--"}°C.`,
              village: villageName,
              author: "ManaOoru Weather",
              createdAt: Date.now(),
              href: "/weather",
              isEmergency: /heavy|thunder|storm/i.test(`${weather.condition} ${weather.rain}`),
              verified: true,
              source: "weather",
            },
          ]
        : [];

    const fallbackActivities = [...workActivities, ...listingActivities];
    const sourceActivities =
      officialActivities.length > 0 ? officialActivities : fallbackActivities;

    return [...weatherActivity, ...sourceActivities].sort(
      (a, b) =>
        Number(b.isPinned || b.isEmergency) - Number(a.isPinned || a.isEmergency) ||
        b.createdAt - a.createdAt,
    );
  }, [items, timelineQuery.data, villageName, weather, works]);

  const filtered = activities.filter((item) => {
    const searchText =
      `${item.title} ${item.body} ${item.author} ${item.village} ${activityMeta[item.type].label}`.toLowerCase();
    return (
      sameVillage(item, villageName, isSuperAdmin) &&
      matchesFilter(item, activeFilter) &&
      inHistoryWindow(item.createdAt, historyFilter) &&
      (!query.trim() || searchText.includes(query.trim().toLowerCase()))
    );
  });

  const pinned = filtered.filter((item) => item.isPinned || item.isEmergency);
  const regular = filtered.filter((item) => !item.isPinned && !item.isEmergency);
  const groups = ["Today", "Yesterday", "Last Week", "Older"].map((label) => ({
    label,
    items: regular.filter((item) => groupTitle(item.createdAt) === label),
  }));
  const analytics = {
    emergency: filtered.filter((item) => item.isEmergency).length,
    complaints: filtered.filter((item) => item.type === "complaint").length,
    resolved: filtered.filter((item) => item.type === "complaint_resolved").length,
    government: filtered.filter((item) => item.verified).length,
    mostActive:
      Object.entries(
        filtered.reduce<Record<string, number>>((acc, item) => {
          acc[activityMeta[item.type].label] = (acc[activityMeta[item.type].label] || 0) + 1;
          return acc;
        }, {}),
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || "No activity",
  };
  const summary = [
    `${filtered.length} timeline activities in ${villageName || "your selected village"}`,
    `${filtered.filter((item) => item.type === "worker").length} worker updates`,
    `${analytics.resolved} complaints resolved`,
    `${filtered.filter((item) => item.type === "village_shop").length} shop updates`,
    analytics.emergency
      ? `${analytics.emergency} emergency alerts need attention`
      : "No emergency alerts now",
  ];

  const submitComment = (id: string, value: string) => {
    if (!value.trim()) return;
    setComments((prev) => ({ ...prev, [id]: [value.trim(), ...(prev[id] || [])] }));
    toast.success("Comment added");
  };

  return (
    <PageLayout
      title="Village Timeline"
      subtitle="The official live activity history for your village, generated from notices, works, complaints, services, shops, weather, and marketplace updates."
      icon={<ActivityIcon />}
    >
      <SectionHeader
        eyebrow="Official activity center"
        title={villageName ? `${villageName} live timeline` : "Choose a village to personalize"}
        description={`Showing ${isSuperAdmin ? "all villages for super admin review" : formatVillageProfile(profile)}.`}
        actions={
          <AppButton
            icon={<Bell className="size-4" />}
            onClick={() => toast.success("You will receive notifications for followed activity")}
          >
            Follow updates
          </AppButton>
        }
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.72fr]">
        <SurfaceCard className="overflow-hidden p-0">
          <div className="relative min-h-64 bg-[linear-gradient(135deg,#143120,#256b2b_45%,#18a999)] p-6 text-white sm:p-8">
            <motion.div
              className="absolute right-8 top-8 size-28 rounded-full border border-white/25"
              animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.16, 0.45] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-8 right-24 size-16 rounded-full bg-accent/35 blur-xl"
              animate={{ y: [0, -16, 0], x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
                <Sparkles className="size-3.5" /> AI summary
              </span>
              <h3 className="mt-5 font-display text-3xl font-semibold">Today's Village Summary</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {summary.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/14 bg-white/10 p-4 text-sm font-semibold leading-6 backdrop-blur-xl"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SurfaceCard>

        {isAdmin && (
          <SurfaceCard className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
              Admin analytics
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Most active", analytics.mostActive],
                ["Pending complaints", analytics.complaints],
                ["Resolved", analytics.resolved],
                ["Verified posts", analytics.government],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-2 font-display text-xl font-semibold text-clay">{value}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        )}
      </div>

      <SurfaceCard hover={false} className="sticky top-20 z-20 mb-8 p-3 backdrop-blur-2xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-white px-4">
            <Search className="size-4 text-primary" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search date, category, person, shop, festival, work..."
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
            />
          </label>
          <select
            value={historyFilter}
            onChange={(event) => setHistoryFilter(event.target.value as typeof historyFilter)}
            className="min-h-12 rounded-2xl border border-border bg-white px-4 text-sm font-bold text-clay"
          >
            {historyFilters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setActiveFilter("Today")}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-bold text-primary-foreground"
          >
            Today <ChevronDown className="size-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveFilter(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                activeFilter === item
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </SurfaceCard>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="size-6" />}
          title="No timeline activity found"
          description="Try another filter, or post a notice, worker, shop, service, complaint, or marketplace item."
        />
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-primary/0 via-primary/35 to-primary/0 md:block" />

          {pinned.length > 0 && (
            <section className="mb-8 space-y-4">
              <h3 className="ml-0 flex items-center gap-2 font-display text-2xl font-semibold text-clay md:ml-16">
                <Pin className="size-5 text-primary" /> Pinned and emergency
              </h3>
              {pinned.map((item, index) => (
                <TimelineCard
                  key={item.id}
                  item={item}
                  index={index}
                  liked={Boolean(liked[item.id])}
                  saved={isSaved(item.id)}
                  comments={comments[item.id] || []}
                  commentOpen={commentOpen === item.id}
                  onLike={() => setLiked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  onSave={() => toggleSaved({ id: item.id, title: item.title })}
                  onShare={() =>
                    void navigator.clipboard
                      ?.writeText(`${location.origin}${item.href}`)
                      .then(() => toast.success("Timeline link copied"))
                  }
                  onReport={() => toast.success("Report received for review")}
                  onToggleComments={() => setCommentOpen(commentOpen === item.id ? null : item.id)}
                  onComment={submitComment}
                />
              ))}
            </section>
          )}

          {groups.map((group) =>
            group.items.length > 0 ? (
              <section key={group.label} className="mb-8 space-y-4">
                <h3 className="ml-0 font-display text-2xl font-semibold text-clay md:ml-16">
                  {group.label}
                </h3>
                {group.items.map((item, index) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    index={index}
                    liked={Boolean(liked[item.id])}
                    saved={isSaved(item.id)}
                    comments={comments[item.id] || []}
                    commentOpen={commentOpen === item.id}
                    onLike={() => setLiked((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                    onSave={() => toggleSaved({ id: item.id, title: item.title })}
                    onShare={() =>
                      void navigator.clipboard
                        ?.writeText(`${location.origin}${item.href}`)
                        .then(() => toast.success("Timeline link copied"))
                    }
                    onReport={() => toast.success("Report received for review")}
                    onToggleComments={() =>
                      setCommentOpen(commentOpen === item.id ? null : item.id)
                    }
                    onComment={submitComment}
                  />
                ))}
              </section>
            ) : null,
          )}
        </div>
      )}
    </PageLayout>
  );
}

function ActivityIcon() {
  return (
    <motion.span
      animate={{ rotate: [0, -6, 6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex"
    >
      <Bell className="size-7" />
    </motion.span>
  );
}

function TimelineCard({
  item,
  index,
  liked,
  saved,
  comments,
  commentOpen,
  onLike,
  onSave,
  onShare,
  onReport,
  onToggleComments,
  onComment,
}: {
  item: TimelineActivity;
  index: number;
  liked: boolean;
  saved: boolean;
  comments: string[];
  commentOpen: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onReport: () => void;
  onToggleComments: () => void;
  onComment: (id: string, value: string) => void;
}) {
  const meta = activityMeta[item.type];
  const Icon = meta.icon;
  const [draft, setDraft] = useState("");

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.04, 0.24), ease: "easeOut" }}
      className="relative grid gap-4 md:grid-cols-[3rem_1fr]"
    >
      <div className="relative hidden md:block">
        <motion.div
          animate={item.isEmergency ? { scale: [1, 1.12, 1] } : undefined}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
          className={`sticky top-36 grid size-12 place-items-center rounded-2xl ${meta.tone} shadow-sm ring-4 ring-white`}
        >
          <Icon className="size-5" />
        </motion.div>
      </div>
      <SurfaceCard
        hover={false}
        className={`overflow-hidden p-0 ${item.isEmergency ? "border-red-300 shadow-[0_22px_70px_-40px_rgba(220,38,38,0.8)]" : ""}`}
      >
        <div className={`h-1.5 bg-gradient-to-r ${meta.glow} via-primary/30 to-transparent`} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${meta.tone}`}>
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${meta.tone}`}
                  >
                    {meta.label}
                  </span>
                  {item.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                      <ShieldCheck className="size-3" /> Verified
                    </span>
                  )}
                  {(item.isPinned || item.isEmergency) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-red-700">
                      {item.isEmergency ? (
                        <AlertTriangle className="size-3" />
                      ) : (
                        <Pin className="size-3" />
                      )}
                      {item.isEmergency ? "Emergency" : "Pinned"}
                    </span>
                  )}
                </div>
                <h4 className="mt-3 font-display text-xl font-semibold leading-tight text-clay">
                  {item.title}
                </h4>
              </div>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              {timeAgo(item.createdAt)}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.body}</p>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              loading="lazy"
              className="mt-5 aspect-[16/7] w-full rounded-2xl object-cover"
            />
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
              <MapPin className="size-3.5" /> {item.village}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5">
              <Users className="size-3.5" /> {item.author}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
            <div className="flex flex-wrap gap-2">
              <TimelineAction
                active={liked}
                icon={<ThumbsUp className="size-4" />}
                label={liked ? "Liked" : "Like"}
                onClick={onLike}
              />
              <TimelineAction
                icon={<MessageCircle className="size-4" />}
                label={`Comment ${comments.length ? comments.length : ""}`}
                onClick={onToggleComments}
              />
              <TimelineAction
                icon={<Share2 className="size-4" />}
                label="Share"
                onClick={onShare}
              />
              <TimelineAction
                active={saved}
                icon={<Bookmark className="size-4" />}
                label={saved ? "Saved" : "Save"}
                onClick={onSave}
              />
              <TimelineAction
                icon={<Flag className="size-4" />}
                label="Report"
                onClick={onReport}
              />
            </div>
            <a
              href={item.href}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:brightness-110"
            >
              Open <Send className="size-3.5" />
            </a>
          </div>

          <AnimatePresence>
            {commentOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onComment(item.id, draft);
                    setDraft("");
                  }}
                  className="mt-4 flex gap-2 rounded-2xl bg-muted/60 p-2"
                >
                  <input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Add an official comment or public note..."
                    className="min-w-0 flex-1 rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-primary"
                  />
                  <button className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Send className="size-4" />
                  </button>
                </form>
                {comments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {comments.map((comment, commentIndex) => (
                      <p
                        key={`${comment}-${commentIndex}`}
                        className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground"
                      >
                        {comment}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SurfaceCard>
    </motion.article>
  );
}

function TimelineAction({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-white text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
