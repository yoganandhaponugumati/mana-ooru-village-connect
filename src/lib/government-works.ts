import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { uploadUserFile } from "@/lib/supabase/storage";

export type GovernmentWork = {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  department: string | null;
  budget: number | null;
  status: "planned" | "active" | "completed" | "paused" | "cancelled";
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  created_at: string;
  government_work_images?: {
    id: string;
    image_url: string;
    storage_path: string | null;
    created_at: string;
  }[];
};

export type GovernmentWorkInput = {
  title: string;
  description?: string;
  department?: string;
  budget?: string;
  status: GovernmentWork["status"];
  startDate?: string;
  endDate?: string;
  location?: string;
  photos: File[];
};

export function useGovernmentWorks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["government-works"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("government_works")
        .select(
          "id,created_by,title,description,department,budget,status,start_date,end_date,location,created_at,government_work_images(id,image_url,storage_path,created_at)",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as GovernmentWork[];
    },
  });

  const createWork = useCallback(
    async (input: GovernmentWorkInput) => {
      if (!user) {
        toast.error("Please sign in first");
        throw new Error("not authenticated");
      }

      const { data: work, error: workError } = await supabase
        .from("government_works")
        .insert({
          created_by: user.id,
          title: input.title,
          description: input.description || null,
          department: input.department || null,
          budget: input.budget ? Number(input.budget) : null,
          status: input.status,
          start_date: input.startDate || null,
          end_date: input.endDate || null,
          location: input.location || null,
        })
        .select("id")
        .single();

      if (workError) throw workError;
      const workId = (work as unknown as { id: string }).id;

      if (input.photos.length > 0) {
        const uploaded = await Promise.all(
          input.photos.map((photo) => uploadUserFile("government-works", user.id, photo)),
        );

        const { error: imageError } = await supabase.from("government_work_images").insert(
          uploaded.map((photo) => ({
            government_work_id: workId,
            uploaded_by: user.id,
            image_url: photo.url,
            storage_path: photo.path,
          })),
        );

        if (imageError) throw imageError;
      }

      await queryClient.invalidateQueries({ queryKey: ["government-works"] });
      toast.success("Government work update posted");
    },
    [queryClient, user],
  );

  return {
    works: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    createWork,
    creating: false,
  };
}
