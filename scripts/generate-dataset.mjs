import fs from "fs";

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
  ["Stoner", "John Williams", "Classics"],
  ["Bluets", "Maggie Nelson", "Poetry"],
  ["Crush", "Richard Siken", "Poetry"],
  ["Kitchen", "Banana Yoshimoto", "Literary Fiction"],
  ["Crying in H Mart", "Michelle Zauner", "Memoir & Biography"],
  ["Drive Your Plow Over the Bones of the Dead", "Olga Tokarczuk", "Literary Fiction"],
  ["No Longer Human", "Osamu Dazai", "Classics"],
  ["Convenience Store Woman", "Sayaka Murata", "Literary Fiction"],
  ["My Year of Rest and Relaxation", "Ottessa Moshfegh", "Literary Fiction"],
  ["The Summer Book", "Tove Jansson", "Classics"],
];

const FIRST_NAMES = [
  "Julian", "Elena", "Clara", "Matteo", "Maya", "Theo", "Sophie", "Noah",
  "Camille", "Leo", "Aria", "Ethan", "Grace", "Sam", "Isla", "Oliver",
  "Hannah", "Gabriel", "Zoe", "Felix", "Maeve", "Lucas", "Sasha", "Nico",
  "Ren", "Beatrice", "Daniel", "Chloe", "Arthur", "Mina", "Rowan", "Miles",
  "Iris", "Jonah", "Tessa", "Eli", "Vera", "Liam", "Nora", "Caleb"
];

const SENDERS = [
  "an anonymous reader",
  "someone who stayed too long",
  "a fellow overthinker",
  "the girl from the morning train",
  "the boy by the window",
  "M. in 4B",
  "someone who owes you an apology",
  "your favorite disaster",
  "a quiet admirer",
  "someone who still has your copy",
  "an insomniac",
  "the one who kept the receipts",
  "someone who remembers the summer",
  "a stranger on the subway",
  "J.", "K.", "A.", "E.", "S.",
  "the person who should have called",
  "someone learning how to stay",
  "a friend who misses you"
];

const STREETS = ["Bedford Ave", "Franklin St", "Lincoln Park", "Telegraph Ave", "Queen Street", "St. Marks", "Division St", "Parkway"];
const SCENES = ["the train station farewell", "the kitchen scene in chapter six", "the final letter", "the monologue in the rain", "the morning after the storm"];

const BOOK_QUOTES = {
  "The Secret History": [
    "Beauty is terror. Whatever we call beautiful, we quiver before it.",
    "Does such a thing as 'the fatal flaw,' that poetic dark hairline fracture, exist outside of literature?",
    "I suppose there is a certain cruel charm to snow falling on graves."
  ],
  "Normal People": [
    "Life offers up these moments of joy despite everything.",
    "It's not like this with other people.",
    "No one can be independent of other people completely, so why not agree to begin by being dependent on each other?"
  ],
  "The Song of Achilles": [
    "He was half of my soul, as the poets say.",
    "I could recognize him by touch alone, by smell; I would know him blind.",
    "In the darkness, two shadows, reaching through the hopeless, heavy dusk."
  ],
  "Stoner": [
    "He was forty-three years old, and he could see nothing before him that he wished to enjoy.",
    "In his forty-second year William Stoner learned that the person one loves at first is not the person one loves at last."
  ],
  "The Bell Jar": [
    "I saw my life branching out before me like the green fig tree in the story.",
    "I took a deep breath and listened to the old brag of my heart: I am, I am, I am."
  ],
  "Tomorrow, and Tomorrow, and Tomorrow": [
    "To allow yourself to play with another person is no small risk.",
    "What is a game? It’s the possibility of being someone else, of having another chance."
  ],
  "Bluets": [
    "1. Suppose I were to begin by saying that I had fallen in love with a color.",
    "To love someone who has no more use for you is a peculiar form of haunting."
  ],
  "Crush": [
    "You’re in a car with a beautiful boy, and he won’t tell you that he loves you, but he loves you.",
    "I take down the glass, I fill it with water, I say your name into the sink."
  ],
  "Piranesi": [
    "The Beauty of the House is immeasurable; its Kindness infinite.",
    "May your Paths be safe, your Floors unbroken and may the House fill your eyes with Wonder."
  ]
};

const EMOTIONAL_VOICES = {
  lover: [
    "Read this and thought of you on every single page.",
    "A story as quiet and deep as the way we talk late at night.",
    "Every time {author} writes about hands, I think of how you hold the steering wheel when you're tired.",
    "To {recipient}: for the nights when the radiator clanked and we took turns reading dialogue until our voices gave out.",
    "I bought two copies so we could read the final chapter at the exact same minute across two different time zones.",
    "You once told me that some books feel like coming home after walking through a blizzard. This is that book for me, and so are you."
  ],
  situationship: [
    "For {recipient}: leaving this here because texting you directly felt like stepping onto thin ice.",
    "We never gave it an official title, but you gave me this book, and that felt heavier than any label.",
    "For someone who refuses to define anything: here is a book where nobody defines anything either, and look how that turned out.",
    "Some people exist only in the margins of your year, but they leave the deepest pencil marks.",
    "I don't know what we were doing from October to March, but this was the soundtrack to every late night drive back from your apartment."
  ],
  ex: [
    "A reminder of a version of us that used to love without hesitation.",
    "I read this on the train ride home after we agreed to stop trying. Page {page} felt like you standing right in front of me with your coat on.",
    "You gave me this copy when we still lived on {street}. I finally finished it today. You were right about the ending, but wrong about us.",
    "For {recipient}: I kept your boarding pass tucked into chapter four for two years. Yesterday I threw it away. I hope the coast treats you well.",
    "No bitterness, just gratitude for the seasons we shared."
  ],
  friend: [
    "For your next brave beginning. You're going to do extraordinary things.",
    "Because you made this past winter bearable. Keep this on your nightstand.",
    "Read this when my grandfather was in hospice. It didn't make the fluorescent lights any softer, but it kept me anchored to the earth.",
    "For anyone who feels like they are walking through their own life as a ghost lately: this will gently remind you that you are made of flesh and bone.",
    "I picked this up off a library cart on a rainy Tuesday when I couldn't stop crying in my car. It saved me in ways I don't know how to explain."
  ],
  bff: [
    "To {recipient}: you are literally the main character in chapter {page} and if you deny it I am leaking our group chat.",
    "We stayed on FaceTime for two hours screaming about the plot twist on page {page}. My jaw was physically on the carpet.",
    "Passing this to my favorite human alive. If you don't love this as much as I do, our friendship is on probation for 30 business days.",
    "You brought this to the diner at 1 AM and forced me to read the prologue over lukewarm fries. Best recommendation you've ever made.",
    "If you don't read this immediately I am revoking your privileges."
  ],
  crush: [
    "To the person who sits across from me in the quiet car: you read this with a pencil in your hand, and that made me love you a little.",
    "I bought this because I saw you reading it by the fountain. Now I understand why you looked so far away.",
    "Leaving this here because asking for your number felt too terrifying. I hope you find this note."
  ],
  family: [
    "For my grandmother: I still hear your voice when the wind picks up off the water.",
    "For Mom: I know we argue about everything, but I promise I will learn how to make your stew.",
    "For my sister: thank you for making soup when I couldn't get out of bed."
  ],
  recommendation: [
    "Look, the prose is absolute poetry, but every single character in this novel desperately needs therapy and a glass of water. 3 cats for the writing alone.",
    "I read this in four days while ignoring every deadline in my life. It makes you want to wear wool coats, drink black coffee, and make terrible moral compromises.",
    "This book felt like being hit by a slow-moving truck that reverses over you just to make sure. Five cats.",
    "I finished this at 3:15 AM and stared at my ceiling until the sun came up. The tenderness in the first half makes the conclusion feel like physical punishment.",
    "A quiet, devastating masterpiece about a modest life that broke my heart in the most dignified way possible.",
    "Nothing happens in this book and yet everything happens. Keep a quiet afternoon for it.",
    "Plath's prose is razor sharp. It doesn't ask for your pity; it just lays out the suffocating glass bell with clinical, terrifying honesty.",
    "Reading this felt like washing my brain in clean, cold saltwater. His innocence is the greatest antidote to cynicism I've ever found.",
    "The middle section dragged slightly near page {page}, but that final sentence knocked the wind out of me. Worth every single minute.",
    "Hilarious, deadpan, and deeply subversive. Defends the right to be weird, functional, and content in a society obsessed with milestones.",
    "I wanted to sleep for a year and wake up renewed, entirely purged of the past. Four cats for the sharp teeth in the prose."
  ]
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
    const isRec = Math.random() < 0.55;
    const [title, author, genre] = BOOKS[Math.floor(Math.random() * BOOKS.length)];
    const createdAt = new Date(now - Math.pow(Math.random(), 1.5) * ninetyDays).toISOString();

    let rating = null;
    let relationship = null;
    let recipient = null;
    let rawNote = "";
    let quote = "";
    let purrs = 0;

    const page = Math.floor(Math.random() * 260) + 30;
    const street = STREETS[Math.floor(Math.random() * STREETS.length)];
    const targetRecipient = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];

    if (BOOK_QUOTES[title] && Math.random() < 0.5) {
      quote = BOOK_QUOTES[title][Math.floor(Math.random() * BOOK_QUOTES[title].length)];
    } else {
      const generalQuotes = [
        `In the end, we are only the stories we had the courage to tell.`,
        `There is no loneliness like the loneliness of two people who once shared everything.`,
        `Some doors only open when you stop trying to knock them down.`,
        `I was never afraid of the dark until I saw how much light you carried with you.`,
        `We forgave each other in silence, which is just another way of saying goodbye.`,
        `A quiet persistent hunger for a life that felt honest.`,
        `Let the morning come without apologies.`,
        `And yet, despite everything, the garden grew back.`
      ];
      quote = generalQuotes[Math.floor(Math.random() * generalQuotes.length)];
    }

    if (isRec) {
      rating = weightedChoice([5, 4, 3, 2, 1], [0.55, 0.30, 0.10, 0.03, 0.02]);
      const list = EMOTIONAL_VOICES.recommendation;
      rawNote = list[Math.floor(Math.random() * list.length)];
      purrs = Math.floor(Math.pow(Math.random(), -0.45) * 3);
    } else {
      relationship = weightedChoice(RELATIONSHIPS, RELATIONSHIP_WEIGHTS);
      recipient = targetRecipient;
      const list = EMOTIONAL_VOICES[relationship] || EMOTIONAL_VOICES.friend;
      rawNote = list[Math.floor(Math.random() * list.length)];
    }

    const note = rawNote
      .replace("{recipient}", targetRecipient)
      .replace("{page}", page.toString())
      .replace("{street}", street)
      .replace("{author}", author);

    records.push({
      post_id: `rec-${String(i).padStart(4, "0")}`,
      kind: isRec ? "recommendation" : "dedication",
      book_title: title,
      book_author: author,
      genre,
      rating,
      quote,
      note,
      note_length: note.length,
      from_sender: SENDERS[Math.floor(Math.random() * SENDERS.length)],
      recipient,
      relationship,
      purrs,
      has_spoiler: Math.random() < 0.12,
      created_at: createdAt,
    });
  }

  return records;
}

const requestedCount = Number.parseInt(process.argv[2] || "500", 10);
const recordCount = Number.isFinite(requestedCount) && requestedCount > 0
  ? Math.min(requestedCount, 100_000)
  : 500;
const records = generateRecords(recordCount);

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

const outputBase = `read_receipts_synthetic_${recordCount}`;
fs.writeFileSync(`${outputBase}.csv`, csvContent, "utf8");
fs.writeFileSync(`${outputBase}.json`, JSON.stringify(records, null, 2), "utf8");

console.log(`Generated ${records.length} synthetic records successfully!`);
console.log(`Saved ${outputBase}.csv and ${outputBase}.json`);
