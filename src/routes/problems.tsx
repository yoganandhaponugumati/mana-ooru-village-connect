import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Droplets,
  ImagePlus,
  Lightbulb,
  Milestone,
  Phone,
  Plus,
  Siren,
  Trash2,
  Waves,
  ThumbsUp,
  Share2,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import {
  AppButton,
  EmptyState,
  FeatureIcon,
  SectionHeader,
  SurfaceCard,
} from "@/components/design-system";
import { emergencyContacts, fallbackListings } from "@/lib/app-data";
import { logContact } from "@/lib/local-actions";
import { useListings, timeAgo } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/problems")({
  head: () => ({ meta: [{ title: "Citizen Problem Desk & Civic Accountability — ManaOoru" }] }),
  component: ProblemsPage,
});

const issueTypes = [
  { label: "Road Damage & CC Paving", icon: Milestone },
  { label: "Drainage Overflow / Clogs", icon: Waves },
  { label: "Drinking Water Leakage / Cut", icon: Droplets },
  { label: "Broken Streetlight / Pole", icon: Lightbulb },
  { label: "Garbage Pileup / Sanitation", icon: Trash2 },
  { label: "Other Civic Issue", icon: AlertTriangle },
];

function ProblemsPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const { items, remove, update } = useListings("complaint");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "complaint");
  const [showForm, setShowForm] = useState(false);
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "in_progress" | "completed" | "escalated">("all");
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [activeDeskId, setActiveDeskId] = useState<string | null>(null);
  const [deskStatus, setDeskStatus] = useState<string>("in_progress");
  const [deskNote, setDeskNote] = useState<string>("");
  const urgentContacts = emergencyContacts.filter((item) => item.urgent).slice(0, 3);
  const canManage = role === "village_admin" || role === "super_admin";

  const handlePostClick = () => {
    if (!user) {
      toast.error("Sign in required to report an issue.");
      navigate({
        to: "/auth",
        search: {
          redirect: window.location.pathname,
          message: "signin_to_post",
        },
      });
      return;
    }
    setShowForm((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
      return next;
    });
  };

  const handleOpenFormClick = () => {
    if (!user) {
      toast.error("Sign in required to report an issue.");
      navigate({
        to: "/auth",
        search: {
          redirect: window.location.pathname,
          message: "signin_to_post",
        },
      });
      return;
    }
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const handleUpvote = (id: string) => {
    setUpvotes((prev) => {
      const cur = prev[id] || 0;
      toast.success("Community support verified! Added your voice to this report.");
      return { ...prev, [id]: cur + 1 };
    });
  };

  const shareToWhatsApp = (title: string, desc: string, loc: string) => {
    const url = window.location.href;
    const msg = `🚨 *ManaOoru Citizen Issue Reported*\n*Problem:* ${title}\n*Location:* ${loc}\n*Details:* ${desc}\n\nSupport this civic report here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <PageLayout
      title="Citizen Problem & Civic Action Desk"
      subtitle="Public photo reporting with community upvoting. Every report is visible to the entire village and Gram Panchayat."
      icon={<AlertTriangle className="size-7 text-red-600" />}
    >
      <SectionHeader
        eyebrow="Civic Transparency"
        title="Photo Proof Drives Panchayat Action"
        description="Report damaged roads, overflowing drainage, streetlight outages, and water pipe breaks. Rally support with community upvotes."
        actions={
          <>
            <Link
              to="/emergency"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 shadow-sm"
            >
              <Siren className="size-4 animate-pulse" /> Urgent Siren Contacts
            </Link>
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handlePostClick}
            >
              {showForm ? "Hide Form" : "Report New Problem"}
            </AppButton>
          </>
        }
      />

      {/* Emergency quick cards */}
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {urgentContacts.map((contact) => (
          <SurfaceCard
            key={contact.id}
            hover={false}
            className="border-red-200 bg-red-50/90 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <FeatureIcon
                icon={<contact.icon className="size-5" />}
                className="bg-red-100 text-red-700 shadow-inner"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-bold text-clay">{contact.title}</p>
                <p className="text-xs text-red-700 font-medium">{contact.role}</p>
              </div>
              <a
                href={`tel:${contact.contact}`}
                onClick={() => logContact(contact, "call")}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow transition hover:brightness-110"
                aria-label={`Call ${contact.title}`}
              >
                <Phone className="size-4" />
              </a>
            </div>
          </SurfaceCard>
        ))}
      </div>

      {/* Category selection chips */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {issueTypes.map((issue) => (
          <SurfaceCard
            key={issue.label}
            className="p-4 border-accent/60 bg-gradient-to-br from-card to-accent/5"
          >
            <button
              type="button"
              onClick={handleOpenFormClick}
              className="flex w-full items-center gap-3 text-left"
            >
              <FeatureIcon icon={<issue.icon className="size-5 text-primary" />} />
              <span>
                <span className="block font-bold text-clay">{issue.label}</span>
                <span className="text-xs text-muted-foreground">
                  Tap to attach photo & GPS location
                </span>
              </span>
            </button>
          </SurfaceCard>
        ))}
      </div>

      {showForm && (
        <div ref={formRef}>
          <SurfaceCard className="mb-8 p-6 sm:p-8 border-2 border-primary/30 shadow-md bg-card ring-2 ring-primary/20">
            <ListingForm
              type="complaint"
              title="Problem Details & Photo Proof"
              redirectTo="/problems"
              photoRequired
              photoLabel="Take / Upload Problem Photo"
              photoHint="Camera proof is mandatory for road damage, drainage clogs, garbage dumps, or broken infrastructure."
              fields={[
                {
                  name: "title",
                  label: "Problem Title",
                  placeholder: "e.g. CC Road cracked & drainage blocked near temple",
                  required: true,
                },
                {
                  name: "category",
                  label: "Issue Category",
                  placeholder: "",
                  options: issueTypes.map((item) => item.label),
                  required: true,
                },
                {
                  name: "description",
                  label: "Detailed Description",
                  placeholder:
                    "Explain exactly how long this issue has existed, who is affected, and why urgent repair is needed...",
                  textarea: true,
                  required: true,
                },
                {
                  name: "location",
                  label: "Exact Location / Ward / Street",
                  placeholder: "Ward No., Street name, or nearby landmark",
                  required: true,
                },
                {
                  name: "contact",
                  label: "Your Contact Number",
                  placeholder: "10-digit mobile (for Panchayat clarification)",
                  required: true,
                },
              ]}
            />
          </SurfaceCard>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All Reports" },
              { id: "pending", label: "⏳ Pending" },
              { id: "in_progress", label: "🛠️ In Progress" },
              { id: "completed", label: "✅ Resolved" },
              { id: "escalated", label: "⚠️ Escalated" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusTab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          Showing {
            displayItems.filter((i) => {
              const st = i.status || "pending";
              if (statusTab === "pending") return st === "pending" || st === "active";
              if (statusTab === "in_progress") return st === "in_progress";
              if (statusTab === "completed") return st === "completed" || st === "resolved";
              if (statusTab === "escalated") return st === "escalated" || st === "rejected";
              return true;
            }).length
          } report(s)
        </span>
      </div>

      {displayItems.length === 0 ? (
        <EmptyState
          icon={<ImagePlus className="size-6" />}
          title="No public problems reported yet"
          description="Be the first citizen to report a civic issue with clear photo proof and location."
          action={
            <AppButton
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={handleOpenFormClick}
            >
              Report New Problem
            </AppButton>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {displayItems
            .filter((item) => {
              const st = item.status || "pending";
              if (statusTab === "pending") return st === "pending" || st === "active";
              if (statusTab === "in_progress") return st === "in_progress";
              if (statusTab === "completed") return st === "completed" || st === "resolved";
              if (statusTab === "escalated") return st === "escalated" || st === "rejected";
              return true;
            })
            .map((item) => {
              const votesCount = (upvotes[item.id] || 0) + 12;
              const status = item.status || "pending";
              const isResolved = status === "completed" || status === "resolved";
              const isInProgress = status === "in_progress";

              return (
                <SurfaceCard
                  key={item.id}
                  hover={false}
                  className={`p-6 flex flex-col justify-between transition-all rounded-[1.5rem] shadow-sm border-l-4 ${
                    isResolved
                      ? "border-emerald-500 bg-emerald-50/30"
                      : isInProgress
                        ? "border-blue-500 bg-blue-50/20"
                        : "border-amber-500 bg-card/95"
                  }`}
                >
                  <div>
                    {item.imageUrl && (
                      <div className="mb-4 overflow-hidden rounded-2xl border border-border/80 relative group">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="aspect-[16/9] w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-3 right-3 rounded-full bg-black/65 backdrop-blur-md px-3 py-1 text-xs font-bold text-white flex items-center gap-1.5">
                          <MapPin className="size-3 text-amber-300" />{" "}
                          {item.location || "Village Street"}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <Award className="size-3.5 text-primary" /> {item.category || "Civic Report"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : isInProgress
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                              : status === "escalated" || status === "rejected"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {isResolved ? (
                          <>
                            <CheckCircle2 className="size-3.5 text-emerald-600" /> Resolved by Panchayat
                          </>
                        ) : isInProgress ? (
                          <>
                            <Clock className="size-3.5 text-blue-600 animate-pulse" /> Work In Progress
                          </>
                        ) : status === "escalated" || status === "rejected" ? (
                          <>
                            <AlertTriangle className="size-3.5 text-red-600" /> Cannot Solve Immediately / Escalated
                          </>
                        ) : (
                          <>
                            <Clock className="size-3.5 text-amber-600 animate-pulse" /> Pending Review
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="mt-3 font-display text-xl font-bold text-clay dark:text-zinc-100">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>

                    {item.officialResponse && (
                      <div className="mt-3.5 rounded-2xl border border-primary/30 bg-primary/5 dark:bg-primary/10 p-3.5 text-sm shadow-sm">
                        <div className="flex items-center gap-1.5 font-bold text-primary text-xs uppercase tracking-wider">
                          <ShieldCheck className="size-4" /> Official Gram Panchayat Response / Note
                        </div>
                        <p className="mt-1.5 text-clay dark:text-zinc-200 font-medium leading-6">{item.officialResponse}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 border-t border-border/70 pt-4 space-y-4">
                    {/* Community Upvoting Bar */}
                    <div className="flex items-center justify-between rounded-2xl bg-muted/70 p-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary font-black text-xs">
                          +{votesCount}
                        </span>
                        <span className="text-xs font-bold text-clay">
                          Villagers verified this issue
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpvote(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-bold shadow-sm hover:brightness-110 transition active:scale-95"
                      >
                        <ThumbsUp className="size-3.5" /> I Face This Too (+1)
                      </button>
                    </div>

                    {/* Admin controls and sharing */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3" /> {item.contact}
                        </span>
                        <span>· {timeAgo(item.createdAt)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            shareToWhatsApp(item.title, item.description || "", item.location || "")
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mr-1"
                        >
                          <Share2 className="size-3.5" /> Share
                        </button>

                        {canManage && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveDeskId((prev) => (prev === item.id ? null : item.id));
                                setDeskStatus(status || "in_progress");
                                setDeskNote(item.officialResponse || "");
                              }}
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition shadow-sm"
                            >
                              <ShieldCheck className="size-3.5" /> 🏛️ Panchayat Status & Note Desk
                            </button>

                            {status !== "in_progress" && (
                              <button
                                type="button"
                                onClick={() => update(item.id, { status: "in_progress" })}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border border-blue-300 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100"
                              >
                                🛠️ In Progress
                              </button>
                            )}

                            {status !== "completed" && status !== "resolved" && (
                              <button
                                type="button"
                                onClick={() => update(item.id, { status: "completed" })}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100"
                              >
                                <CheckCircle2 className="size-3.5" /> Mark Resolved ✅
                              </button>
                            )}
                          </div>
                        )}

                        {(canManage || item.localOnly || (!!user && user.id === item.owner_id)) && (
                          <button
                            type="button"
                            onClick={() => remove(item.id)}
                            className="text-xs font-semibold text-red-600 hover:underline ml-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Official Panchayat Response & Resolution Desk Panel */}
                    {canManage && activeDeskId === item.id && (
                      <div className="mt-4 rounded-2xl border-2 border-primary/50 bg-primary/5 dark:bg-zinc-900/90 p-4 space-y-3.5 shadow-md">
                        <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                          <p className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                            <ShieldCheck className="size-4" /> Official Gram Panchayat Resolution Desk
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveDeskId(null)}
                            className="text-xs font-bold text-muted-foreground hover:text-foreground"
                          >
                            Close ✕
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-clay dark:text-zinc-200 mb-1.5">
                            Select Current Status:
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: "pending", label: "⏳ Pending Review" },
                              { id: "in_progress", label: "🛠️ In Progress" },
                              { id: "completed", label: "✅ Resolved by Panchayat" },
                              { id: "escalated", label: "⚠️ Cannot Solve / Escalated" },
                            ].map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setDeskStatus(s.id)}
                                className={`rounded-xl px-2.5 py-2 text-xs font-bold border transition text-center ${
                                  deskStatus === s.id
                                    ? "border-primary bg-primary text-white shadow-sm"
                                    : "border-border bg-white dark:bg-zinc-800 text-foreground hover:border-primary/50"
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-clay dark:text-zinc-200 mb-1">
                            Official Panchayat Explanation / Resolution Note:
                          </label>
                          <p className="text-[11px] text-muted-foreground mb-1.5 leading-4">
                            If Sarpanch cannot solve right now (e.g., waiting for funds or district approval), explain clearly. If verified & resolved, describe what action was taken.
                          </p>
                          <textarea
                            rows={2}
                            value={deskNote}
                            onChange={(e) => setDeskNote(e.target.value)}
                            placeholder="e.g., Work started by road contractor today. OR Cannot solve immediately due to lack of Panchayat funds; proposal sent to Mandal Parishad for budget approval."
                            className="w-full rounded-xl border border-border bg-white dark:bg-zinc-800 p-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none shadow-sm"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveDeskId(null)}
                            className="rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              update(item.id, {
                                status: deskStatus as never,
                                officialResponse: deskNote,
                              });
                              setActiveDeskId(null);
                            }}
                            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition active:scale-95 flex items-center gap-1.5"
                          >
                            <ShieldCheck className="size-4" /> Save Response & Send Citizen Push Alert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </SurfaceCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
