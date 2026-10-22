import fs from "fs";
import path from "path";

const GENRES = [
  "Classics",
  "Romance",
  "Literary Fiction",
  "Fantasy",
  "Sci-Fi",
  "Mystery & Thriller",
  "Poetry",
  "Memoir & Biography",
  "Philosophy",
];

const RELATIONSHIPS = [
  "lover",
  "situationship",
  "ex",
  "friend",
  "bff",
  "crush",
  "family",
  null,
];

const RELATIONSHIP_WEIGHTS = [0.22, 0.18, 0.15, 0.20, 0.10, 0.08, 0.05, 0.02];

const BOOKS = [
  ["Pride and Prejudice", "Jane Austen", "Classics"],
  ["The Great Gatsby", "F. Scott Fitzgerald", "Classics"],
  ["Jane Eyre", "Charlotte Brontë", "Classics"],
  ["The Secret History", "Donna Tartt", "Mystery & Thriller"],
  ["Little Women", "Louisa May Alcott", "Classics"],
  ["The Picture of Dorian Gray", "Oscar Wilde", "Classics"],
  ["The Hobbit", "J. R. R. Tolkien", "Fantasy"],
  ["Beloved", "Toni Morrison", "Literary Fiction"],
  ["The Bell Jar", "Sylvia Plath", "Classics"],
  ["Dune", "Frank Herbert", "Sci-Fi"],
  ["The Catcher in the Rye", "J. D. Salinger", "Classics"],
  ["The Book Thief", "Markus Zusak", "Literary Fiction"],
  ["Circe", "Madeline Miller", "Fantasy"],
  ["Normal People", "Sally Rooney", "Romance"],
  ["The Night Circus", "Erin Morgenstern", "Fantasy"],
  ["Frankenstein", "Mary Shelley", "Classics"],
  ["Wuthering Heights", "Emily Brontë", "Classics"],
  ["The Seven Husbands of Evelyn Hugo", "Taylor Jenkins Reid", "Romance"],
  ["A Little Life", "Hanya Yanagihara", "Literary Fiction"],
  ["The Song of Achilles", "Madeline Miller", "Romance"],
  ["Rebecca", "Daphne du Maurier", "Mystery & Thriller"],
  ["To Kill a Mockingbird", "Harper Lee", "Classics"],
  ["The Midnight Library", "Matt Haig", "Fantasy"],
  ["Giovanni's Room", "James Baldwin", "Classics"],
  ["Station Eleven", "Emily St. John Mandel", "Sci-Fi"],
  ["If on a winter's night a traveler", "Italo Calvino", "Literary Fiction"],
  ["Klara and the Sun", "Kazuo Ishiguro", "Sci-Fi"],
  ["Pachinko", "Min Jin Lee", "Literary Fiction"],
  ["Never Let Me Go", "Kazuo Ishiguro", "Sci-Fi"],
  ["Tomorrow, and Tomorrow, and Tomorrow", "Gabrielle Zevin", "Literary Fiction"],
  ["Piranesi", "Susanna Clarke", "Fantasy"],
  ["Norwegian Wood", "Haruki Murakami", "Romance"],
  ["East of Eden", "John Steinbeck", "Classics"],
];

const FIRST_NAMES = [
  "Maria", "James", "Bea", "Elena", "Lucas", "Maya", "Julian", "Clara",
  "Theo", "Sophie", "Noah", "Camille", "Leo", "Aria", "Mateo", "Chloe",
  "Ethan", "Grace", "Sam", "Isla", "Oliver", "Hannah", "Gabriel", "Zoe"
];

const SENDERS = [
  "a fellow overthinker", "an anonymous reader", "someone who knows",
  "a quiet admirer", "M.", "Jules", "someone who loves old houses",
  "a friend from the bookstore", "a stranger on the subway", "K.", "A."
];

const NOTE_SNIPPETS = {
  lover: [
    "Read this and thought of you on every single page.",
    "A story as quiet and deep as the way we talk late at night.",
    "You once told me you needed a book like this.",
    "For the person who turned every ordinary room into poetry.",
  ],
  situationship: [
    "I don't know what we are, but I know you belong with this book.",
    "Maybe we never figured it out, but I hope this gives you some peace.",
    "Some stories exist in the space between goodbye and staying.",
    "Leaving this here because asking you directly felt like too much.",
  ],
  ex: [
    "A reminder of a version of us that used to love without hesitation.",
    "I finally finished the book you left on my nightstand.",
    "No bitterness, just gratitude for the seasons we shared.",
    "For closure, or maybe just to say I hope you are doing well.",
  ],
  friend: [
    "For your next brave beginning. You're going to do great things.",
    "Because you made this past year bearable.",
    "Next time you need an escape, start here.",
    "Laughed out loud and wished you were sitting next to me.",
  ],
  bff: [
    "If you don't read this immediately I am revoking our friendship.",
    "This main character is literally you and you cannot deny it.",
    "Passing this to my favorite human on earth.",
    "Read it so we can dissect every chapter for three hours.",
  ],
  recommendation: [
    "Lush, bright, and impossible to put down.",
    "Come for the wit, stay for the quiet courage of changing your mind.",
    "A slow unraveling with a mood that follows you around afterward.",
    "A whole world in the palm of your hand.",
    "The atmosphere stayed with me long after the ending.",
    "I closed the book and needed a minute to breathe.",
  ],
};

function weightedChoice(items, weights) {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r <= acc) return items[i];
  }
  return items[items.length - 1];
}

function generateRecords(numRecords = 500) {
  const records = [];
  const now = Date.now();
  const ninetyDays = 90 * 86400 * 1000;

  for (let i = 1; i <= numRecords; i++) {
    const isRec = Math.random() < 0.65;
    const [title, author, genre] = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    const createdAt = new Date(now - Math.random() * ninetyDays).toISOString();

    let rating = null;
    let relationship = null;
    let recipient = null;
    let note = "";
    let purrs = 0;

    if (isRec) {
      rating = weightedChoice([5, 4, 3, 2, 1], [0.55, 0.30, 0.10, 0.03, 0.02]);
      const list = NOTE_SNIPPETS.recommendation;
      note = list[Math.floor(Math.random() * list.length)];
      purrs = Math.floor(Math.pow(Math.random(), -0.45) * 3);
    } else {
      relationship = weightedChoice(RELATIONSHIPS, RELATIONSHIP_WEIGHTS);
      recipient = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const list = NOTE_SNIPPETS[relationship] || NOTE_SNIPPETS.friend;
      note = list[Math.floor(Math.random() * list.length)];
    }

    records.push({
      post_id: `rec-${String(i).padStart(4, "0")}`,
      kind: isRec ? "recommendation" : "dedication",
      book_title: title,
      book_author: author,
      genre,
      rating,
      quote: `A line from ${title} that stays in your head.`,
      note,
      note_length: note.length,
      from_sender: SENDERS[Math.floor(Math.random() * SENDERS.length)],
      recipient,
      relationship,
      purrs,
      has_spoiler: Math.random() < 0.14,
      created_at: createdAt,
    });
  }

  return records;
}

const records = generateRecords(500);

const csvHeaders = Object.keys(records[0]);
const csvRows = records.map((r) =>
  csvHeaders
    .map((h) => {
      const val = r[h];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    })
    .join(",")
);
const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

fs.writeFileSync("read_receipts_synthetic_500.csv", csvContent, "utf8");
fs.writeFileSync("read_receipts_synthetic_500.json", JSON.stringify(records, null, 2), "utf8");

console.log(`Generated ${records.length} synthetic records successfully!`);
console.log("Saved read_receipts_synthetic_500.csv and read_receipts_synthetic_500.json");
