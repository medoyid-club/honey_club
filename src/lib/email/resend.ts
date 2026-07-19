import { Resend } from "resend";

import {
  type AuthorEmailKey,
  AUTHOR_EMAIL_ADDRESSES,
  type EmailRole,
  EMAIL_ADDRESSES,
  formatAuthorEmailFrom,
  formatEmailFrom,
} from "@/lib/email/addresses";

let client: Resend | null = null;

/** Resend SMTP — for Gmail «Отправлять письма как». Password = RESEND_API_KEY. */
export const RESEND_SMTP = {
  host: "smtp.resend.com",
  port: 465,
  portTls: 587,
  username: "resend",
} as const;

export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

export function getEmailFrom(role: EmailRole = "noreply"): string {
  if (role !== "noreply") {
    return formatEmailFrom(role);
  }
  return process.env.EMAIL_FROM?.trim() || formatEmailFrom("noreply");
}

export function resolveEmailFrom(params: {
  role?: EmailRole;
  author?: AuthorEmailKey;
}): string {
  if (params.author) {
    return formatAuthorEmailFrom(params.author);
  }
  return getEmailFrom(params.role ?? "noreply");
}

function resolveReplyTo(
  replyTo?: EmailRole | AuthorEmailKey | string
): string | undefined {
  if (!replyTo) return undefined;
  if (replyTo.includes("@")) return replyTo;
  if (replyTo in EMAIL_ADDRESSES) {
    return EMAIL_ADDRESSES[replyTo as EmailRole];
  }
  if (replyTo in AUTHOR_EMAIL_ADDRESSES) {
    return AUTHOR_EMAIL_ADDRESSES[replyTo as AuthorEmailKey];
  }
  return replyTo;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  from?: EmailRole;
  fromAuthor?: AuthorEmailKey;
  replyTo?: EmailRole | AuthorEmailKey | string;
}): Promise<{ id: string | null; error: string | null }> {
  const resend = getResendClient();
  const replyTo = resolveReplyTo(params.replyTo);

  const { data, error } = await resend.emails.send({
    from: resolveEmailFrom({ role: params.from, author: params.fromAuthor }),
    to: params.to,
    subject: params.subject,
    html: params.html,
    ...(replyTo ? { replyTo } : {}),
  });

  return { id: data?.id ?? null, error: error ? error.message : null };
}
