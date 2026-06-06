-- Shopping cart, orders, promo codes, and gift enrollments

CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE,
  scope text NOT NULL CHECK (scope IN ('course', 'module')),
  unit_price_cents integer NOT NULL CHECK (unit_price_cents >= 0),
  pricing_mode text NOT NULL CHECK (pricing_mode IN ('online', 'offline')),
  title_snapshot text NOT NULL,
  is_gift boolean NOT NULL DEFAULT false,
  gift_recipient_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cart_items_gift_email CHECK (
    (NOT is_gift) OR (gift_recipient_email IS NOT NULL AND gift_recipient_email <> '')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_course_module_idx
  ON public.cart_items (
    user_id,
    course_id,
    COALESCE(module_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_page_id uuid NOT NULL REFERENCES public.author_pages(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  applies_to text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'course', 'module')),
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_author_code_idx
  ON public.promo_codes (author_page_id, lower(code));

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  promo_code_id uuid REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  promo_code_text text,
  subtotal_cents integer NOT NULL DEFAULT 0,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'eur',
  locale text NOT NULL DEFAULT 'ru',
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE SET NULL,
  scope text NOT NULL CHECK (scope IN ('course', 'module')),
  unit_price_cents integer NOT NULL,
  discount_cents integer NOT NULL DEFAULT 0,
  final_price_cents integer NOT NULL,
  pricing_mode text NOT NULL,
  title_snapshot text NOT NULL,
  is_gift boolean NOT NULL DEFAULT false,
  gift_recipient_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS is_gift boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gift_recipient_email text,
  ADD COLUMN IF NOT EXISTS gifted_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL;

ALTER TABLE public.enrollments ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY cart_items_select_own ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cart_items_insert_own ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cart_items_update_own ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cart_items_delete_own ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY orders_select_own ON public.orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY orders_insert_own ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY order_items_select_own ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY promo_codes_author_manage ON public.promo_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.author_pages ap
      WHERE ap.id = author_page_id AND ap.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.author_pages ap
      WHERE ap.id = author_page_id AND ap.profile_id = auth.uid()
    )
  );
