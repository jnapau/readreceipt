"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, BookHeart, Check, MessageCircle, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import type { Book } from "@/lib/books";
import { quoteSuggestions } from "@/lib/sample-data";

export type NewDedication = {
  recipient: string;
  book: Book;
  quote: string;
  message: string;
  from: string;
  spoiler?: boolean;
};

export function DedicationModal({ book, onClose, onSend, onChangeBook }: {
  book: Book | null;
  onClose: () => void;
  onSend: (dedication: NewDedication) => Promise<void>;
  onChangeBook?: () => void;
}) {
  const headingId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [recipient, setRecipient] = useState("");
  const [quote, setQuote] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const suggestions = useMemo(() => {
    if (!book) return [];
    return quoteSuggestions[book.title] ?? [
      "A book I would pass across the table to you.",
      "The kind of story that stays after the last page.",
    ];
  }, [book]);

  useEffect(() => {
    if (!book) return;
    setRecipient(""); setQuote(""); setMessage(""); setFrom(""); setSpoiler(false); setError("");
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
    if (!recipient.trim()) { setError("Add the person this dedication is for."); return; }
    if (!message.trim()) { setError("Write a short message to send with the book."); return; }
    setSending(true); setError("");
    try { await onSend({ recipient: recipient.trim(), book, quote: quote.trim(), message: message.trim(), from: from.trim() || "an anonymous reader", spoiler }); }
    catch { setError("Your dedication could not be saved. Please try again."); }
    finally { setSending(false); }
  };

  return createPortal(
    <div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="recommend-dialog dedication-dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={headingId}>
        <div className="recommend-header">
          <div><span className="book-dialog-kicker"><BookHeart size={15} aria-hidden="true" /> A dedication</span><h2 id={headingId}>Send it quietly</h2><p>Choose a book, then leave a little piece of yourself with it.</p></div>
          <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close dedication form"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="recommend-scroll">
          <div className="recommend-field dedication-recipient-field"><label className="recommend-label" htmlFor="recipient"><span>To whom?</span><small>Names are matched exactly</small></label><input id="recipient" value={recipient} onChange={(event) => { setRecipient(event.target.value); setError(""); }} placeholder="A first name or nickname" maxLength={60} autoComplete="off" /></div>

          <div className="recommend-book-row">
            <div className="recommend-book-art"><CoverArt book={book} sizes="70px" /></div>
            <div><span>Book selected</span><strong>{book.title}</strong><small>by {book.author}</small></div>
            {onChangeBook && <button type="button" onClick={onChangeBook}><ArrowLeft size={14} aria-hidden="true" /> Change</button>}
          </div>

          <div className="recommend-field"><label className="recommend-label" htmlFor="dedication-quote"><span>Favorite line <small>(optional)</small></span></label><textarea id="dedication-quote" value={quote} onChange={(event) => setQuote(event.target.value)} placeholder="A line you want to send along…" rows={2} /><div className="quote-suggestions"><MessageCircle size={15} aria-hidden="true" />{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setQuote(suggestion)}>{suggestion}</button>)}</div></div>

          <div className="recommend-field"><label className="recommend-label" htmlFor="dedication-message"><span>Personal message</span><small>{message.length}/280</small></label><textarea id="dedication-message" maxLength={280} value={message} onChange={(event) => { setMessage(event.target.value); setError(""); }} placeholder="A note for the person who will find this…" rows={4} /></div>

          <div className="recommend-field"><label className="recommend-label" htmlFor="dedication-from"><span>From <small>(optional)</small></span></label><input id="dedication-from" value={from} onChange={(event) => setFrom(event.target.value)} placeholder="A nickname, an initial, or leave blank" maxLength={50} /></div>

          <label className="spoiler-toggle"><input type="checkbox" checked={spoiler} onChange={(event) => setSpoiler(event.target.checked)} /><span className="toggle-track"><span /></span><span><strong>Contains a spoiler</strong><small>The dedication and quote will be blurred until revealed.</small></span></label>
          {error && <p className="form-error" role="alert">{error}</p>}
        </div>
        <div className="recommend-footer"><button className="recommend-cancel" type="button" onClick={onClose}>Keep reading</button><button className="button button-primary recommend-submit" type="button" onClick={submit} disabled={sending}>{sending ? "Sending…" : "Send dedication"} <Check size={17} aria-hidden="true" /></button></div>
      </div>
    </div>,
    document.body,
  );
}
