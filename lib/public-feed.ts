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

const fields = "id,kind,book_id,rating,quote,note,recipient_name,sender_nickname,spoiler,created_at";

async function withBooks(client: SupabaseClient, rows: PublicPost[]) {
  const ids = [...new Set(rows.map((row) => row.book_id))];
  if (!ids.length) return [];
  const { data, error } = await client.from("books").select("id,open_library_key,title,author,cover_id,color").in("id", ids);
  if (error) throw error;
  const books = new Map((data ?? []).map((book) => [book.id, {
    key: book.open_library_key,
    title: book.title,
    author: book.author,
    coverId: book.cover_id ?? undefined,
    color: book.color,
  } satisfies Book]));
  return rows.flatMap((row) => {
    const book = books.get(row.book_id);
    return book ? [{ row, book }] : [];
  });
}

export async function fetchFeed(client: SupabaseClient) {
  const [recent, selected] = await Promise.all([
    client.from("public_posts").select(fields).eq("kind", "recommendation").order("created_at", { ascending: false }).limit(60),
    client.from("top_pick").select("book_id").maybeSingle(),
  ]);
  if (recent.error) throw recent.error;
  if (selected.error) throw selected.error;
  const rows = (recent.data ?? []) as PublicPost[];
  const selectedId = selected.data?.book_id as string | null | undefined;
  if (selectedId && !rows.some((row) => row.book_id === selectedId)) {
    const pick = await client.from("public_posts").select(fields).eq("kind", "recommendation").eq("book_id", selectedId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (pick.error) throw pick.error;
    if (pick.data) rows.push(pick.data as PublicPost);
  }
  const mapped = await withBooks(client, rows);
  const posts: SamplePost[] = mapped.map(({ row, book }) => ({
    id: row.id, book, rating: row.rating ?? 1, quote: row.quote,
    note: row.note, from: row.sender_nickname, spoiler: row.spoiler,
  }));
  const featured = selectedId ? mapped.find(({ row }) => row.book_id === selectedId) : mapped[0];
  return { posts, topPickId: featured?.row.id ?? posts[0]?.id ?? null };
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
