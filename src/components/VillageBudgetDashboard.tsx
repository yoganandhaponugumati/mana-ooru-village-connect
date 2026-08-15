import { useState } from "react";
import {
  Landmark,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  IndianRupee,
} from "lucide-react";

interface GrantProject {
  id: string;
  name: string;
  scheme: string;
  allocatedBudget: number;
  spentBudget: number;
  status: "Completed" | "In Progress" | "Sanctioned";
  completionPct: number;
  contractor: string;
}

const DEFAULT_PROJECTS: GrantProject[] = [
  {
    id: "proj-1",
    name: "Ward 3 & 4 Concrete Drain & CC Road Construction",
    scheme: "15th Finance Commission Grant",
    allocatedBudget: 450000,
    spentBudget: 410000,
    status: "Completed",
    completionPct: 100,
    contractor: "Sri Sai Infrastructure",
  },
  {
    id: "proj-2",
    name: "Panchayat Solar Streetlights Installation (45 Poles)",
    scheme: "Gram Swaraj Abhiyan Fund",
    allocatedBudget: 280000,
    spentBudget: 195000,
    status: "In Progress",
    completionPct: 75,
    contractor: "Green Energy Solutions",
  },
  {
    id: "proj-3",
    name: "Overhead Water Tank Maintenance & Purification Unit",
    scheme: "Mission Bhagiratha / Jal Jeevan Mission",
    allocatedBudget: 320000,
    spentBudget: 80000,
    status: "In Progress",
    completionPct: 35,
    contractor: "Rural Water Supply Dept",
  },
  {
    id: "proj-4",
    name: "Gram Panchayat Office Roof Renovation & Computer Room",
    scheme: "Panchayat Raj State Sanction",
    allocatedBudget: 150000,
    spentBudget: 0,
    status: "Sanctioned",
    completionPct: 0,
    contractor: "Panchayat Works Dept",
  },
];

export function VillageBudgetDashboard() {
  const [projects] = useState<GrantProject[]>(DEFAULT_PROJECTS);

  const totalAllocated = projects.reduce((acc, p) => acc + p.allocatedBudget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spentBudget, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallSpentPct = Math.round((totalSpent / totalAllocated) * 100);

  const formatRupees = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Sanctioned Grants
            </span>
            <div className="grid size-9 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Landmark className="size-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {formatRupees(totalAllocated)}
          </p>
          <span className="mt-1 block text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            FY 2025–2026 Gram Panchayat Allocations
          </span>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-blue-500/10 via-card to-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Funds Utilized
            </span>
            <div className="grid size-9 place-items-center rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {formatRupees(totalSpent)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${overallSpentPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {overallSpentPct}%
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-gradient-to-br from-amber-500/10 via-card to-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Remaining Balance
            </span>
            <div className="grid size-9 place-items-center rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <IndianRupee className="size-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-foreground">
            {formatRupees(totalRemaining)}
          </p>
          <span className="mt-1 block text-[11px] font-medium text-amber-600 dark:text-amber-400">
            Available for ongoing works
          </span>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <span>Gram Panchayat Works & Financial Status</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Public disclosure of village development projects and funds utilization.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/80">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3">Project & Scheme</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Allocated Budget</th>
                <th className="px-4 py-3">Spent Amount</th>
                <th className="px-4 py-3">Completion Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-muted/20 transition">
                  <td className="px-4 py-3.5 max-w-xs">
                    <p className="font-semibold text-foreground">{proj.name}</p>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {proj.scheme} • Contractor: {proj.contractor}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {proj.status === "Completed" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" /> Completed
                      </span>
                    )}
                    {proj.status === "In Progress" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        <Clock className="size-3" /> In Progress
                      </span>
                    )}
                    {proj.status === "Sanctioned" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3" /> Sanctioned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold whitespace-nowrap">
                    {formatRupees(proj.allocatedBudget)}
                  </td>
                  <td className="px-4 py-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatRupees(proj.spentBudget)}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${proj.completionPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-bold text-muted-foreground">
                        {proj.completionPct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
