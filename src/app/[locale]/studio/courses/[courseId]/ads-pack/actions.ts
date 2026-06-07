"use server";

import { GeminiError } from "@/lib/gemini/generate-json";
import { buildBaseGoogleAdsPack } from "@/lib/ads-pack/build-base-pack";
import { enrichGoogleAdsPackWithGemini } from "@/lib/ads-pack/enrich-with-gemini";
import type { AdsPackLocale, GoogleAdsPack } from "@/lib/ads-pack/types";
import type { DbCourse } from "@/lib/courses";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

export type GenerateAdsPackResult =
  | { ok: true; pack: GoogleAdsPack }
  | { ok: false; error: string };

export async function generateGoogleAdsPack(input: {
  locale: string;
  courseId: string;
  contentLocale: AdsPackLocale;
  useAi: boolean;
}): Promise<GenerateAdsPackResult> {
  const { page } = await getStudioContext(input.locale);
  const supabase = await createClient();

  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", input.courseId)
    .eq("author_page_id", page.id)
    .maybeSingle();

  if (!courseData) {
    return { ok: false, error: "not_found" };
  }

  const course = courseData as DbCourse;
  let pack = buildBaseGoogleAdsPack({
    course,
    authorName: page.display_name || course.author_name,
    authorSlug: page.slug,
    primaryLocale: input.contentLocale,
  });

  if (input.useAi) {
    try {
      pack = await enrichGoogleAdsPackWithGemini({
        course,
        authorName: page.display_name || course.author_name,
        pack,
        locale: input.contentLocale,
      });
    } catch (err) {
      if (err instanceof GeminiError) {
        return { ok: false, error: err.code };
      }
      return { ok: false, error: "gemini_failed" };
    }
  }

  return { ok: true, pack };
}
