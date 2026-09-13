create table if not exists public.chat_responses (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  message_id text not null,
  response text not null,
  created_at timestamptz not null default now(),
  unique (session_id, message_id)
);

create index if not exists chat_responses_lookup_idx
  on public.chat_responses (session_id, message_id);

create index if not exists chat_responses_created_at_idx
  on public.chat_responses (created_at);

alter table public.chat_responses enable row level security;
