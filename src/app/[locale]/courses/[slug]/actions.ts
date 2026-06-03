"use server";

import { redirect } from "next/navigation";
import { getStripeClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function createCheckoutSession(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const stripePriceId = formData.get("stripePriceId") as string;
  const locale = formData.get("locale") as string;
  const slug = formData.get("slug") as string;

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/courses/${slug}`);
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, payment_status")
    .eq("user_id", user.sub)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing && (existing.payment_status === "paid" || existing.payment_status === "free")) {
    redirect(`/${locale}/courses/${slug}?enrolled=1`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: stripePriceId, quantity: 1 }],
    mode: "payment",
    success_url: `${baseUrl}/${locale}/courses/${slug}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/courses/${slug}`,
    customer_email: user.email as string,
    metadata: { course_id: courseId, user_id: user.sub, locale },
  });

  await supabase.from("enrollments").upsert(
    { user_id: user.sub, course_id: courseId, payment_status: "pending", stripe_session_id: session.id },
    { onConflict: "user_id,course_id" }
  );

  redirect(session.url!);
}

export async function enrollFree(formData: FormData) {
  const courseId = formData.get("courseId") as string;
  const locale = formData.get("locale") as string;
  const slug = formData.get("slug") as string;

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/courses/${slug}`);
  }

  await supabase.from("enrollments").upsert(
    { user_id: user.sub, course_id: courseId, payment_status: "free" },
    { onConflict: "user_id,course_id" }
  );

  redirect(`/${locale}/courses/${slug}?enrolled=1`);
}
