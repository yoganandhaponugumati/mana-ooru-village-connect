import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Utensils, PhoneCall, ShieldCheck, Award, ExternalLink, School, Users } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { SurfaceCard } from "@/components/design-system";

export const Route = createFileRoute("/education")({
  head: () => ({ meta: [{ title: "Education & Schools Hub - ManaOoru" }] }),
  component: EducationPage,
});

const VILLAGE_SCHOOLS = [
  { name: "Zilla Parishad High School (ZPHS)", type: "Government High School (6th - 10th)", headmaster: "M. Ramakrishna", phone: "9848066771", location: "School Bazar Road", students: "280+ Students" },
  { name: "Mandal Parishad Primary School (MPPS)", type: "Government Primary (1st - 5th)", headmaster: "K. Anuradha", phone: "9848066772", location: "Near Panchayat Office", students: "140+ Students" },
  { name: "Village Anganwadi Center 1 & 2", type: "Pre-School & Nutrition", headmaster: "S. Padmavathi (Teacher)", phone: "9848066773", location: "Ward 2 & Ward 4", students: "45+ Children" },
];

const TUTORS_DIRECTORY = [
  { name: "Suresh Master", subject: "Mathematics & Physics (Classes 8th - 10th)", phone: "9848033111", location: "Bazar Street", fee: "Home Tuition Available" },
  { name: "Praveen Kumar", subject: "English & Social Studies", phone: "9848033222", location: "Near Railway Gate", fee: "Batches at 6:00 PM" },
];

const MIDDAY_MEAL_MENU = [
  { day: "Monday", menu: "Rice, Sambar, Boiled Egg (గుడ్డు), Vegetable Curry" },
  { day: "Tuesday", menu: "Rice, Tomato Dal, Chikki / Chutney" },
  { day: "Wednesday", menu: "Rice, Vegetable Sambar, Boiled Egg (గుడ్డు)" },
  { day: "Thursday", menu: "Rice, Leafy Vegetable Dal (ఆకుకూర పప్పు)" },
  { day: "Friday", menu: "Rice, Sambar, Boiled Egg (గుడ్డు)" },
  { day: "Saturday", menu: "Rice, Lemon Rice / Pulihora, Curd" },
];

function EducationPage() {
  return (
    <PageLayout
      title="Education & Learning Hub (విద్య & పాఠశాలలు)"
      subtitle="Village schools directory, Headmaster contacts, mid-day meal menu, and scholarship guides."
      icon={<GraduationCap className="size-7 text-primary" />}
    >
      <div className="space-y-8">
        {/* Village Schools Directory */}
        <div>
          <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <School className="size-5 text-primary" /> Village Schools & Colleges (పాఠశాలల వివరాలు)
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {VILLAGE_SCHOOLS.map((sch, idx) => (
              <SurfaceCard key={idx} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center font-bold">
                      <GraduationCap className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        {sch.name}
                        <ShieldCheck className="size-4 text-blue-500" />
                      </h3>
                      <p className="text-xs font-semibold text-primary">{sch.type}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/40 text-xs space-y-1 text-muted-foreground border border-border/40">
                    <div>👨‍🏫 HM: <strong className="text-foreground">{sch.headmaster}</strong></div>
                    <div>📍 {sch.location}</div>
                    <div className="text-emerald-600 font-semibold">🎓 {sch.students}</div>
                  </div>
                </div>

                <a
                  href={`tel:${sch.phone}`}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-bold text-xs py-2.5 hover:brightness-110 active:scale-95 transition shadow-sm"
                >
                  <PhoneCall className="size-3.5" /> Call HM {sch.phone}
                </a>
              </SurfaceCard>
            ))}
          </div>
        </div>

        {/* Mid-Day Meal Menu & Scholarships */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Mid-day Meal Transparency Menu */}
          <SurfaceCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center">
                <Utensils className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Mid-Day Meal Weekly Menu (మధ్యాహ్న భోజనం)</h3>
                <p className="text-xs text-muted-foreground">Government nutritional food menu transparency</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {MIDDAY_MEAL_MENU.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-muted/40 text-xs flex justify-between items-center">
                  <span className="font-bold text-foreground w-20">{item.day}</span>
                  <span className="text-muted-foreground text-right flex-1">{item.menu}</span>
                </div>
              ))}
            </div>
          </SurfaceCard>

          {/* ePass Scholarships & Tutors */}
          <div className="space-y-6">
            <SurfaceCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center">
                  <Award className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">ePass & College Scholarships</h3>
                  <p className="text-xs text-muted-foreground">Pre-metric & Post-metric fee reimbursement</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Apply for state post-metric scholarships, Jaganna Vidya Deevena, and Overseas Education Trust support.
              </p>
              <a
                href="https://telanganaepass.cgg.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                Open ePass Portal <ExternalLink className="size-3.5" />
              </a>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 grid place-items-center">
                  <Users className="size-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Home Tutors Directory</h3>
                  <p className="text-xs text-muted-foreground">Local subject teachers for 10th & Inter</p>
                </div>
              </div>

              <div className="space-y-2">
                {TUTORS_DIRECTORY.map((tut, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-foreground">{tut.name}</div>
                      <div className="text-muted-foreground">{tut.subject}</div>
                    </div>
                    <a href={`tel:${tut.phone}`} className="p-2 rounded-xl bg-primary text-white font-bold text-xs hover:brightness-110">
                      <PhoneCall className="size-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
