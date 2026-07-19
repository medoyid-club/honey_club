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

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export async function updateAuthorProfile(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("[studio/profile] SUPABASE_SERVICE_ROLE_KEY is missing");
      redirect(`/${locale}/studio/profile?error=upload`);
    }

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

    let coverUrl = page.cover_url;
    let avatarUrl = page.avatar_url;

    const coverFile = formData.get("cover");
    if (isUploadFile(coverFile)) {
      const uploaded = await uploadAuthorMedia(storage, page.id, "cover", coverFile);
      if (!uploaded) redirect(`/${locale}/studio/profile?error=upload`);
      coverUrl = uploaded;
    }

    const avatarFile = formData.get("avatar");
    if (isUploadFile(avatarFile)) {
      const uploaded = await uploadAuthorMedia(storage, page.id, "avatar", avatarFile);
      if (!uploaded) redirect(`/${locale}/studio/profile?error=upload`);
      avatarUrl = uploaded;
    }

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
      console.error("[studio/profile] update failed:", error.message);
      redirect(`/${locale}/studio/profile?error=save`);
    }

    revalidatePath(`/${locale}/studio/profile`);
    revalidatePath(`/${locale}/authors`, "layout");
    revalidatePath(`/${locale}/authors/${slug}`, "layout");
    redirect(`/${locale}/studio/profile?saved=1`);
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
    console.error("[studio/profile] unexpected error:", err);
    redirect(`/${locale}/studio/profile?error=save`);
  }
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
