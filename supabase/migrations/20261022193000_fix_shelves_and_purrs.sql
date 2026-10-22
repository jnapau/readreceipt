-- Keep anonymous reactions account-free and enable shelves with explicit,
-- least-privilege Data API grants.

drop policy if exists "anyone can purr a recommendation" on public.purrs;
drop policy if exists "anyone can purr a page" on public.purrs;
create policy "anyone can purr a page"
  on public.purrs for insert to anon, authenticated
  with check (true);

drop policy if exists "anyone can leave marginalia on a recommendation" on public.marginalia;
drop policy if exists "anyone can leave marginalia on a page" on public.marginalia;
create policy "anyone can leave marginalia on a page"
  on public.marginalia for insert to anon, authenticated
  with check (true);

revoke all on public.shelves from anon, authenticated;
grant select, insert, delete on public.shelves to authenticated;

revoke all on public.books from anon, authenticated;
grant select, insert on public.books to anon, authenticated;

grant select (id, kind, book_id, rating, quote, note, recipient_name,
  relationship, sender_nickname, spoiler, created_at)
  on public.posts to anon, authenticated;
