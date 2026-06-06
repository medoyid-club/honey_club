import type { CartItem, CartItemRow } from "@/lib/cart/types";
import { mapCartItem } from "@/lib/cart/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCartItems(
  supabase: SupabaseClient,
  userId: string
): Promise<CartItem[]> {
  const { data } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (!data?.length) return [];

  const courseIds = [...new Set(data.map((row) => row.course_id))];
  const { data: courses } = await supabase
    .from("courses")
    .select("id, slug, author_page_id")
    .in("id", courseIds);

  const metaById = new Map(
    (courses ?? []).map((c) => [
      c.id,
      { slug: c.slug as string, authorPageId: c.author_page_id as string | null },
    ])
  );

  return (data as CartItemRow[]).map((row) => {
    const meta = metaById.get(row.course_id);
    return mapCartItem(row, meta?.slug ?? "", meta?.authorPageId ?? null);
  });
}

export async function getCartItemCount(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("cart_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  return count ?? 0;
}

export async function clearCart(supabase: SupabaseClient, userId: string) {
  await supabase.from("cart_items").delete().eq("user_id", userId);
}
