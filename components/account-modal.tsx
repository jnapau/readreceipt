"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Bookmark, LogOut, UserRound, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Book } from "@/lib/books";

type ShelfBook = Book & { id: string };

export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [shelf, setShelf] = useState<ShelfBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const supabase = useMemo(() => createClient(), []);

  const loadShelf = useCallback(async (active: () => boolean = () => true) => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!active()) return;
    setUserId(user?.id ?? null);
    if (!user) { setShelf([]); return; }
    const { data, error: shelfError } = await supabase.from("shelves").select("id, books(id, open_library_key, title, author, cover_id, color, cover_url, genre)").order("created_at", { ascending: false });
    if (shelfError) { setError("Your shelf couldn't be loaded. Please try again."); return; }
    type BookRow = { id: string; open_library_key: string; title: string; author: string; cover_id: number | null; color: string; cover_url?: string | null; genre?: string | null };
    const rows = (data ?? []) as unknown as Array<{ id: string; books: BookRow | BookRow[] | null }>;
    if (!active()) return;
    setShelf(rows.flatMap((row) => {
      const related = Array.isArray(row.books) ? row.books : row.books ? [row.books] : [];
      return related.map((book) => ({ id: book.id, key: book.open_library_key, title: book.title, author: book.author, coverId: book.cover_id ?? undefined, coverUrl: book.cover_url ?? undefined, genre: book.genre ?? undefined, color: book.color }));
    }));
  }, [supabase]);

  useEffect(() => {
    if (!open || !supabase) return;
    let active = true;
    const isActive = () => active;
    void loadShelf(isActive);
    const refresh = () => { void loadShelf(isActive); };
    window.addEventListener("rr:shelf-changed", refresh);
    const { data: authListener } = supabase.auth.onAuthStateChange(refresh);
    return () => { active = false; window.removeEventListener("rr:shelf-changed", refresh); authListener.subscription.unsubscribe(); };
  }, [open, supabase, loadShelf]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(""); setMessage("");
    if (!supabase) { setError("Add the Supabase environment variables to enable accounts."); return; }
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{1,39}$/.test(normalized)) { setError("Use 2–40 letters, numbers, dots, dashes, or underscores."); return; }
    if (password.length < 8) { setError("Use at least 8 characters for your password."); return; }
    setLoading(true);
    // Supabase Auth needs an email-shaped identifier. This reserved domain is
    // internal only; people sign in with their username and never supply email.
    const email = `${normalized}@accounts.readreceipts.example.com`;
    try {
      const result = mode === "signup" ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === "signup" && result.data.user && result.data.session) {
        const { error: profileError } = await supabase.from("profiles").insert({ id: result.data.user.id, username: normalized });
        if (profileError && !profileError.message.toLowerCase().includes("duplicate")) throw profileError;
      }
      if (!result.data.session) { setError("This account needs email confirmation, which is unavailable for username-only accounts. Please contact the site owner."); return; }
      setUserId(result.data.user?.id ?? null); setPassword(""); setMessage(mode === "signup" ? "Your private shelf is ready." : "Welcome back.");
    } catch (caught) {
      const detail = caught instanceof Error ? caught.message : "";
      setError(/already registered|already exists|duplicate/i.test(detail)
        ? "That username is already taken. Please choose another."
        : /invalid login credentials/i.test(detail)
          ? "Incorrect username or password."
          : /email|@accounts\.readreceipts/i.test(detail)
            ? "We couldn't create this username right now. Please try another or contact the site owner."
            : detail || "We could not complete that request.");
    } finally { setLoading(false); }
  };

  const signOut = async () => { if (!supabase) return; await supabase.auth.signOut(); setUserId(null); setShelf([]); setMessage("Signed out."); };
  return createPortal(<div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="book-dialog account-dialog" role="dialog" aria-modal="true" aria-labelledby="account-title"><div className="book-dialog-header"><div><span className="book-dialog-kicker"><Bookmark size={15} aria-hidden="true" /> Private account</span><h2 id="account-title">My Shelf</h2><p>Your saved books stay tied to your account and never appear on public posts.</p></div><button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close My Shelf"><X size={20} aria-hidden="true" /></button></div>{!isSupabaseConfigured() ? <div className="account-setup"><UserRound size={25} aria-hidden="true" /><h3>Connect your private shelf</h3><p>Add the Supabase values from <code>.env.local</code> to enable username and password accounts.</p></div> : userId ? <div className="account-shelf"><div className="account-shelf-heading"><div><span className="book-dialog-kicker">Your saved books</span><h3>{shelf.length} {shelf.length === 1 ? "book" : "books"}</h3></div><button className="account-signout" type="button" onClick={signOut}><LogOut size={15} aria-hidden="true" /> Sign out</button></div>{shelf.length ? <div className="shelf-grid">{shelf.map((book) => <div className="shelf-item" key={book.id}><div className="shelf-item-art"><CoverArt book={book} sizes="70px" /></div><strong>{book.title}</strong><small>{book.author}</small></div>)}</div> : <div className="account-empty"><Bookmark size={24} aria-hidden="true" /><p>Your shelf is ready for its first book.</p></div>}</div> : <form className="account-form" onSubmit={submit}><div className="account-mode"><button className={mode === "login" ? "account-mode-active" : ""} type="button" onClick={() => { setMode("login"); setError(""); }}>Sign in</button><button className={mode === "signup" ? "account-mode-active" : ""} type="button" onClick={() => { setMode("signup"); setError(""); }}>Create account</button></div><label className="recommend-label" htmlFor="account-username"><span>Username</span><small>Private handle</small></label><input id="account-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="your-bookish-name" autoComplete="username" /><label className="recommend-label" htmlFor="account-password"><span>Password</span><small>8+ characters</small></label><input id="account-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"} />{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="account-message" role="status">{message}</p>}<button className="button button-primary account-submit" type="submit" disabled={loading}>{loading ? "Opening shelf…" : mode === "signup" ? "Create private shelf" : "Open My Shelf"}<ArrowRight size={17} aria-hidden="true" /></button></form>}</div></div>, document.body);
}
