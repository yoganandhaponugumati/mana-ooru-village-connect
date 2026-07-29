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
  console.info("[storage] upload:start", {
    bucket,
    path,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  });

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    console.error("[storage] upload:error", { bucket, path, error });
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const url = getPublicStorageUrl(bucket, path);
  console.info("[storage] upload:success", { bucket, path, url });

  return {
    path,
    url,
  };
}

export async function deleteUserFile(bucket: StorageBucket, path: string) {
  console.info("[storage] delete:start", { bucket, path });
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("[storage] delete:error", { bucket, path, error });
    throw new Error(`Uploaded image rollback failed: ${error.message}`);
  }
  console.info("[storage] delete:success", { bucket, path });
}
