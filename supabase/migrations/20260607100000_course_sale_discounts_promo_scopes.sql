-- Sale discounts on courses/modules + promo code scope targeting

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS sale_discount_percent integer
    CHECK (sale_discount_percent IS NULL OR sale_discount_percent BETWEEN 1 AND 100);

ALTER TABLE public.course_modules
  ADD COLUMN IF NOT EXISTS sale_discount_percent integer
    CHECK (sale_discount_percent IS NULL OR sale_discount_percent BETWEEN 1 AND 100);

CREATE TABLE IF NOT EXISTS public.promo_code_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_code_items_unique_idx
  ON public.promo_code_items (
    promo_code_id,
    course_id,
    COALESCE(module_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

ALTER TABLE public.promo_code_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY promo_code_items_author_manage ON public.promo_code_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.promo_codes pc
      JOIN public.author_pages ap ON ap.id = pc.author_page_id
      WHERE pc.id = promo_code_id AND ap.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.promo_codes pc
      JOIN public.author_pages ap ON ap.id = pc.author_page_id
      WHERE pc.id = promo_code_id AND ap.profile_id = auth.uid()
    )
  );

DROP FUNCTION IF EXISTS public.get_course_outline(uuid);

CREATE OR REPLACE FUNCTION public.get_course_outline(p_course_id uuid)
 RETURNS TABLE(
   module_id uuid,
   module_position integer,
   module_title_ru text,
   module_title_uk text,
   module_title_en text,
   module_summary_ru text,
   module_summary_uk text,
   module_summary_en text,
   module_price_online_usd integer,
   module_price_offline_usd integer,
   module_sale_discount_percent integer,
   lesson_id uuid,
   lesson_position integer,
   lesson_type lesson_type,
   lesson_title_ru text,
   lesson_title_uk text,
   lesson_title_en text,
   lesson_duration_minutes integer,
   lesson_has_video boolean,
   lesson_scheduled_at timestamptz
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select m.id, m.position, m.title_ru, m.title_uk, m.title_en,
         m.summary_ru, m.summary_uk, m.summary_en,
         m.price_online_usd, m.price_offline_usd, m.sale_discount_percent,
         l.id, l.position, l.type, l.title_ru, l.title_uk, l.title_en,
         l.duration_minutes, (l.video_url is not null), l.scheduled_at
  from public.course_modules m
  left join public.lessons l on l.module_id = m.id
  where m.course_id = p_course_id
    and exists (
      select 1 from public.courses c
      where c.id = p_course_id
        and (c.published or c.author_id = auth.uid() or public.is_admin())
    )
  order by m.position, l.position;
$function$;
