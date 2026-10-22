-- Version 2 (Data Science): Book genre classification and dedication receiver relationship

-- Add genre to books table for literary classification and recommendation modeling
alter table public.books add column if not exists genre text
  check (genre is null or char_length(btrim(genre)) <= 60);

-- Add relationship to posts table for dedication intimacy & relationship analysis
alter table public.posts add column if not exists relationship text
  check (relationship is null or char_length(btrim(relationship)) <= 60);

-- Update public permissions
grant select (genre) on public.books to anon, authenticated;
grant select (relationship) on public.posts to anon, authenticated;
grant insert (relationship) on public.posts to anon, authenticated;

-- Recreate public_posts view with relationship exposed
create or replace view public.public_posts as
  select id, kind, book_id, rating, quote, note, recipient_name, relationship,
    sender_nickname, spoiler, created_at,
    lower(btrim(recipient_name)) as recipient_key
  from public.posts;
alter view public.public_posts set (security_invoker = true);
grant select on public.public_posts to anon, authenticated;

-- Performance index for relationship analytics and filtering
create index if not exists posts_relationship_idx
  on public.posts (relationship) where relationship is not null;
