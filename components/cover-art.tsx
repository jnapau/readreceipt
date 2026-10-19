"use client";

import { useState } from "react";
import type { Book } from "@/lib/books";

export function CoverArt({ book, sizes }: { book: Book; sizes?: string }) {
  const [failed, setFailed] = useState(false);
  const fallback = !book.coverId || failed;
  return (
    <div className={`cover-art ${fallback ? "cover-fallback" : ""}`} style={{ backgroundColor: book.color }}>
      {fallback ? (
        <div className="spine-type"><span>{book.title}</span><small>{book.author}</small></div>
      ) : (
        // Open Library supplies the covers; a text spine replaces missing images.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg?default=false`} alt={`Cover of ${book.title}`} sizes={sizes} loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  );
}
