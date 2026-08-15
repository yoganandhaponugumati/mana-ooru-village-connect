import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CheckCheck,
  Trash2,
  Megaphone,
  AlertTriangle,
  Camera,
  Vote,
  Zap,
  Info,
  ArrowLeft,
  BellOff,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useNotifications, type AppNotification } from "@/lib/notifications";
import { useAuth } from "@/lib/auth";
import { timeAgo } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GramMitra" },
      { name: "description", content: "All your village notifications — stories, complaints, announcements, polls, and alerts." },
    ],
  }),
  component: NotificationsPage,
});

type NotifFilter = "all" | "story" | "complaint" | "announcement" | "poll" | "system";

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  story: {
    icon: Camera,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-950/50",
    label: "Story",
  },
  complaint: {
    icon: AlertTriangle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-950/50",
    label: "Problem",
  },
  announcement: {
    icon: Megaphone,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
    label: "Notice",
  },
  poll: {
    icon: Vote,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-950/50",
    label: "Poll",
  },
  system: {
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-950/50",
    label: "System",
  },
};

function getTypeConfig(type: string) {
  return typeConfig[type] ?? {
    icon: Info,
    color: "text-zinc-500",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    label: "Alert",
  };
}

const filterTabs: { key: NotifFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "story", label: "Stories" },
  { key: "complaint", label: "Problems" },
  { key: "announcement", label: "Notices" },
  { key: "poll", label: "Polls" },
  { key: "system", label: "System" },
];

function NotificationCard({ item, onMarkRead, onDelete }: {
  item: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const cfg = getTypeConfig(item.type);
  const Icon = cfg.icon;

  const handleClick = () => {
    onMarkRead(item.id);
    if (item.action_url) {
      navigate({ to: item.action_url as any });
    }
  };

  return (
    <div
      className={`group relative flex gap-3 rounded-2xl border p-4 transition-all cursor-pointer select-none ${
        item.read_at
          ? "border-border bg-card opacity-70"
          : "border-primary/20 bg-primary/5 dark:bg-primary/10 shadow-sm"
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Unread dot */}
      {!item.read_at && (
        <span className="absolute top-4 right-4 size-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
      )}

      {/* Type Icon */}
      <div className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${cfg.bg}`}>
        <Icon className={`size-5 ${cfg.color}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pr-4">
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
            {cfg.label}
          </span>
          <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
            {timeAgo(new Date(item.created_at).getTime())}
          </span>
        </div>
        <p className="mt-1.5 text-sm font-bold text-foreground leading-snug line-clamp-1">
          {item.title}
        </p>
        {item.body && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.body}
          </p>
        )}
      </div>

      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(item.id);
        }}
        className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        aria-label="Delete notification"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markRead, markAllRead, deleteNotification, clearAll } =
    useNotifications();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<NotifFilter>("all");

  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 bg-background">
        <div className="grid size-20 place-items-center rounded-3xl bg-primary/10 text-primary">
          <Bell className="size-10" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-clay dark:text-zinc-100">
            Sign in for Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Get alerts for village stories, civic problems, notices and polls.
          </p>
        </div>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25"
        >
          <Bell className="size-4" /> Sign In to Continue
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 pt-16">
      {/* Header */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: "/" })}
                className="grid size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary transition"
                aria-label="Go back"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h1 className="font-display text-lg font-extrabold text-clay dark:text-zinc-100 leading-tight">
                  Notifications
                </h1>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All caught up ✓"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => clearAll()}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:border-destructive hover:text-destructive transition"
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <Filter className="size-3.5 text-muted-foreground shrink-0 mt-1.5 ml-0.5" />
            {filterTabs.map((tab) => {
              const count =
                tab.key === "all"
                  ? notifications.length
                  : notifications.filter((n) => n.type === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                    activeFilter === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 text-[9px] font-black ${
                      activeFilter === tab.key
                        ? "bg-white/25 text-white"
                        : "bg-border text-muted-foreground"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-muted/50"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="grid size-20 place-items-center rounded-3xl bg-muted text-muted-foreground">
              <BellOff className="size-10" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-clay dark:text-zinc-100">
                {activeFilter === "all" ? "No notifications yet" : `No ${activeFilter} notifications`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeFilter === "all"
                  ? "You'll get alerts when something happens in your village."
                  : "Try switching to a different filter above."}
              </p>
            </div>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Show all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onMarkRead={(id) => markRead(id)}
                onDelete={(id) => deleteNotification(id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
