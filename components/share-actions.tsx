"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Link2, Loader2, Send, X } from "lucide-react";
import { showToast } from "@/components/toast";
import { copyText, noteUrl } from "@/lib/interactions";
import type { SamplePost } from "@/lib/sample-data";
import { isMobileDevice, renderStoryImage, storyFileName } from "@/lib/story-image";

const STICKER_TOAST = "Link copied! Paste it in Instagram's Link Sticker.";

/** The Instagram glyph (lucide no longer ships brand marks). */
export function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CopyLinkButton({ id, className = "" }: { id: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`note-action-button ${className}`}
      type="button"
      onClick={async (event) => {
        event.stopPropagation();
        const ok = await copyText(noteUrl(id));
        showToast(ok ? "Link copied to your clipboard." : "Couldn't copy — try again.");
        if (ok) { setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
      }}
    >
      <Link2 size={15} aria-hidden="true" /> {copied ? "Copied" : "Copy Link"}
    </button>
  );
}

export function ShareStoryButton({
  post,
  iconOnly = false,
  className = "",
}: {
  post: SamplePost;
  iconOnly?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareDirectly = async () => {
    setSharing(true);
    try {
      const blob = await renderStoryImage(post);
      const file = new File([blob], storyFileName(post), { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${post.book.title} — Read Receipts`,
          text: post.id ? noteUrl(post.id) : undefined,
        });
        return;
      }
      setOpen(true);
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") setOpen(true);
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <button
        className={iconOnly ? `instagram-share-icon-btn ${className}`.trim() : `instagram-share-button ${className}`.trim()}
        type="button"
        title="Share to Instagram Story"
        aria-label="Share to Instagram Story"
        disabled={sharing}
        onClick={(event) => {
          event.stopPropagation();
          void shareDirectly();
        }}
      >
        <InstagramIcon size={iconOnly ? 15 : 16} />
        {!iconOnly && (sharing ? " Preparing Story…" : " Instagram Story")}
      </button>
      {open && <StorySheet post={post} onClose={() => setOpen(false)} />}
    </>
  );
}

function StorySheet({ post, onClose }: { post: SamplePost; onClose: () => void }) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mobile] = useState(isMobileDevice);
  const closeRef = useRef(onClose);
  const dialogRef = useRef<HTMLDivElement>(null);
  closeRef.current = onClose;

  useEffect(() => {
    let active = true;
    let url: string | null = null;
    renderStoryImage(post)
      .then((image) => {
        if (!active) return;
        url = URL.createObjectURL(image);
        setBlob(image);
        setPreview(url);
      })
      .catch(() => { if (active) setError("We couldn't draw the story card in this browser."); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [post]);

  useEffect(() => {
    // Capture-phase listener so ESC closes only this sheet, not the note underneath.
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      closeRef.current();
    }
    window.addEventListener("keydown", handleKeyDown, true);
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>("button")?.focus(), 0);
    return () => { window.removeEventListener("keydown", handleKeyDown, true); previousFocus?.focus(); };
  }, []);

  const file = blob ? new File([blob], storyFileName(post), { type: "image/png" }) : null;
  const canShareFile = !!file && typeof navigator !== "undefined" && !!navigator.canShare?.({ files: [file] });

  const shareToStory = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], title: `${post.book.title} — Read Receipts` });
    } catch (shareError) {
      if ((shareError as DOMException)?.name !== "AbortError") download();
    }
  };

  const openInstagram = () => {
    if (post.id) void copyText(noteUrl(post.id)).then((ok) => { if (ok) showToast(STICKER_TOAST); });
    const fallback = window.setTimeout(() => {
      if (document.visibilityState === "visible") window.open("https://instagram.com", "_blank", "noopener");
    }, 1400);
    window.addEventListener("pagehide", () => window.clearTimeout(fallback), { once: true });
    window.location.href = "instagram-stories://share";
  };

  const download = () => {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    link.download = storyFileName(post);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast("Story image downloaded.");
  };

  return createPortal(
    <div className="book-dialog-backdrop story-backdrop" onMouseDown={(event) => { event.stopPropagation(); if (event.target === event.currentTarget) onClose(); }} onClick={(event) => event.stopPropagation()}>
      <div className="story-sheet" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="story-sheet-title">
        <div className="story-sheet-header">
          <div>
            <span className="book-dialog-kicker"><InstagramIcon size={14} /> Instagram Story</span>
            <h2 id="story-sheet-title">Share this page</h2>
            <p>We&apos;ve copied the note&apos;s link — add it with Instagram&apos;s Link Sticker.</p>
          </div>
          <button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close story sharing"><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="story-preview">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={`Story card for ${post.book.title}`} />
          ) : error ? <p className="form-error" role="alert">{error}</p> : <span className="story-loading"><Loader2 className="shelf-spin" size={22} aria-hidden="true" /> Drawing your story card…</span>}
        </div>
        <div className="story-actions">
          {mobile ? (
            <>
              <button className="instagram-share-button story-primary" type="button" disabled={!file} onClick={canShareFile ? shareToStory : download}>
                <Send size={16} aria-hidden="true" /> {canShareFile ? "Share to Story" : "Save Story Image"}
              </button>
              <button className="note-action-button" type="button" onClick={openInstagram}><InstagramIcon size={15} /> Open Instagram Story</button>
            </>
          ) : (
            <>
              <button className="instagram-share-button story-primary" type="button" disabled={!preview} onClick={download}><Download size={16} aria-hidden="true" /> Download Story Image</button>
              {canShareFile && <button className="note-action-button" type="button" onClick={shareToStory}><Send size={15} aria-hidden="true" /> Share…</button>}
            </>
          )}
          {post.id && <CopyLinkButton id={post.id} />}
        </div>
      </div>
    </div>,
    document.body,
  );
}
