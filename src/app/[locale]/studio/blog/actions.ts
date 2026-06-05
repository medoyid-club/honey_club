"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { slugify } from "@/lib/slug";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

function str(formData: FormData, key: string): string {
  return ((formData.get(key) as string) || "").trim();
}

function int(formData: FormData, key: string, fallback = 5): number {
  const v = parseInt((formData.get(key) as string) || "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

async function uniqueSlug(
  supabase: SupabaseClient,
  pageId: string,
  base: string,
  excludeId?: string
): Promise<string> {
  let slug = base || "post";
  for (let i = 0; i < 50; i++) {
    let q = supabase
      .from("blog_posts")
      .select("id")
      .eq("author_page_id", pageId)
      .eq("slug", slug);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
    slug = `${base}-${i + 2}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createBlogPost(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  const title = str(formData, "title_ru") || "Новая статья";
  const slug = await uniqueSlug(supabase, page.id, slugify(title));

  const { data: created } = await supabase
    .from("blog_posts")
    .insert({
      author_page_id: page.id,
      slug,
      title_ru: title,
      reading_minutes: 5,
      published: false,
    })
    .select("id")
    .single();

  revalidatePath(`/${locale}/studio/blog`);
  redirect(`/${locale}/studio/blog/${created?.id ?? ""}`);
}

export async function updateBlogPost(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  const postId = str(formData, "postId");
  const published = formData.get("published") === "on";

  const { data: current } = await supabase
    .from("blog_posts")
    .select("slug, published, published_at")
    .eq("id", postId)
    .maybeSingle();

  const desiredSlug = slugify(str(formData, "slug") || current?.slug || "post");
  const slug =
    desiredSlug === current?.slug
      ? desiredSlug
      : await uniqueSlug(supabase, page.id, desiredSlug, postId);

  const publishedAt =
    published && !current?.published_at
      ? new Date().toISOString()
      : current?.published_at ?? null;

  await supabase
    .from("blog_posts")
    .update({
      slug,
      title_ru: str(formData, "title_ru") || "Без названия",
      title_uk: str(formData, "title_uk") || null,
      title_en: str(formData, "title_en") || null,
      excerpt_ru: str(formData, "excerpt_ru") || null,
      excerpt_uk: str(formData, "excerpt_uk") || null,
      excerpt_en: str(formData, "excerpt_en") || null,
      content_ru: str(formData, "content_ru") || null,
      content_uk: str(formData, "content_uk") || null,
      content_en: str(formData, "content_en") || null,
      reading_minutes: int(formData, "reading_minutes"),
      published,
      published_at: publishedAt,
    })
    .eq("id", postId);

  revalidatePath(`/${locale}/studio/blog/${postId}`);
  redirect(`/${locale}/studio/blog/${postId}?saved=1`);
}

export async function deleteBlogPost(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await getStudioContext(locale);
  const supabase = await createClient();

  const postId = str(formData, "postId");
  await supabase.from("blog_posts").delete().eq("id", postId);

  revalidatePath(`/${locale}/studio/blog`);
  redirect(`/${locale}/studio/blog`);
}
