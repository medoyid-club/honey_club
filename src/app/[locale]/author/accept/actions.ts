"use server";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/roles";
import { slugify } from "@/lib/slug";
import { createServiceClient } from "@/lib/supabase/service";

export async function acceptInvite(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const token = (formData.get("token") as string) || "";

  const user = await getSessionUser();
  if (!user) {
    redirect(
      `/${locale}/login?redirect=/${locale}/author/accept?token=${token}`
    );
  }

  const svc = createServiceClient();

  const { data: invite } = await svc
    .from("author_invites")
    .select("id, email, status, expires_at, author_page_id")
    .eq("token", token)
    .maybeSingle();

  if (
    !invite ||
    invite.status !== "pending" ||
    new Date(invite.expires_at).getTime() < Date.now()
  ) {
    redirect(`/${locale}/author/accept?token=${token}&error=invalid`);
  }

  const email = (user.email || "").toLowerCase();
  if (email !== (invite.email || "").toLowerCase()) {
    redirect(`/${locale}/author/accept?token=${token}&error=email_mismatch`);
  }

  // Find an unclaimed seed page matching the invite email, otherwise create one.
  let authorPageId = invite.author_page_id as string | null;

  if (!authorPageId) {
    const { data: claimable } = await svc
      .from("author_pages")
      .select("id")
      .is("profile_id", null)
      .ilike("claim_email", email)
      .maybeSingle();

    if (claimable) {
      authorPageId = claimable.id;
      await svc
        .from("author_pages")
        .update({ profile_id: user.id })
        .eq("id", claimable.id);
    } else {
      const base = slugify(email.split("@")[0] || "author");
      let slug = base;
      for (let i = 0; i < 50; i++) {
        const { data: clash } = await svc
          .from("author_pages")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!clash) break;
        slug = `${base}-${i + 2}`;
      }

      const { data: created } = await svc
        .from("author_pages")
        .insert({
          profile_id: user.id,
          claim_email: email,
          slug,
          published: false,
        })
        .select("id")
        .single();

      authorPageId = created?.id ?? null;
    }
  }

  await svc
    .from("author_invites")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      author_page_id: authorPageId,
    })
    .eq("id", invite.id);

  // Promote to author unless the user is already an admin.
  await svc
    .from("profiles")
    .update({ role: "author" })
    .eq("id", user.id)
    .neq("role", "admin");

  redirect(`/${locale}/studio`);
}
