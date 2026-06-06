/**
 * Upload cover + overview video for Nata's manipulation course.
 *
 * Usage: node scripts/seed-nata-course-media.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const COVER_PATH = path.join(ROOT, "temp", "manipulation.png");
const VIDEO_PATH = path.join(ROOT, "temp", "manipulation.mp4");
const COURSE_SLUG = "manipulyatsii-nata-ustimenko";
const BUCKET = "author-media";

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local not found");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function uploadFile(supabase, storagePath, filePath, contentType) {
  const buffer = fs.readFileSync(filePath);
  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload failed (${storagePath}): ${error.message}`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  if (!fs.existsSync(COVER_PATH)) throw new Error(`Cover not found: ${COVER_PATH}`);
  if (!fs.existsSync(VIDEO_PATH)) throw new Error(`Video not found: ${VIDEO_PATH}`);

  const supabase = createClient(url, key);

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, author_page_id, slug")
    .eq("slug", COURSE_SLUG)
    .maybeSingle();

  if (courseError || !course) {
    throw new Error(`Course "${COURSE_SLUG}" not found. Run seed-nata-manipulations first.`);
  }

  const pageId = course.author_page_id;
  const courseId = course.id;
  const coverUrl = await uploadFile(
    supabase,
    `${pageId}/courses/${courseId}/cover.png`,
    COVER_PATH,
    "image/png"
  );
  const overviewVideoUrl = await uploadFile(
    supabase,
    `${pageId}/courses/${courseId}/overview.mp4`,
    VIDEO_PATH,
    "video/mp4"
  );

  const { error: updateError } = await supabase
    .from("courses")
    .update({ cover_url: coverUrl, overview_video_url: overviewVideoUrl })
    .eq("id", courseId);

  if (updateError) throw new Error(updateError.message);

  console.log("Updated course media:");
  console.log("  cover:", coverUrl);
  console.log("  video:", overviewVideoUrl);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
