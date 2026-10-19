"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, BookOpen, Search, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import type { Book } from "@/lib/books";
import { collageBooks } from "@/lib/sample-data";

type SearchState = "idle" | "loading" | "success" | "error";

export function BookSearchModal({ open, onClose, onSelect }: {
  open: boolean;
  onClose: () => void;
  onSelect: (book: Book) => void;
}) {
  const headingId = useId();
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [state, setState] = useState<SearchState>("idle");
  const [retry, setRetry] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), input:not(:disabled)"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState("loading");
      try {
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json() as { books?: Book[] };
        if (!controller.signal.aborted) {
          setBooks(Array.isArray(data.books) ? data.books : []);
          setState("success");
        }
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, query, retry]);

  if (!open) return null;

  const term = query.trim();
  const shownBooks = term.length < 2 ? [collageBooks[0], collageBooks[6], collageBooks[12], collageBooks[22]] : books;

  return createPortal(
    <div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="book-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <div className="book-dialog-header">
          <div>
            <span className="book-dialog-kicker"><BookOpen size={15} aria-hidden="true" /> The first page</span>
            <h2 id={headingId}>Find your book</h2>
            <p>Search by title or author, then choose the book you want to share.</p>
          </div>
          <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close book search"><X size={20} aria-hidden="true" /></button>
        </div>

        <label className="book-search-input">
          <Search size={20} aria-hidden="true" />
          <input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setBooks([]); setState("idle"); }} placeholder="Search books or authors…" aria-label="Search books or authors" autoComplete="off" />
          {query && <button type="button" onClick={() => { setQuery(""); setBooks([]); setState("idle"); inputRef.current?.focus(); }} aria-label="Clear book search"><X size={16} aria-hidden="true" /></button>}
        </label>

        <div className="book-results-heading" aria-live="polite">
          <span>{term.length < 2 ? "A few books to start with" : state === "loading" || state === "idle" ? "Searching Open Library…" : state === "success" ? `${books.length} ${books.length === 1 ? "book" : "books"} found` : "Search unavailable"}</span>
          {term.length >= 2 && state === "success" && <small>Results from Open Library</small>}
        </div>

        <div className="book-results" aria-busy={term.length >= 2 && (state === "loading" || state === "idle")}>
          {term.length >= 2 && state === "error" ? (
            <div className="book-search-message"><p>We couldn&apos;t reach Open Library. Please try again.</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>
          ) : term.length >= 2 && state === "success" && books.length === 0 ? (
            <div className="book-search-message"><p>No matches yet. Try the author&apos;s name or a shorter title.</p></div>
          ) : term.length >= 2 && (state === "loading" || state === "idle") ? (
            <div className="book-search-message book-search-loading"><span className="book-search-spinner" aria-hidden="true" /> Looking through the shelves…</div>
          ) : shownBooks.map((book) => (
            <button className="book-result" type="button" key={book.key ?? book.title} onClick={() => onSelect(book)}>
              <span className="book-result-cover"><CoverArt book={book} sizes="58px" /></span>
              <span className="book-result-copy"><strong>{book.title}</strong><span>{book.author}{book.firstPublishYear ? ` · ${book.firstPublishYear}` : ""}</span></span>
              <ArrowRight className="book-result-arrow" size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
        <p className="book-dialog-footnote">Can&apos;t see a cover? The book will get a custom text spine.</p>
      </div>
    </div>,
    document.body,
  );
}
