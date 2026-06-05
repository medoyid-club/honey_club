"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { CourseStatus, LessonType } from "@/lib/courses";
import { slugify } from "@/lib/slug";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const STATUSES: CourseStatus[] = [
  "draft",
  "upcoming",
  "live",
  "completed",
  "archived",
];
const LESSON_TYPES: LessonType[] = ["lecture", "practice", "seminar"];

function int(formData: FormData, key: string): number {
  const v = parseInt((formData.get(key) as string) || "0", 10);
  return Number.isFinite(v) && v >= 0 ? v : 0;
}

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string) || "").trim();
}

async function uniqueCourseSlug(
  supabase: SupabaseClient,
  base: string
): Promise<string> {
  let slug = base || "course";
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

async function recalcCourseTotals(supabase: SupabaseClient, courseId: string) {
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id")
    .eq("course_id", courseId);

  const moduleIds = (modules ?? []).map((m: { id: string }) => m.id);
  if (moduleIds.length === 0) {
    await supabase
      .from("courses")
      .update({ lessons: 0, duration_hours: 0 })
      .eq("id", courseId);
    return;
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("duration_minutes")
    .in("module_id", moduleIds);

  const count = lessons?.length ?? 0;
  const minutes = (lessons ?? []).reduce(
    (sum: number, l: { duration_minutes: number }) => sum + (l.duration_minutes || 0),
    0
  );

  await supabase
    .from("courses")
    .update({ lessons: count, duration_hours: Math.round((minutes / 60) * 10) / 10 })
    .eq("id", courseId);
}

export async function createCourse(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { user, page } = await getStudioContext(locale);
  const supabase = await createClient();

  const title = str(formData, "title_ru") || "Новый курс";
  const slug = await uniqueCourseSlug(supabase, slugify(title));

  const { data: created, error } = await supabase
    .from("courses")
    .insert({
      slug,
      title_ru: title,
      summary_ru: "",
      author_name: page.display_name || "Автор",
      author_id: user.id,
      author_page_id: page.id,
      status: "draft",
      published: false,
      format: "course",
      level: "beginner",
      duration_hours: 0,
      lessons: 0,
      price_usd: 0,
      price_online_usd: 0,
      price_offline_usd: 0,
      tags: [],
    })
    .select("id")
    .single();

  if (error || !created) {
    redirect(`/${locale}/studio/courses?error=create_failed`);
  }

  revalidatePath(`/${locale}/studio/courses`);
  redirect(`/${locale}/studio/courses/${created.id}`);
}

export async function updateCourse(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const status = str(formData, "status") as CourseStatus;
  const tags = str(formData, "tags")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await supabase
    .from("courses")
    .update({
      title_ru: str(formData, "title_ru") || "Без названия",
      title_uk: str(formData, "title_uk") || null,
      title_en: str(formData, "title_en") || null,
      summary_ru: str(formData, "summary_ru"),
      summary_uk: str(formData, "summary_uk") || null,
      summary_en: str(formData, "summary_en") || null,
      description_ru: str(formData, "description_ru") || null,
      description_uk: str(formData, "description_uk") || null,
      description_en: str(formData, "description_en") || null,
      format: str(formData, "format") || "course",
      level: str(formData, "level") || "beginner",
      status: STATUSES.includes(status) ? status : "draft",
      price_online_usd: int(formData, "price_online_usd"),
      price_offline_usd: int(formData, "price_offline_usd"),
      published: formData.get("published") === "on",
      author_name: page.display_name || "Автор",
      tags,
    })
    .eq("id", courseId);

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}?saved=1`);
}

export async function deleteCourse(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  await supabase.from("courses").delete().eq("id", courseId);

  revalidatePath(`/${locale}/studio/courses`);
  redirect(`/${locale}/studio/courses`);
}

export async function createModule(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const { count } = await supabase
    .from("course_modules")
    .select("id", { count: "exact", head: true })
    .eq("course_id", courseId);

  await supabase.from("course_modules").insert({
    course_id: courseId,
    position: (count ?? 0) + 1,
    title_ru: str(formData, "title_ru") || `Модуль ${(count ?? 0) + 1}`,
  });

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}`);
}

export async function updateModule(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const moduleId = str(formData, "moduleId");

  await supabase
    .from("course_modules")
    .update({
      position: int(formData, "position") || 1,
      title_ru: str(formData, "title_ru") || "Модуль",
      title_uk: str(formData, "title_uk") || null,
      title_en: str(formData, "title_en") || null,
      summary_ru: str(formData, "summary_ru") || null,
      summary_uk: str(formData, "summary_uk") || null,
      summary_en: str(formData, "summary_en") || null,
      price_online_usd: int(formData, "price_online_usd"),
      price_offline_usd: int(formData, "price_offline_usd"),
    })
    .eq("id", moduleId);

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}?saved=1`);
}

export async function deleteModule(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const moduleId = str(formData, "moduleId");

  await supabase.from("course_modules").delete().eq("id", moduleId);
  await recalcCourseTotals(supabase, courseId);

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}`);
}

export async function createLesson(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const moduleId = str(formData, "moduleId");

  const { count } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId);

  await supabase.from("lessons").insert({
    module_id: moduleId,
    position: (count ?? 0) + 1,
    type: "lecture",
    title_ru: str(formData, "title_ru") || `Занятие ${(count ?? 0) + 1}`,
    duration_minutes: 0,
  });

  await recalcCourseTotals(supabase, courseId);

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}`);
}

export async function updateLesson(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const lessonId = str(formData, "lessonId");
  const type = str(formData, "type") as LessonType;

  await supabase
    .from("lessons")
    .update({
      position: int(formData, "position") || 1,
      type: LESSON_TYPES.includes(type) ? type : "lecture",
      title_ru: str(formData, "title_ru") || "Занятие",
      title_uk: str(formData, "title_uk") || null,
      title_en: str(formData, "title_en") || null,
      content_ru: str(formData, "content_ru") || null,
      content_uk: str(formData, "content_uk") || null,
      content_en: str(formData, "content_en") || null,
      duration_minutes: int(formData, "duration_minutes"),
      video_url: str(formData, "video_url") || null,
    })
    .eq("id", lessonId);

  await recalcCourseTotals(supabase, courseId);

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}?saved=1`);
}

export async function deleteLesson(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const courseId = str(formData, "courseId");
  const lessonId = str(formData, "lessonId");

  await supabase.from("lessons").delete().eq("id", lessonId);
  await recalcCourseTotals(supabase, courseId);

  revalidatePath(`/${locale}/studio/courses/${courseId}`);
  redirect(`/${locale}/studio/courses/${courseId}`);
}
