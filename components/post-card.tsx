"use client";

import { BookHeart, Eye, EyeOff, Sparkles } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { CatRating } from "@/components/cat-rating";
import { PurrButton, type PurrState } from "@/components/purr-button";
import { ShareStoryButton } from "@/components/share-actions";
import { ShelfButton } from "@/components/shelf-button";
import { isDedication, type SamplePost } from "@/lib/sample-data";

export function PostCard({ post, featured = false, onOpen, onRequestAuth, revealed, onToggleReveal, purr }: {
  post: SamplePost;
  featured?: boolean;
  onOpen: () => void;
  onRequestAuth: () => void;
  /** Spoiler reveal state is owned by the page so it carries into the detail modal. */
  revealed: boolean;
  onToggleReveal: () => void;
  /** Anonymous purr state for this shared page. */
  purr?: PurrState;
}) {
  const dedication = isDedication(post);
  const isRevealed = !post.spoiler || revealed;
  const className = featured ? "top-pick" : `post-card${dedication ? " post-card-dedication" : ""}`;
  return (
    <article className={`${className}${post.spoiler ? " has-spoiler" : ""}`} tabIndex={0} onClick={onOpen} onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onOpen(); } }}>
      {featured ? <div className="top-pick-art"><CoverArt book={post.book} sizes="(max-width: 600px) 38vw, 260px" /></div> : (
        <div className="post-card-top">
          <div className="post-cover"><CoverArt book={post.book} sizes="90px" /></div>
          <div>
            <span className="post-type">
              {dedication ? <><BookHeart size={11} aria-hidden="true" /> Dedication</> : <>Reader&apos;s note</>}
              {post.book.genre && <span className="post-genre-tag"> · {post.book.genre}</span>}
            </span>
            <h3>{post.book.title}</h3>
            <p className="book-author">{post.book.author}</p>
            {dedication ? (
              <p className="dedication-for">
                For {post.recipient}
                {post.relationship && <span className="dedication-relationship"> ({post.relationship})</span>}
              </p>
            ) : <CatRating rating={post.rating} />}
          </div>
        </div>
      )}
      <div className={featured ? "top-pick-copy" : "post-card-content"}>
        {featured && <span className="top-pick-label"><Sparkles size={15} aria-hidden="true" /> Top pick · refreshes every 3 days</span>}
        {featured && (
          <div className="top-pick-main">
            <p className="post-type">
              A recommendation for the curious
              {post.book.genre && <span className="post-genre-tag"> · {post.book.genre}</span>}
            </p>
            <h3>{post.book.title}</h3>
            <p className="book-author">by {post.book.author}</p>
            <CatRating rating={post.rating} />
          </div>
        )}
        <div className={`spoiler-content${!isRevealed ? " spoiler-hidden" : ""}`}>
          {post.quote && <blockquote>“{post.quote}”</blockquote>}
          <p className={featured ? "post-note" : "post-card-note"}>{post.note}</p>
        </div>
        {post.spoiler && <button className="spoiler-reveal" type="button" onClick={(event) => { event.stopPropagation(); onToggleReveal(); }}>{isRevealed ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />} {isRevealed ? "Hide spoiler" : "Click to reveal spoiler"}</button>}
        <div className="post-footer">
          <span>From {post.from}</span>
          <span className="post-footer-actions">
            {purr && <PurrButton {...purr} compact />}
            <ShelfButton book={post.book} onRequestAuth={onRequestAuth} />
            <ShareStoryButton post={post} iconOnly />
          </span>
        </div>
      </div>
    </article>
  );
}
