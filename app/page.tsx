"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, ChevronDown } from "lucide-react";
import { AccountModal } from "@/components/account-modal";
import { CoverArt } from "@/components/cover-art";
import { HeroControls } from "@/components/hero-controls";
import type { NewDedication } from "@/components/dedication-modal";
import { PostCard } from "@/components/post-card";
import { PostDetailModal } from "@/components/post-detail-modal";
import type { NewPost } from "@/components/recommendation-modal";
import { collageBooks, sampleDedications, samplePosts, dedicationToFeedItem } from "@/lib/sample-data";
import type { Dedication, SamplePost } from "@/lib/sample-data";
import type { Book } from "@/lib/books";
import { createClient } from "@/lib/supabase/client";
import { fetchFeed, fetchNoteById } from "@/lib/public-feed";
import { fetchPurrCounts, givePurr, readPurred, samplePurrSeed } from "@/lib/interactions";

async function persistPost(
  kind: "recommendation" | "dedication",
  book: Book,
  values: {
    rating?: number;
    quote: string;
    note: string;
    recipientName?: string;
    relationship?: string;
    from: string;
    spoiler?: boolean;
  }
) {
  const supabase = createClient();
  if (!supabase) throw new Error("The book archive is unavailable right now.");
  const openLibraryKey = book.key ?? `title:${book.title.toLowerCase()}`;
  let { data: storedBook } = await supabase.from("books").select("id").eq("open_library_key", openLibraryKey).maybeSingle();
  if (!storedBook) {
    const payload: {
      open_library_key: string;
      title: string;
      author: string;
      cover_id: number | null;
      color: string;
      cover_url?: string;
      genre?: string;
    } = {
      open_library_key: openLibraryKey,
      title: book.title,
      author: book.author,
      cover_id: book.coverId ?? null,
      color: book.color,
    };
    if (book.coverUrl) payload.cover_url = book.coverUrl;
    if (book.genre) payload.genre = book.genre;
    let result = await supabase.from("books").insert(payload).select("id").single();
    if (result.error) {
      delete payload.genre;
      result = await supabase.from("books").insert(payload).select("id").single();
      if (result.error && book.coverUrl) {
        delete payload.cover_url;
        result = await supabase.from("books").insert(payload).select("id").single();
      }
    }
    if (result.error) throw result.error;
    storedBook = result.data;
  }
  const postPayload: Record<string, unknown> = {
    kind,
    book_id: storedBook.id,
    rating: values.rating ?? null,
    quote: values.quote,
    note: values.note,
    recipient_name: values.recipientName ?? null,
    sender_nickname: values.from,
    spoiler: values.spoiler ?? false,
  };
  if (values.relationship) postPayload.relationship = values.relationship;
  let { data, error } = await supabase.from("posts").insert(postPayload).select("id").single();
  if (error && values.relationship) {
    delete postPayload.relationship;
    const retryResult = await supabase.from("posts").insert(postPayload).select("id").single();
    data = retryResult.data;
    error = retryResult.error;
  }
  if (error || !data) throw error ?? new Error("Failed to save post");
  return data.id as string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<SamplePost[]>(() =>
    samplePosts.map((post, index) => ({ ...post, id: post.id ?? `sample-${index}`, kind: "recommendation" }))
  );
  const [dedications, setDedications] = useState<Dedication[]>(sampleDedications);
  const [feedMode, setFeedMode] = useState<"loading" | "sample" | "live" | "error">("loading");
  const [detailPost, setDetailPost] = useState<SamplePost | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [feedFilter, setFeedFilter] = useState<"all" | "recommendation" | "dedication">("recommendation");

  // Spoiler continuity across feed card and detail modal
  const [revealedMap, setRevealedMap] = useState<Record<string, boolean>>({});

  // Purr likes state
  const [purredMap, setPurredMap] = useState<Record<string, true>>(() => readPurred());
  const [purrCounts, setPurrCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) { setFeedMode("sample"); return; }
    let active = true;
    void fetchFeed(supabase).then(({ posts: livePosts, dedications: liveDedications }) => {
      if (!active) return;
      if (livePosts.length || liveDedications.length) {
        if (livePosts.length) setPosts(livePosts);
        if (liveDedications.length) {
          const mappedDed: Dedication[] = liveDedications.map((item) => ({
            id: item.id,
            recipient: item.recipient ?? "someone",
            relationship: item.relationship,
            book: item.book,
            quote: item.quote,
            message: item.note,
            from: item.from,
            spoiler: item.spoiler,
            createdAt: item.createdAt,
          }));
          setDedications(mappedDed);
        }
        setFeedMode("live");

        // Fetch live purrs for stored notes
        const allIds = [...livePosts.map((p) => p.id), ...liveDedications.map((d) => d.id)].filter(Boolean) as string[];
        fetchPurrCounts(supabase, allIds).then((remoteCounts) => {
          if (active && remoteCounts) {
            setPurrCounts((prev) => ({ ...prev, ...remoteCounts }));
          }
        });
      } else {
        setFeedMode("sample");
      }
    }).catch(() => { if (active) setFeedMode("error"); });
    return () => { active = false; };
  }, []);

  // Direct Note Deep-Linking: check on mount for ?note=[id]
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const noteId = params.get("note");
    if (!noteId) return;

    const allCurrent: SamplePost[] = [
      ...posts,
      ...dedications.map((d) => dedicationToFeedItem(d)),
    ];
    const match = allCurrent.find((item) => item.id === noteId);
    if (match) {
      setDetailPost(match);
      return;
    }

    const supabase = createClient();
    if (supabase) {
      fetchNoteById(supabase, noteId).then((fetched) => {
        if (fetched) setDetailPost(fetched);
      });
    }
  }, [posts, dedications]);

  // Deterministic 3-Day Top Pick Rotation from recommendations
  const orderedRecommendations = useMemo(() => {
    if (!posts.length) return [];
    // Rotate every 3 days deterministically based on epoch
    const topIndex = Math.floor(Date.now() / (3 * 86_400_000)) % posts.length;
    const top = posts[topIndex] ?? posts[0];
    const rest = posts.filter((p) => p.id !== top.id);
    return [top, ...rest];
  }, [posts]);

  const topPick = orderedRecommendations[0];

  const handlePost = async (post: NewPost) => {
    const id = await persistPost("recommendation", post.book, {
      rating: post.rating,
      quote: post.quote,
      note: post.note,
      from: post.from,
      spoiler: post.spoiler,
    });
    const nextPost: SamplePost = { ...post, id, kind: "recommendation", genre: post.book.genre, createdAt: new Date().toISOString() };
    setPosts((current) => (feedMode === "live" ? [nextPost, ...current] : [nextPost]));
    setFeedMode("live");
    return id;
  };

  const handleDedication = async (dedication: NewDedication) => {
    const id = await persistPost("dedication", dedication.book, {
      quote: dedication.quote,
      note: dedication.message,
      recipientName: dedication.recipient,
      relationship: dedication.relationship,
      from: dedication.from,
      spoiler: dedication.spoiler,
    });
    const nextDed: Dedication = { ...dedication, id, createdAt: new Date().toISOString() };
    setDedications((current) => [nextDed, ...current]);
    return id;
  };

  const handlePurr = (id: string) => {
    if (purredMap[id]) return;
    setPurredMap((prev) => ({ ...prev, [id]: true }));
    setPurrCounts((prev) => ({ ...prev, [id]: (prev[id] ?? samplePurrSeed(id)) + 1 }));
    void givePurr(id);
  };

  // Dedications converted to feed items
  const dedicationFeedItems = useMemo(
    () => dedications.map((d) => dedicationToFeedItem(d)),
    [dedications]
  );

  // Keep "All" chronological after the rotating top pick; the other views show one kind only.
  const displayedPosts = useMemo(() => {
    const candidates = feedFilter === "recommendation"
      ? orderedRecommendations.slice(1)
      : feedFilter === "dedication"
        ? dedicationFeedItems
        : [...orderedRecommendations.slice(1), ...dedicationFeedItems];

    return [...candidates].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
  }, [feedFilter, orderedRecommendations, dedicationFeedItems]);

  const showTopPick = feedFilter !== "dedication" && !!topPick;

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
                const book = collageBooks[(columnIndex * 7 + rowIndex * 11) % collageBooks.length];
                return (
                  <div
                    className="collage-cover"
                    key={`${columnIndex}-${rowIndex}`}
                    style={{
                      animationDelay: `${((columnIndex * 3 + rowIndex * 5) % 17) * -0.63}s`,
                      animationDuration: `${3 + ((columnIndex + rowIndex * 2) % 6)}s`,
                    }}
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
          <HeroControls
            onPost={handlePost}
            onDedication={handleDedication}
            dedications={dedications}
            onRequestAuth={() => setAccountOpen(true)}
          />
        </div>
        <a className="hero-scroll-prompt" href="#feed" aria-label="Scroll down to explore the latest pages">
          <span className="hero-scroll-chevron" aria-hidden="true"><ChevronDown size={17} strokeWidth={2.4} /></span>
          <span className="hero-scroll-text">Scroll to explore</span>
        </a>
      </section>

      <section className="feed-section" id="feed" aria-labelledby="feed-title">
        <div className="section-heading">
          <div>
            <h2 id="feed-title">The latest pages</h2>
            <p>Good books travel from one person to another.</p>
          </div>
          <div className="section-heading-meta">
            {feedMode === "live" && <span className="sample-badge">From our readers</span>}
            {feedMode === "error" && <span className="sample-badge">Archive unavailable</span>}
          </div>
        </div>

        <div className="feed-filter-bar" aria-label="Filter the newsfeed">
          <div className="feed-filter-tabs" role="group" aria-label="Newsfeed categories">
            {([
              ["all", "All", posts.length + dedications.length],
              ["recommendation", "Recommendation", posts.length],
              ["dedication", "Dedication", dedications.length],
            ] as const).map(([value, label, count]) => (
              <button
                className={`feed-filter-tab${feedFilter === value ? " feed-filter-tab-active" : ""}`}
                type="button"
                key={value}
                aria-pressed={feedFilter === value}
                onClick={() => setFeedFilter(value)}
              >
                {label} <span className="filter-count">{count}</span>
              </button>
            ))}
          </div>
          <div className="feed-filter-dropdown-wrapper">
            <label className="sr-only" htmlFor="feed-filter">Newsfeed category</label>
            <select
              id="feed-filter"
              className="feed-filter-dropdown"
              value={feedFilter}
              onChange={(event) => setFeedFilter(event.target.value as "all" | "recommendation" | "dedication")}
            >
              <option value="all">All ({posts.length + dedications.length})</option>
              <option value="recommendation">Recommendation ({posts.length})</option>
              <option value="dedication">Dedication ({dedications.length})</option>
            </select>
          </div>
        </div>

        <div className="feed-grid">
          {showTopPick && topPick && (
            <PostCard
              post={topPick}
              featured
              onOpen={() => setDetailPost(topPick)}
              onRequestAuth={() => setAccountOpen(true)}
              revealed={!!revealedMap[topPick.id ?? topPick.book.title]}
              onToggleReveal={() => {
                const key = topPick.id ?? topPick.book.title;
                setRevealedMap((prev) => ({ ...prev, [key]: !prev[key] }));
              }}
              purr={topPick.id ? {
                count: purrCounts[topPick.id] ?? samplePurrSeed(topPick.id),
                purred: !!purredMap[topPick.id],
                onPurr: () => handlePurr(topPick.id!),
              } : undefined}
            />
          )}

          {displayedPosts.map((post) => {
            const key = post.id ?? post.book.title;
            return (
              <PostCard
                post={post}
                key={key}
                onOpen={() => setDetailPost(post)}
                onRequestAuth={() => setAccountOpen(true)}
                revealed={!!revealedMap[key]}
                onToggleReveal={() => {
                  setRevealedMap((prev) => ({ ...prev, [key]: !prev[key] }));
                }}
                purr={post.id ? {
                  count: purrCounts[post.id] ?? samplePurrSeed(post.id),
                  purred: !!purredMap[post.id],
                  onPurr: () => handlePurr(post.id!),
                } : undefined}
              />
            );
          })}
        </div>
      </section>

      <PostDetailModal
        post={detailPost}
        onClose={() => setDetailPost(null)}
        revealed={detailPost ? !!revealedMap[detailPost.id ?? detailPost.book.title] : false}
        onToggleReveal={() => {
          if (!detailPost) return;
          const key = detailPost.id ?? detailPost.book.title;
          setRevealedMap((prev) => ({ ...prev, [key]: !prev[key] }));
        }}
        purr={detailPost?.id ? {
          count: purrCounts[detailPost.id] ?? samplePurrSeed(detailPost.id),
          purred: !!purredMap[detailPost.id],
          onPurr: () => handlePurr(detailPost.id!),
        } : undefined}
      />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      <footer className="site-footer">
        <span>read receipts</span>
        <span>Made for the books you can&apos;t keep to yourself.</span>
      </footer>
    </main>
  );
}
