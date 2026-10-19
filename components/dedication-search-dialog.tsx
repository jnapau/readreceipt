"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookHeart, Eye, EyeOff, Search, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { ShelfButton } from "@/components/shelf-button";
import type { Dedication } from "@/lib/sample-data";
import { createClient } from "@/lib/supabase/client";
import { fetchDedications } from "@/lib/public-feed";

export function DedicationSearchDialog({ query, dedications, onClose, onRequestAuth }: { query: string; dedications: Dedication[]; onClose: () => void; onRequestAuth: () => void }) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [stored, setStored] = useState<Dedication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const local = dedications.filter((dedication) => dedication.recipient.trim().toLowerCase() === query.trim().toLowerCase());
  const matches = [...local, ...stored.filter((item) => !local.some((recent) => recent.id === item.id))];

  useEffect(() => {
    const client = createClient();
    if (!client) { setLoading(false); return; }
    let active = true;
    void fetchDedications(client, query).then((items) => {
      if (active) { setStored(items); setLoading(false); }
    }).catch(() => { if (active) { setLoadError(true); setLoading(false); } });
    return () => { active = false; };
  }, [query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="book-dialog dedication-search-dialog" role="dialog" aria-modal="true" aria-labelledby="dedication-search-title">
        <div className="book-dialog-header">
          <div><span className="book-dialog-kicker"><BookHeart size={15} aria-hidden="true" /> Dedications found</span><h2 id="dedication-search-title">For {query}</h2><p>{loading ? "Searching…" : `${matches.length} ${matches.length === 1 ? "dedication" : "dedications"} found`}</p></div>
          <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close dedication results"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="dedication-results" aria-live="polite">
          {loadError && <p className="form-error" role="alert">The archive could not be searched. Please try again.</p>}
          {!loading && matches.length === 0 ? <div className="dedication-empty"><Search size={22} aria-hidden="true" /><strong>No dedication found for “{query}”</strong><p>Try the exact first name or nickname it was sent to.</p></div> : matches.map((dedication, index) => {
            const key = dedication.id ?? `${dedication.recipient}-${dedication.book.title}-${index}`;
            const isRevealed = !dedication.spoiler || revealed[key];
            return <article className="dedication-result" key={key}><div className="dedication-result-art"><CoverArt book={dedication.book} sizes="64px" /></div><div className="dedication-result-copy"><div className="dedication-result-heading"><div><span className="post-type">A book for {dedication.recipient}</span><h3>{dedication.book.title}</h3><p className="book-author">{dedication.book.author}</p></div><ShelfButton book={dedication.book} onRequestAuth={onRequestAuth} /></div><div className={isRevealed ? "dedication-copy" : "dedication-copy dedication-copy-hidden"}>{dedication.quote && <blockquote>“{dedication.quote}”</blockquote>}<p>{dedication.message}</p></div>{dedication.spoiler && <button className="spoiler-reveal" type="button" onClick={() => setRevealed((current) => ({ ...current, [key]: !isRevealed }))}>{isRevealed ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />} {isRevealed ? "Hide spoiler" : "Click to reveal spoiler"}</button>}<div className="detail-from">From <strong>{dedication.from}</strong></div></div></article>;
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
