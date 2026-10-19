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
  sender_nickname: string;
  spoiler: boolean;
  created_at: string;
};

type BookRow = { id: string; open_library_key: string; title: string; author: string; cover_id: number | null; color: string; cover_url?: string | null };

const fields = "id,kind,book_id,rating,quote,note,recipient_name,sender_nickname,spoiler,created_at";

async function selectBooks(client: SupabaseClient, ids: string[]) {
  // `cover_url` arrives with the v2 migration; fall back gracefully if it hasn't been applied yet.
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
    createdAt: row.created_at,
  };
}

/** Loads the public feed: the latest recommendations and the latest public dedications. */
export async function fetchFeed(client: SupabaseClient) {
  const [recent, dedicated] = await Promise.all([
    client.from("public_posts").select(fields).eq("kind", "recommendation").order("created_at", { ascending: false }).limit(60),
    client.from("public_posts").select(fields).eq("kind", "dedication").order("created_at", { ascending: false }).limit(60),
  ]);
  if (recent.error) throw recent.error;
  if (dedicated.error) throw dedicated.error;
  const mapped = await withBooks(client, [...(recent.data ?? []), ...(dedicated.data ?? [])] as PublicPost[]);
  const items = mapped.map(({ row, book }) => toFeedItem(row, book));
  return {
    posts: items.filter((item) => item.kind !== "dedication"),
    dedications: items.filter((item) => item.kind === "dedication"),
  };
}

/** Fetches a single note (recommendation or dedication) for deep links. */
export async function fetchNoteById(client: SupabaseClient, id: string): Promise<SamplePost | null> {
  const { data, error } = await client.from("public_posts").select(fields).eq("id", id).maybeSingle();
  if (error || !data) return null;
  const [mapped] = await withBooks(client, [data as PublicPost]);
  return mapped ? toFeedItem(mapped.row, mapped.book) : null;
}

export async function fetchDedications(client: SupabaseClient, name: string): Promise<Dedication[]> {
  const recipient = name.trim().toLowerCase();
  if (!recipient) return [];
  const rows: PublicPost[] = [];
  for (let start = 0; ; start += 100) {
    const { data, error } = await client.from("public_posts").select(fields)
      .eq("kind", "dedication").eq("recipient_key", recipient)
      .order("created_at", { ascending: false }).range(start, start + 99);
    if (error) throw error;
    rows.push(...((data ?? []) as PublicPost[]));
    if (!data || data.length < 100) break;
  }
  const mapped = await withBooks(client, rows);
  return mapped.map(({ row, book }) => ({
    id: row.id, recipient: row.recipient_name ?? name, book,
    quote: row.quote, message: row.note, from: row.sender_nickname,
    spoiler: row.spoiler,
  }));
}
