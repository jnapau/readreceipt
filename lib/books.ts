export type Book = {
  key?: string;
  title: string;
  author: string;
  coverId?: number;
  /** A custom cover (data URL or storage URL) supplied for manually entered books. */
  coverUrl?: string;
  firstPublishYear?: number;
  color: string;
};

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
