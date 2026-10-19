"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, BookOpen, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { bookSpineColor, type Book } from "@/lib/books";
import { collageBooks } from "@/lib/sample-data";

type SearchState = "idle" | "loading" | "success" | "error";

function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxW = 480;
        const maxH = 720;
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

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

  // Manual book entry state
  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualCover, setManualCover] = useState<string | null>(null);
  const [manualError, setManualError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const manualTitleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setManualMode(false);
      setManualTitle("");
      setManualAuthor("");
      setManualCover(null);
      setManualError("");
      return;
    }
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
    if (manualMode) {
      window.setTimeout(() => manualTitleRef.current?.focus(), 0);
    }
  }, [manualMode]);

  useEffect(() => {
    if (!open || manualMode) return;
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
  }, [open, query, retry, manualMode]);

  if (!open) return null;

  const term = query.trim();
  const shownBooks = term.length < 2 ? [collageBooks[0], collageBooks[6], collageBooks[12], collageBooks[22]] : books;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await downscaleImage(file);
    if (dataUrl) setManualCover(dataUrl);
  };

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualTitle.trim()) {
      setManualError("Book title is required.");
      return;
    }
    if (!manualAuthor.trim()) {
      setManualError("Author is required.");
      return;
    }
    const title = manualTitle.trim();
    const author = manualAuthor.trim();
    const customBook: Book = {
      key: `custom:${Date.now()}:${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title,
      author,
      coverUrl: manualCover || undefined,
      color: bookSpineColor(title),
    };
    onSelect(customBook);
  };

  return createPortal(
    <div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="book-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId}>
        {manualMode ? (
          <>
            <div className="book-dialog-header">
              <div>
                <span className="book-dialog-kicker"><BookOpen size={15} aria-hidden="true" /> Indie &amp; Custom</span>
                <h2 id={headingId}>Enter book manually</h2>
                <p>Provide title, author, and an optional cover image.</p>
              </div>
              <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close book entry"><X size={20} aria-hidden="true" /></button>
            </div>

            <form className="manual-book-form" onSubmit={handleManualSubmit}>
              <div className="manual-book-fields">
                <div className="manual-book-preview-col">
                  <div className="manual-book-cover-preview">
                    <CoverArt
                      book={{
                        title: manualTitle.trim() || "Untitled",
                        author: manualAuthor.trim() || "Author",
                        color: bookSpineColor(manualTitle.trim() || "sample"),
                        coverUrl: manualCover || undefined,
                      }}
                      sizes="110px"
                    />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    aria-label="Upload cover image"
                  />
                  <div className="manual-cover-buttons">
                    <button
                      type="button"
                      className="manual-cover-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus size={15} aria-hidden="true" />
                      {manualCover ? "Change Cover" : "Add Cover Image"}
                    </button>
                    {manualCover && (
                      <button
                        type="button"
                        className="manual-cover-remove-btn"
                        onClick={() => setManualCover(null)}
                        aria-label="Remove cover image"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <small className="manual-cover-hint">
                    {manualCover ? "Custom cover attached" : "No image? An elegant spine will be generated."}
                  </small>
                </div>

                <div className="manual-book-inputs-col">
                  <div className="recommend-field">
                    <label className="recommend-label" htmlFor="manual-title">
                      <span>Book Title *</span>
                    </label>
                    <input
                      ref={manualTitleRef}
                      id="manual-title"
                      value={manualTitle}
                      onChange={(e) => { setManualTitle(e.target.value); setManualError(""); }}
                      placeholder="e.g. Tomorrow, and Tomorrow, and Tomorrow"
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="recommend-field">
                    <label className="recommend-label" htmlFor="manual-author">
                      <span>Author *</span>
                    </label>
                    <input
                      id="manual-author"
                      value={manualAuthor}
                      onChange={(e) => { setManualAuthor(e.target.value); setManualError(""); }}
                      placeholder="e.g. Gabrielle Zevin"
                      maxLength={100}
                      required
                    />
                  </div>

                  {manualError && <p className="form-error" role="alert">{manualError}</p>}
                </div>
              </div>

              <div className="manual-book-footer">
                <button
                  type="button"
                  className="recommend-cancel"
                  onClick={() => setManualMode(false)}
                >
                  <ArrowLeft size={15} aria-hidden="true" /> Back to search
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                >
                  Select this book <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
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
              <button
                type="button"
                className="manual-entry-button"
                onClick={() => {
                  setManualMode(true);
                  if (term.length >= 2) setManualTitle(term);
                }}
              >
                <Plus size={14} aria-hidden="true" /> Enter book manually
              </button>
            </div>

            <div className="book-results" aria-busy={term.length >= 2 && (state === "loading" || state === "idle")}>
              {term.length >= 2 && state === "error" ? (
                <div className="book-search-message">
                  <p>We couldn&apos;t reach Open Library. Please try again.</p>
                  <div className="book-search-message-actions">
                    <button type="button" onClick={() => setRetry((value) => value + 1)}>Try again</button>
                    <button type="button" className="button button-outline" onClick={() => { setManualMode(true); setManualTitle(term); }}>
                      + Enter book manually
                    </button>
                  </div>
                </div>
              ) : term.length >= 2 && state === "success" && books.length === 0 ? (
                <div className="book-search-message">
                  <p>No matches yet. Try the author&apos;s name or enter the title manually.</p>
                  <button
                    type="button"
                    className="button button-primary manual-fallback-cta"
                    onClick={() => { setManualMode(true); setManualTitle(term); }}
                  >
                    + Enter book manually
                  </button>
                </div>
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
            <p className="book-dialog-footnote">
              Can&apos;t find your book?{" "}
              <button
                type="button"
                className="footnote-link"
                onClick={() => {
                  setManualMode(true);
                  if (term.length >= 2) setManualTitle(term);
                }}
              >
                + Enter book manually
              </button>
            </p>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
