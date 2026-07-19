"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SocialEntry } from "@/lib/authors/db";
import type { AuthorSocialPlatform } from "@/lib/authors/types";
import { uploadAuthorMedia } from "@/lib/author-media";
import { slugify } from "@/lib/slug";
import { getStudioContext } from "@/lib/studio";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

const SOCIAL_PLATFORMS: AuthorSocialPlatform[] = [
  "youtube",
  "telegram",
  "facebook",
  "instagram",
  "email",
  "mono",
];

export async function updateAuthorProfile(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const { page } = await getStudioContext(locale);
  const supabase = await createClient();
  const storage = createServiceClient();

  const str = (key: string) => ((formData.get(key) as string) || "").trim();

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

  const coverFile = formData.get("cover");
  const avatarFile = formData.get("avatar");

  const coverUrl =
    (coverFile instanceof File
      ? await uploadAuthorMedia(storage, page.id, "cover", coverFile)
      : null) ?? page.cover_url;
  const avatarUrl =
    (avatarFile instanceof File
      ? await uploadAuthorMedia(storage, page.id, "avatar", avatarFile)
      : null) ?? page.avatar_url;

  const { error } = await supabase
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

  if (error) {
    redirect(`/${locale}/studio/profile?error=save`);
  }

  revalidatePath(`/${locale}/studio/profile`);
  revalidatePath(`/${locale}/authors`, "layout");
  revalidatePath(`/${locale}/authors/${slug}`, "layout");
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
  revalidatePath(`/${locale}/authors`, "layout");
  revalidatePath(`/${locale}/authors/${page.slug}`, "layout");
  redirect(`/${locale}/studio/profile?saved=1`);
}
