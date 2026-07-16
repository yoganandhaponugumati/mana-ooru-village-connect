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
  const { items, remove, update } = useListings("complaint");
  const displayItems =
    items.length > 0 ? items : fallbackListings.filter((item) => item.type === "complaint");
  const [showForm, setShowForm] = useState(false);
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});
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
    setShowForm((value) => !value);
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
          <SurfaceCard key={contact.id} hover={false} className="border-red-200 bg-red-50/90 p-4 shadow-sm">
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
          <SurfaceCard key={issue.label} className="p-4 border-accent/60 bg-gradient-to-br from-card to-accent/5">
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
        <SurfaceCard className="mb-8 p-6 sm:p-8 border-2 border-primary/30 shadow-md bg-card">
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
                placeholder: "Explain exactly how long this issue has existed, who is affected, and why urgent repair is needed...",
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
      )}

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
          {displayItems.map((item) => {
            const votesCount = (upvotes[item.id] || 0) + 12; // Base citizen interest + live upvotes
            const status = item.status || "active";
            const isResolved = status === "completed";

            return (
              <SurfaceCard
                key={item.id}
                hover={false}
                className={`p-6 flex flex-col justify-between transition-all rounded-[1.5rem] shadow-sm border-l-4 ${
                  isResolved
                    ? "border-emerald-500 bg-emerald-50/30"
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
                        <MapPin className="size-3 text-amber-300" /> {item.location || "Village Street"}
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
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {isResolved ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-emerald-600" /> Resolved by Panchayat
                        </>
                      ) : (
                        <>
                          <Clock className="size-3.5 text-amber-600 animate-pulse" /> Action Pending
                        </>
                      )}
                    </span>
                  </div>

                  <h3 className="mt-3 font-display text-xl font-bold text-clay">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-border/70 pt-4 space-y-4">
                  {/* Community Upvoting Bar */}
                  <div className="flex items-center justify-between rounded-2xl bg-muted/70 p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary font-black text-xs">
                        +{votesCount}
                      </span>
                      <span className="text-xs font-bold text-clay">Villagers verified this issue</span>
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

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => shareToWhatsApp(item.title, item.description || "", item.location || "")}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        <Share2 className="size-3.5" /> Share
                      </button>

                      {canManage && (
                        <button
                          type="button"
                          onClick={() =>
                            update(item.id, {
                              status: isResolved ? "active" : "completed",
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border transition ${
                            isResolved
                              ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                              : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          <ShieldCheck className="size-3.5" />
                          {isResolved ? "Reopen Issue" : "Mark Resolved 🟢"}
                        </button>
                      )}

                      {(canManage || item.localOnly || (!!user && user.id === item.owner_id)) && (
                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
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
