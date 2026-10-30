"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BookHeart, BookOpen, Eye, EyeOff, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { CatRating } from "@/components/cat-rating";
import { Marginalia } from "@/components/marginalia";
import { PurrButton, type PurrState } from "@/components/purr-button";
import { isDedication, type SamplePost } from "@/lib/sample-data";

export function PostDetailModal({ post, onClose, revealed, onToggleReveal, purr }: {
  post: SamplePost | null;
  onClose: () => void;
  /** Spoiler reveal state, shared with the feed card so it never re-blurs. */
  revealed: boolean;
  onToggleReveal: () => void;
  /** Anonymous purr state for this shared page. */
  purr?: PurrState;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!post) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>(".book-dialog-close")?.focus(), 0);
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") { closeRef.current(); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), textarea, input:not([tabindex='-1'])"));
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", handleKeyDown); previousFocus?.focus(); };
  }, [post]);

  if (!post) return null;
  const dedication = isDedication(post);
  const hidden = !!post.spoiler && !revealed;

  return createPortal(
    <div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className={`detail-dialog${dedication ? " detail-dialog-dedication" : ""}`} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <div className="recommend-header">
          <div>
            <span className="book-dialog-kicker">{dedication ? <><BookHeart size={15} aria-hidden="true" /> A dedication</> : <><BookOpen size={15} aria-hidden="true" /> A reader&apos;s note</>}</span>
            <h2 id="detail-title">{dedication ? `A book for ${post.recipient ?? "someone"}` : "A book passed along"}</h2>
          </div>
          <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close note"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="detail-scroll">
          <div className="detail-body">
            <div className="detail-art"><CoverArt book={post.book} sizes="145px" /></div>
            <div>
              <p className="post-type">
                {post.book.author}
                {post.book.genre && <span className="post-genre-tag"> · {post.book.genre}</span>}
              </p>
              <h3>{post.book.title}</h3>
              {dedication ? (
                <p className="dedication-for">
                  For {post.recipient}
                  {post.relationship && <span className="dedication-relationship"> ({post.relationship})</span>}
                </p>
              ) : <CatRating rating={post.rating} />}
              <div className={hidden ? "detail-spoiler-hidden" : ""}>
                <blockquote>“{post.quote || "A story worth passing on."}”</blockquote>
                <p>{post.note}</p>
              </div>
              {post.spoiler && <button className="spoiler-reveal detail-spoiler-button" type="button" onClick={onToggleReveal}>{revealed ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />} {revealed ? "Hide spoiler" : "Click to reveal spoiler"}</button>}
              <div className="detail-from">From <strong>{post.from}</strong></div>
              {purr && (
                <div className="detail-actions">
                  <PurrButton {...purr} />
                </div>
              )}
            </div>
          </div>
          {post.id && <Marginalia postId={post.id} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}
