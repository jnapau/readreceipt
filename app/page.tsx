"use client";

import { Bookmark } from "lucide-react";
import { AccountModal } from "@/components/account-modal";
import { CoverArt } from "@/components/cover-art";
import { HeroControls } from "@/components/hero-controls";
import type { NewDedication } from "@/components/dedication-modal";
import { PostCard } from "@/components/post-card";
import { PostDetailModal } from "@/components/post-detail-modal";
import type { NewPost } from "@/components/recommendation-modal";
import { useEffect, useState } from "react";
import { collageBooks, samplePosts } from "@/lib/sample-data";
import type { Dedication, SamplePost } from "@/lib/sample-data";
import type { Book } from "@/lib/books";
import { createClient } from "@/lib/supabase/client";
import { fetchFeed } from "@/lib/public-feed";

async function persistPost(kind: "recommendation" | "dedication", book: Book, values: { rating?: number; quote: string; note: string; recipientName?: string; from: string; spoiler?: boolean }) {
  const supabase = createClient();
  if (!supabase) throw new Error("The book archive is unavailable right now.");
  const openLibraryKey = book.key ?? `title:${book.title.toLowerCase()}`;
  let { data: storedBook } = await supabase.from("books").select("id").eq("open_library_key", openLibraryKey).maybeSingle();
  if (!storedBook) {
    const result = await supabase.from("books").insert({ open_library_key: openLibraryKey, title: book.title, author: book.author, cover_id: book.coverId ?? null, color: book.color }).select("id").single();
    if (result.error) throw result.error;
    storedBook = result.data;
  }
  const { data, error } = await supabase.from("posts").insert({ kind, book_id: storedBook.id, rating: values.rating ?? null, quote: values.quote, note: values.note, recipient_name: values.recipientName ?? null, sender_nickname: values.from, spoiler: values.spoiler ?? false }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<SamplePost[]>(() => samplePosts.map((post, index) => ({ ...post, id: post.id ?? `sample-${index}` })));
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [topPickId, setTopPickId] = useState<string | null>("sample-0");
  const [feedMode, setFeedMode] = useState<"loading" | "sample" | "live" | "error">("loading");
  const [detailPost, setDetailPost] = useState<SamplePost | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const topPick = posts.find((post) => post.id === topPickId) ?? posts[0];

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setFeedMode("sample"); return; }
    let active = true;
    void fetchFeed(supabase).then(({ posts: livePosts, topPickId: liveTopPickId }) => {
      if (!active) return;
      if (livePosts.length) { setPosts(livePosts); setTopPickId(liveTopPickId); setFeedMode("live"); }
      else setFeedMode("sample");
    }).catch(() => { if (active) setFeedMode("error"); });
    return () => { active = false; };
  }, []);

  if (!topPick) return null;

  const handlePost = async (post: NewPost) => {
    const id = await persistPost("recommendation", post.book, { rating: post.rating, quote: post.quote, note: post.note, from: post.from, spoiler: post.spoiler });
    const nextPost: SamplePost = { ...post, id };
    setPosts((current) => feedMode === "live" ? [nextPost, ...current] : [nextPost]);
    if (feedMode !== "live") setTopPickId(id);
    setFeedMode("live");
  };

  const handleDedication = async (dedication: NewDedication) => {
    const id = await persistPost("dedication", dedication.book, { quote: dedication.quote, note: dedication.message, recipientName: dedication.recipient, from: dedication.from, spoiler: dedication.spoiler });
    setDedications((current) => [{ ...dedication, id }, ...current]);
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="read receipts home">
          <span className="brand-mark" aria-hidden="true">rr.</span>
          <span>read receipts</span>
        </a>
        <button className="shelf-link" type="button" onClick={() => setAccountOpen(true)}>
          <Bookmark size={18} strokeWidth={1.7} aria-hidden="true" />
          <span>My Shelf</span>
        </button>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="collage" aria-hidden="true">
          {Array.from({ length: 12 }, (_, columnIndex) => (
            <div className={`collage-column collage-column-${columnIndex + 1}`} key={columnIndex}>
              {Array.from({ length: 5 }, (_, rowIndex) => {
                const book = collageBooks[(columnIndex * 5 + rowIndex * 7) % collageBooks.length];
                return (
                  <div
                    className="collage-cover"
                    key={`${columnIndex}-${rowIndex}`}
                    style={{ animationDelay: `${((columnIndex * 3 + rowIndex * 5) % 17) * -0.63}s`, animationDuration: `${3 + ((columnIndex + rowIndex * 2) % 6)}s` }}
                  >
                    <CoverArt book={book} sizes="(max-width: 600px) 20vw, 9vw" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="hero-wash" />
        <div className="hero-content">
          <p className="hero-overline">A little something between the lines</p>
          <h1 id="hero-title">this one&apos;s for you</h1>
          <HeroControls onPost={handlePost} onDedication={handleDedication} dedications={dedications} onRequestAuth={() => setAccountOpen(true)} />
        </div>
        <div className="hero-bottom-line" aria-hidden="true" />
      </section>

      <section className="feed-section" aria-labelledby="feed-title">
        <div className="section-heading">
          <div>
            <h2 id="feed-title">The latest pages</h2>
            <p>Good books travel from one person to another.</p>
          </div>
          {feedMode === "live" && <span className="sample-badge">From our readers</span>}
          {feedMode === "error" && <span className="sample-badge">Archive unavailable</span>}
        </div>

        <div className="feed-grid">
          <PostCard post={topPick} featured onOpen={() => setDetailPost(topPick)} onRequestAuth={() => setAccountOpen(true)} />

          {posts.filter((post) => post.id !== topPick.id).map((post) => <PostCard post={post} key={post.id ?? post.book.title} onOpen={() => setDetailPost(post)} onRequestAuth={() => setAccountOpen(true)} />)}
        </div>
      </section>
      <PostDetailModal post={detailPost} onClose={() => setDetailPost(null)} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      <footer className="site-footer"><span>read receipts</span><span>Made for the books you can&apos;t keep to yourself.</span></footer>
    </main>
  );
}
