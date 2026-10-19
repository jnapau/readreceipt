"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Eye, EyeOff, X } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { CatRating } from "@/components/cat-rating";
import type { SamplePost } from "@/lib/sample-data";

export function PostDetailModal({ post, onClose }: { post: SamplePost | null; onClose: () => void }) {
  const [revealed, setRevealed] = useState(!post?.spoiler);
  useEffect(() => setRevealed(!post?.spoiler), [post]);
  if (!post) return null;
  return createPortal(<div className="book-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title"><div className="recommend-header"><div><span className="book-dialog-kicker"><BookOpen size={15} aria-hidden="true" /> A reader&apos;s note</span><h2 id="detail-title">A book passed along</h2></div><button className="book-dialog-close" type="button" onClick={onClose} aria-label="Close note"><X size={20} aria-hidden="true" /></button></div><div className="detail-body"><div className="detail-art"><CoverArt book={post.book} sizes="145px" /></div><div><p className="post-type">{post.book.author}</p><h3>{post.book.title}</h3><CatRating rating={post.rating} /><div className={post.spoiler && !revealed ? "detail-spoiler-hidden" : ""}><blockquote>“{post.quote || "A story worth passing on."}”</blockquote><p>{post.note}</p></div>{post.spoiler && <button className="spoiler-reveal detail-spoiler-button" type="button" onClick={() => setRevealed((value) => !value)}>{revealed ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />} {revealed ? "Hide spoiler" : "Click to reveal spoiler"}</button>}<div className="detail-from">From <strong>{post.from}</strong></div></div></div></div></div>, document.body);
}
