import { requireRole, type SessionUser } from "@/lib/auth/roles";
import type { AuthorPageRow } from "@/lib/authors/db";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";

export type StudioContext = {
  user: SessionUser;
  page: AuthorPageRow;
};

/**
 * Authorizes the current user for the studio (author/admin) and returns their
 * author page, creating an empty one on first visit. Uses the authed client so
 * RLS enforces ownership on every read/write.
 */
export async function getStudioContext(locale: string): Promise<StudioContext> {
  const user = await requireRole(locale, ["author", "admin"], `/${locale}/studio`);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("author_pages")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    return { user, page: existing as AuthorPageRow };
  }

  const base = slugify((user.email || "author").split("@")[0] || "author");
  let slug = base;
  for (let i = 0; i < 50; i++) {
    const { data: clash } = await supabase
      .from("author_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${base}-${i + 2}`;
  }

  const { data: created } = await supabase
    .from("author_pages")
    .insert({
      profile_id: user.id,
      claim_email: user.email,
      slug,
      published: false,
    })
    .select("*")
    .single();

  return { user, page: created as AuthorPageRow };
}
