-- Version 2: custom covers for manually entered books, anonymous "purrs"
-- on recommendations, and reader marginalia (recommendations only).

-- Manually entered books may carry a small, downscaled cover image.
alter table public.books add column if not exists cover_url text
  check (cover_url is null or char_length(cover_url) <= 400000);

-- Purrs ------------------------------------------------------------------
create table if not exists public.purrs (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  client_id text not null check (char_length(client_id) between 8 and 64),
  created_at timestamptz not null default now(),
  unique (post_id, client_id)
);

alter table public.purrs enable row level security;

create policy "purrs are publicly countable"
  on public.purrs for select to anon, authenticated using (true);
create policy "anyone can purr a page"
  on public.purrs for insert to anon, authenticated
  with check (true);

revoke all on public.purrs from anon, authenticated;
grant select (post_id) on public.purrs to anon, authenticated;
grant insert (post_id, client_id) on public.purrs to anon, authenticated;

create or replace view public.purr_counts with (security_invoker = true) as
  select post_id, count(*)::int as purrs from public.purrs group by post_id;
grant select on public.purr_counts to anon, authenticated;

create index if not exists purrs_post_id_idx on public.purrs (post_id);

-- Marginalia ---------------------------------------------------------------
create table if not exists public.marginalia (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  nickname text not null default 'an anonymous reader'
    check (char_length(btrim(nickname)) between 1 and 40),
  body text not null check (char_length(btrim(body)) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.marginalia enable row level security;

create policy "marginalia is publicly readable"
  on public.marginalia for select to anon, authenticated using (true);
create policy "anyone can leave marginalia on a page"
  on public.marginalia for insert to anon, authenticated
  with check (true);

revoke all on public.marginalia from anon, authenticated;
grant select (id, post_id, nickname, body, created_at) on public.marginalia to anon, authenticated;
grant insert (post_id, nickname, body) on public.marginalia to anon, authenticated;

create index if not exists marginalia_post_created_idx on public.marginalia (post_id, created_at);
