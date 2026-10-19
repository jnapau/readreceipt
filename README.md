# Read Receipts

An anonymous home for book recommendations and dedications. This repository is being built in six reviewable stages.

## Run the current preview locally

You need Node.js 20.9 or newer. From this folder:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The homepage shows illustrative recommendations until a reader posts the first real one. **Recommend** and **Dedicate** use live Open Library search and save to Supabase. Recipient search finds exact names while ignoring capitalization. **My Shelf** supports private username and password accounts.

## Why this stack

- **Next.js App Router** organizes the app by pages and layouts. It can render public book pages quickly and later host server-side operations without a separate backend project.
- **TypeScript** catches common mistakes while editing, such as passing the wrong kind of book data to a component.
- **Tailwind CSS** provides reusable styling utilities. The Stage 1 design also uses a small global stylesheet for the editorial collage and motion.
- **Supabase** stores posts and private shelves in PostgreSQL and handles optional accounts. Public post data is separated from account identities.
- **Vercel** builds and hosts the Next.js app from this repository.

The `app/` folder holds pages, the shared layout, and a small `/api/books/search` route that asks Open Library for books. `components/` holds reusable visual pieces. `lib/sample-data.ts` supplies illustrative recommendations for an empty feed; `lib/public-feed.ts` loads real posts and dedications.

### Supabase setup

Copy `.env.example` to `.env.local` and add the publishable key from the Supabase project settings. Stage 5 includes the schema in `supabase/migrations/20261019000000_stage5.sql`; it creates private profiles, public-safe posts, book metadata, and per-user shelves with row-level security. For username-only accounts, turn off **Confirm email** under Authentication → Sign In / Providers. Supabase Auth stores an internal email-shaped identifier derived from each username; users do not enter an email address. This means email-based password recovery is unavailable.

The Stage 6 migration in `supabase/migrations/20261019055746_stage6_public_feed.sql` adds public-safe feed reads and a Top Pick view. Top Pick counts recommendations made before the current three-day window, so it changes at most once per window. While there is no older history, it uses the latest recommendation.

### Vercel deployment

Import this GitHub repository as a **Next.js** project. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Production, Preview, and Development environments using the same values as `.env.local`. Do not add a Supabase secret or service-role key. The build command is `npm run build`.

## Planned stages

1. Homepage, fonts, hero collage, sample feed — complete.
2. Open Library search modal and book fallback spines — **ready for review**.
3. Recommendation form, quote suggestions, live feed, spoiler reveal — **ready for review**.
4. Dedication form and exact, case-insensitive recipient search — complete.
5. Supabase tables, optional accounts, and My Shelf — **ready for review**.
6. Top Pick rotation, mobile polish, and Vercel preparation — complete.
