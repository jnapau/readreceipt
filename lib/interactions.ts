"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/* Shared helpers                                                      */
/* ------------------------------------------------------------------ */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True when an id belongs to a note stored in Supabase (as opposed to sample data). */
export function isStoredNote(id: string | undefined): id is string {
  return !!id && UUID_PATTERN.test(id);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or disabled */ }
}

/** A random, anonymous per-browser id used only to de-duplicate purrs. */
export function getClientId() {
  const key = "rr:client-id";
  try {
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "ephemeral";
  }
}

/** Shareable deep link to a single note. */
export function noteUrl(id: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?note=${encodeURIComponent(id)}`;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers / insecure contexts: fall back to a hidden textarea.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/* ------------------------------------------------------------------ */
/* Purrs                                                               */
/* ------------------------------------------------------------------ */

const PURRED_KEY = "rr:purred";

export function readPurred(): Record<string, true> {
  return readJson<Record<string, true>>(PURRED_KEY, {});
}

function rememberPurr(id: string) {
  writeJson(PURRED_KEY, { ...readPurred(), [id]: true });
}

/** A small, stable starting tally so sample notes feel lived-in. */
export function samplePurrSeed(id: string) {
  let hash = 0;
  for (const character of id) hash = (hash * 33 + character.charCodeAt(0)) | 0;
  return 4 + (Math.abs(hash) % 21);
}

/**
 * Returns purr tallies for stored notes, or null when the archive (or the
 * purrs table) is unavailable so callers can fall back to local state.
 */
export async function fetchPurrCounts(client: SupabaseClient, ids: string[]): Promise<Record<string, number> | null> {
  const stored = ids.filter(isStoredNote);
  if (!stored.length) return {};
  const { data, error } = await client.from("purr_counts").select("post_id,purrs").in("post_id", stored);
  if (error) return null;
  const counts: Record<string, number> = {};
  for (const row of (data ?? []) as { post_id: string; purrs: number }[]) counts[row.post_id] = Number(row.purrs) || 0;
  return counts;
}

/** Records a purr. Always remembers it locally; persists to Supabase when possible. */
export async function givePurr(id: string) {
  rememberPurr(id);
  if (!isStoredNote(id)) return;
  const client = createClient();
  if (!client) return;
  const { error } = await client.from("purrs").insert({ post_id: id, client_id: getClientId() });
  // 23505 = already purred from this browser; anything else is a soft failure we tolerate.
  if (error && error.code !== "23505") console.warn("Purr could not be saved:", error.message);
}

/* ------------------------------------------------------------------ */
/* Marginalia (reader notes on recommendations)                        */
/* ------------------------------------------------------------------ */

export type Marginalia = {
  id: string;
  nickname: string;
  body: string;
  createdAt: string;
};

export const MARGINALIA_MAX = 280;
export const MARGINALIA_COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "rr:marginalia-last";
const localKey = (postId: string) => `rr:marginalia:${postId}`;

/** Collapses whitespace and strips control characters; returns "" for blank input. */
export function sanitizeNote(value: string, max: number) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

export function cooldownRemaining() {
  const last = readJson<number>(COOLDOWN_KEY, 0);
  return Math.max(0, last + MARGINALIA_COOLDOWN_MS - Date.now());
}

export async function fetchMarginalia(postId: string): Promise<Marginalia[]> {
  const local = readJson<Marginalia[]>(localKey(postId), []);
  const client = createClient();
  if (!client || !isStoredNote(postId)) return local;
  const { data, error } = await client.from("marginalia").select("id,nickname,body,created_at").eq("post_id", postId).order("created_at", { ascending: true }).limit(200);
  if (error) return local;
  const remote = ((data ?? []) as { id: string; nickname: string; body: string; created_at: string }[]).map((row) => ({ id: row.id, nickname: row.nickname, body: row.body, createdAt: row.created_at }));
  // Keep any notes that only exist locally (e.g. saved while the archive was offline).
  const pending = local.filter((note) => note.id.startsWith("local-"));
  return [...remote, ...pending].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addMarginalia(postId: string, nickname: string, body: string): Promise<Marginalia> {
  writeJson(COOLDOWN_KEY, Date.now());
  const client = createClient();
  if (client && isStoredNote(postId)) {
    const { data, error } = await client.from("marginalia").insert({ post_id: postId, nickname, body }).select("id,nickname,body,created_at").single();
    if (!error && data) return { id: data.id, nickname: data.nickname, body: data.body, createdAt: data.created_at };
  }
  const note: Marginalia = { id: `local-${Date.now()}`, nickname, body, createdAt: new Date().toISOString() };
  writeJson(localKey(postId), [...readJson<Marginalia[]>(localKey(postId), []), note]);
  return note;
}
