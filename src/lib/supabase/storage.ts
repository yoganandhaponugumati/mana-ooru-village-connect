import { supabase } from "@/integrations/supabase/client";

export type StorageBucket =
  | "profile-images"
  | "complaints"
  | "government-works"
  | "products"
  | "events"
  | "documents";

export function getPublicStorageUrl(bucket: StorageBucket, path: string) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function uploadUserFile(bucket: StorageBucket, userId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  return {
    path,
    url: getPublicStorageUrl(bucket, path),
  };
}
