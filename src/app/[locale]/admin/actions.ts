"use server";

import { randomBytes } from "crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sendEmail } from "@/lib/email/resend";
import { authorInviteEmail } from "@/lib/email/templates/author-invite";
import { requireRole } from "@/lib/auth/roles";
import type { Locale } from "@/i18n/routing";
import { createServiceClient } from "@/lib/supabase/service";
import { getBaseUrl } from "@/lib/url";

const ROLES = ["user", "author", "admin"] as const;

export async function setUserRole(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await requireRole(locale, ["admin"], `/${locale}/admin`);

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as (typeof ROLES)[number];

  if (!userId || !ROLES.includes(role)) {
    redirect(`/${locale}/admin?error=invalid`);
  }

  const svc = createServiceClient();
  await svc.from("profiles").update({ role }).eq("id", userId);

  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin?roleUpdated=1`);
}

export async function inviteAuthor(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  const admin = await requireRole(locale, ["admin"], `/${locale}/admin`);

  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    redirect(`/${locale}/admin?error=invalid_email`);
  }

  const svc = createServiceClient();
  const token = randomBytes(24).toString("hex");

  const { error: insertError } = await svc.from("author_invites").insert({
    email,
    token,
    invited_by: admin.id,
    status: "pending",
  });

  if (insertError) {
    redirect(`/${locale}/admin?error=invite_failed`);
  }

  const acceptUrl = `${getBaseUrl()}/${locale}/author/accept?token=${token}`;
  const { subject, html } = authorInviteEmail({
    acceptUrl,
    locale: locale as Locale,
    inviterName: "Клуб медоедов",
  });

  let emailSent = false;
  try {
    const { error } = await sendEmail({ to: email, subject, html });
    emailSent = !error;
  } catch {
    emailSent = false;
  }

  revalidatePath(`/${locale}/admin`);
  // Pass the token back so the admin can copy the accept link locally
  // (Resend test mode only delivers to the account owner).
  redirect(
    `/${locale}/admin?invited=${encodeURIComponent(email)}&sent=${
      emailSent ? "1" : "0"
    }&token=${token}`
  );
}

export async function revokeInvite(formData: FormData) {
  const locale = (formData.get("locale") as string) || "ru";
  await requireRole(locale, ["admin"], `/${locale}/admin`);

  const inviteId = formData.get("inviteId") as string;
  if (inviteId) {
    const svc = createServiceClient();
    await svc
      .from("author_invites")
      .update({ status: "expired" })
      .eq("id", inviteId);
  }

  revalidatePath(`/${locale}/admin`);
  redirect(`/${locale}/admin`);
}
