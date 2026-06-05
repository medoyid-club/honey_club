import { Resend } from "resend";

let client: Resend | null = null;

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

export function getEmailFrom(): string {
  // Until medoyid-club.com is verified in Resend, the test sender only
  // delivers to the account owner's address.
  return process.env.EMAIL_FROM ?? "Клуб медоедов <onboarding@resend.dev>";
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ id: string | null; error: string | null }> {
  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  return { id: data?.id ?? null, error: error ? error.message : null };
}
