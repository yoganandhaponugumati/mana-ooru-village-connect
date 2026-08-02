import { useState, useEffect } from "react";
import { Shield, Clock, Search, Filter, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AuditLog {
  id: string;
  actor_email: string;
  action_type: string;
  target_resource: string;
  details: string;
  created_at: string;
}

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    actor_email: "sarpanch@grammitra.org",
    action_type: "APPROVE_DEALER",
    target_resource: "Sri Lakshmi Fertilisers & Seeds",
    details: "Approved dealer storefront listing and assigned Verified Badge.",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "log-2",
    actor_email: "admin@grammitra.org",
    action_type: "RESOLVE_COMPLAINT",
    target_resource: "Streetlight Repair Ward 4",
    details: "Marked citizen complaint as resolved by Electrical Dept.",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "log-3",
    actor_email: "sarpanch@grammitra.org",
    action_type: "POST_NOTICE",
    target_resource: "Gram Sabha General Meeting Notice",
    details: "Published official Gram Sabha meeting schedule for upcoming Sunday.",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>(DEFAULT_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("audit_logs" as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          setLogs(data as any);
        }
      } catch (err) {
        console.warn("Using fallback audit logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.actor_email.toLowerCase().includes(search.toLowerCase()) ||
      log.action_type.toLowerCase().includes(search.toLowerCase()) ||
      log.target_resource.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold flex items-center gap-2 text-foreground">
            <Shield className="size-5 text-amber-500" />
            <span>Admin Action Audit Logs</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent activity record for Sarpanch, Panchayat Ops & Platform Admins.
          </p>
        </div>

        {/* Search filter */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-background/50">
        <table className="w-full text-left text-xs text-foreground">
          <thead className="bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Admin Actor</th>
              <th className="px-4 py-3">Action Type</th>
              <th className="px-4 py-3">Target Resource</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No matching audit logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-primary">
                    {log.actor_email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                      <CheckCircle2 className="size-3" />
                      {log.action_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium">
                    {log.target_resource}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
