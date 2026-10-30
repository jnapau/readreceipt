import { createClient } from "@/lib/supabase/client";
import { fetchPurrCounts } from "@/lib/interactions";
import { fetchFeed } from "@/lib/public-feed";
import { samplePosts, sampleDedications, dedicationToFeedItem, type SamplePost } from "@/lib/sample-data";

function sanitizeCsv(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";

  let posts: SamplePost[] = [];
  let purrCounts: Record<string, number> = {};
  const client = createClient();
  if (client) {
    try {
      const feed = await fetchFeed(client);
      posts = [...feed.posts, ...feed.dedications].sort((a, b) => {
        const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
        const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
        return bTime - aTime;
      });
    } catch {
      posts = [];
    }
  }

  // Fallback to sample data if no live data is found
  if (posts.length === 0) {
    posts = [
      ...samplePosts,
      ...sampleDedications.map((d) => dedicationToFeedItem(d)),
    ];
  }

  if (client) {
    const storedIds = posts
      .map((post) => post.id)
      .filter((id): id is string => !!id && /^[0-9a-f-]{36}$/i.test(id));
    if (storedIds.length) {
      const fetched = await fetchPurrCounts(client, storedIds);
      if (fetched) purrCounts = fetched;
    }
  }

  const dataset = posts.map((item, index) => {
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
      purrs: item.id ? (purrCounts[item.id] ?? 0) : 0,
      has_spoiler: !!item.spoiler,
      created_at: item.createdAt || new Date(Date.now() - index * 86400000).toISOString(),
    };
  });

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
