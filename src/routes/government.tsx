import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Megaphone,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  FileText,
  Landmark,
  Users,
  Clock,
  ExternalLink,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";
import { VillageBudgetDashboard } from "@/components/VillageBudgetDashboard";

export const Route = createFileRoute("/government")({
  head: () => ({ meta: [{ title: "Gram Panchayat & Govt Services - GramMitra" }] }),
  component: GovernmentPage,
});

const PANCHAYAT_OFFICERS = [
  {
    name: "Ponugumati Yoganandha",
    designation: "Sarpanch",
    phone: "0841-23456",
    office: "Gram Panchayat Building",
    hours: "10:00 AM - 5:00 PM",
  },
  {
    name: "R. Venkatesh",
    designation: "Panchayat Secretary",
    phone: "9848011222",
    office: "Room 1, GP Office",
    hours: "9:30 AM - 5:30 PM",
  },
  {
    name: "K. Satyanarayana",
    designation: "Village Revenue Officer (VRO)",
    phone: "9848033444",
    office: "Tahsil Office Desk",
    hours: "10:00 AM - 2:00 PM",
  },
];

const MEESEVA_SERVICES = [
  {
    title: "Caste Certificate (కుల ధృవీకరణ)",
    time: "3 Days",
    fee: "₹45",
    desc: "Required for scholarships, admissions & BC/SC/ST reservations.",
  },
  {
    title: "Income Certificate (ఆదాయ ధృవీకరణ)",
    time: "3 Days",
    fee: "₹45",
    desc: "Required for Rythu Bharosa, fee reimbursement & Aarogyasri.",
  },
  {
    title: "Residence Certificate (నివాస ధృవీకరణ)",
    time: "7 Days",
    fee: "₹45",
    desc: "Address proof for govt jobs and housing schemes.",
  },
  {
    title: "Pahani / Dharani 1B Copy",
    time: "Instant",
    fee: "₹25",
    desc: "Official land record extract & mutation history.",
  },
];

import { useVillagePreferences } from "@/lib/village-preferences";

function GovernmentPage() {
  const { t } = useVillagePreferences();
  return (
    <PageLayout
      title={t.governmentTitle}
      subtitle={t.governmentSubtitle}
      icon={<Building2 className="size-7 text-primary" />}
    >
      <div className="space-y-8">
        {/* Gram Panchayat Office Header Banner */}
        <SurfaceCard className="p-6 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent border-primary/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Official Panchayat Workspace
              </span>
              <h2 className="font-display text-xl font-bold text-foreground">
                Gram Panchayat Office (గ్రామ పంచాయతీ కార్యాలయం)
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="size-3.5 text-primary" /> Working Hours: Monday to Saturday (10:00
                AM - 5:00 PM)
              </p>
            </div>
            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-110 shrink-0"
            >
              <Megaphone className="size-4" /> View Gram Sabha Notices
            </Link>
          </div>
        </SurfaceCard>

        {/* Village Officers Directory */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="size-5 text-primary" /> Village Officers Directory (అధికారుల వివరాలు)
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {PANCHAYAT_OFFICERS.map((off, idx) => (
              <SurfaceCard key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center font-bold text-lg">
                      {off.designation[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        {off.name}
                        <ShieldCheck className="size-4 text-blue-500" />
                      </h3>
                      <p className="text-xs font-semibold text-primary">{off.designation}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1 text-muted-foreground border border-border/40">
                    <div>📍 {off.office}</div>
                    <div>🕒 {off.hours}</div>
                  </div>
                </div>

                <a
                  href={`tel:${off.phone}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-xs py-2.5 hover:brightness-110 active:scale-95 transition shadow-sm"
                >
                  <PhoneCall className="size-3.5" /> Call {off.phone}
                </a>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {/* MeeSeva Online Certificates */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="size-5 text-primary" /> MeeSeva Online Certificates (మీసేవ సేవలు)
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MEESEVA_SERVICES.map((srv, idx) => (
              <SurfaceCard key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Processing: {srv.time}
                    </span>
                    <span className="text-xs font-bold text-foreground">{srv.fee}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{srv.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{srv.desc}</p>
                </div>

                <a
                  href="https://ts.meeseva.telangana.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 text-primary font-bold text-xs py-2 hover:bg-primary/5 transition"
                >
                  Apply Online <ExternalLink className="size-3" />
                </a>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {/* Land Records & Schemes Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
                <Landmark className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Dharani Land Records Guide
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pahani, Passbook & Mutation status online
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Check your agricultural land survey numbers, encumbrance certificates (EC), and Rythu
              Bandhu transaction status directly through the official state land portal.
            </p>
            <a
              href="https://dharani.telangana.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              Open Dharani Portal <ExternalLink className="size-3.5" />
            </a>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 grid place-items-center">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Government Welfare Schemes
                </h3>
                <p className="text-xs text-muted-foreground">
                  Explore housing, pension & health schemes
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Browse complete details and eligibility guidelines for Indiramma Indlu (Housing),
              Aasara Pensions, Kalyana Lakshmi, and Mahalakshmi Free Bus Pass scheme.
            </p>
            <Link
              to="/schemes"
              className="inline-flex items-center gap-2 rounded-full border border-primary text-primary px-5 py-2.5 text-xs font-bold transition hover:bg-primary/5"
            >
              View All Welfare Schemes
            </Link>
          </SurfaceCard>
        </div>

        {/* Gram Panchayat Budget & Financial Transparency Dashboard */}
        <VillageBudgetDashboard />
      </div>
    </PageLayout>
  );
}
