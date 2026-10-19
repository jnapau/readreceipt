"use client";

import { useEffect, useState } from "react";
import { Bookmark, Check, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/lib/books";

export function ShelfButton({ book, onRequestAuth }: { book: Book; onRequestAuth: () => void }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const supabase = createClient();
  const openLibraryKey = book.key ?? `title:${book.title.toLowerCase()}`;

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data: storedBook } = await supabase.from("books").select("id").eq("open_library_key", openLibraryKey).maybeSingle();
      if (!storedBook || !active) return;
      const { data: shelfRow } = await supabase.from("shelves").select("id").eq("user_id", user.id).eq("book_id", storedBook.id).maybeSingle();
      if (active) setSaved(Boolean(shelfRow));
    })();
    return () => { active = false; };
  }, [openLibraryKey, supabase]);

  const toggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!supabase) { onRequestAuth(); return; }
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { onRequestAuth(); return; }
      let { data: storedBook } = await supabase.from("books").select("id").eq("open_library_key", openLibraryKey).maybeSingle();
      if (!storedBook) {
        const result = await supabase.from("books").insert({ open_library_key: openLibraryKey, title: book.title, author: book.author, cover_id: book.coverId ?? null, color: book.color }).select("id").single();
        if (result.error) throw result.error;
        storedBook = result.data;
      }
      if (saved) {
        const { error } = await supabase.from("shelves").delete().eq("user_id", user.id).eq("book_id", storedBook.id);
        if (error) throw error;
        setSaved(false);
      } else {
        const { error } = await supabase.from("shelves").insert({ user_id: user.id, book_id: storedBook.id });
        if (error) throw error;
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return <button className={saved ? "shelf-book-button shelf-book-button-saved" : "shelf-book-button"} type="button" onClick={toggle} disabled={busy} aria-label={saved ? `Remove ${book.title} from My Shelf` : `Save ${book.title} to My Shelf`} title={saved ? "Remove from My Shelf" : "Save to My Shelf"}>{busy ? <LoaderCircle size={16} className="shelf-spin" aria-hidden="true" /> : saved ? <Check size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}<span>{saved ? "Saved" : "My Shelf"}</span></button>;
}
