-- Overview video for course landing page (author-recorded intro)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS overview_video_url text;
