export type Book = {
  key?: string;
  title: string;
  author: string;
  coverId?: number;
  /** A custom cover (data URL or storage URL) supplied for manually entered books. */
  coverUrl?: string;
  firstPublishYear?: number;
  color: string;
  /** Literary genre of the book, useful for classification and data science. */
  genre?: string;
};

export const BOOK_GENRES = [
  "Fiction",
  "Classics",
  "Romance",
  "Literary Fiction",
  "Fantasy",
  "Sci-Fi",
  "Mystery & Thriller",
  "Poetry",
  "Memoir & Biography",
  "Non-Fiction",
  "Philosophy",
  "Young Adult",
] as const;

export function normalizeGenre(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const clean = raw.trim().toLowerCase();
  if (!clean) return undefined;
  if (/classic/i.test(clean)) return "Classics";
  if (/romance|love/i.test(clean)) return "Romance";
  if (/fantasy|magic|myth/i.test(clean)) return "Fantasy";
  if (/science fiction|sci-fi|dystop/i.test(clean)) return "Sci-Fi";
  if (/mystery|thriller|crime|detective/i.test(clean)) return "Mystery & Thriller";
  if (/poetry|poems/i.test(clean)) return "Poetry";
  if (/memoir|biograph|autobiograph/i.test(clean)) return "Memoir & Biography";
  if (/philosophy|ethics/i.test(clean)) return "Philosophy";
  if (/young adult|ya\b/i.test(clean)) return "Young Adult";
  if (/non-fiction|history|essays/i.test(clean)) return "Non-Fiction";
  if (/fiction/i.test(clean)) return "Fiction";
  // Title-case raw string if not recognized
  return raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1);
}

const spineColors = ["#665065", "#314d46", "#755e4d", "#315363", "#764a52", "#4b5e66"];

export function bookSpineColor(key: string) {
  let hash = 0;
  for (const character of key) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return spineColors[Math.abs(hash) % spineColors.length];
}

/** Returns the best available cover image URL for a book, or null for a text spine. */
export function bookCoverSrc(book: Book, size: "S" | "M" | "L" = "M") {
  if (book.coverUrl) return book.coverUrl;
  if (book.coverId) return `https://covers.openlibrary.org/b/id/${book.coverId}-${size}.jpg?default=false`;
  return null;
}

