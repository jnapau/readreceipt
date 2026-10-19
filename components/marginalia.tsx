"use client";

import { useEffect, useId, useState } from "react";
import { PenLine } from "lucide-react";
import { addMarginalia, cooldownRemaining, fetchMarginalia, MARGINALIA_MAX, sanitizeNote, type Marginalia as Note } from "@/lib/interactions";

const dateFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

/** Reader notes penciled in the margins of a recommendation. */
export function Marginalia({ postId }: { postId: string }) {
  const fieldId = useId();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void fetchMarginalia(postId).then((items) => { if (active) { setNotes(items); setLoading(false); } });
    return () => { active = false; };
  }, [postId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (honeypot) { setBody(""); return; } // Bots fill hidden fields; quietly drop.
    const clean = sanitizeNote(body, MARGINALIA_MAX);
    if (!clean) { setError("Write a few words first."); return; }
    const wait = cooldownRemaining();
    if (wait > 0) { setError(`Give it a moment — you can add another note in ${Math.ceil(wait / 1000)}s.`); return; }
    setSending(true); setError("");
    try {
      const note = await addMarginalia(postId, sanitizeNote(nickname, 40) || "an anonymous reader", clean);
      setNotes((current) => [...current, note]);
      setBody("");
    } catch {
      setError("Your note couldn't be saved. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="marginalia" aria-labelledby={`${fieldId}-title`}>
      <div className="marginalia-heading">
        <span className="book-dialog-kicker"><PenLine size={14} aria-hidden="true" /> Marginalia</span>
        <h4 id={`${fieldId}-title`}>Reader notes</h4>
      </div>
      {loading ? <p className="marginalia-empty">Turning the pages…</p> : notes.length === 0 ? (
        <p className="marginalia-empty">No notes in the margins yet. Leave the first one.</p>
      ) : (
        <ol className="marginalia-list">
          {notes.map((note) => (
            <li key={note.id}>
              <p>{note.body}</p>
              <span>— {note.nickname}, {dateFormat.format(new Date(note.createdAt))}</span>
            </li>
          ))}
        </ol>
      )}
      <form className="marginalia-form" onSubmit={submit} noValidate>
        <div className="marginalia-honeypot" aria-hidden="true">
          <label htmlFor={`${fieldId}-website`}>Website</label>
          <input id={`${fieldId}-website`} tabIndex={-1} autoComplete="off" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
        </div>
        <label className="recommend-label" htmlFor={`${fieldId}-body`}><span>Add a note in the margin</span><small>{body.length}/{MARGINALIA_MAX}</small></label>
        <textarea id={`${fieldId}-body`} value={body} maxLength={MARGINALIA_MAX} rows={2} placeholder="A thought, a feeling, a line you underlined…" onChange={(event) => { setBody(event.target.value); setError(""); }} />
        <div className="marginalia-form-row">
          <input aria-label="Nickname (optional)" value={nickname} maxLength={40} placeholder="Nickname (optional)" onChange={(event) => setNickname(event.target.value)} />
          <button className="button button-primary" type="submit" disabled={sending}>{sending ? "Writing…" : "Pencil it in"}</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </section>
  );
}
