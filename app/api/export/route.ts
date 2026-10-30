import { createClient } from "@supabase/supabase-js";
import { samplePosts, sampleDedications, dedicationToFeedItem } from "@/lib/sample-data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function sanitizeCsv(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

type ExportRow = {
  post_id: string;
  kind: string;
  book_title: string;
  book_author: string;
  genre: string;
  rating: number | null;
  quote: string;
  note: string;
  note_length: number;
  from_sender: string;
  recipient: string | null;
  relationship: string | null;
  purrs: number;
  has_spoiler: boolean;
  created_at: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";

  let dataset: ExportRow[] = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const client = createClient(supabaseUrl, supabaseKey);

      // Fetch all books
      const { data: booksData } = await client.from("books").select("id,title,author,genre");
      const booksMap = new Map((booksData || []).map((b) => [b.id, b]));

      // Fetch all purr counts with pagination
      const purrCounts: Record<string, number> = {};
      for (let pStart = 0; ; pStart += 1000) {
        const { data: pData, error: pErr } = await client
          .from("purr_counts")
          .select("post_id,purrs")
          .range(pStart, pStart + 999);
        if (pErr || !pData || !pData.length) break;
        for (const row of pData) {
          purrCounts[row.post_id] = Math.min(231, Number(row.purrs) || 0);
        }
        if (pData.length < 1000) break;
      }

      // Fetch all posts with pagination
      const PAGE_SIZE = 1000;
      const allPosts: any[] = [];
      for (let start = 0; ; start += PAGE_SIZE) {
        const { data, error } = await client
          .from("public_posts")
          .select("id,kind,book_id,rating,quote,note,recipient_name,relationship,sender_nickname,spoiler,created_at")
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(start, start + PAGE_SIZE - 1);

        if (error || !data || !data.length) break;
        allPosts.push(...data);
        if (data.length < PAGE_SIZE) break;
      }

      if (allPosts.length > 0) {
        dataset = allPosts.map((row, index) => {
          const book = booksMap.get(row.book_id) || { title: "Unknown", author: "Unknown", genre: "Uncategorized" };
          const isDedication = row.kind === "dedication";
          return {
            post_id: row.id,
            kind: row.kind,
            book_title: book.title,
            book_author: book.author,
            genre: book.genre || "Uncategorized",
            rating: isDedication ? null : (row.rating ?? 0),
            quote: row.quote || "",
            note: row.note || "",
            note_length: (row.note || "").length,
            from_sender: row.sender_nickname,
            recipient: isDedication ? (row.recipient_name || "") : null,
            relationship: isDedication ? (row.relationship || "unspecified") : null,
            purrs: purrCounts[row.id] ?? 0,
            has_spoiler: !!row.spoiler,
            created_at: row.created_at || new Date(Date.now() - index * 86400000).toISOString(),
          };
        });
      }
    } catch (e) {
      console.error("Export API error fetching from Supabase:", e);
    }
  }

  // Fallback to sample data if no database data
  if (dataset.length === 0) {
    const fallbackItems = [
      ...samplePosts,
      ...sampleDedications.map((d) => dedicationToFeedItem(d)),
    ];
    dataset = fallbackItems.map((item, index) => {
      const isDedication = item.kind === "dedication";
      return {
        post_id: item.id || `sample-${index + 1}`,
        kind: item.kind || "recommendation",
        book_title: item.book.title,
        book_author: item.book.author,
        genre: item.book.genre || item.genre || "Uncategorized",
        rating: isDedication ? null : item.rating,
        quote: item.quote || "",
        note: item.note || "",
        note_length: (item.note || "").length,
        from_sender: item.from,
        recipient: isDedication ? (item.recipient || "") : null,
        relationship: isDedication ? (item.relationship || "unspecified") : null,
        purrs: 0,
        has_spoiler: !!item.spoiler,
        created_at: item.createdAt || new Date(Date.now() - index * 86400000).toISOString(),
      };
    });
  }

  if (format === "csv") {
    const headers = [
      "post_id",
      "kind",
      "book_title",
      "book_author",
      "genre",
      "rating",
      "quote",
      "note",
      "note_length",
      "from_sender",
      "recipient",
      "relationship",
      "purrs",
      "has_spoiler",
      "created_at",
    ];

    const rows = dataset.map((row) => [
      sanitizeCsv(row.post_id),
      sanitizeCsv(row.kind),
      sanitizeCsv(row.book_title),
      sanitizeCsv(row.book_author),
      sanitizeCsv(row.genre),
      sanitizeCsv(row.rating),
      sanitizeCsv(row.quote),
      sanitizeCsv(row.note),
      sanitizeCsv(row.note_length),
      sanitizeCsv(row.from_sender),
      sanitizeCsv(row.recipient),
      sanitizeCsv(row.relationship),
      sanitizeCsv(row.purrs),
      sanitizeCsv(row.has_spoiler),
      sanitizeCsv(row.created_at),
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="read_receipts_data.csv"',
      },
    });
  }

  return Response.json({
    total_records: dataset.length,
    dataset,
  }, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
