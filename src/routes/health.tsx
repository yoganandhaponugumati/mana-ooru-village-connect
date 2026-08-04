import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HeartPulse,
  Siren,
  Stethoscope,
  PhoneCall,
  ShieldCheck,
  CalendarDays,
  Pill,
  Activity,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";
import { useVillagePreferences } from "@/lib/village-preferences";

export const Route = createFileRoute("/health")({
  head: () => ({ meta: [{ title: "Health & Medical Hub - GramMitra" }] }),
  component: HealthPage,
});

const EMERGENCY_BUTTONS = [
  {
    name: "108 Emergency Ambulance",
    number: "108",
    desc: "24/7 Free Emergency Transport",
    bg: "bg-red-600 hover:bg-red-700 text-white",
  },
  {
    name: "104 Mobile Health Clinic",
    number: "104",
    desc: "Tele-medicine & Advice",
    bg: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  {
    name: "Mandal Primary Health Center (PHC)",
    number: "0841-23999",
    desc: "General OP & Emergency Ward",
    bg: "bg-blue-600 hover:bg-blue-700 text-white",
  },
];

const HEALTH_STAFF = [
  {
    name: "Lalitha Kumari",
    role: "Auxiliary Nurse Midwife (ANM)",
    phone: "9848077889",
    center: "Sub-Center Ward 3",
    status: "Available 24/7 for Deliveries",
  },
  {
    name: "Lakshmi",
    role: "ASHA Worker (ఆశా కార్యకర్త)",
    phone: "9848044556",
    center: "Main Bazar Ward 1",
    status: "Maternal & Child Health",
  },
  {
    name: "Dr. K. Srinivas",
    role: "Duty Medical Officer",
    phone: "9848033221",
    center: "Mandal Government Hospital",
    status: "OP: 9:00 AM - 1:00 PM",
  },
];

const MEDICAL_SHOPS = [
  {
    name: "Sri Sai Medical & General Stores",
    owner: "Srinivas",
    phone: "9848055667",
    location: "Bus Stand Road",
    open24hrs: true,
  },
  {
    name: "Apollo Pharmacy Partner",
    owner: "Venkatesh",
    phone: "9848088990",
    location: "Main Bazar",
    open24hrs: false,
  },
];

function HealthPage() {
  const { t } = useVillagePreferences();
  return (
    <PageLayout
      title={(t as any).healthTitle || "Village Health & Emergency Services"}
      subtitle={(t as any).healthSubtitle || "Find 24/7 doctors, ambulances, blood donors, and medical camps nearby."}
      icon={<HeartPulse className="size-7 text-red-500" />}
    >
      <div className="space-y-8">
        {/* 1-Tap Emergency Call Banner */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Siren className="size-5 text-red-500 animate-pulse" /> 1-Tap Emergency Helpline Call
            Buttons
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {EMERGENCY_BUTTONS.map((btn, idx) => (
              <a
                key={idx}
                href={`tel:${btn.number}`}
                className={`p-5 rounded-2xl ${btn.bg} shadow-lg transition transform hover:-translate-y-1 active:scale-95 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider opacity-80">
                      Emergency
                    </span>
                    <PhoneCall className="size-5" />
                  </div>
                  <h3 className="font-bold text-lg">{btn.name}</h3>
                  <p className="text-xs opacity-90 mt-1">{btn.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/20 font-black text-xl tracking-wider">
                  📞 Dial {btn.number}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Village Healthcare Staff Directory */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Stethoscope className="size-5 text-primary" /> Village Healthcare Staff (ఆరోగ్య
            సిబ్బంది)
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {HEALTH_STAFF.map((staff, idx) => (
              <SurfaceCard key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-11 rounded-2xl bg-red-500/10 text-red-500 grid place-items-center font-bold">
                      <HeartPulse className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        {staff.name}
                        <ShieldCheck className="size-4 text-emerald-500" />
                      </h3>
                      <p className="text-xs font-semibold text-primary">{staff.role}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1 text-muted-foreground border border-border/40">
                    <div>📍 {staff.center}</div>
                    <div className="text-emerald-600 font-semibold">✨ {staff.status}</div>
                  </div>
                </div>

                <a
                  href={`tel:${staff.phone}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white font-bold text-xs py-2.5 hover:bg-red-700 active:scale-95 transition shadow-sm"
                >
                  <PhoneCall className="size-3.5" /> Call {staff.phone}
                </a>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {/* 24/7 Medical Shops & Health Camps */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Medical Shops */}
          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 grid place-items-center">
                <Pill className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Local Medical Shops
                </h3>
                <p className="text-xs text-muted-foreground">
                  Medicines, first-aid & emergency supplies
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {MEDICAL_SHOPS.map((shop, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-foreground flex items-center gap-2">
                      {shop.name}
                      {shop.open24hrs && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          24/7 Open
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-0.5">📍 {shop.location}</div>
                  </div>
                  <a
                    href={`tel:${shop.phone}`}
                    className="p-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:brightness-110"
                  >
                    <PhoneCall className="size-4" />
                  </a>
                </div>
              ))}
            </div>
          </SurfaceCard>

          {/* Free Health Camps & Aarogyasri */}
          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
                <Activity className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Free Health Camps & Aarogyasri
                </h3>
                <p className="text-xs text-muted-foreground">
                  Free treatment up to ₹5 Lakhs per family
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Check the schedule for upcoming 104 Mobile Medical Van visits, pulse polio drives,
              free eye checkup camps, and Aarogyasri empanelled hospital list.
            </p>

            <Link
              to="/announcements"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <CalendarDays className="size-4" /> View Health Camp Schedule
            </Link>
          </SurfaceCard>
        </div>

        {/* Emergency Blood Donors Directory */}
        <BloodDonorsDirectory />
      </div>
    </PageLayout>
  );
}

const BLOOD_DONORS = [
  { name: "Ramesh Kumar", group: "O+", phone: "9848011223", location: "Main Bazar Ward 2", status: "Ready to donate", lastDonated: "3 months ago" },
  { name: "K. Venkatesh", group: "A+", phone: "9848033445", location: "Station Road", status: "Ready to donate", lastDonated: "6 months ago" },
  { name: "Suresh Reddy", group: "B+", phone: "9848055667", location: "Panchayat Office", status: "Emergency only", lastDonated: "2 months ago" },
  { name: "B. Anitha", group: "O-", phone: "9848077889", location: "School Street Ward 4", status: "Universal Donor", lastDonated: "4 months ago" },
  { name: "M. Rajesh", group: "AB+", phone: "9848099001", location: "Bus Stand Area", status: "Ready to donate", lastDonated: "5 months ago" },
];

function BloodDonorsDirectory() {
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const groups = ["ALL", "O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"];

  const filteredDonors = selectedGroup === "ALL"
    ? BLOOD_DONORS
    : BLOOD_DONORS.filter((d) => d.group === selectedGroup);

  return (
    <SurfaceCard className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-red-500/10 text-red-600 font-bold text-sm">🩸</span>
            <span>Emergency Blood Donors Directory</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verified local blood donors available for emergency transfusions.
          </p>
        </div>

        {/* Group Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                selectedGroup === g
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDonors.map((donor, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-border/80 bg-background/50 flex items-center justify-between gap-3 shadow-2xs hover:border-red-500/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-red-500/15 text-red-600 dark:text-red-400 font-display font-extrabold text-sm shrink-0">
                {donor.group}
              </div>
              <div>
                <h4 className="font-bold text-xs text-foreground">{donor.name}</h4>
                <p className="text-[11px] text-muted-foreground">📍 {donor.location}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ● {donor.status}
                </span>
              </div>
            </div>

            <a
              href={`tel:${donor.phone}`}
              className="grid size-9 place-items-center rounded-xl bg-red-600 text-white hover:bg-red-700 transition shrink-0"
              title={`Call ${donor.name}`}
            >
              <PhoneCall className="size-4" />
            </a>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

