import { bookSpineColor, type Book } from "@/lib/books";

type OpenLibraryDoc = {
  key?: unknown;
  title?: unknown;
  author_name?: unknown;
  cover_i?: unknown;
  first_publish_year?: unknown;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) {
    return Response.json({ error: "Enter 2 to 100 characters to search for a book." }, { status: 400 });
  }

  const search = new URL("https://openlibrary.org/search.json");
  search.searchParams.set("q", query);
  search.searchParams.set("fields", "key,title,author_name,cover_i,first_publish_year");
  search.searchParams.set("limit", "12");

  try {
    const response = await fetch(search, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Open Library returned ${response.status}`);

    const data: unknown = await response.json();
    const docs = typeof data === "object" && data !== null && "docs" in data && Array.isArray(data.docs)
      ? data.docs as OpenLibraryDoc[]
      : [];

    const books: Book[] = docs.flatMap((doc) => {
      if (typeof doc.key !== "string" || typeof doc.title !== "string" || !doc.title.trim()) return [];
      const author = Array.isArray(doc.author_name) && typeof doc.author_name[0] === "string"
        ? doc.author_name[0]
        : "Unknown author";
      return [{
        key: doc.key,
        title: doc.title,
        author,
        coverId: typeof doc.cover_i === "number" ? doc.cover_i : undefined,
        firstPublishYear: typeof doc.first_publish_year === "number" ? doc.first_publish_year : undefined,
        color: bookSpineColor(doc.key),
      }];
    });

    return Response.json({ books });
  } catch {
    return Response.json({ error: "Book search is unavailable right now. Please try again." }, { status: 502 });
  }
}
