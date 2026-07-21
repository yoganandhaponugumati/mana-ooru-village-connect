import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  Scale,
  Megaphone,
  AlertTriangle,
  X,
  CheckCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  ThumbsUp,
  TrendingUp,
  FileText,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------
// Concept Definitions
// ---------------------------------------------------------
type Concept = "audit" | "eligibility" | "grievance" | "voice";

interface ConceptMeta {
  id: Concept;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  gradient: string;
  glow: string;
}

const concepts: ConceptMeta[] = [
  {
    id: "audit",
    title: "Sarpanch Works",
    subtitle: "Panchayat Auditor & Progress Tracker",
    description:
      "Track active development budgets, works expenses, and stage-by-stage village project completions.",
    icon: Landmark,
    color: "text-emerald-500",
    gradient: "from-emerald-500 to-teal-600",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    id: "eligibility",
    title: "Government Schemes",
    subtitle: "Interactive Eligibility Matcher",
    description:
      "Input your profile details to instantly check qualification for active farming, education, and subsidy schemes.",
    icon: Scale,
    color: "text-amber-500",
    gradient: "from-amber-500 to-orange-600",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    id: "grievance",
    title: "Report Problem",
    subtitle: "Village Grievance & Upvote Desk",
    description:
      "Post and upvote local streetlight, drainage, or road repair issues. Popular issues get escalated automatically.",
    icon: AlertTriangle,
    color: "text-rose-500",
    gradient: "from-rose-500 to-red-600",
    glow: "rgba(244,63,94,0.15)",
  },
  {
    id: "voice",
    title: "Village Notices",
    subtitle: "Voice Notice Broadcast Desk",
    description:
      "Listen to official Panchayat notices read aloud in regional languages using our text-to-speech system.",
    icon: Megaphone,
    color: "text-sky-500",
    gradient: "from-sky-500 to-indigo-600",
    glow: "rgba(14,165,233,0.15)",
  },
];

// ---------------------------------------------------------
// Component Main
// ---------------------------------------------------------
export function ConceptShowcase() {
  const navigate = useNavigate();
  const [activeConcept, setActiveConcept] = useState<Concept | null>(null);

  const routesMap: Record<Concept, string> = {
    audit: "/timeline",
    eligibility: "/schemes",
    grievance: "/problems",
    voice: "/announcements",
  };

  return (
    <section className="relative z-30 mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-secondary">
          Premium Village OS
        </span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-clay sm:text-5xl">
          Core Village Services
        </h2>
        <p className="mt-3 mx-auto max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Select any interactive service below to launch dynamic dashboards, check scheme
          eligibilities, upvote local reports, or listen to voice notices.
        </p>
      </div>

      {/* Grid of 3D Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {concepts.map((concept, idx) => (
          <ConceptCard
            key={concept.id}
            concept={concept}
            index={idx}
            onClick={() => navigate({ to: routesMap[concept.id] })}
          />
        ))}
      </div>

      {/* Overlay Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeConcept && (
              <ConceptModal conceptId={activeConcept} onClose={() => setActiveConcept(null)} />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}

// ---------------------------------------------------------
// 3D Tilt Card Component
// ---------------------------------------------------------
function ConceptCard({
  concept,
  index,
  onClick,
}: {
  concept: ConceptMeta;
  index: number;
  onClick: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setTilt({ x: x * 12, y: -y * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const Icon = concept.icon;

  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onClick={onClick}
        animate={{
          rotateY: tilt.x,
          rotateX: tilt.y,
          scale: isHovered ? 1.03 : 1,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 18 }}
        style={{
          boxShadow: isHovered
            ? `0 20px 40px -15px ${concept.glow}, 0 0 2px 1px ${concept.glow}`
            : "none",
        }}
        className="premium-need-card h-full rounded-[24px] border border-border/80 bg-card p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group select-none"
      >
        {/* Hover Glow Effect */}
        <div
          className={`absolute -right-20 -top-20 size-48 rounded-full bg-gradient-to-br ${concept.gradient} opacity-0 group-hover:opacity-10 blur-[48px] transition-all duration-500`}
        />

        <div>
          <div className="mb-6 flex items-center justify-between">
            <span
              className={`grid size-12 place-items-center rounded-2xl bg-muted text-primary shadow-sm group-hover:scale-105 group-hover:rotate-[-4deg] transition-all duration-300 ${concept.color}`}
            >
              <Icon className="size-6" strokeWidth={1.8} />
            </span>
            <ChevronRight className="size-5 text-muted-foreground/60 group-hover:translate-x-1 group-hover:text-primary transition-all duration-300" />
          </div>
          <h3 className="font-display text-xl font-bold text-clay group-hover:text-primary transition-colors duration-200">
            {concept.title}
          </h3>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-secondary">
            {concept.subtitle}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{concept.description}</p>
        </div>

        <div className="mt-6 flex items-center gap-1 text-xs font-bold text-primary group-hover:underline">
          <Sparkles className="size-3.5" /> Launch Tool
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// Glassmorphic Modal Component
// ---------------------------------------------------------
function ConceptModal({ conceptId, onClose }: { conceptId: Concept; onClose: () => void }) {
  const concept = concepts.find((c) => c.id === conceptId)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 30 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[24px] sm:rounded-[32px] border border-white/20 bg-white/92 shadow-[0_32px_110px_rgba(0,0,0,0.5)] p-4 sm:p-10 relative flex flex-col justify-between"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all duration-200 border border-border"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 border-b border-border/80 pb-6 mb-6">
          <span
            className={`grid size-14 shrink-0 place-items-center rounded-3xl bg-muted text-primary shadow-sm ${concept.color}`}
          >
            <concept.icon className="size-8" strokeWidth={1.8} />
          </span>
          <div>
            <h3 className="font-display text-2xl font-black text-clay sm:text-3xl">
              {concept.title}
            </h3>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-secondary">
              {concept.subtitle}
            </p>
          </div>
        </div>

        {/* Interactive Feature Body */}
        <div className="flex-1">
          {conceptId === "audit" && <SarpanchAuditFeature />}
          {conceptId === "eligibility" && <EligibilityFeature />}
          {conceptId === "grievance" && <GrievanceUpvoteFeature />}
          {conceptId === "voice" && <VoiceNoticeFeature />}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------
// 1. Sarpanch Posted Works Feature
// ---------------------------------------------------------
function SarpanchAuditFeature() {
  const budgetAllocation = [
    {
      name: "CC Roads Construction",
      budget: 350000,
      spent: 310000,
      pct: 88,
      color: "bg-emerald-500",
    },
    {
      name: "Drainage Pipeline Work",
      budget: 150000,
      spent: 145000,
      pct: 96,
      color: "bg-teal-500",
    },
    { name: "PHC Health Subcenter", budget: 200000, spent: 40000, pct: 20, color: "bg-amber-500" },
    { name: "Streetlights Renewal", budget: 75000, spent: 75000, pct: 100, color: "bg-sky-500" },
  ];

  const totalBudget = budgetAllocation.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = budgetAllocation.reduce((sum, item) => sum + item.spent, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
            Total Sanctioned Budget
          </p>
          <p className="mt-1 font-display text-2xl font-black text-emerald-900">
            ₹{(totalBudget / 100000).toFixed(2)} Lakhs
          </p>
        </div>
        <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-teal-800">
            Total Audited Expenditures
          </p>
          <p className="mt-1 font-display text-2xl font-black text-teal-900">
            ₹{(totalSpent / 100000).toFixed(2)} Lakhs
          </p>
        </div>
        <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-sky-800">
            Budget Utilization
          </p>
          <p className="mt-1 font-display text-2xl font-black text-sky-900">
            {((totalSpent / totalBudget) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 border-b border-border/80 pb-3">
          <TrendingUp className="size-5 text-primary" />
          <h4 className="font-display font-bold text-clay">Development Cost Allocations</h4>
        </div>
        <div className="space-y-5">
          {budgetAllocation.map((item) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm font-semibold">
                <span className="text-clay">{item.name}</span>
                <span className="text-muted-foreground">
                  ₹{(item.spent / 1000).toFixed(0)}k / ₹{(item.budget / 1000).toFixed(0)}k spent (
                  {item.pct}%)
                </span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Timelines */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h4 className="font-display font-bold text-clay mb-4">CC Road Concrete Work Timeline</h4>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border hidden md:block -translate-y-1/2 z-0" />
          {[
            { stage: "Survey", desc: "Land survey", date: "June 10", status: "completed" },
            { stage: "Excavation", desc: "Soil preparation", date: "June 25", status: "completed" },
            { stage: "Pouring", desc: "Concrete casting", date: "July 12", status: "active" },
            { stage: "Curing", desc: "Strengthening", date: "July 24", status: "pending" },
          ].map((item, idx) => (
            <div
              key={item.stage}
              className="relative z-10 flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center flex-1"
            >
              <div
                className={`size-10 rounded-full grid place-items-center border-2 font-bold text-sm shadow-sm transition-all duration-300 ${
                  item.status === "completed"
                    ? "bg-primary border-primary text-white"
                    : item.status === "active"
                      ? "bg-amber-400 border-amber-500 text-clay animate-pulse"
                      : "bg-card border-border text-muted-foreground"
                }`}
              >
                {idx + 1}
              </div>
              <div>
                <p className="font-bold text-clay text-sm">{item.stage}</p>
                <p className="text-[11px] text-muted-foreground leading-4">{item.desc}</p>
                <p className="text-[10px] text-primary/75 font-semibold mt-0.5">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 2. Interactive Eligibility Checker Feature
// ---------------------------------------------------------
function EligibilityFeature() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    occupation: "farmer",
    age: "35",
    landAcres: "3",
    income: "under-1.5",
  });
  const [results, setResults] = useState<
    { title: string; category: string; description: string; match: boolean }[] | null
  >(null);

  const handleCheck = () => {
    const ageVal = parseInt(inputs.age) || 0;
    const landVal = parseFloat(inputs.landAcres) || 0;

    const matchedSchemes = [
      {
        title: "PM-KISAN Cash Assistance",
        category: "Agriculture subsidy",
        description:
          "₹6,000 yearly income support paid in three equal installments directly to land-holding farmers' accounts.",
        match: inputs.occupation === "farmer" && landVal > 0 && landVal <= 5,
      },
      {
        title: "Rythu Bandhu Input Support",
        category: "State farm incentive",
        description:
          "₹10,000 per acre per year support for purchasing seeds, fertilizers, and general farm prep requirements.",
        match: inputs.occupation === "farmer" && landVal > 0,
      },
      {
        title: "PM Shram Yogi Maandhan Pension",
        category: "Elderly safety net",
        description:
          "Monthly pension of ₹3,000 upon reaching age 60 for unorganized workers, daily wagers, and artisans.",
        match:
          (inputs.occupation === "worker" || inputs.occupation === "artisan") &&
          ageVal >= 18 &&
          ageVal <= 40,
      },
      {
        title: "Free Seed & Tool Subsidy Desk",
        category: "Panchayat empowerment",
        description:
          "Subsidized farm equipment kits and hybrid paddy seeds distributed through local Panchayat counters.",
        match: inputs.occupation === "farmer" && landVal <= 2.5,
      },
    ];

    setResults(matchedSchemes);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 text-xs font-black uppercase tracking-wider text-muted-foreground">
        <span className={step === 1 ? "text-primary" : ""}>1. Profile</span>
        <ChevronRight className="size-4" />
        <span className={step === 2 ? "text-primary" : ""}>2. Land & Details</span>
        <ChevronRight className="size-4" />
        <span className={step === 3 ? "text-primary" : ""}>3. Matches</span>
      </div>

      {step === 1 && (
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h4 className="font-display font-bold text-clay">Tell us about yourself</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-clay">Primary Occupation</span>
              <select
                value={inputs.occupation}
                onChange={(e) => setInputs({ ...inputs, occupation: e.target.value })}
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                <option value="farmer">Farmer / Cultivator</option>
                <option value="worker">Daily Wage Worker</option>
                <option value="student">Student / Scholar</option>
                <option value="artisan">Artisan / Weaver</option>
                <option value="other">Other / Business</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-clay">Age (in years)</span>
              <input
                type="number"
                value={inputs.age}
                onChange={(e) => setInputs({ ...inputs, age: e.target.value })}
                placeholder="E.g. 35"
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
              />
            </label>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-secondary transition-colors duration-200"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h4 className="font-display font-bold text-clay">Holdings and Income Info</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-clay">
                Farmland Holdings (in Acres)
              </span>
              <input
                type="number"
                value={inputs.landAcres}
                onChange={(e) => setInputs({ ...inputs, landAcres: e.target.value })}
                placeholder="Enter 0 if none"
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-clay">
                Annual Household Income
              </span>
              <select
                value={inputs.income}
                onChange={(e) => setInputs({ ...inputs, income: e.target.value })}
                className="premium-input w-full rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                <option value="under-1.5">Under ₹1.5 Lakhs</option>
                <option value="under-5">₹1.5 Lakhs - ₹5 Lakhs</option>
                <option value="above-5">Above ₹5 Lakhs</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 rounded-2xl border border-border py-3.5 text-sm font-bold text-clay hover:bg-muted transition-colors duration-200"
            >
              Back
            </button>
            <button
              onClick={handleCheck}
              className="flex-1 rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:bg-secondary transition-colors duration-200"
            >
              Find Matching Schemes
            </button>
          </div>
        </div>
      )}

      {step === 3 && results && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-display font-bold text-clay">Scheme Matches for You</h4>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-primary hover:underline"
            >
              Check Another Profile
            </button>
          </div>
          <div className="space-y-3">
            {results.filter((s) => s.match).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-muted-foreground">
                <HelpCircle className="mx-auto size-8 text-muted-foreground/60 mb-2" />
                <p className="text-sm font-semibold">
                  No direct scheme matches found for this profile.
                </p>
                <p className="text-xs mt-1">
                  Please double-check your land holdings or age profile values.
                </p>
              </div>
            ) : (
              results
                .filter((s) => s.match)
                .map((scheme) => (
                  <div
                    key={scheme.title}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5 flex gap-4"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                      <CheckCircle className="size-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                        {scheme.category}
                      </span>
                      <h5 className="mt-2 font-display font-bold text-clay">{scheme.title}</h5>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {scheme.description}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------
// 3. Grievance Upvote / Voter Feature
// ---------------------------------------------------------
interface GrievanceItem {
  id: string;
  title: string;
  category: string;
  description: string;
  votes: number;
  status: string;
}

function GrievanceUpvoteFeature() {
  const [grievances, setGrievances] = useState<GrievanceItem[]>([]);
  const [votedList, setVotedList] = useState<string[]>([]);

  useEffect(() => {
    // Initial sample complaints list
    const initialList = [
      {
        id: "g-1",
        title: "Paddy road potholes near main well",
        category: "Roads & Safety",
        description: "Massive road erosion causing tractors to get stuck while carrying harvest.",
        votes: 14,
        status: "Escalated to Sarpanch",
      },
      {
        id: "g-2",
        title: "PHC water tank leakage",
        category: "Drinking Water",
        description: "Clean water leaking from the main subcenter tank for the last 3 days.",
        votes: 8,
        status: "Registered",
      },
      {
        id: "g-3",
        title: "Streetlights not working in Harijanwada",
        category: "Electricity",
        description:
          "Dark street poles leading to safety concerns for children and elderly at night.",
        votes: 21,
        status: "Work Assigned",
      },
    ];

    const saved = localStorage.getItem("village-votes");
    const votesCast = saved ? JSON.parse(saved) : [];
    setVotedList(votesCast);

    // Load custom vote scores if saved
    const scoreSaved = localStorage.getItem("village-complaint-scores");
    if (scoreSaved) {
      setGrievances(JSON.parse(scoreSaved));
    } else {
      setGrievances(initialList);
    }
  }, []);

  const handleVote = (id: string) => {
    if (votedList.includes(id)) {
      toast.info("You already voted for this issue!");
      return;
    }

    const updated = grievances.map((item) => {
      if (item.id === id) {
        const nextVotes = item.votes + 1;
        const nextStatus = nextVotes >= 20 ? "High Priority - Sent to Mandal SI" : item.status;
        return { ...item, votes: nextVotes, status: nextStatus };
      }
      return item;
    });

    const nextVoted = [...votedList, id];
    setGrievances(updated);
    setVotedList(nextVoted);

    localStorage.setItem("village-votes", JSON.stringify(nextVoted));
    localStorage.setItem("village-complaint-scores", JSON.stringify(updated));
    toast.success("Grievance upvoted successfully!");
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center border-b border-border/80 pb-3">
        <h4 className="font-display font-bold text-clay">Trending Grievance Issues</h4>
        <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
          Total: {grievances.length} issues
        </span>
      </div>

      <div className="space-y-3">
        {grievances
          .sort((a, b) => b.votes - a.votes)
          .map((item) => {
            const hasVoted = votedList.includes(item.id);
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border bg-card p-5 flex justify-between items-start gap-4 hover:border-red-100 transition-colors duration-200"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        item.status.includes("High")
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : item.status.includes("Escalated")
                            ? "bg-amber-50 text-amber-600"
                            : "bg-sky-50 text-sky-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <h5 className="font-display font-bold text-clay leading-tight">{item.title}</h5>
                  <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => handleVote(item.id)}
                    className={`grid size-12 place-items-center rounded-2xl border transition-all duration-200 ${
                      hasVoted
                        ? "bg-primary border-primary text-white"
                        : "border-border text-clay hover:bg-red-50/50 hover:text-red-500"
                    }`}
                    title={hasVoted ? "Upvoted" : "Upvote grievance"}
                  >
                    <ThumbsUp className={`size-5 ${hasVoted ? "fill-white" : ""}`} />
                  </button>
                  <span className="text-xs font-black text-clay tracking-wider">
                    {item.votes} Votes
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// 4. Voice Notice Broadcast Feature
// ---------------------------------------------------------
function VoiceNoticeFeature() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState<"te" | "en" | "hi">("en");
  const [voiceSpeed, setVoiceSpeed] = useState(1);

  const notices = {
    en: "Notice from Panchayat Secretary: Power shutdown is planned tomorrow from 9:00 AM to 1:00 PM for transformer repairs. Drinking water supply will run only in the evening. Please save water and plan ahead.",
    te: "పంచాయతీ కార్యదర్శి నోటీసు: రేపు ఉదయం 9 గంటల నుండి మధ్యాహ్నం 1 గంటల వరకు ట్రాన్స్‌ఫార్మర్ మరమ్మతుల కోసం విద్యుత్ సరఫరా నిలిపివేయబడుతుంది. మంచినీటి సరఫరా సాయంత్రం మాత్రమే ఉంటుంది. దయచేసి నీటిని పొదుపు చేసుకోండి.",
    hi: "पंचायत सचिव की सूचना: कल सुबह 9 बजे से दोपहर 1 बजे तक ट्रांसफार्मर मरम्मत के लिए बिजली बंद रहेगी। पीने के पानी की आपूर्ति केवल शाम को होगी। कृपया पानी बचाएं और पहले से योजना बनाएं।",
  };

  const voiceLangs = {
    en: "en-IN",
    te: "te-IN",
    hi: "hi-IN",
  };

  const handleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = notices[lang];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voiceLangs[lang];
    utterance.rate = voiceSpeed;

    // Find Indian accent voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchLang = voiceLangs[lang];
    const voice = voices.find((v) => v.lang.includes(matchLang));
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error("Voice output error.");
    };

    window.speechSynthesis.cancel(); // Cancel any active speak
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in flex flex-col items-center">
      {/* Visualizer Circle */}
      <div className="relative size-36 sm:size-44 flex items-center justify-center">
        {isPlaying && (
          <>
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-sky-200/50"
            />
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute inset-4 rounded-full bg-sky-100"
            />
          </>
        )}
        <button
          onClick={handleSpeech}
          className={`relative z-10 size-24 rounded-full grid place-items-center shadow-lg transition-transform duration-200 active:scale-95 ${
            isPlaying
              ? "bg-red-500 text-white shadow-red-500/20"
              : "bg-sky-500 text-white shadow-sky-500/20"
          }`}
          title={isPlaying ? "Stop Broadcast" : "Play Voice Broadcast"}
        >
          {isPlaying ? <VolumeX className="size-10" /> : <Volume2 className="size-10" />}
        </button>
      </div>

      <div className="w-full space-y-4 rounded-2xl border border-border bg-card p-6">
        <h4 className="font-display font-bold text-clay">Voice Settings</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-clay font-display">
              Broadcast Language
            </span>
            <div className="flex gap-2">
              {(["en", "te", "hi"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLang(l);
                    if (isPlaying) {
                      window.speechSynthesis.cancel();
                      setIsPlaying(false);
                    }
                  }}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-black uppercase transition-all duration-200 border ${
                    lang === l
                      ? "bg-primary border-primary text-white"
                      : "border-border hover:bg-muted text-clay"
                  }`}
                >
                  {l === "en" ? "English" : l === "te" ? "తెలుగు" : "हिंदी"}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-clay font-display">
              Voice Speed ({voiceSpeed}x)
            </span>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.25"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              className="w-full accent-primary mt-2"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-left w-full">
        <div className="flex items-center gap-2 border-b border-border/80 pb-2 mb-2">
          <FileText className="size-4 text-sky-600" />
          <span className="text-[10px] font-black uppercase tracking-wider text-clay">
            Notice Board Transcript
          </span>
        </div>
        <p className="text-sm font-semibold text-clay leading-6 italic">"{notices[lang]}"</p>
      </div>
    </div>
  );
}
