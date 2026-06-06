-- Cohort start date for live/upcoming courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS cohort_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS schedule_timezone text NOT NULL DEFAULT 'Europe/Kyiv';

-- Per-lesson scheduled start time
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

CREATE INDEX IF NOT EXISTS lessons_scheduled_at_idx ON public.lessons (scheduled_at)
  WHERE scheduled_at IS NOT NULL;

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
         m.price_online_usd, m.price_offline_usd,
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
