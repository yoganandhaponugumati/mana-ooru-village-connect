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
  Phone,
  Pin,
  Plus,
  School,
  Shield,
  ShieldCheck,
  Share2,
  MapPin,
  BadgeIndianRupee,
} from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import {
  AppButton,
  EmptyState,
  FeatureIcon,
  SectionHeader,
  StatusBadge,
  SurfaceCard,
} from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
import { useAuth } from "@/lib/auth";
import { useListings, timeAgo } from "@/lib/store";
import { useGovernmentWorks, type GovernmentWorkInput } from "@/lib/government-works";
import { toast } from "sonner";

export const Route = createFileRoute("/announcements")({
  head: () => ({ meta: [{ title: "Village Notice Board & Sarpanch Pragati — ManaOoru" }] }),
  component: AnnPage,
});

function AnnPage() {
  const navigate = useNavigate();
  const noticeFormRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"notices" | "sarpanch_works">("notices");

  // Notice board data
  const { items, remove, update } = useListings("announcement");
  const { user, role } = useAuth();
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "announcement");
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const canManageNotices = role === "village_admin" || role === "super_admin";

  // Sarpanch Works data
  const { works, loading: worksLoading, createWork } = useGovernmentWorks();
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [workValues, setWorkValues] = useState<Omit<GovernmentWorkInput, "photos">>({
    title: "",
    description: "",
    department: "Gram Panchayat",
    budget: "",
    status: "active",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [workPhotos, setWorkPhotos] = useState<File[]>([]);
  const [submittingWork, setSubmittingWork] = useState(false);

  const handlePostNoticeClick = () => {
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
      toast.error("Only Village Admins or Sarpanch officials can post official notices.");
      return;
    }
    setShowNoticeForm((v) => {
        const next = !v;
        if (next) {
          setTimeout(() => noticeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
        }
        return next;
    });
  };

  const handleWorkSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!workValues.title.trim()) {
      toast.error("Add a clear work title");
      return;
    }
    setSubmittingWork(true);
    try {
      await createWork({ ...workValues, photos: workPhotos });
      toast.success("Sarpanch work update published publicly!");
      setWorkValues({
        title: "",
        description: "",
        department: "Gram Panchayat",
        budget: "",
        status: "active",
        startDate: "",
        endDate: "",
        location: "",
      });
      setWorkPhotos([]);
      setShowWorkForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post work update");
    } finally {
      setSubmittingWork(false);
    }
  };

  const shareToWhatsApp = (title: string, text: string) => {
    const url = window.location.href;
    const msg = `🏛️ *ManaOoru Village Update*\n*${title}*\n${text}\n\nCheck live updates here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
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
      title="Village Notice Board & Sarpanch Pragati"
      subtitle="Public Panchayat announcements, urgent civic alerts, and transparent tracking of all Sarpanch development works."
      icon={<Megaphone className="size-6 text-primary" />}
      heroAction={
        <div className="flex flex-wrap items-center justify-center gap-3">
          {canManageNotices && (
            <button
              type="button"
              onClick={handlePostNoticeClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-primary/30 transition hover:scale-105"
            >
              <Plus className="size-5" />
              <span>{showNoticeForm ? "Hide Notice Form" : "⚡ Post Official Notice +"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setActiveTab("sarpanch_works");
              if (canManageNotices) setShowWorkForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-6 py-4 text-sm font-bold text-primary shadow-sm transition hover:bg-primary/20"
          >
            <Shield className="size-4" />
            <span>{canManageNotices ? "⚡ Add Sarpanch Work Progress +" : "View Sarpanch Pragati Tracker"}</span>
          </button>
        </div>
      }
    >
      {/* Dual Tab Switcher */}
      <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-border/80 pb-5">
        <button
          type="button"
          onClick={() => setActiveTab("notices")}
          className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "notices"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-card text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          }`}
        >
          <Megaphone className="size-4" />
          <span>Village Notice Board</span>
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-extrabold">
            {displayItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sarpanch_works")}
          className={`inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-bold transition-all ${
            activeTab === "sarpanch_works"
              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-card text-muted-foreground hover:bg-primary/10 hover:text-foreground"
          }`}
        >
          <ShieldCheck className="size-4" />
          <span>Sarpanch Pragati (Works Done)</span>
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-extrabold">
            {works.length}
          </span>
        </button>
      </div>

      {activeTab === "notices" ? (
        /* TAB 1: NOTICES BOARD */
        <div>
          <SectionHeader
            eyebrow="Gram Panchayat alerts"
            title="Official & Community Notices"
            description="Stay informed on urgent schedules, meetings, and public alerts. All posts visible to every citizen."
            actions={
              <AppButton
                variant="primary"
                icon={<Plus className="size-4" />}
                onClick={handlePostNoticeClick}
              >
                {showNoticeForm ? "Cancel" : "Post Official Notice"}
              </AppButton>
            }
          />

          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Panchayat Alert", icon: Building2 },
              { label: "Water Supply", icon: Droplets },
              { label: "Power Cut Schedule", icon: Lightbulb },
              { label: "Gram Sabha", icon: ShieldCheck },
              { label: "School & Youth", icon: School },
              { label: "Health Camp", icon: HeartPulse },
              { label: "Festival / Temple", icon: Church },
              { label: "Ration & Schemes", icon: GraduationCap },
            ].map((item) => (
              <SurfaceCard
                key={item.label}
                className="p-4 bg-gradient-to-br from-card to-primary/5 border-primary/10"
              >
                <div className="flex items-center gap-3">
                  <FeatureIcon icon={<item.icon className="size-5 text-primary" />} />
                  <div>
                    <p className="font-semibold text-clay">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">Public notice category</p>
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>

          {showNoticeForm && (
            <div ref={noticeFormRef}>
              <SurfaceCard className="mb-8 p-6 sm:p-8 border-primary/20 ring-2 ring-primary/20">
              <ListingForm
                type="announcement"
                title="Notice details"
                redirectTo="/announcements"
                photoLabel="Add notice photo / poster"
                photoHint="Attach a circular, official letter, event flyer, or location photo when useful."
                fields={[
                  {
                    name: "title",
                    label: "Notice title",
                    placeholder: "e.g. Water tank cleaning Sunday morning",
                    required: true,
                  },
                  {
                    name: "category",
                    label: "Category",
                    placeholder: "",
                    options: [
                      "Panchayat Alert",
                      "Water Supply",
                      "Power Schedule",
                      "Gram Sabha",
                      "Health Camp",
                      "School Event",
                      "Festival",
                      "Emergency",
                    ],
                    required: true,
                  },
                  {
                    name: "description",
                    label: "Details",
                    placeholder: "Exact date, timing, and instructions for villagers...",
                    textarea: true,
                    required: true,
                  },
                  { name: "location", label: "Location", placeholder: "Village / Ward / Street" },
                  {
                    name: "contact",
                    label: "Official contact number",
                    placeholder: "10-digit mobile",
                    required: true,
                  },
                ]}
              />
            </SurfaceCard>
          </div>
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
                  onClick={handlePostNoticeClick}
                >
                  Post Official Notice
                </AppButton>
              }
            />
          ) : (
            <div className="space-y-7">
              {pinnedNotice && (
                <SurfaceCard
                  hover={false}
                  className="overflow-hidden border-2 border-primary bg-card p-0 shadow-lg"
                >
                  <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-6 text-primary-foreground sm:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 text-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wider">
                            <Pin className="size-3.5 fill-slate-950" /> Urgent & Pinned Notice
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold">
                            <ShieldCheck className="size-3 text-emerald-300" /> Verified Panchayat
                          </span>
                        </div>
                        <p className="mt-6 text-sm font-bold text-amber-200">
                          {pinnedNotice.category || "Official Notice"}
                        </p>
                        <h3 className="mt-1 font-display text-3xl font-extrabold leading-tight">
                          {pinnedNotice.title}
                        </h3>
                        <p className="mt-4 text-sm sm:text-base leading-7 text-white/90">
                          {pinnedNotice.description}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            shareToWhatsApp(pinnedNotice.title, pinnedNotice.description || "")
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-white text-primary px-4 py-2 text-xs font-bold transition hover:bg-amber-100"
                        >
                          <Share2 className="size-3.5" /> Share to Village WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="p-6 sm:p-8 flex flex-col justify-between">
                      {pinnedNotice.imageUrl ? (
                        <img
                          src={pinnedNotice.imageUrl}
                          alt={pinnedNotice.title}
                          className="mb-5 aspect-[16/8] w-full rounded-2xl object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="mb-5 aspect-[16/6] w-full rounded-2xl bg-primary/5 flex items-center justify-center border border-dashed border-primary/30">
                          <p className="text-sm font-semibold text-primary">
                            Public Notice Circular
                          </p>
                        </div>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["Date", timeAgo(pinnedNotice.createdAt)],
                          ["Contact", pinnedNotice.contact],
                          ["Category", pinnedNotice.category || "Notice"],
                          [
                            "Status",
                            pinnedNotice.status === "completed" ? "Completed" : "Active Alert",
                          ],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-2xl bg-muted/60 p-3.5">
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
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                          >
                            <Pin className="size-3.5" />
                            {pinnedNotice.isPinned ? "Unpin notice" : "Pin notice"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              update(pinnedNotice.id, {
                                status:
                                  pinnedNotice.status === "completed" ? "active" : "completed",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary"
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
                    <h3 className="mb-4 font-display text-xl font-bold text-clay flex items-center gap-2">
                      <span>{groupTitle}</span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {groupItems.length}
                      </span>
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {groupItems.map((a) => (
                        <SurfaceCard
                          key={a.id}
                          hover={false}
                          className="rounded-[1.5rem] border-l-4 border-primary bg-card/95 p-5 flex flex-col justify-between shadow-sm"
                        >
                          <div>
                            {a.imageUrl && (
                              <img
                                src={a.imageUrl}
                                alt={a.title}
                                className="mb-4 aspect-[16/7] w-full rounded-2xl object-cover"
                              />
                            )}
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                                <ShieldCheck className="size-3" /> {a.category || "Notice"}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground">
                                {timeAgo(a.createdAt)}
                              </span>
                            </div>
                            <h4 className="mt-3 font-display text-lg font-bold text-clay">
                              {a.title}
                            </h4>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                              {a.description}
                            </p>
                          </div>
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
                            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                                <Phone className="size-3" /> {a.contact}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => shareToWhatsApp(a.title, a.description || "")}
                                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                              >
                                <Share2 className="size-3.5" /> Share
                              </button>
                              {(canManageNotices ||
                                a.localOnly ||
                                (!!user && user.id === a.owner_id)) && (
                                <button
                                  type="button"
                                  onClick={() => remove(a.id)}
                                  className="text-xs font-semibold text-red-600 transition hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        </SurfaceCard>
                      ))}
                    </div>
                  </section>
                ) : null,
              )}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: SARPANCH & PANCHAYAT WORKS SHOWCASE (WHAT SARPANCH HAS DONE) */
        <div>
          <SectionHeader
            eyebrow="Mana Panchayat Pragati"
            title="Sarpanch & Village Works Showcase"
            description="Transparent tracking of what our Gram Panchayat and Sarpanch have planned, built, and completed for the community."
            actions={
              canManageNotices ? (
                <AppButton
                  variant="primary"
                  icon={<Plus className="size-4" />}
                  onClick={() => setShowWorkForm((v) => !v)}
                >
                  {showWorkForm ? "Cancel" : "Post Sarpanch Work Update"}
                </AppButton>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck className="size-4" /> 100% Publicly Auditable Works
                </span>
              )
            }
          />

          {showWorkForm && canManageNotices && (
            <SurfaceCard className="mb-8 p-6 sm:p-8 border-2 border-primary/30 bg-gradient-to-br from-card to-primary/5">
              <h3 className="font-display text-xl font-bold text-clay flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" /> Publish New Panchayat Development
                Work
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload road repairs, water line setups, solar streetlights, or school building
                updates so all villagers can see the progress.
              </p>
              <form onSubmit={handleWorkSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Work Title
                  </label>
                  <input
                    value={workValues.title}
                    onChange={(e) => setWorkValues((cur) => ({ ...cur, title: e.target.value }))}
                    placeholder="e.g. New CC Road Construction in SC Colony"
                    required
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Description & Progress Details
                  </label>
                  <textarea
                    value={workValues.description}
                    onChange={(e) =>
                      setWorkValues((cur) => ({ ...cur, description: e.target.value }))
                    }
                    placeholder="Provide details on contractor, materials used, budget allocation, and current completion percentage..."
                    rows={4}
                    required
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Department / Scheme
                    </label>
                    <input
                      value={workValues.department}
                      onChange={(e) =>
                        setWorkValues((cur) => ({ ...cur, department: e.target.value }))
                      }
                      placeholder="e.g. MGNREGA / Gram Panchayat Fund"
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Budget Allocation
                    </label>
                    <input
                      value={workValues.budget}
                      onChange={(e) => setWorkValues((cur) => ({ ...cur, budget: e.target.value }))}
                      placeholder="e.g. ₹4,50,000"
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Current Status
                    </label>
                    <select
                      value={workValues.status}
                      onChange={(e) =>
                        setWorkValues((cur) => ({
                          ...cur,
                          status: e.target.value as GovernmentWorkInput["status"],
                        }))
                      }
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary font-semibold"
                    >
                      <option value="planned">Planned / Sanctioned</option>
                      <option value="active">Active & In Progress</option>
                      <option value="completed">Completed & Verified</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Location / Ward
                  </label>
                  <input
                    value={workValues.location}
                    onChange={(e) => setWorkValues((cur) => ({ ...cur, location: e.target.value }))}
                    placeholder="e.g. Ward No. 4, Near High School"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Attach Proof Photos (Up to 3)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setWorkPhotos(Array.from(e.target.files ?? []).slice(0, 3))}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-primary hover:file:bg-primary/20"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <AppButton type="button" variant="ghost" onClick={() => setShowWorkForm(false)}>
                    Cancel
                  </AppButton>
                  <AppButton type="submit" variant="primary" loading={submittingWork}>
                    Publish Sarpanch Work Progress
                  </AppButton>
                </div>
              </form>
            </SurfaceCard>
          )}

          {worksLoading ? (
            <div className="py-16 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                Loading village development works...
              </p>
            </div>
          ) : works.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="size-6" />}
              title="No Sarpanch works showcased yet"
              description="Panchayat works, road projects, and community improvements will appear here with photos and progress tracking."
              action={
                canManageNotices ? (
                  <AppButton variant="primary" onClick={() => setShowWorkForm(true)}>
                    Post First Sarpanch Work
                  </AppButton>
                ) : undefined
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {works.map((work) => (
                <SurfaceCard
                  key={work.id}
                  hover={false}
                  className="p-6 flex flex-col justify-between border-primary/15 bg-card/95 shadow-sm"
                >
                  <div>
                    {work.government_work_images && work.government_work_images.length > 0 && (
                      <div className="mb-4 overflow-hidden rounded-2xl border border-border/80">
                        <img
                          src={work.government_work_images[0].image_url}
                          alt={work.title}
                          className="aspect-[16/9] w-full object-cover transition hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <ShieldCheck className="size-3.5" /> {work.department || "Gram Panchayat"}
                      </span>
                      <StatusBadge
                        tone={
                          work.status === "completed"
                            ? "success"
                            : work.status === "active"
                              ? "primary"
                              : "secondary"
                        }
                      >
                        {work.status}
                      </StatusBadge>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold text-clay">{work.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {work.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/70 pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {work.budget && (
                        <div className="rounded-xl bg-muted/60 p-2.5">
                          <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                            Sanctioned Budget
                          </span>
                          <span className="font-bold text-clay text-sm flex items-center gap-1 mt-0.5">
                            <BadgeIndianRupee className="size-3.5 text-emerald-600" /> {work.budget}
                          </span>
                        </div>
                      )}
                      {work.location && (
                        <div className="rounded-xl bg-muted/60 p-2.5">
                          <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                            Location
                          </span>
                          <span className="font-bold text-clay text-sm flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="size-3.5 text-primary" /> {work.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        Posted {timeAgo(new Date(work.created_at).getTime())}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          shareToWhatsApp(
                            work.title,
                            `Panchayat Work: ${work.description}\nStatus: ${work.status}`,
                          )
                        }
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <Share2 className="size-3.5" /> Share Work Proof
                      </button>
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
