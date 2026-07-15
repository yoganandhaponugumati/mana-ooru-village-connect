import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  Church,
  Droplets,
  GraduationCap,
  HeartPulse,
  Lightbulb,
  Megaphone,
  PartyPopper,
  Phone,
  Pin,
  Plus,
  School,
} from "lucide-react";
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import {
  AppButton,
  EmptyState,
  FeatureIcon,
  SectionHeader,
  SurfaceCard,
} from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
import { useAuth } from "@/lib/auth";
import { useListings, timeAgo } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Announcements — ManaOoru" }] }),
  component: AnnPage,
});

function AnnPage() {
  const navigate = useNavigate();
  const { items, remove, update } = useListings("announcement");
  const { user, role } = useAuth();
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "announcement");
  const [showForm, setShowForm] = useState(false);
  const canManageNotices = role === "village_admin" || role === "super_admin";

  const handlePostClick = () => {
    if (!user) {
      toast.error("Sign in required to post.");
      navigate({
        to: "/auth",
        search: {
          redirect: window.location.pathname,
          message: "signin_to_post",
        },
      });
      return;
    }
    if (!canManageNotices) {
      toast.error("Only Village Admins or Super Admins can post official notices.");
      return;
    }
    setShowForm((v) => !v);
  };
  const pinnedNotice =
    displayItems.find((item) => item.isPinned) ??
    displayItems.find((item) =>
      /water|urgent|emergency|power|electricity/i.test(`${item.title} ${item.category}`),
    );
  const groupedNotices = displayItems.reduce(
    (groups, item) => {
      if (item.id === pinnedNotice?.id) return groups;
      const ageDays = Math.floor((Date.now() - item.createdAt) / 86400000);
      if (ageDays === 0) groups.today.push(item);
      else if (ageDays === 1) groups.yesterday.push(item);
      else if (ageDays <= 7) groups.lastWeek.push(item);
      else groups.older.push(item);
      return groups;
    },
    {
      today: [] as typeof displayItems,
      yesterday: [] as typeof displayItems,
      lastWeek: [] as typeof displayItems,
      older: [] as typeof displayItems,
    },
  );
  const noticeGroups = [
    ["Today's Updates", groupedNotices.today],
    ["Yesterday", groupedNotices.yesterday],
    ["Last Week", groupedNotices.lastWeek],
    ["Older Notices", groupedNotices.older],
  ] as const;
  return (
    <PageLayout
      title="Village Notice Board"
      subtitle="Panchayat updates, government notices, community alerts."
      icon={<Megaphone className="size-7" />}
    >
      <SectionHeader
        eyebrow="Community alerts"
        title="Stay on top of local updates"
        description="Share important notices and keep everyone informed without friction."
        actions={
          <AppButton
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={handlePostClick}
          >
            {showForm ? "Cancel" : "Post a notice"}
          </AppButton>
        }
      />
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Temple", icon: Church },
          { label: "School", icon: School },
          { label: "Panchayat", icon: Building2 },
          { label: "Government", icon: GraduationCap },
          { label: "Water", icon: Droplets },
          { label: "Electricity", icon: Lightbulb },
          { label: "Medical Camp", icon: HeartPulse },
          { label: "Festival", icon: PartyPopper },
        ].map((item) => (
          <SurfaceCard key={item.label} className="p-4">
            <div className="flex items-center gap-3">
              <FeatureIcon icon={<item.icon className="size-5" />} />
              <div>
                <p className="font-semibold text-clay">{item.label}</p>
                <p className="text-xs text-muted-foreground">Village notice category</p>
              </div>
            </div>
          </SurfaceCard>
        ))}
      </div>
      {showForm && (
        <SurfaceCard className="mb-8 p-6 sm:p-8">
          <ListingForm
            type="announcement"
            title="Notice details"
            redirectTo="/announcements"
            photoLabel="Add notice photo"
            photoHint="Attach a poster, official paper, event image, or place photo when useful."
            fields={[
              {
                name: "title",
                label: "Notice title",
                placeholder: "e.g. Water tank cleaning Sunday",
                required: true,
              },
              {
                name: "category",
                label: "Category",
                placeholder: "",
                options: [
                  "Panchayat",
                  "Agriculture",
                  "Health",
                  "Education",
                  "Water Supply",
                  "Electricity",
                  "Festival",
                  "Gram Sabha",
                  "Health Camp",
                  "School Event",
                  "Emergency",
                ],
                required: true,
              },
              {
                name: "description",
                label: "Details",
                placeholder: "Date, time, who it concerns…",
                textarea: true,
                required: true,
              },
              { name: "location", label: "Location", placeholder: "Where it applies" },
              {
                name: "contact",
                label: "Posted by phone",
                placeholder: "10-digit mobile",
                required: true,
              },
            ]}
          />
        </SurfaceCard>
      )}
      {displayItems.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="size-6" />}
          title="No notices yet"
          description="Post the first announcement so the whole village stays informed."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handlePostClick}
            >
              Post a notice
            </AppButton>
          }
        />
      ) : (
        <div className="space-y-7">
          {pinnedNotice && (
            <SurfaceCard hover={false} className="overflow-hidden border-accent bg-card p-0">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-primary p-6 text-primary-foreground sm:p-8">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                    <Pin className="size-3.5" /> Pinned
                  </span>
                  <p className="mt-7 text-sm font-semibold text-white/70">
                    {pinnedNotice.category || "Village Notice"}
                  </p>
                  <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">
                    {pinnedNotice.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/82">{pinnedNotice.description}</p>
                </div>
                <div className="p-6 sm:p-8">
                  {pinnedNotice.imageUrl && (
                    <img
                      src={pinnedNotice.imageUrl}
                      alt={pinnedNotice.title}
                      className="mb-5 aspect-[16/8] w-full rounded-2xl object-cover"
                    />
                  )}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Date", timeAgo(pinnedNotice.createdAt)],
                      ["Posted by", pinnedNotice.contact],
                      ["Category", pinnedNotice.category || "Notice"],
                      ["Status", pinnedNotice.status === "completed" ? "Completed" : "Active"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl bg-muted/60 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-clay">{value}</p>
                      </div>
                    ))}
                  </div>
                  {canManageNotices && (
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                      <button
                        type="button"
                        onClick={() =>
                          update(pinnedNotice.id, { isPinned: !pinnedNotice.isPinned })
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                      >
                        <Pin className="size-3.5" />
                        {pinnedNotice.isPinned ? "Unpin notice" : "Pin notice"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          update(pinnedNotice.id, {
                            status: pinnedNotice.status === "completed" ? "active" : "completed",
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary"
                      >
                        <CheckCircle2 className="size-3.5" />
                        {pinnedNotice.status === "completed" ? "Mark active" : "Mark completed"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SurfaceCard>
          )}

          {noticeGroups.map(([groupTitle, groupItems]) =>
            groupItems.length > 0 ? (
              <section key={groupTitle}>
                <h3 className="mb-3 font-display text-xl font-semibold text-clay">{groupTitle}</h3>
                <div className="space-y-3">
                  {groupItems.map((a) => (
                    <SurfaceCard
                      key={a.id}
                      hover={false}
                      className="rounded-[1.5rem] border-l-4 border-accent bg-card/95 p-5"
                    >
                      {a.imageUrl && (
                        <img
                          src={a.imageUrl}
                          alt={a.title}
                          className="mb-4 aspect-[16/7] w-full rounded-2xl object-cover"
                        />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
                          {a.category || "Notice"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(a.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold text-clay">
                        {a.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {a.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                            <Phone className="size-3.5" /> {a.contact}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                            <CheckCircle2 className="size-3.5" />{" "}
                            {a.status === "completed" ? "Completed" : "Active"}
                          </span>
                        </div>
                        {(canManageNotices ||
                          a.localOnly ||
                          (!!user && user.id === a.owner_id)) && (
                          <div className="flex flex-wrap items-center gap-3">
                            {canManageNotices && (
                              <>
                                <button
                                  onClick={() => update(a.id, { isPinned: !a.isPinned })}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:text-secondary"
                                >
                                  <Pin className="size-3.5" />
                                  {a.isPinned ? "Unpin" : "Pin"}
                                </button>
                                <button
                                  onClick={() =>
                                    update(a.id, {
                                      status: a.status === "completed" ? "active" : "completed",
                                    })
                                  }
                                  className="text-xs font-semibold text-primary transition hover:text-secondary"
                                >
                                  {a.status === "completed" ? "Mark active" : "Complete"}
                                </button>
                              </>
                            )}
                            {(a.localOnly || (!!user && user.id === a.owner_id)) && (
                              <button
                                onClick={() => remove(a.id)}
                                className="text-xs font-semibold text-muted-foreground transition hover:text-destructive"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </SurfaceCard>
                  ))}
                </div>
              </section>
            ) : null,
          )}
        </div>
      )}
    </PageLayout>
  );
}
