"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SocialEntry } from "@/lib/authors/db";
import type { AuthorSocialPlatform } from "@/lib/authors/types";
import { slugify } from "@/lib/slug";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const SOCIAL_PLATFORMS: AuthorSocialPlatform[] = [
  "youtube",
  "telegram",
  "facebook",
  "instagram",
  "email",
  "mono",
];

async function uploadImage(
  supabase: SupabaseClient,
  pageId: string,
  kind: "cover" | "avatar",
  file: File
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${pageId}/${kind}-${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from("author-media")
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });

  if (error) return null;

  const { data } = supabase.storage.from("author-media").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateAuthorProfile(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  const str = (key: string) => ((formData.get(key) as string) || "").trim();

  // Slug
  let slug = slugify(str("slug") || page.slug);
  if (slug !== page.slug) {
    const { data: clash } = await supabase
      .from("author_pages")
      .select("id")
      .eq("slug", slug)
      .neq("id", page.id)
      .maybeSingle();
    if (clash) slug = page.slug;
  }

  // Socials
  const socials: SocialEntry[] = [];
  for (const platform of SOCIAL_PLATFORMS) {
    const url = str(`social_${platform}`);
    if (url) socials.push({ platform, url });
  }

  const contacts: Record<string, string> = {};
  const contactEmail = str("contact_email");
  const contactLocation = str("contact_location");
  if (contactEmail) contacts.email = contactEmail;
  if (contactLocation) contacts.location = contactLocation;

  const coverUrl =
    (await uploadImage(
      supabase,
      page.id,
      "cover",
      formData.get("cover") as File
    )) ?? page.cover_url;
  const avatarUrl =
    (await uploadImage(
      supabase,
      page.id,
      "avatar",
      formData.get("avatar") as File
    )) ?? page.avatar_url;

  await supabase
    .from("author_pages")
    .update({
      slug,
      display_name: str("display_name") || null,
      headline_ru: str("headline_ru") || null,
      headline_uk: str("headline_uk") || null,
      headline_en: str("headline_en") || null,
      slogan_ru: str("slogan_ru") || null,
      slogan_uk: str("slogan_uk") || null,
      slogan_en: str("slogan_en") || null,
      bio_ru: str("bio_ru") || null,
      bio_uk: str("bio_uk") || null,
      bio_en: str("bio_en") || null,
      socials,
      contacts,
      cover_url: coverUrl,
      avatar_url: avatarUrl,
    })
    .eq("id", page.id);

  revalidatePath(`/${locale}/studio/profile`);
  redirect(`/${locale}/studio/profile?saved=1`);
}

export async function toggleAuthorPagePublished(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();

  await supabase
    .from("author_pages")
    .update({ published: !page.published })
    .eq("id", page.id);

  revalidatePath(`/${locale}/studio`, "layout");
  redirect(`/${locale}/studio/profile?saved=1`);
}
