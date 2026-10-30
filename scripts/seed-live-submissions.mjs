import { createClient } from "@supabase/supabase-js";
import { BOOKS } from "./seed-books.mjs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrcizghnvjpawkzawej.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_PeuFFl5qLIgTWlubzIfxWQ_hwUJaT97";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DRY_RUN = process.argv.includes("--dry");
const COUNT = Number.parseInt(process.argv.find((a) => /^\d+$/.test(a)) || "1238", 10);

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const chance = (p) => Math.random() < p;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const weighted = (items, weights) => {
  let r = Math.random() * weights.reduce((x, y) => x + y, 0);
  for (let i = 0; i < items.length; i++) { if ((r -= weights[i]) <= 0) return items[i]; }
  return items[items.length - 1];
};

const NAMES = [
  "Julian", "Elena", "Clara", "Matteo", "Maya", "Theo", "Sophie", "Noah", "Camille", "Leo", "Aria", "Ethan",
  "Grace", "Sam", "Isla", "Oliver", "Hannah", "Gabriel", "Zoe", "Felix", "Maeve", "Lucas", "Sasha", "Nico",
  "Ren", "Beatrice", "Daniel", "Chloe", "Arthur", "Mina", "Rowan", "Miles", "Iris", "Jonah", "Tessa", "Eli",
  "Vera", "Liam", "Nora", "Caleb", "Freya", "Jude", "Migs", "Bea", "Pia", "Jao", "Kat", "Paolo", "Andrea",
  "Gab", "Janine", "Carlo", "Tricia", "Enzo", "Bianca", "Marco", "Ysa", "Luis", "Kim", "Ana", "Joaquin",
  "Rafa", "Althea", "Miggy", "Danielle", "Kiko", "Gelo", "Ines", "Rocco", "Kaye", "Anton", "Celine", "Dom"
];

const SENDERS = [
  "an anonymous reader", "an anonymous reader", "an anonymous reader", "an anonymous reader",
  "someone who stayed too long", "a fellow overthinker", "the girl from the morning train", "your roommate",
  "the one who borrowed your umbrella", "someone who still has your copy", "an insomniac", "you know who",
  "m.", "j", "k.", "a", "e.", "r.", "the one in the yellow raincoat", "your seatmate", "a quiet admirer",
  "the person who should have called", "your favorite disaster", "a friend who misses you", "me, obviously",
  "someone halfway across the country", "the night shift", "your ex-lab partner", "a former bookworm",
  "the girl with the tote bag", "bookstore regular", "someone learning how to stay", "your older sister",
  "the kid from 4B", "lowkey", "an old friend", "the one who lent you a pen", "anon", "anon", "a stranger",
  "someone on the 10pm commute", "a coffee shop regular", "the one who listened", "the boy in the grey hoodie",
  "an old classmate", "someone who kept the ticket stubs", "a tired grad student", "your favorite headache"
];

const MEMORIES = {
  lover: [
    "you fell asleep on my shoulder halfway through chapter two",
    "we read this out loud on the balcony our first summer in the apartment",
    "you left a sticky note on page one that just said 'good morning'",
    "you still make me tea without asking",
    "three years in and you still save me the last bite",
    "you read the first page out loud in the bookstore like a weirdo and I bought it anyway",
    "you hold my hand under the table at every family dinner",
    "you waited outside my office in the rain with an umbrella you didn't even need",
    "you know exactly how I take my coffee and you've never once gotten it wrong",
    "the smell of your shampoo is still stuck between the pages",
    "we stayed up till 4am debating the ending on the floor",
    "you kissed my forehead while I was crying over the last three chapters",
    "I bought this copy just so you could annotate the margins with your messy handwriting"
  ],
  situationship: [
    "we never figured out what we were",
    "you text me at 1am and then disappear for a week",
    "I still don't know what to call you",
    "this is easier than saying it to your face",
    "we said it was casual. it wasn't casual for me",
    "you left your hoodie at my place in march and I never gave it back",
    "we keep almost having the conversation",
    "I still wonder what we would have been if we hadn't been so cowardly",
    "you were my favorite almost",
    "I see books you'd love every week and pretend I don't care",
    "we acted like lovers until daylight came and then we were strangers again"
  ],
  ex: [
    "we don't talk anymore and that's probably right",
    "I found your bookmark still tucked inside",
    "you left this at my place when you moved out",
    "no hard feelings. just a book I think you'd like",
    "it's been two years and I still think of you when I see this cover",
    "I hope whoever reads to you now does the voices",
    "we were good for a while. I want to remember that part",
    "I finally finished the book you begged me to read three summers ago",
    "I hope you're happy now, genuinely",
    "we couldn't save us, but I still saved this note"
  ],
  friend: [
    "you made this year bearable",
    "thank you for the voice notes when I couldn't pick up the phone",
    "I keep thinking about all those nights in your car outside the 7-eleven",
    "you always know which book I need before I do",
    "congrats on the new job, you earned every bit of it",
    "you drove four hours to help me move and didn't complain once",
    "you've never once made me feel like too much",
    "you showed up with food the week everything fell apart",
    "thank you for letting me rot on your couch without questions",
    "for my favorite human to sit in comfortable silence with",
    "you're the person I text first whenever something good happens"
  ],
  bff: [
    "if you don't read this I'm leaking the group chat",
    "you've been my person since grade 4",
    "read it so we can scream about it on facetime",
    "I would take a bullet for you but I won't lend you my copy, so here's yours",
    "you're literally the main character and you know it",
    "remember when we got kicked out of the library for laughing",
    "no one gets our unhinged inside jokes like you do",
    "we share half a braincell and you have it today"
  ],
  crush: [
    "I see you reading by the window every tuesday",
    "you laughed at my bad joke in class and I've been thinking about it for a week",
    "I don't have the guts to say this to your face",
    "you recommended a song once and I've played it about three hundred times",
    "we've talked maybe four times and I think about all four",
    "I memorized what book you were carrying so I could read it too",
    "maybe one day I'll actually look up from my laptop when you walk past"
  ],
  family: [
    "you taught me to read before I started school",
    "I know you don't really read, but try this one",
    "you always kept a book in your bag for me",
    "I miss Sunday lunches at your house",
    "you're going off to college and I'm pretending I'm not sad about it",
    "proud of you always, kiddo",
    "thinking of you from miles away"
  ],
  general: [
    "I found this at a thrift store and thought of you immediately",
    "I've been meaning to give you this for months",
    "you came to mind on almost every page",
    "you said you needed something to read",
    "just felt like leaving this here for someone who needs it today",
    "left on the library return cart for whoever picks it up next"
  ],
};

const TIES = [
  "I thought of you during {bit}.",
  "you'll know why I picked this when you get to {bit}.",
  "{Bit} is basically us.",
  "call me after {bit}.",
  "I cried at {bit} and immediately wanted to tell you.",
  "{Bit} reminded me of you so much I had to stop reading for a minute.",
  "I won't spoil anything, just wait for {bit}.",
  "please tell me what you think of {bit}.",
  "pay attention to {bit}, that's where everything shifted for me.",
  "when you reach {bit}, promise you'll remember this note.",
  "I was literally gasping at {bit}.",
  "{Bit} made me want to call you immediately."
];

const SIGNOFFS = {
  lover: ["love you.", "always.", "x", "come home soon.", "", "", "yours,", "forever."],
  situationship: ["", "anyway.", "or whatever.", "", "text me. or don't.", "take care."],
  ex: ["take care.", "", "hope you're okay.", "be well.", "wishing you the best."],
  friend: ["", "thank you.", "miss you.", "lunch soon?", "love you, seriously.", "catch up soon!"],
  bff: ["love u", "", "ily", "ok bye", "you're welcome", "read it right now"],
  crush: ["", "...hi", "anyway, hi.", "maybe one day I'll say this out loud.", "stay wonderful."],
  family: ["love you.", "", "see you at christmas.", "call me when you finish.", "with love,"],
  general: ["", "enjoy.", "x", "happy reading."],
};

const OPENERS = [
  "Finished this on my lunch break and had to go back to work like nothing happened.",
  "Picked it up because of the cover, stayed for everything else.",
  "Took me two tries to get into it.",
  "Read it in one weekend with my phone in another room.",
  "My book club picked this and I was the only one who finished.",
  "Started it on the train and missed my stop.",
  "Borrowed it from my sister and I'm not giving it back.",
  "Third reread.",
  "Went in with low expectations.",
  "Bought it secondhand and the previous owner's margin notes made it even better.",
  "Read it during finals instead of studying. No regrets.",
  "Saw it everywhere online and finally caved.",
  "Read it on night shifts over two weeks.",
  "A friend shoved it into my hands and said 'just read it'.",
  "I almost DNF'd at page 40.",
  "Read it in the hospital waiting room.",
  "Finished it at 4am.",
  "First book I've finished this year.",
  "I'm a slow reader and still flew through it.",
  "Read it on the beach and got sunburnt because I couldn't stop.",
  "It's rare for a novel to make me sit in silence for an hour after finishing.",
  "Read this during the typhoon while the power was out.",
  "Picked this up on a whim at a train station bookstall.",
  "", "", "",
];

const BIT_LINES = {
  high: [
    "{Bit} is the part I keep thinking about.",
    "{Bit} alone is worth it.",
    "I wasn't ready for {bit}.",
    "Still thinking about {bit}.",
    "{Bit} made me put it down and stare at a wall.",
    "If you need one reason, {bit}.",
    "The way {bit} unfolds is pure perfection.",
    "I was genuinely tearing up during {bit}."
  ],
  low: [
    "{Bit} was the best part for me.",
    "I liked {bit}, but the rest dragged.",
    "I wanted more of {bit}.",
    "Parts like {bit} were brilliant, but the pacing felt uneven."
  ],
};

const VERDICTS = {
  5: ["Five cats.", "Easy five.", "Five cats, no notes.", "Already lending it out.", "An instant all-time favorite.", "", ""],
  4: ["Four cats.", "Four, only because the middle slowed down for me.", "Docking one cat for pacing, but it's worth it.", "Solid four.", ""],
  3: ["Three cats. Lovely in places, didn't fully land for me.", "Solid three. I get why people love it.", "Middle of the road for me.", "Good, just not life-changing."],
  2: ["Two cats. I wanted to love it.", "Two. Some good lines, but it dragged."],
  1: ["One cat. Not for me at all.", "Couldn't connect with it. One cat."],
};

const fill = (t, bit, name) =>
  t.replace("{Bit}", cap(bit)).replace("{bit}", bit).replace("{name}", name);

function composeDedication(book, rel, name) {
  const key = rel ?? "general";
  const mem = pick(MEMORIES[key]);
  const tie = fill(pick(TIES), pick(book.bits), name);
  const sign = pick(SIGNOFFS[key]);
  const greet = pick(["", "", `For ${name}.`, `${name},`, `to ${name} —`, `${name}:`]);
  
  const variant = Math.floor(Math.random() * 4);
  let parts;
  if (variant === 0) {
    parts = [greet, cap(mem) + ".", cap(tie), sign];
  } else if (variant === 1) {
    parts = [greet, cap(tie), cap(mem) + ".", sign];
  } else if (variant === 2) {
    parts = [greet, cap(mem) + ".", sign];
  } else {
    parts = [greet, cap(tie), sign];
  }

  let s = parts.filter(Boolean).join(" ").replace(/\.\./g, ".").replace(/\s+/g, " ").trim();
  if (chance(0.30)) s = s.toLowerCase();
  return s;
}

function composeRecommendation(book, rating) {
  const bitLine = fill(pick(rating >= 4 ? BIT_LINES.high : BIT_LINES.low), pick(book.bits), "");
  const opener = pick(OPENERS);
  const verdict = pick(VERDICTS[rating]);
  
  const variant = Math.floor(Math.random() * 4);
  let parts;
  if (variant === 0) {
    parts = [opener, bitLine, verdict];
  } else if (variant === 1) {
    parts = [bitLine, opener ? opener.toLowerCase() : "", verdict];
  } else if (variant === 2) {
    parts = [opener, bitLine];
  } else {
    parts = [bitLine, verdict];
  }

  let s = parts.filter(Boolean).join(" ").replace(/\.\./g, ".").replace(/\s+/g, " ").trim();
  if (chance(0.12)) s = s.toLowerCase();
  return s;
}

function randomTimestamp() {
  const start = Date.parse("2026-10-19T02:00:00Z");
  const end = Date.now() - 5 * 60 * 1000;
  // Weight heavily towards recent days
  const t = start + Math.pow(Math.random(), 0.75) * (end - start);
  const d = new Date(t);
  // Shift most posts into evening/night hours (Asia/Manila, UTC+8).
  const hourLocal = weighted([8, 12, 15, 18, 20, 21, 22, 23, 1], [1, 2, 2, 3, 4, 5, 4, 3, 2]);
  d.setUTCHours((hourLocal - 8 + 24) % 24, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d.getTime() > end ? new Date(end - Math.random() * 3600e3).toISOString() : d.toISOString();
}

async function main() {
  const { data: rows, error } = await supabase.from("books").select("id, title");
  if (error) throw error;
  const idByTitle = new Map();
  for (const r of rows) if (!idByTitle.has(r.title)) idByTitle.set(r.title, r.id);

  const titles = Object.keys(BOOKS).filter((t) => idByTitle.has(t));
  const missing = Object.keys(BOOKS).filter((t) => !idByTitle.has(t));
  if (missing.length) console.warn("Not in DB, skipped:", missing);
  const weights = titles.map((t) => BOOKS[t].quotes.length * 2 + BOOKS[t].bits.length);

  // Hand-written notes are used first; then composed notes
  const handRecs = titles.flatMap((t) => (BOOKS[t].recs || []).map((n) => ({ t, n })));
  const handDeds = titles.flatMap((t) => (BOOKS[t].deds || []).map((n) => ({ t, n })));

  const seen = new Set();
  const out = [];
  const push = (title, kind, note, extra) => {
    if (seen.has(note)) return false;
    seen.add(note);
    const book = BOOKS[title];
    out.push({
      kind,
      book_id: idByTitle.get(title),
      quote: pick(book.quotes),
      note,
      sender_nickname: pick(SENDERS),
      spoiler: chance(0.07),
      created_at: randomTimestamp(),
      ...extra,
    });
    return true;
  };

  const recRating = () => weighted([5, 4, 3, 2, 1], [48, 34, 12, 4, 2]);
  const relFor = () => weighted(["lover", "situationship", "ex", "friend", "bff", "crush", "family", null], [20, 15, 14, 20, 12, 9, 8, 2]);

  for (const { t, n } of handRecs) {
    const r = /two stars|2 cats|two cats/i.test(n) ? 2 : /three cats|a warm three/i.test(n) ? 3 : /little long|could've lost|bit obvious|a bit preachy/i.test(n) ? 4 : weighted([5, 4], [7, 3]);
    push(t, "recommendation", n, { rating: r, recipient_name: null, relationship: null });
  }
  for (const { t, n } of handDeds) {
    push(t, "dedication", n, { rating: null, recipient_name: pick(NAMES), relationship: relFor() });
  }

  let guard = 0;
  while (out.length < COUNT && guard++ < COUNT * 30) {
    const title = weighted(titles, weights);
    const book = BOOKS[title];
    if (chance(0.52)) {
      const rating = recRating();
      push(title, "recommendation", composeRecommendation(book, rating), { rating, recipient_name: null, relationship: null });
    } else {
      const rel = relFor();
      const name = pick(NAMES);
      push(title, "dedication", composeDedication(book, rel, name), { rating: null, recipient_name: name, relationship: rel });
    }
  }

  console.log(`Prepared ${out.length} posts across ${titles.length} books.`);
  if (DRY_RUN) {
    for (const p of out.sort(() => Math.random() - 0.5).slice(0, 15)) {
      const t = rows.find((r) => r.id === p.book_id).title;
      console.log(`\n[${p.kind}${p.rating ? " " + p.rating + "★" : " → " + p.recipient_name + " (" + p.relationship + ")"}] ${t}\n  "${p.quote}"\n  ${p.note}\n  — ${p.sender_nickname}`);
    }
    return;
  }

  let inserted = 0;
  for (let i = 0; i < out.length; i += 50) {
    const batch = out.slice(i, i + 50);
    let { error: e } = await supabase.from("posts").insert(batch);
    if (e) {
      await new Promise((r) => setTimeout(r, 800));
      ({ error: e } = await supabase.from("posts").insert(batch));
    }
    if (e) {
      console.error(`Batch ${i} failed:`, e.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`Successfully inserted ${inserted} posts into Supabase.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
