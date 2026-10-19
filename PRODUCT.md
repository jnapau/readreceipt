# Read Receipts

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
Next.js App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL and Auth, deployed on Vercel. The user specified this stack.

## Users
Readers who want to recommend a book publicly or dedicate one to a named person without revealing their identity. Browsers can discover recommendations and search dedications by recipient name.

## Product Purpose
Make book recommendations and personal dedications easy to share and discover. Posting requires no account; an optional account adds a private personal shelf.

## Operating Context
Visitors browse a public recommendation feed, search Open Library for books, post reviews or dedications, search dedications by exact case-insensitive recipient name, and optionally save books to My Shelf.

## Capabilities and Constraints
- Anonymous posting is required. A sender may provide an optional display nickname.
- Public UI and database responses must never disclose an optional account's ID or username through a post.
- Spoiler-tagged text is blurred until the visitor chooses to reveal it.
- Book metadata and covers come from Open Library; missing covers use designed text spines.
- Recommendations have 1–5 black cat ratings.
- Build proceeds in six user-reviewed stages. Stage 1 is a sample-data homepage, typography, hero, and animated cover collage.

## Brand Commitments
The name is Read Receipts. The user supplied the midnight navy, parchment, lavender-gray, and gold palette, plus Fraunces, DM Sans, and historic cursive headline fonts.

## Evidence on Hand
The GitHub repository started with only a README. No real posts, testimonials, or supplied book list exist yet. Stage 1 samples are illustrative.

## Product Principles
- Make sharing a book feel personal and safe.
- Let visitors read and post without friction.
- Protect identities even when visitors choose to create accounts.
- Keep the book itself and the sender's words central.
