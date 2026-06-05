"use server";

import { redirect } from "next/navigation";

import { activePricing, type CourseStatus } from "@/lib/courses";
import { getStripeClient } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getBaseUrl } from "@/lib/url";

type Scope = "course" | "module";

async function clearPending(
  svc: ReturnType<typeof createServiceClient>,
  userId: string,
  courseId: string,
  scope: Scope,
  moduleId: string | null
) {
  let del = svc
    .from("enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .in("payment_status", ["pending", "failed"]);
  del = scope === "module" ? del.eq("module_id", moduleId) : del.is("module_id", null);
  await del;
}

export async function createCheckoutSession(formData: FormData) {
  const scope: Scope =
    (formData.get("scope") as string) === "module" ? "module" : "course";
  const courseId = formData.get("courseId") as string;
  const moduleId = (formData.get("moduleId") as string) || null;
  const locale = formData.get("locale") as string;
  const slug = formData.get("slug") as string;

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims ?? null;

  if (!user) {
    redirect(`/${locale}/login?redirect=/${locale}/courses/${slug}`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, status, price_online_usd, price_offline_usd, title_ru")
    .eq("id", courseId)
    .single();

  if (!course) {
    redirect(`/${locale}/courses/${slug}`);
  }

  const pricing = activePricing(
    course.status as CourseStatus,
    course.price_online_usd,
    course.price_offline_usd
  );

  if (!pricing) {
    redirect(`/${locale}/courses/${slug}?error=not_sellable`);
  }

  let amount = pricing.priceUsd;
  let productName = course.title_ru;

  if (scope === "module" && moduleId) {
    const { data: mod } = await supabase
      .from("course_modules")
      .select("id, title_ru, price_online_usd, price_offline_usd")
      .eq("id", moduleId)
      .eq("course_id", courseId)
      .single();

    if (!mod) {
      redirect(`/${locale}/courses/${slug}`);
    }

    amount =
      pricing.mode === "online" ? mod.price_online_usd : mod.price_offline_usd;
    productName = `${course.title_ru} — ${mod.title_ru}`;
  }

  // Already has access?
  const accessQuery = supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.sub)
    .eq("course_id", courseId)
    .in("payment_status", ["free", "paid"]);
  const { data: existing } =
    scope === "module"
      ? await accessQuery.eq("module_id", moduleId).maybeSingle()
      : await accessQuery.is("module_id", null).maybeSingle();

  if (existing) {
    redirect(`/${locale}/courses/${slug}?enrolled=1`);
  }

  const svc = createServiceClient();

  // Free (or zero-priced) → enroll immediately.
  if (amount <= 0) {
    await clearPending(svc, user.sub as string, courseId, scope, moduleId);
    await svc.from("enrollments").insert({
      user_id: user.sub,
      course_id: courseId,
      module_id: scope === "module" ? moduleId : null,
      scope,
      pricing_mode: pricing.mode,
      payment_status: "free",
    });
    redirect(`/${locale}/courses/${slug}?enrolled=1`);
  }

  const baseUrl = getBaseUrl();
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: { name: productName },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${baseUrl}/${locale}/courses/${slug}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/${locale}/courses/${slug}`,
    customer_email: user.email as string,
    metadata: {
      scope,
      course_id: courseId,
      module_id: moduleId ?? "",
      pricing_mode: pricing.mode,
      user_id: user.sub as string,
      locale,
    },
  });

  await clearPending(svc, user.sub as string, courseId, scope, moduleId);
  await svc.from("enrollments").insert({
    user_id: user.sub,
    course_id: courseId,
    module_id: scope === "module" ? moduleId : null,
    scope,
    pricing_mode: pricing.mode,
    payment_status: "pending",
    stripe_session_id: session.id,
  });

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

  const svc = createServiceClient();
  await clearPending(svc, user.sub as string, courseId, "course", null);
  await svc
    .from("enrollments")
    .insert({
      user_id: user.sub,
      course_id: courseId,
      scope: "course",
      payment_status: "free",
    });

  redirect(`/${locale}/courses/${slug}?enrolled=1`);
}
