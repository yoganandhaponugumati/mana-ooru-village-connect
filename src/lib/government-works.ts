import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { deleteUserFile, uploadUserFile } from "@/lib/supabase/storage";
import { sendVillagePushNotification } from "@/lib/api/notification.functions";

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
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["government-works", profile?.village_id ?? "all"],
    queryFn: async () => {
      let request = supabase
        .from("government_works")
        .select(
          "id,created_by,title,description,department,budget,status,start_date,end_date,location,created_at,government_work_images(id,image_url,storage_path,created_at)",
        )
        .order("created_at", { ascending: false });
      if (profile?.village_id) {
        request = request.eq("village_id", profile.village_id);
      }

      const { data, error } = await request;
      if (error) throw error;
      return (data ?? []) as unknown as GovernmentWork[];
    },
  });

  const createWork = useCallback(
    async (input: GovernmentWorkInput) => {
      if (!user) {
        throw new Error("Please sign in before posting. Posts are saved only to Supabase.");
      }

      const uploadedPaths: string[] = [];
      const { data: work, error: workError } = await supabase
        .from("government_works")
        .insert({
          created_by: user.id,
          village_id: profile?.village_id || null,
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

      if (workError) {
        console.error("[government-work] create:error", workError);
        throw new Error(`Government work could not be saved: ${workError.message}`);
      }
      const workId = (work as unknown as { id: string }).id;

      try {
        if (input.photos.length > 0) {
          const uploaded = await Promise.all(
            input.photos.map((photo) => uploadUserFile("government-works", user.id, photo)),
          );
          uploadedPaths.push(...uploaded.map((photo) => photo.path));

          const { error: imageError } = await supabase.from("government_work_images").insert(
            uploaded.map((photo) => ({
              government_work_id: workId,
              uploaded_by: user.id,
              image_url: photo.url,
              storage_path: photo.path,
            })),
          );

          if (imageError) {
            console.error("[government-work] photos:db-insert:error", imageError);
            throw new Error(`Government work photos could not be saved: ${imageError.message}`);
          }
        }
      } catch (error) {
        console.error("[government-work] create:rollback:start", { workId, uploadedPaths, error });
        await Promise.allSettled(
          uploadedPaths.map((path) => deleteUserFile("government-works", path)),
        );
        if (workId) {
          const { error: deleteWorkError } = await supabase
            .from("government_works")
            .delete()
            .eq("id", workId);
          if (deleteWorkError) {
            console.error("[government-work] create:rollback-work:error", deleteWorkError);
          }
        }
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["government-works"] });
      await queryClient.invalidateQueries({ queryKey: ["timeline-activities"] });

      toast.success("Government work update posted");

      void sendVillagePushNotification({
        data: {
          villageId: profile?.village_id || null,
          title: "GramMitra • Gram Panchayat Work Progress",
          body: `Sarpanch updated progress: "${input.title}" (${input.status.replace("_", " ")}). Tap to open & view photos.`,
          url: "/official",
          tag: `work:${workId}`,
          notificationId: workId,
        },
      }).catch((err) => {
        console.error("[government-work] push notification error:", err);
      });
    },
    [queryClient, user, profile?.village_id],
  );

  return {
    works: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    createWork,
    creating: false,
  };
}
