create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 40),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
alter table public.profiles enable row level security;

create policy "profiles are private to their owner"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "users can create their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  open_library_key text not null unique,
  title text not null,
  author text not null,
  cover_id bigint,
  color text not null default '#4a4a6e',
  created_at timestamptz not null default now()
);

alter table public.books enable row level security;
create policy "books are publicly readable"
  on public.books for select to anon, authenticated using (true);
create policy "book metadata can be saved from Open Library"
  on public.books for insert to anon, authenticated with check (true);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('recommendation', 'dedication')),
  book_id uuid not null references public.books(id) on delete cascade,
  rating smallint check (rating between 1 and 5),
  quote text not null default '',
  note text not null default '',
  recipient_name text,
  sender_nickname text not null default 'an anonymous reader',
  spoiler boolean not null default false,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
create policy "anyone can create an anonymous post"
  on public.posts for insert to anon, authenticated
  with check (user_id is null or (select auth.uid()) = user_id);

create view public.public_posts as
  select id, kind, book_id, rating, quote, note, recipient_name, sender_nickname, spoiler, created_at
  from public.posts;

revoke all on public.posts from anon, authenticated;
grant insert on public.posts to anon, authenticated;
grant select on public.public_posts to anon, authenticated;

create table if not exists public.shelves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

alter table public.shelves enable row level security;
create policy "users can view their own shelf"
  on public.shelves for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users can add to their own shelf"
  on public.shelves for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "users can remove from their own shelf"
  on public.shelves for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_recipient_name_lower_idx on public.posts (lower(recipient_name));
create index if not exists shelves_user_id_idx on public.shelves (user_id);
