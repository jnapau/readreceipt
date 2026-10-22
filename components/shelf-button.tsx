"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, LoaderCircle } from "lucide-react";
import { showToast } from "@/components/toast";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/books";

export function ShelfButton({ book, onRequestAuth }: { book: Book; onRequestAuth: () => void }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const openLibraryKey = book.key ?? `title:${book.title.toLowerCase()}`;

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const refresh = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setSaved(false); return; }
      const { data: storedBook } = await supabase.from("books").select("id").eq("open_library_key", openLibraryKey).maybeSingle();
      if (!storedBook || !active) { setSaved(false); return; }
      const { data: shelfRow } = await supabase.from("shelves").select("id").eq("user_id", user.id).eq("book_id", storedBook.id).maybeSingle();
      if (active) setSaved(Boolean(shelfRow));
    };
    void refresh();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void refresh(); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [openLibraryKey, supabase]);

  const toggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!supabase) { onRequestAuth(); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { onRequestAuth(); return; }
      let { data: storedBook, error: lookupError } = await supabase.from("books").select("id").eq("open_library_key", openLibraryKey).maybeSingle();
      if (lookupError) throw lookupError;
      if (!storedBook) {
        const result = await supabase.from("books").insert({ open_library_key: openLibraryKey, title: book.title, author: book.author, cover_id: book.coverId ?? null, color: book.color, cover_url: book.coverUrl ?? null, genre: book.genre ?? null }).select("id").single();
        if (result.error) throw result.error;
        storedBook = result.data;
      }
      if (saved) {
        const { error } = await supabase.from("shelves").delete().eq("user_id", user.id).eq("book_id", storedBook.id);
        if (error) throw error;
        setSaved(false);
        showToast(`${book.title} removed from My Shelf.`);
      } else {
        const { error } = await supabase.from("shelves").insert({ user_id: user.id, book_id: storedBook.id });
        if (error) throw error;
        setSaved(true);
        showToast(`${book.title} saved to My Shelf.`);
      }
      window.dispatchEvent(new Event("rr:shelf-changed"));
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : "Unknown error";
      console.error("Shelf update failed:", detail);
      showToast("My Shelf couldn't be updated. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return <button className={saved ? "shelf-book-button shelf-book-button-saved" : "shelf-book-button"} type="button" onClick={toggle} disabled={busy} aria-label={saved ? `Remove ${book.title} from My Shelf` : `Save ${book.title} to My Shelf`} title={saved ? "Remove from My Shelf" : "Save to My Shelf"}>{busy ? <LoaderCircle size={16} className="shelf-spin" aria-hidden="true" /> : saved ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}<span>{saved ? "Saved" : "My Shelf"}</span></button>;
}
