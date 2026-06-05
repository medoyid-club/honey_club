"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/slug";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string) || "").trim();
}

function int(formData: FormData, key: string): number {
  const v = parseInt((formData.get(key) as string) || "0", 10);
  return Number.isFinite(v) && v > 0 ? v : 1;
}

function parseYoutubeId(input: string): string {
  const raw = input.trim();
  const match = raw.match(
    /(?:youtu\.be\/|watch\?v=|embed\/|shorts\/)([a-zA-Z0-9_-]{6,})/
  );
  return match ? match[1] : raw;
}

export async function createCategory(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  const name = str(formData, "name_ru") || "Категория";
  const { count } = await supabase
    .from("video_categories")
    .select("id", { count: "exact", head: true })
    .eq("author_page_id", page.id);

  await supabase.from("video_categories").insert({
    author_page_id: page.id,
    slug: slugify(name),
    name_ru: name,
    position: (count ?? 0) + 1,
  });

  revalidatePath(`/${locale}/studio/videos`);
  redirect(`/${locale}/studio/videos`);
}

export async function updateCategory(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const categoryId = str(formData, "categoryId");
  await supabase
    .from("video_categories")
    .update({
      slug: slugify(str(formData, "slug") || str(formData, "name_ru") || "category"),
      name_ru: str(formData, "name_ru") || "Категория",
      name_uk: str(formData, "name_uk") || null,
      name_en: str(formData, "name_en") || null,
      position: int(formData, "position"),
    })
    .eq("id", categoryId);

  revalidatePath(`/${locale}/studio/videos`);
  redirect(`/${locale}/studio/videos?saved=1`);
}

export async function deleteCategory(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  await supabase
    .from("video_categories")
    .delete()
    .eq("id", str(formData, "categoryId"));

  revalidatePath(`/${locale}/studio/videos`);
  redirect(`/${locale}/studio/videos`);
}

export async function createVideo(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  const { count } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("author_page_id", page.id);

  const categoryId = str(formData, "category_id");

  await supabase.from("videos").insert({
    author_page_id: page.id,
    category_id: categoryId || null,
    youtube_id: parseYoutubeId(str(formData, "youtube_id")),
    title_ru: str(formData, "title_ru") || "Видео",
    position: (count ?? 0) + 1,
  });

  revalidatePath(`/${locale}/studio/videos`);
  redirect(`/${locale}/studio/videos`);
}

export async function updateVideo(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const videoId = str(formData, "videoId");
  const categoryId = str(formData, "category_id");

  await supabase
    .from("videos")
    .update({
      category_id: categoryId || null,
      youtube_id: parseYoutubeId(str(formData, "youtube_id")),
      title_ru: str(formData, "title_ru") || "Видео",
      title_uk: str(formData, "title_uk") || null,
      title_en: str(formData, "title_en") || null,
      position: int(formData, "position"),
    })
    .eq("id", videoId);

  revalidatePath(`/${locale}/studio/videos`);
  redirect(`/${locale}/studio/videos?saved=1`);
}

export async function deleteVideo(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  await supabase.from("videos").delete().eq("id", str(formData, "videoId"));

  revalidatePath(`/${locale}/studio/videos`);
  redirect(`/${locale}/studio/videos`);
}
