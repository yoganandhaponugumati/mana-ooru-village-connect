import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";
import { toast } from "sonner";

export type SchemeCategory =
  | "agriculture"
  | "health"
  | "education"
  | "housing"
  | "women"
  | "senior_citizen"
  | "general";

export type SchemeStatus = "active" | "closed" | "upcoming";
export type ApplicationStatus = "submitted" | "under_review" | "approved" | "rejected";

export type VillageScheme = {
  id: string;
  created_by: string;
  village_id: string | null;
  title: string;
  description: string;
  department: string | null;
  eligibility: string | null;
  benefit_amount: number | null;
  application_url: string | null;
  document_url: string | null;
  category: SchemeCategory;
  status: SchemeStatus;
  deadline: string | null;
  created_at: string;
};

export type SchemeApplication = {
  id: string;
  scheme_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
};

/** All schemes an admin has posted through ManaOoru, newest first. */
export function useVillageSchemes() {
  return useQuery({
    queryKey: ["village-schemes"],
    queryFn: async (): Promise<VillageScheme[]> => {
      const { data, error } = await supabase
        .from("government_schemes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as VillageScheme[];
    },
  });
}

/** The signed-in citizen's own applications, keyed by scheme_id for quick lookup. */
export function useMyApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-scheme-applications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<Record<string, SchemeApplication>> => {
      if (!user) return {};
      const { data, error } = await supabase
        .from("scheme_applications")
        .select("*")
        .eq("applicant_id", user.id);
      if (error) throw error;
      const byScheme: Record<string, SchemeApplication> = {};
      for (const row of (data ?? []) as SchemeApplication[]) {
        byScheme[row.scheme_id] = row;
      }
      return byScheme;
    },
  });
}

/** Submit (or resubmit) an application for a scheme. */
export function useApplyToScheme() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (schemeId: string) => {
      if (!user) throw new Error("Please sign in to apply.");
      const { error } = await supabase
        .from("scheme_applications")
        .upsert(
          { scheme_id: schemeId, applicant_id: user.id, status: "submitted" },
          { onConflict: "scheme_id,applicant_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted. Track its status right here.");
      queryClient.invalidateQueries({ queryKey: ["my-scheme-applications"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not submit application");
    },
  });
}

/** Admin-only: create a new scheme. */
export function useCreateScheme() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: Pick<VillageScheme, "title" | "description" | "category"> &
        Partial<
          Omit<
            VillageScheme,
            "id" | "created_by" | "created_at" | "title" | "description" | "category"
          >
        >,
    ) => {
      if (!user) throw new Error("Please sign in.");
      const { error } = await supabase.from("government_schemes").insert({
        ...input,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Scheme published to your village");
      queryClient.invalidateQueries({ queryKey: ["village-schemes"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Could not publish scheme");
    },
  });
}

export const schemeCategoryLabels: Record<SchemeCategory, string> = {
  agriculture: "Agriculture",
  health: "Health",
  education: "Education",
  housing: "Housing",
  women: "Women & Children",
  senior_citizen: "Senior Citizen",
  general: "General",
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Not approved",
};
