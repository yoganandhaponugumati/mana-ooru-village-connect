import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Loader2, MapPin, ShieldAlert, ShoppingBag, Store, X } from "lucide-react";
import { toast } from "sonner";
import { SurfaceCard } from "@/components/design-system";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  approveDealerApplication,
  rejectDealerApplication,
  suspendDealer,
} from "@/lib/supabase/auth";

type DealerApplication = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  shop_name: string | null;
  shop_description: string | null;
  shop_address: string | null;
  dealer_category: string | null;
  dealer_status: string | null;
  village: string | null;
  village_id: string | null;
  district: string | null;
  state: string | null;
  created_at: string;
  photo_url: string | null;
};

type DealerApprovalListProps = {
  /** Filter: "pending" | "approved" | "suspended" | "rejected" | "all" */
  statusFilter?: string;
};

export function DealerApprovalList({ statusFilter = "pending" }: DealerApprovalListProps) {
  const { role, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: dealers, isLoading } = useQuery({
    queryKey: ["dealer-applications", statusFilter, profile?.village_id],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(
          "id,full_name,email,phone,shop_name,shop_description,shop_address,dealer_category,dealer_status,village,village_id,district,state,created_at,photo_url",
        )
        .not("dealer_status", "is", null)
        .order("created_at", { ascending: false });

      // Status filter
      if (statusFilter !== "all") {
        query = query.eq(
          "dealer_status",
          statusFilter as "pending" | "approved" | "suspended" | "rejected",
        );
      }

      // Execute primary query
      const { data, error } = await query;
      if (error) {
        console.error("Dealer query error:", error);
        throw error;
      }

      let results = (data || []) as DealerApplication[];

      // If village_admin is viewing, prioritize village matches but don't hide unassigned dealers
      if (role === "village_admin" && profile?.village_id) {
        const villageMatched = results.filter(
          (d) => d.village_id === profile.village_id || d.village === profile.village || !d.village_id
        );
        if (villageMatched.length > 0) {
          results = villageMatched;
        }
      }

      return results;
    },
    enabled: role === "super_admin" || role === "village_admin",
  });

  const approveMutation = useMutation({
    mutationFn: approveDealerApplication,
    onSuccess: () => {
      toast.success("Dealer approved successfully!");
      queryClient.invalidateQueries({ queryKey: ["dealer-applications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectDealerApplication,
    onSuccess: () => {
      toast.success("Dealer application rejected.");
      queryClient.invalidateQueries({ queryKey: ["dealer-applications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const suspendMutation = useMutation({
    mutationFn: suspendDealer,
    onSuccess: () => {
      toast.success("Dealer suspended.");
      queryClient.invalidateQueries({ queryKey: ["dealer-applications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        Loading dealer applications...
      </div>
    );
  }

  if (!dealers || dealers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
        <Store className="mx-auto mb-3 size-8 text-muted-foreground/50" />
        No {statusFilter === "all" ? "" : statusFilter} dealer applications found.
      </div>
    );
  }

  const isActionBusy =
    approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-clay">
          {statusFilter === "all"
            ? "All Dealers"
            : statusFilter === "pending"
              ? "Pending Applications"
              : statusFilter === "approved"
                ? "Approved Dealers"
                : statusFilter === "suspended"
                  ? "Suspended Dealers"
                  : "Rejected Applications"}
        </h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          {dealers.length}
        </span>
      </div>

      {dealers.map((dealer) => (
        <SurfaceCard key={dealer.id} className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="grid size-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {dealer.full_name?.charAt(0)?.toUpperCase() || "D"}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-clay">
                  {dealer.full_name || "Unknown"}
                </h4>
                <StatusBadge status={dealer.dealer_status} />
              </div>
              <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {dealer.shop_name && (
                  <p className="flex items-center gap-1">
                    <Store className="size-3" />
                    {dealer.shop_name}
                  </p>
                )}
                {dealer.dealer_category && (
                  <p className="flex items-center gap-1">
                    <ShoppingBag className="size-3" />
                    {dealer.dealer_category}
                  </p>
                )}
                {dealer.village && (
                  <p className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {[dealer.village, dealer.district, dealer.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {dealer.shop_description && (
                  <p className="mt-1 line-clamp-2 text-muted-foreground/80">
                    {dealer.shop_description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
            {dealer.dealer_status === "pending" && (
              <>
                <button
                  onClick={() => approveMutation.mutate(dealer.id)}
                  disabled={isActionBusy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="size-3" />
                  Approve
                </button>
                <button
                  onClick={() => rejectMutation.mutate(dealer.id)}
                  disabled={isActionBusy}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  <X className="size-3" />
                  Reject
                </button>
              </>
            )}
            {dealer.dealer_status === "approved" && (
              <button
                onClick={() => suspendMutation.mutate(dealer.id)}
                disabled={isActionBusy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
              >
                <ShieldAlert className="size-3" />
                Suspend
              </button>
            )}
            {dealer.dealer_status === "suspended" && (
              <button
                onClick={() => approveMutation.mutate(dealer.id)}
                disabled={isActionBusy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="size-3" />
                Reinstate
              </button>
            )}
            {dealer.dealer_status === "rejected" && (
              <button
                onClick={() => approveMutation.mutate(dealer.id)}
                disabled={isActionBusy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="size-3" />
                Approve
              </button>
            )}
          </div>
        </SurfaceCard>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const config: Record<string, { bg: string; text: string; icon: typeof Check; label: string }> = {
    pending: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock, label: "Pending" },
    approved: { bg: "bg-emerald-100", text: "text-emerald-700", icon: Check, label: "Approved" },
    suspended: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: ShieldAlert,
      label: "Suspended",
    },
    rejected: { bg: "bg-red-100", text: "text-red-700", icon: X, label: "Rejected" },
  };

  const c = config[status ?? ""] ?? {
    bg: "bg-muted",
    text: "text-muted-foreground",
    icon: Clock,
    label: status ?? "Unknown",
  };
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${c.bg} ${c.text}`}
    >
      <Icon className="size-2.5" />
      {c.label}
    </span>
  );
}
