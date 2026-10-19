"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { BookSearchModal } from "@/components/book-search-modal";
import { DedicationModal, type NewDedication } from "@/components/dedication-modal";
import { DedicationSearchDialog } from "@/components/dedication-search-dialog";
import { RecommendationModal, type NewPost } from "@/components/recommendation-modal";
import type { Book } from "@/lib/books";
import type { Dedication } from "@/lib/sample-data";

export function HeroControls({ onPost, onDedication, dedications, onRequestAuth }: {
  onPost: (post: NewPost) => Promise<string | void>;
  onDedication: (dedication: NewDedication) => Promise<string | void>;
  dedications: Dedication[];
  onRequestAuth: () => void;
}) {
  const [recommendSearchOpen, setRecommendSearchOpen] = useState(false);
  const [dedicationSearchOpen, setDedicationSearchOpen] = useState(false);
  const [recommendBook, setRecommendBook] = useState<Book | null>(null);
  const [dedicationBook, setDedicationBook] = useState<Book | null>(null);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientResultsOpen, setRecipientResultsOpen] = useState(false);
  const closeRecommendSearch = useCallback(() => setRecommendSearchOpen(false), []);
  const closeDedicationSearch = useCallback(() => setDedicationSearchOpen(false), []);
  const openRecipientResults = useCallback(() => {
    if (recipientQuery.trim()) setRecipientResultsOpen(true);
  }, [recipientQuery]);

  return (
    <>
      <div className="hero-control-box">
        <p className="hero-subtitle">Recommend a book. Dedicate one. Stay anonymous.</p>
        <div className="search-shell">
          <Search size={20} strokeWidth={1.8} aria-hidden="true" />
          <input aria-label="Find dedications by recipient name" placeholder="Find dedications for…" value={recipientQuery} onChange={(event) => setRecipientQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") openRecipientResults(); }} />
          <button className="search-enter" type="button" onClick={openRecipientResults} aria-label="Search dedications">↵</button>
        </div>
        <div className="hero-actions">
          <button className="button button-primary" type="button" onClick={() => setRecommendSearchOpen(true)}>Recommend <ArrowRight size={18} aria-hidden="true" /></button>
          <button className="button button-outline" type="button" onClick={() => setDedicationSearchOpen(true)}>Dedicate <ArrowRight size={18} aria-hidden="true" /></button>
        </div>
      </div>
      <BookSearchModal open={recommendSearchOpen} onClose={closeRecommendSearch} onSelect={(book) => { setRecommendSearchOpen(false); setRecommendBook(book); }} />
      <RecommendationModal book={recommendBook} onClose={() => setRecommendBook(null)} onChangeBook={() => { setRecommendBook(null); setRecommendSearchOpen(true); }} onPost={async (post) => { const id = await onPost(post); return id; }} />
      <BookSearchModal open={dedicationSearchOpen} onClose={closeDedicationSearch} onSelect={(book) => { setDedicationSearchOpen(false); setDedicationBook(book); }} />
      <DedicationModal book={dedicationBook} onClose={() => setDedicationBook(null)} onChangeBook={() => { setDedicationBook(null); setDedicationSearchOpen(true); }} onSend={async (dedication) => { const id = await onDedication(dedication); return id; }} />
      {recipientResultsOpen && <DedicationSearchDialog query={recipientQuery} dedications={dedications} onClose={() => setRecipientResultsOpen(false)} onRequestAuth={onRequestAuth} />}
    </>
  );
}
