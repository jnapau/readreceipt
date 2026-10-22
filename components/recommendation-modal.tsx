"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, BookOpen, Check, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { BOOK_GENRES, type Book } from "@/lib/books";

export type NewPost = {
  book: Book;
  rating: number;
  quote: string;
  note: string;
  from: string;
  spoiler?: boolean;
};

function CatPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="cat-picker" role="radiogroup" aria-label="Rating from 1 to 5 cats">
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        return (
          <button key={rating} className={rating <= value ? "cat-choice cat-choice-active" : "cat-choice"} type="button" role="radio" aria-checked={rating === value} aria-label={`${rating} ${rating === 1 ? "cat" : "cats"}`} onClick={() => onChange(rating)}>
            <svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.4 4.6c-.4-.7-.3-1.2.3-1.1l4.7 2.6a10.3 10.3 0 0 1 5.2 0l4.7-2.6c.6-.1.7.4.3 1.1l-1.1 5.2c1 1.4 1.5 3.1 1.5 4.9 0 4.3-3.4 7.1-8 7.1s-8-2.8-8-7.1c0-1.8.5-3.5 1.5-4.9L4.4 4.6Zm4.9 8.7a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm5.4 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm-4.1 3.5c.6.5 1 .7 1.4.7l-1.4-1.1-1.4 1.1Z" /></svg>
          </button>
        );
      })}
    </div>
  );
}

export function RecommendationModal({ book, onClose, onPost, onChangeBook }: {
  book: Book | null;
  onClose: () => void;
  onPost: (post: NewPost) => Promise<string | void>;
  onChangeBook?: () => void;
}) {
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(0);
  const [genre, setGenre] = useState(book?.genre ?? "");
  const [quote, setQuote] = useState("");
  const [note, setNote] = useState("");
  const [from, setFrom] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!book) return;
    setRating(0); setGenre(book.genre ?? ""); setQuote(""); setNote(""); setFrom(""); setSpoiler(false); setError("");
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), textarea, input") ?? []);
    window.setTimeout(() => focusable()[0]?.focus(), 0);
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { onClose(); return; }
      if (event.key !== "Tab") return;
      const elements = focusable(); const first = elements[0]; const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [book, onClose]);

  if (!book) return null;

  const submit = async () => {
    if (!rating) { setError("Choose a cat rating first."); return; }
    if (!note.trim()) { setError("Add a short note so people know why you chose this book."); return; }
    setSending(true); setError("");
    try {
      const updatedBook: Book = { ...book, genre: genre.trim() || book.genre };
      const payload: NewPost = { book: updatedBook, rating, quote: quote.trim(), note: note.trim(), from: from.trim() || "an anonymous reader", spoiler };
      await onPost(payload);
      window.location.assign("/");
    }
    catch { setError("Your recommendation could not be saved. Please try again."); }
    finally { setSending(false); }
  };

  return createPortal(
    <div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="recommend-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <div className="recommend-header">
          <div><span className="book-dialog-kicker"><BookOpen size={15} aria-hidden="true" /> A recommendation</span><h2 id={headingId}>Pass it along</h2><p>A few words can make a book feel like a letter.</p></div>
          <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close recommendation form"><X size={20} aria-hidden="true" /></button>
        </div>

        <>
            <div className="recommend-scroll">
              <div className="recommend-book-row">
                <div className="recommend-book-art"><CoverArt book={book} sizes="70px" /></div>
                <div><span>Book selected</span><strong>{book.title}</strong><small>by {book.author}</small></div>
                {onChangeBook && <button type="button" onClick={onChangeBook}><ArrowLeft size={14} aria-hidden="true" /> Change</button>}
              </div>

              <div className="recommend-field"><div className="recommend-label"><span>How much did it stay with you?</span><small>{rating ? `${rating} of 5 cats` : "Choose a rating"}</small></div><CatPicker value={rating} onChange={(value) => { setRating(value); setError(""); }} /></div>

              <div className="recommend-field">
                <div className="recommend-label">
                  <span>Genre <small>(optional · helps reader discovery)</small></span>
                  {genre && <button type="button" className="relationship-skip-btn" onClick={() => setGenre("")}>Clear</button>}
                </div>
                <div className="genre-chips" role="group" aria-label="Genre categories">
                  {BOOK_GENRES.slice(0, 8).map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`genre-chip${genre === g ? " genre-chip-active" : ""}`}
                      onClick={() => setGenre(genre === g ? "" : g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <input
                  id="recommendation-genre"
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                  placeholder="Or custom genre (e.g. Literary Fiction, Fantasy)"
                  maxLength={50}
                />
              </div>

              <div className="recommend-field"><label className="recommend-label" htmlFor="quote"><span>Favorite line <small>(optional)</small></span></label><textarea id="quote" value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="A line you want to pass along…" rows={2} /></div>

              <div className="recommend-field"><label className="recommend-label" htmlFor="recommendation-note"><span>Why this book?</span><small>{note.length}/280</small></label><textarea id="recommendation-note" maxLength={280} value={note} onChange={(event) => { setNote(event.target.value); setError(""); }} placeholder="Tell the next reader what this book might give them…" rows={4} /></div>

              <div className="recommend-field"><label className="recommend-label" htmlFor="from"><span>From <small>(optional)</small></span></label><input id="from" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="A nickname, an initial, or leave blank" maxLength={50} /></div>

              <label className="spoiler-toggle"><input type="checkbox" checked={spoiler} onChange={(event) => setSpoiler(event.target.checked)} /><span className="toggle-track"><span /></span><span><strong>Contains a spoiler</strong><small>The note and quote will be blurred until revealed.</small></span></label>
              {error && <p className="form-error" role="alert">{error}</p>}
            </div>
            <div className="recommend-footer"><button className="recommend-cancel" type="button" onClick={onClose}>Keep reading</button><button className="button button-primary recommend-submit" type="button" onClick={submit} disabled={sending}>{sending ? "Posting…" : "Post recommendation"} <Check size={17} aria-hidden="true" /></button></div>
        </>
      </div>
    </div>,
    document.body,
  );
}
