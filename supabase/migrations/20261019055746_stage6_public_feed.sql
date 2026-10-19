-- Posts are publicly readable, but account identity is not a public column.
create policy "public posts can be read"
  on public.posts for select to anon, authenticated using (true);

grant select (id, kind, book_id, rating, quote, note, recipient_name,
  sender_nickname, spoiler, created_at) on public.posts to anon, authenticated;

create or replace view public.public_posts as
  select id, kind, book_id, rating, quote, note, recipient_name,
    sender_nickname, spoiler, created_at,
    lower(btrim(recipient_name)) as recipient_key
  from public.posts;
alter view public.public_posts set (security_invoker = true);
grant select on public.public_posts to anon, authenticated;

-- Count recommendations made before the current three-day window. A book
-- chosen this way stays in place for that entire window. New sites use the
-- latest recommendation until the first window has historical data.
create view public.top_pick with (security_invoker = true) as
with window_start as (
  select to_timestamp(floor(extract(epoch from now()) / 259200) * 259200) as starts_at
), ranked as (
  select p.book_id
  from public.posts p, window_start w
  where p.kind = 'recommendation' and p.created_at < w.starts_at
  group by p.book_id
  order by count(*) desc, max(p.created_at) desc, p.book_id
  limit 1
), latest as (
  select p.book_id from public.posts p
  where p.kind = 'recommendation'
  order by p.created_at desc
  limit 1
)
select coalesce((select book_id from ranked), (select book_id from latest)) as book_id;
grant select on public.top_pick to anon, authenticated;

create index if not exists posts_recommendation_book_created_idx
  on public.posts (book_id, created_at desc) where kind = 'recommendation';
