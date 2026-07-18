-- Prevent duplicate YouTube videos per author videoteka (same 11-char video id)

-- Normalize legacy rows that stored full URLs
update public.videos
set youtube_id = (regexp_match(youtube_id, '(?:youtu\.be/|v=|embed/|shorts/|live/)([a-zA-Z0-9_-]{11})'))[1]
where youtube_id ~ 'youtu'
  and length(youtube_id) > 11
  and (regexp_match(youtube_id, '(?:youtu\.be/|v=|embed/|shorts/|live/)([a-zA-Z0-9_-]{11})'))[1] is not null;

-- Remove exact duplicates per author (keep oldest row)
delete from public.videos v
using public.videos dup
where v.author_page_id = dup.author_page_id
  and v.youtube_id = dup.youtube_id
  and v.youtube_id is not null
  and v.youtube_id <> ''
  and v.id > dup.id;

create unique index if not exists videos_author_page_youtube_id_unique
  on public.videos (author_page_id, youtube_id)
  where youtube_id is not null and youtube_id <> '';
