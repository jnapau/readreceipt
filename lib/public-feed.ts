import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book } from "@/lib/books";
import type { Dedication, SamplePost } from "@/lib/sample-data";

type PublicPost = {
  id: string;
  kind: "recommendation" | "dedication";
  book_id: string;
  rating: number | null;
  quote: string;
  note: string;
  recipient_name: string | null;
  relationship?: string | null;
  sender_nickname: string;
  spoiler: boolean;
  created_at: string;
};

type BookRow = { id: string; open_library_key: string; title: string; author: string; cover_id: number | null; color: string; cover_url?: string | null; genre?: string | null };

const fieldsWithRel = "id,kind,book_id,rating,quote,note,recipient_name,relationship,sender_nickname,spoiler,created_at";
const basicFields = "id,kind,book_id,rating,quote,note,recipient_name,sender_nickname,spoiler,created_at";

async function selectBooks(client: SupabaseClient, ids: string[]) {
  // `genre` and `cover_url` arrive with migrations; fall back gracefully if not applied yet.
  const withGenre = await client.from("books").select("id,open_library_key,title,author,cover_id,color,cover_url,genre").in("id", ids);
  if (!withGenre.error) return (withGenre.data ?? []) as BookRow[];
  const withCover = await client.from("books").select("id,open_library_key,title,author,cover_id,color,cover_url").in("id", ids);
  if (!withCover.error) return (withCover.data ?? []) as BookRow[];
  const basic = await client.from("books").select("id,open_library_key,title,author,cover_id,color").in("id", ids);
  if (basic.error) throw basic.error;
  return (basic.data ?? []) as BookRow[];
}

async function withBooks(client: SupabaseClient, rows: PublicPost[]) {
  const ids = [...new Set(rows.map((row) => row.book_id))];
  if (!ids.length) return [];
  const data = await selectBooks(client, ids);
  const books = new Map(data.map((book) => [book.id, {
    key: book.open_library_key,
    title: book.title,
    author: book.author,
    coverId: book.cover_id ?? undefined,
    coverUrl: book.cover_url ?? undefined,
    color: book.color,
    genre: book.genre ?? undefined,
  } satisfies Book]));
  return rows.flatMap((row) => {
    const book = books.get(row.book_id);
    return book ? [{ row, book }] : [];
  });
}

function toFeedItem(row: PublicPost, book: Book): SamplePost {
  return {
    id: row.id,
    kind: row.kind,
    book,
    rating: row.rating ?? (row.kind === "recommendation" ? 1 : 0),
    quote: row.quote,
    note: row.note,
    from: row.sender_nickname,
    spoiler: row.spoiler,
    recipient: row.recipient_name ?? undefined,
    relationship: row.relationship ?? undefined,
    genre: book.genre,
    createdAt: row.created_at,
  };
}

async function selectRows(
  queryWithRel: PromiseLike<{ data: unknown; error: unknown }>,
  queryFallback: () => PromiseLike<{ data: unknown; error: unknown }>
): Promise<PublicPost[]> {
  const result = await queryWithRel;
  if (!result.error && Array.isArray(result.data)) {
    return result.data as PublicPost[];
  }
  const fallback = await queryFallback();
  if (fallback.error) throw fallback.error;
  return (Array.isArray(fallback.data) ? fallback.data : []) as PublicPost[];
}

/** Loads the public feed: the latest recommendations and the latest public dedications. */
export async function fetchFeed(client: SupabaseClient) {
  const [recent, dedicated] = await Promise.all([
    selectRows(
      client.from("public_posts").select(fieldsWithRel).eq("kind", "recommendation").order("created_at", { ascending: false }).limit(60),
      () => client.from("public_posts").select(basicFields).eq("kind", "recommendation").order("created_at", { ascending: false }).limit(60)
    ),
    selectRows(
      client.from("public_posts").select(fieldsWithRel).eq("kind", "dedication").order("created_at", { ascending: false }).limit(60),
      () => client.from("public_posts").select(basicFields).eq("kind", "dedication").order("created_at", { ascending: false }).limit(60)
    ),
  ]);
  const mapped = await withBooks(client, [...recent, ...dedicated]);
  const items = mapped.map(({ row, book }) => toFeedItem(row, book));
  return {
    posts: items.filter((item) => item.kind !== "dedication"),
    dedications: items.filter((item) => item.kind === "dedication"),
  };
}

/** Fetches a single note (recommendation or dedication) for deep links. */
export async function fetchNoteById(client: SupabaseClient, id: string): Promise<SamplePost | null> {
  const res = await client.from("public_posts").select(fieldsWithRel).eq("id", id).maybeSingle();
  let row = res.data as PublicPost | null;
  if (res.error) {
    const fallback = await client.from("public_posts").select(basicFields).eq("id", id).maybeSingle();
    row = fallback.data as PublicPost | null;
  }
  if (!row) return null;
  const [mapped] = await withBooks(client, [row]);
  return mapped ? toFeedItem(mapped.row, mapped.book) : null;
}

export async function fetchDedications(client: SupabaseClient, name: string): Promise<Dedication[]> {
  const recipient = name.trim().toLowerCase();
  if (!recipient) return [];
  const rows: PublicPost[] = [];
  for (let start = 0; ; start += 100) {
    const pageRows = await selectRows(
      client.from("public_posts").select(fieldsWithRel)
        .eq("kind", "dedication").eq("recipient_key", recipient)
        .order("created_at", { ascending: false }).range(start, start + 99),
      () => client.from("public_posts").select(basicFields)
        .eq("kind", "dedication").eq("recipient_key", recipient)
        .order("created_at", { ascending: false }).range(start, start + 99)
    );
    rows.push(...pageRows);
    if (pageRows.length < 100) break;
  }
  const mapped = await withBooks(client, rows);
  return mapped.map(({ row, book }) => ({
    id: row.id,
    recipient: row.recipient_name ?? name,
    relationship: row.relationship ?? undefined,
    book,
    quote: row.quote,
    message: row.note,
    from: row.sender_nickname,
    spoiler: row.spoiler,
  }));
}
