/**
 * Set 30% sale on recorded Manipulation course + START promo (100%) for September cohort.
 *
 * Usage: node scripts/seed-nata-promos.mjs
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(ROOT, ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, key);

async function main() {
  const { data: authorPage, error: authorErr } = await supabase
    .from("author_pages")
    .select("id, display_name")
    .eq("slug", "nata-ustimenko")
    .single();

  if (authorErr || !authorPage) {
    throw new Error("Author page nata-ustimenko not found");
  }

  const { data: recorded, error: recordedErr } = await supabase
    .from("courses")
    .select("id, slug, title_ru")
    .eq("slug", "manipulyatsii-nata-ustimenko")
    .single();

  if (recordedErr || !recorded) {
    throw new Error('Course "manipulyatsii-nata-ustimenko" not found');
  }

  const { data: upcoming, error: upcomingErr } = await supabase
    .from("courses")
    .select("id, slug, title_ru")
    .eq("slug", "manipulyatsii-sentyabr-2026")
    .single();

  if (upcomingErr || !upcoming) {
    throw new Error('Course "manipulyatsii-sentyabr-2026" not found. Run seed-nata-manipulations-upcoming first.');
  }

  const { error: saleErr } = await supabase
    .from("courses")
    .update({ sale_discount_percent: 30 })
    .eq("id", recorded.id);

  if (saleErr) throw saleErr;
  console.log(`✓ 30% sale on "${recorded.title_ru}" (${recorded.slug})`);

  const { data: existingPromo } = await supabase
    .from("promo_codes")
    .select("id")
    .eq("author_page_id", authorPage.id)
    .ilike("code", "START")
    .maybeSingle();

  let promoId = existingPromo?.id;

  if (promoId) {
    await supabase
      .from("promo_codes")
      .update({
        discount_percent: 100,
        active: true,
        applies_to: "course",
        course_id: upcoming.id,
      })
      .eq("id", promoId);

    await supabase.from("promo_code_items").delete().eq("promo_code_id", promoId);
  } else {
    const { data: created, error: promoErr } = await supabase
      .from("promo_codes")
      .insert({
        author_page_id: authorPage.id,
        code: "START",
        discount_percent: 100,
        active: true,
        applies_to: "course",
        course_id: upcoming.id,
      })
      .select("id")
      .single();

    if (promoErr || !created) throw promoErr ?? new Error("Failed to create START promo");
    promoId = created.id;
  }

  const { error: scopeErr } = await supabase.from("promo_code_items").insert({
    promo_code_id: promoId,
    course_id: upcoming.id,
    module_id: null,
  });

  if (scopeErr) throw scopeErr;

  console.log(`✓ Promo START (100%) scoped to "${upcoming.title_ru}" (${upcoming.slug})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
