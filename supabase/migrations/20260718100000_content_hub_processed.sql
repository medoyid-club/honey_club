-- Deduplication and audit log for Telegram content hub

create table if not exists public.content_hub_processed (
  id uuid primary key default gen_random_uuid(),
  source_channel_id text not null,
  source_message_id bigint not null,
  author_slug text not null,
  status text not null check (status in ('published', 'rejected', 'error')),
  club_message_id bigint,
  reject_reason text,
  created_at timestamptz not null default now(),
  unique (source_channel_id, source_message_id)
);

create index if not exists content_hub_processed_created_at_idx
  on public.content_hub_processed (created_at desc);

alter table public.content_hub_processed enable row level security;

-- No public policies: service role only (same pattern as other admin tables)
