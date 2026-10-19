"use client";

import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { CatRating } from "@/components/cat-rating";
import { ShelfButton } from "@/components/shelf-button";
import type { SamplePost } from "@/lib/sample-data";
import { useState } from "react";

export function PostCard({ post, featured = false, onOpen, onRequestAuth }: { post: SamplePost; featured?: boolean; onOpen: () => void; onRequestAuth: () => void }) {
  const [revealed, setRevealed] = useState(!post.spoiler);
  const className = featured ? "top-pick" : "post-card";
  return (
    <article className={`${className}${post.spoiler ? " has-spoiler" : ""}`} tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpen(); } }}>
      {featured ? <div className="top-pick-art"><CoverArt book={post.book} sizes="(max-width: 600px) 38vw, 260px" /></div> : <div className="post-card-top"><div className="post-cover"><CoverArt book={post.book} sizes="90px" /></div><div><span className="post-type">Reader&apos;s note</span><h3>{post.book.title}</h3><p className="book-author">{post.book.author}</p><CatRating rating={post.rating} /></div></div>}
      <div className={featured ? "top-pick-copy" : "post-card-content"}>
        {featured && <span className="top-pick-label"><Sparkles size={15} aria-hidden="true" /> Top pick · refreshes every 3 days</span>}
        {featured && <div className="top-pick-main"><p className="post-type">A recommendation for the curious</p><h3>{post.book.title}</h3><p className="book-author">by {post.book.author}</p><CatRating rating={post.rating} /></div>}
        <div className={`spoiler-content${!revealed ? " spoiler-hidden" : ""}`}>
          {post.quote && <blockquote>“{post.quote}”</blockquote>}
          <p className={featured ? "post-note" : "post-card-note"}>{post.note}</p>
        </div>
        {post.spoiler && <button className="spoiler-reveal" type="button" onClick={(event) => { event.stopPropagation(); setRevealed((value) => !value); }}>{revealed ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />} {revealed ? "Hide spoiler" : "Click to reveal spoiler"}</button>}
        <div className="post-footer"><span>From {post.from}</span><span className="post-footer-actions"><ShelfButton book={post.book} onRequestAuth={onRequestAuth} /><span>Read the note <ArrowRight size={16} aria-hidden="true" /></span></span></div>
      </div>
    </article>
  );
}
