import { ShoppingCart } from "lucide-react";

import { getCartItemCount } from "@/lib/cart/db";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";

type Props = { locale: string };

export async function CartLink({ locale }: Props) {
  const { user } = await requireUser(locale);

  if (!user) {
    return (
      <Link
        href={`/login?redirect=/${locale}/cart`}
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Cart"
      >
        <ShoppingCart className="size-5" />
      </Link>
    );
  }

  const supabase = await createClient();
  const count = await getCartItemCount(supabase, user.id);

  return (
    <Link
      href="/cart"
      className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Cart"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
