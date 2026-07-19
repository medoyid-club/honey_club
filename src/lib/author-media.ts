import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadAuthorMedia(
  supabase: SupabaseClient,
  pageId: string,
  kind: string,
  file: File | { buffer: Buffer; contentType: string; ext?: string }
): Promise<string | null> {
  let buffer: Buffer;
  let contentType: string;
  let ext: string;

  if (file instanceof File) {
    if (!file.size) return null;
    if (!file.type.startsWith("image/")) {
      console.warn("[author-media] rejected non-image upload:", file.type);
      return null;
    }
    buffer = Buffer.from(await file.arrayBuffer());
    contentType = file.type || "image/jpeg";
    ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  } else {
    if (!file.buffer.length) return null;
    buffer = file.buffer;
    contentType = file.contentType || "image/jpeg";
    ext = file.ext ?? "jpg";
  }

  const path = `${pageId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("author-media").upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error("[author-media] upload failed:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("author-media").getPublicUrl(path);
  return data.publicUrl;
}
