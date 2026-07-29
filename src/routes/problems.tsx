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
  ArrowRight,
} from "lucide-react";
import { useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { ListingForm } from "@/components/ListingForm";
import {
  AppButton,
  EmptyState,
  FeatureIcon,
  SurfaceCard,
} from "@/components/design-system";
import { fallbackListings } from "@/lib/app-data";
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
  const [showForm, setShowForm] = useState(true);
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "in_progress" | "completed" | "escalated">("all");
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
  const [activeDeskId, setActiveDeskId] = useState<string | null>(null);
  const [deskStatus, setDeskStatus] = useState<string>("in_progress");
  const [deskNote, setDeskNote] = useState<string>("");
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
      icon={<AlertTriangle className="size-6 text-red-600" />}
      heroAction={
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            type="button"
            onClick={handlePostClick}
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-primary px-8 py-4 text-base font-extrabold text-white shadow-xl shadow-primary/30 transition-all hover:scale-[1.03] hover:bg-primary/95 active:scale-95 cursor-pointer"
          >
            {showForm ? <Trash2 className="size-5" /> : <Plus className="size-5" />}
            <span>{showForm ? "Cancel New Report" : "⚡ Report New Civic Problem +"}</span>
          </button>
          <Link
            to="/emergency"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/90 px-6 py-4 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            <Siren className="size-4 animate-pulse" />
            <span>Urgent Emergency Numbers</span>
          </Link>
        </div>
      }
    >
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
                  placeholder: "Mobile number for Panchayat verification",
                  required: true,
                },
              ]}
            />
          </SurfaceCard>
        </div>
      )}

      {/* Category selection chips */}
      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-clay dark:text-zinc-100 flex items-center gap-2">
          <span>Choose Issue Category to Report</span>
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {issueTypes.map((issue) => (
            <SurfaceCard
              key={issue.label}
              className="p-4 border-border/80 bg-gradient-to-br from-card to-primary/5 transition hover:border-primary/50 hover:shadow-md cursor-pointer"
            >
              <button
                type="button"
                onClick={handleOpenFormClick}
                className="flex w-full items-center gap-3 text-left"
              >
                <FeatureIcon icon={<issue.icon className="size-5 text-primary" />} />
                <span>
                  <span className="block font-bold text-clay dark:text-zinc-100">{issue.label}</span>
                  <span className="text-xs text-muted-foreground">
                    Tap to attach photo &amp; GPS location
                  </span>
                </span>
              </button>
            </SurfaceCard>
          ))}
        </div>
      </div>

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
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 transition-all rounded-[1.25rem] shadow-sm border-l-4 sm:border-l-0 sm:border-t-4 ${
                    isResolved
                      ? "border-emerald-500 bg-emerald-50/30"
                      : isInProgress
                        ? "border-blue-500 bg-blue-50/20"
                        : "border-amber-500 bg-card/95"
                  }`}
                >
                  {/* Left Side Thumbnail */}
                  {item.imageUrl ? (
                    <div className="relative h-40 w-full sm:size-32 shrink-0 overflow-hidden rounded-[14px] border border-border/80 shadow-sm">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-1 left-1 right-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] sm:text-[8px] font-bold text-white flex items-center justify-center gap-1 backdrop-blur-md min-w-0 overflow-hidden">
                        <MapPin className="size-2.5 sm:size-2 text-amber-400 shrink-0" />
                        <span className="truncate min-w-0">{item.location || "Village"}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-32 w-full sm:size-32 shrink-0 overflow-hidden rounded-[14px] border border-dashed border-border/80 bg-muted/30 flex flex-col items-center justify-center text-muted-foreground">
                      <ImagePlus className="size-6 mb-1 opacity-20" />
                      <span className="text-[9px] font-bold uppercase">No Photo</span>
                    </div>
                  )}

                  {/* Right Side Content */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        <Award className="size-3 text-primary" /> {item.category || "Report"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isResolved
                            ? "bg-emerald-100 text-emerald-800"
                            : isInProgress
                              ? "bg-blue-100 text-blue-800"
                              : status === "escalated" || status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isResolved ? (
                          <>
                            <CheckCircle2 className="size-3 text-emerald-600" /> Resolved
                          </>
                        ) : isInProgress ? (
                          <>
                            <Clock className="size-3 text-blue-600 animate-pulse" /> In Progress
                          </>
                        ) : status === "escalated" || status === "rejected" ? (
                          <>
                            <AlertTriangle className="size-3 text-red-600" /> Escalated
                          </>
                        ) : (
                          <>
                            <Clock className="size-3 text-amber-600 animate-pulse" /> Pending
                          </>
                        )}
                      </span>
                    </div>

                    <h3 className="truncate font-display text-base font-bold text-clay leading-tight">{item.title}</h3>
                    <div className="mt-1 flex-1">
                      <p className="text-[13px] leading-5 text-muted-foreground line-clamp-2">{item.description}</p>
                      <button className="text-[10px] font-bold text-primary mt-0.5 hover:underline flex items-center gap-0.5">Read full details <ArrowRight className="size-3" /></button>
                    </div>

                    {isResolved ? (
                      <div className="mt-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-2 text-[10px] shadow-sm relative overflow-hidden text-left">
                        <div className="flex items-center gap-1 text-emerald-800 font-extrabold uppercase tracking-wider">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Official Resolution
                        </div>
                        <p className="mt-1 truncate text-clay font-bold">
                          {item.officialResponse || "Resolved successfully."}
                        </p>
                      </div>
                    ) : (
                      item.officialResponse && (
                        <div className="mt-2.5 rounded-xl border border-primary/20 bg-primary/5 p-2 text-[10px] text-left">
                          <div className="flex items-center gap-1 font-bold text-primary uppercase tracking-wider">
                            <ShieldCheck className="size-3" /> Panchayat Note
                          </div>
                          <p className="mt-1 truncate text-clay font-medium">{item.officialResponse}</p>
                        </div>
                      )
                    )}
                  <div className="mt-4 border-t border-border/70 pt-3 space-y-3">
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
                                onClick={() => {
                                  setActiveDeskId(item.id);
                                  setDeskStatus("completed");
                                  setDeskNote(item.officialResponse || "CC Road patched & cleared by Gram Panchayat workers.");
                                  toast.info("Panchayat Status: Completed selected. Please review and save the Resolution Note below.");
                                }}
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
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
                                className={`rounded-xl px-2.5 py-2 text-xs font-bold border transition text-center cursor-pointer ${
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
                          
                          {/* Template Shortcuts */}
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            <span className="text-[10px] font-bold text-muted-foreground self-center mr-1">Templates:</span>
                            {[
                              "CC Road patched & cleared by Gram Panchayat workers.",
                              "Drainage cleaned and silt removed by GP sanitation team.",
                              "Borewell pump replaced, drinking water supply restored.",
                              "Street lights repaired and LED bulbs installed successfully.",
                              "Garbage cleared from the site and a new warning sign placed."
                            ].map((tpl) => (
                              <button
                                key={tpl}
                                type="button"
                                onClick={() => setDeskNote(tpl)}
                                className="rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 px-2 py-1 text-[10px] font-semibold text-primary transition truncate max-w-[200px] cursor-pointer"
                                title={tpl}
                              >
                                {tpl}
                              </button>
                            ))}
                          </div>

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
                            className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShieldCheck className="size-4" /> Save Response & Send Citizen Push Alert
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                </SurfaceCard>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
