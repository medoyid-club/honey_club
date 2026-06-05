import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const supabase = createServiceClient();
      const meta = session.metadata ?? {};

      const { data: updated } = await supabase
        .from("enrollments")
        .update({ payment_status: "paid", paid_at: new Date().toISOString() })
        .eq("stripe_session_id", session.id)
        .select("id");

      // Fallback: pending row missing — reconstruct from metadata.
      if ((!updated || updated.length === 0) && meta.user_id && meta.course_id) {
        await supabase.from("enrollments").insert({
          user_id: meta.user_id,
          course_id: meta.course_id,
          module_id: meta.scope === "module" ? meta.module_id || null : null,
          scope: meta.scope === "module" ? "module" : "course",
          pricing_mode: meta.pricing_mode || null,
          payment_status: "paid",
          stripe_session_id: session.id,
          paid_at: new Date().toISOString(),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
