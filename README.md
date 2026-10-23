# Read Receipts

An anonymous social reading journal for recommending books, dedicating them to someone, and leaving small notes in the margins.

**[Visit the live site](https://rreceipt.vercel.app/)**

## What it does

- Publishes anonymous book recommendations with quotes, notes, spoiler controls, genres, and 1–5 cat ratings.
- Creates personal book dedications with an optional recipient relationship.
- Combines both formats in a newest-first feed with dedicated category views and a rotating Top Pick.
- Adds account-free, once-per-device purrs and public marginalia to every entry.
- Lets optional account holders keep a private book shelf.
- Generates a share-ready 9:16 image for Instagram Stories.
- Exports public-safe data as CSV or JSON for analysis.

## Product decisions

Read Receipts is designed to keep participation lightweight. Posting, reacting, and commenting do not require an account; authentication exists only for the private shelf. Public database reads expose post content without linking it to a user identity. The interface keeps recommendations and dedications in one editorial system while still making each format easy to browse.

## Stack

- **Next.js 16 App Router** and **React 19**
- **TypeScript**
- **Tailwind CSS 4** with a custom editorial design layer
- **Supabase** for PostgreSQL, Auth, row-level security, and the public feed
- **Open Library** for book search and cover metadata
- **Vercel** for production hosting

## Project structure

```text
app/                  Pages, global styles, and API routes
components/           Forms, feed cards, interactions, and account UI
lib/                  Feed queries, Supabase clients, data models, and utilities
scripts/              Synthetic analytics dataset generator
supabase/migrations/  Reproducible schema, policies, and feature migrations
proxy.ts              Supabase authentication session refresh
```

## Development

Requires Node.js 20.9+ and a Supabase project. Copy `.env.example` to `.env.local`, add the two public Supabase values, and apply `supabase/migrations/` in filename order.

```bash
npm install
npm run dev
npm run build
```

## Analytics data

The production export is generated from the latest public feed whenever the endpoint is requested:

- [Download CSV](https://rreceipt.vercel.app/api/export?format=csv)
- [View JSON](https://rreceipt.vercel.app/api/export)

Each row includes the entry type, book metadata, genre, rating, note length, recipient relationship, spoiler flag, and submission time. Private account and shelf data are excluded.

For experiments that should not touch production, generate a synthetic dataset locally:

```bash
npm run generate:data           # 500 rows
npm run generate:data -- 5000   # custom size, up to 100,000 rows
```

The command writes matching CSV and JSON files, which are ignored by Git.

## Deployment

Import the repository as a Next.js project in Vercel, add the two public Supabase environment variables, and deploy. The production build command is `npm run build`.
