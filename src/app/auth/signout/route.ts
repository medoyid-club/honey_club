import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  const locale =
    req.headers.get("x-middleware-locale") ??
    req.nextUrl.locale ??
    "ru";
  return NextResponse.redirect(new URL(`/${locale}/login`, req.url), { status: 302 });
}
