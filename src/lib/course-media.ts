import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "author-media";

async function uploadFile(
  supabase: SupabaseClient,
  path: string,
  file: File,
  contentType: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true,
  });

  if (error) return null;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadCourseCover(
  supabase: SupabaseClient,
  pageId: string,
  courseId: string,
  file: File
): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${pageId}/courses/${courseId}/cover-${Date.now()}.${ext}`;
  return uploadFile(supabase, path, file, file.type || "image/jpeg");
}

export async function uploadCourseOverviewVideo(
  supabase: SupabaseClient,
  pageId: string,
  courseId: string,
  file: File
): Promise<string | null> {
  const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
  const path = `${pageId}/courses/${courseId}/overview-${Date.now()}.${ext}`;
  return uploadFile(supabase, path, file, file.type || "video/mp4");
}
