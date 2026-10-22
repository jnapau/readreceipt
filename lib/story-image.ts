"use client";

import { bookCoverSrc } from "@/lib/books";
import type { SamplePost } from "@/lib/sample-data";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

const NAVY = "#17172b";
const PANEL = "#22223d";
const GOLD = "#f2c14e";
const INK = "#f4f1ea";
const MUTED = "#b9b6c9";

const CAT_PATH = "M4.4 4.6c-.4-.7-.3-1.2.3-1.1l4.7 2.6a10.3 10.3 0 0 1 5.2 0l4.7-2.6c.6-.1.7.4.3 1.1l-1.1 5.2c1 1.4 1.5 3.1 1.5 4.9 0 4.3-3.4 7.1-8 7.1s-8-2.8-8-7.1c0-1.8.5-3.5 1.5-4.9L4.4 4.6Zm4.9 8.7a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm5.4 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm-4.1 3.5c.6.5 1 .7 1.4.7s.8-.2 1.4-.7l-1.4-1.1-1.4 1.1Z";

/** Resolves the next/font family stacks exposed as CSS variables on <body>. */
function fontStack(variable: string, fallback: string) {
  const value = getComputedStyle(document.body).getPropertyValue(variable).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    if (!src.startsWith("data:")) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
    window.setTimeout(() => resolve(null), 6000);
  });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) line = candidate;
    else { lines.push(line); line = word; }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  const consumed = lines.join(" ").split(/\s+/).length;
  if (consumed < words.length && lines.length) {
    let last = lines[lines.length - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.includes(" ")) last = last.slice(0, last.lastIndexOf(" "));
    lines[lines.length - 1] = `${last.replace(/[,.;:!?-]+$/, "")}…`;
  }
  return lines;
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) {
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function excerpt(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/**
 * Renders a 1080×1920 Instagram Story card for a note and returns it as a PNG blob.
 * Spoiler notes keep their text hidden on the card.
 */
export async function renderStoryImage(post: SamplePost): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const display = fontStack("--font-display", "Georgia, serif");
  const body = fontStack("--font-body", "system-ui, sans-serif");
  const script = fontStack("--font-script", "cursive");
  const dedication = post.kind === "dedication";

  const canvas = document.createElement("canvas");
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable in this browser.");

  // Background: midnight navy with a warm gold glow.
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);
  const glow = ctx.createRadialGradient(540, 620, 60, 540, 620, 900);
  glow.addColorStop(0, "rgba(242,193,78,0.16)");
  glow.addColorStop(0.55, "rgba(34,34,61,0.55)");
  glow.addColorStop(1, "rgba(23,23,43,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  // Thin gold frame.
  ctx.strokeStyle = "rgba(242,193,78,0.55)";
  ctx.lineWidth = 3;
  roundRect(ctx, 48, 48, STORY_WIDTH - 96, STORY_HEIGHT - 96, 36);
  ctx.stroke();

  // Branding.
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(540, 150, 38, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.font = `italic 600 36px ${display}`;
  ctx.fillText("rr.", 538, 162);
  ctx.fillStyle = INK;
  ctx.font = `600 42px ${display}`;
  ctx.fillText("Read Receipts", 540, 250);
  ctx.fillStyle = GOLD;
  ctx.font = `700 24px ${body}`;
  ctx.letterSpacing = "6px";
  const subhead = dedication
    ? (post.book.genre ? `A BOOK DEDICATION · ${post.book.genre.toUpperCase()}` : "A BOOK DEDICATION")
    : (post.book.genre ? `A BOOK RECOMMENDATION · ${post.book.genre.toUpperCase()}` : "A BOOK RECOMMENDATION");
  ctx.fillText(subhead, 540, 300);
  ctx.letterSpacing = "0px";

  // Cover.
  const coverW = 360, coverH = 540, coverX = (STORY_WIDTH - coverW) / 2, coverY = 350;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
  ctx.fillStyle = post.book.color || PANEL;
  ctx.fillRect(coverX, coverY, coverW, coverH);
  ctx.restore();
  const src = bookCoverSrc(post.book, "L");
  const image = src ? await loadImage(src) : null;
  if (image) {
    const scale = Math.max(coverW / image.width, coverH / image.height);
    const sw = coverW / scale, sh = coverH / scale;
    ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, coverX, coverY, coverW, coverH);
  } else {
    // Typographic spine fallback, matching CoverArt.
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.fillRect(coverX, coverY, 18, coverH);
    ctx.strokeStyle = "rgba(244,241,234,0.3)"; ctx.lineWidth = 2; ctx.strokeRect(coverX + 1, coverY + 1, coverW - 2, coverH - 2);
    ctx.fillStyle = "#fff9ed"; ctx.font = `500 46px ${display}`;
    const titleLines = wrapLines(ctx, post.book.title, coverW - 60, 5);
    const endY = drawLines(ctx, titleLines, 540, coverY + coverH / 2 - (titleLines.length - 1) * 27, 54);
    ctx.fillStyle = "#eee7d6"; ctx.font = `600 18px ${body}`; ctx.letterSpacing = "4px";
    ctx.fillText(post.book.author.toUpperCase(), 540, endY + 26, coverW - 50);
    ctx.letterSpacing = "0px";
  }

  // Title & author.
  let y = coverY + coverH + 100;
  ctx.fillStyle = INK;
  ctx.font = `500 62px ${display}`;
  y = drawLines(ctx, wrapLines(ctx, post.book.title, 880, 2), 540, y, 70);
  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${body}`;
  ctx.fillText(`by ${post.book.author}`, 540, y + 2, 880);
  y += 64;

  // Rating (cats) or dedication recipient.
  if (dedication) {
    ctx.fillStyle = GOLD;
    ctx.font = `400 84px ${script}`;
    const forText = post.relationship ? `For ${post.recipient ?? "you"} (${post.relationship})` : `For ${post.recipient ?? "you"}`;
    ctx.fillText(forText, 540, y + 50, 900);
    y += 110;
  } else {
    const cat = new Path2D(CAT_PATH);
    const size = 52, gap = 14, total = 5 * size + 4 * gap;
    for (let index = 0; index < 5; index++) {
      ctx.save();
      ctx.translate(540 - total / 2 + index * (size + gap), y - 18);
      ctx.scale(size / 24, size / 24);
      ctx.fillStyle = index < post.rating ? GOLD : "#4f4e6b";
      ctx.fill(cat);
      ctx.restore();
    }
    y += 80;
  }

  // Quote + note (hidden for spoilers).
  if (post.spoiler) {
    ctx.fillStyle = MUTED;
    ctx.font = `italic 400 36px ${display}`;
    ctx.fillText("Contains a spoiler — open the note to read.", 540, y + 40, 900);
    y += 90;
  } else {
    if (post.quote) {
      ctx.fillStyle = INK;
      ctx.font = `italic 400 42px ${display}`;
      y = drawLines(ctx, wrapLines(ctx, `“${post.quote}”`, 860, 3), 540, y + 34, 56);
      y += 14;
    }
    if (post.note) {
      ctx.fillStyle = MUTED;
      ctx.font = `400 30px ${body}`;
      y = drawLines(ctx, wrapLines(ctx, excerpt(post.note, 150), 840, 3), 540, y + 30, 44);
    }
  }

  // Attribution.
  ctx.fillStyle = GOLD;
  ctx.font = `700 26px ${body}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(`FROM ${post.from.toUpperCase()}`, 540, Math.min(y + 70, 1610), 880);
  ctx.letterSpacing = "0px";

  // Sticker callout: a dashed slot for Instagram's Link Sticker.
  const stickerY = 1660;
  ctx.save();
  ctx.translate(540, stickerY + 50);
  ctx.rotate(-0.025);
  ctx.setLineDash([14, 10]);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  roundRect(ctx, -300, -50, 600, 100, 50);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = INK;
  ctx.font = `700 30px ${body}`;
  ctx.fillText("🔗  Paste the link sticker here", 0, 11);
  ctx.restore();

  ctx.fillStyle = MUTED;
  ctx.font = `400 24px ${body}`;
  ctx.fillText("read the full note on Read Receipts", 540, 1820);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the story image."))), "image/png");
  });
}

export function storyFileName(post: SamplePost) {
  const slug = post.book.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "note";
  return `read-receipts-${slug}.png`;
}

export function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}
