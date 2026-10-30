import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrcizghnvjpawkzawej.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_PeuFFl5qLIgTWlubzIfxWQ_hwUJaT97";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const RELATIONSHIPS = ["lover", "situationship", "ex", "friend", "bff", "crush", "family", null];
const RELATIONSHIP_WEIGHTS = [0.20, 0.18, 0.16, 0.18, 0.12, 0.08, 0.06, 0.02];

const RECIPIENTS = [
  "Julian", "Elena", "Clara", "Matteo", "Maya", "Theo", "Sophie", "Noah",
  "Camille", "Leo", "Aria", "Ethan", "Grace", "Sam", "Isla", "Oliver",
  "Hannah", "Gabriel", "Zoe", "Felix", "Maeve", "Lucas", "Sasha", "Nico",
  "Ren", "Beatrice", "Daniel", "Chloe", "Arthur", "Mina", "Rowan", "Miles",
  "Iris", "Jonah", "Tessa", "Eli", "Vera", "Liam", "Nora", "Caleb", "Silas",
  "Freya", "Tobias", "Lyra", "Jasper", "Willa", "Ezra", "Ingrid", "Jude"
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
  "J.", "K.", "A.", "E.", "S.", "R.", "L.",
  "the person who should have called",
  "someone learning how to stay",
  "a friend who misses you",
  "the girl in the corduroy coat",
  "someone who never forgot",
  "the reader with cold hands",
  "a night shift regular",
  "someone halfway across the country"
];

const BOOK_LORE = {
  "Babel: An Arcane History": {
    quotes: [
      "Translation is not a mirror; it is an act of betrayal.",
      "That is what language does: it covers the wound, but the blood still seeps through.",
      "We were boys who believed Oxford could love us back.",
      "Silver remembers the meaning lost between words."
    ],
    notes: [
      "R.F. Kuang wrote an absolute gut-punch of a book. The tragedy of Robin Swift broke something in me. Five cats, but keep tissues nearby.",
      "For my study partner in college: remember when we thought academia was going to save us? Page 320 felt like our senior year.",
      "The etymology footnotes alone are worth the price of admission. Lacerating, academic, and devastating."
    ]
  },
  "Yellowface": {
    quotes: [
      "Athena was the kind of person who sucked all the oxygen out of a room and made you thank her for it.",
      "The internet has a very short memory for nuance, and an infinite appetite for cruelty.",
      "Everyone is performing guilt; no one is actually sorry."
    ],
    notes: [
      "June Hayward is completely unhinged and awful, and I could not stop reading. A trainwreck in slow motion.",
      "A razor-sharp satire about publishing, white guilt, and the toxic cesspool of social media. Four cats.",
      "Read this in a single afternoon with my jaw permanently dropped. The secondhand embarrassment is off the charts."
    ]
  },
  "The Picture of Dorian Gray": {
    quotes: [
      "There is only one thing in the world worse than being talked about, and that is not being talked about.",
      "The books that the world calls immoral are books that show the world its own shame.",
      "I have grown too fond of this portrait. It has become a part of my own existence."
    ],
    notes: [
      "Oscar Wilde wrote sentences so decadent you feel like you need to rinse your mouth out with water. Flawless five cats.",
      "For the person who cared more about appearing virtuous than actually being kind. You know who you are.",
      "A tragedy of aesthetic vanity. Lord Henry's dialogue remains the most delightfully cynical in English literature."
    ]
  },
  "Frankenstein": {
    quotes: [
      "Beware; for I am fearless, and therefore powerful.",
      "I ought to be thy Adam, but I am rather the fallen angel.",
      "Life, although it may only be an accumulation of anguish, is dear to me, and I will defend it."
    ],
    notes: [
      "Mary Shelley was nineteen when she wrote this and managed to capture the core loneliness of existence better than anyone before or since.",
      "The Creature's chapters in the snow are pure poetry. Victor Frankenstein is the true monster and nobody can change my mind.",
      "Five cats for the cold winds, the Arctic ice, and the ache of wanting to be touched with tenderness."
    ]
  },
  "Invisible Cities": {
    quotes: [
      "You take delight not in a city's seven or seventy wonders, but in the answer it gives to a question of yours.",
      "Memory's images, once they are fixed in words, are erased.",
      "The inferno of the living is not something that will be; it is already here."
    ],
    notes: [
      "Calvino built a city out of thin air and silk threads. A book you don't read so much as dream inside of.",
      "For Marco: wherever your travels take you, I hope you find the city where they trade postcards for silences.",
      "Short, luminous, and infinite. Five cats for the architecture of imagination."
    ]
  },
  "Labyrinths": {
    quotes: [
      "The universe (which others call the Library) is composed of an indefinite and perhaps infinite number of hexagonal galleries.",
      "Time forks perpetually toward innumerable futures.",
      "A man sets out to draw the world... and at the moment of death finds that that patient labyrinth of lines traces the image of his own face."
    ],
    notes: [
      "Borges playing chess with infinity. Every story is a trapdoor that opens onto the cosmos.",
      "Pierre Menard remains the greatest literary joke ever conceived. Pure intellectual ecstasy.",
      "Read this whenever the world feels small. It expands the walls of your room into an infinite maze."
    ]
  },
  "We Have Always Lived in the Castle": {
    quotes: [
      "My name is Mary Katherine Blackwood. I am eighteen years old, and I live with my sister Constance.",
      "I have often thought that with any luck at all I could have been born a werewolf.",
      "We eat our meals in silence, and the villagers still whisper behind the fence."
    ],
    notes: [
      "Merricat Blackwood is the weirdest, most protective little sister in all of gothic fiction. Shirley Jackson at her peak.",
      "For my sister: we will barricade the doors and drink blackberry tea forever. Let them talk.",
      "Creepy, cozy, and deeply unsettling. Five cats for the poisoned sugar bowl."
    ]
  },
  "The Secret History": {
    quotes: [
      "Beauty is terror. Whatever we call beautiful, we quiver before it.",
      "Does such a thing as 'the fatal flaw,' that poetic dark hairline fracture, exist outside of literature?",
      "I suppose there is a certain cruel charm to snow falling on graves."
    ],
    notes: [
      "I read this in four days while ignoring every deadline in my life. It makes you want to wear wool coats and make terrible choices.",
      "For anyone who knows the specific poison of wanting to belong to people who are rotten at the core. Five cats.",
      "The winter section in Hampden is the most atmospheric fifty pages ever written. I could feel the frost."
    ]
  },
  "Normal People": {
    quotes: [
      "Life offers up these moments of joy despite everything.",
      "It's not like this with other people.",
      "No one can be independent of other people completely."
    ],
    notes: [
      "Connell and Marianne communicate worse than two malfunctioning fax machines and yet I sobbed on page 200.",
      "Read this if you want to remember what it was like to be twenty and utterly convinced that wanting someone was the same as possessing them.",
      "I left this on your nightstand the morning I left Dublin. Neither of us said what we meant."
    ]
  },
  "The Song of Achilles": {
    quotes: [
      "He was half of my soul, as the poets say.",
      "I could recognize him by touch alone, by smell; I would know him blind.",
      "In the darkness, two shadows, reaching through the hopeless, heavy dusk."
    ],
    notes: [
      "I finished this at 3:15 AM and stared at my ceiling until sunrise. Five cats, though my eyes still hurt.",
      "For the only person I would have followed across the sea, even knowing how the prophecy ends.",
      "Miller writes grief like an open wound that has refused to heal for three thousand years."
    ]
  },
  "Stoner": {
    quotes: [
      "He was forty-three years old, and he could see nothing before him that he wished to enjoy.",
      "In his forty-second year William Stoner learned that the person one loves at first is not the person one loves at last."
    ],
    notes: [
      "Nothing happens in this book and yet everything happens. A quiet, devastating masterpiece.",
      "Williams writes about ordinary failure with more dignity than most authors give to epic triumphs. Five cats.",
      "For my father, who worked forty years in the same building and never once complained about the dust."
    ]
  },
  "The Bell Jar": {
    quotes: [
      "I saw my life branching out before me like the green fig tree in the story.",
      "I took a deep breath and listened to the old brag of my heart: I am, I am, I am."
    ],
    notes: [
      "Plath’s prose is razor sharp. It doesn't ask for your pity; it lays out the suffocating glass bell with clinical honesty.",
      "The fig tree passage should be required reading for anyone in their twenties paralyzed by choice.",
      "Dark, funny, lacerating, and alive. Don't let the tragedy overshadow the sheer brilliance of the sentences."
    ]
  },
  "Tomorrow, and Tomorrow, and Tomorrow": {
    quotes: [
      "To allow yourself to play with another person is no small risk.",
      "What is a game? It’s the possibility of being someone else, of having another chance."
    ],
    notes: [
      "The best exploration of creative partnership and non-romantic soulmates since Kavalier & Clay. Five cats.",
      "For my best friend: we built so many imaginary worlds together when we were sixteen. I miss making things with you.",
      "Zevin understands that sometimes the deepest love of your life is the person you argue with about pixels at 4 AM."
    ]
  },
  "Bluets": {
    quotes: [
      "1. Suppose I were to begin by saying that I had fallen in love with a color.",
      "To love someone who has no more use for you is a peculiar form of haunting."
    ],
    notes: [
      "Maggie Nelson wrote the definitive text on heartbreak, acute longing, and the color blue. Glass shards you can't stop turning in your hand.",
      "I underlined almost every line until the margins were ink-stained. For the blue that stayed after you left.",
      "Short enough to read in one sitting, heavy enough to carry around for months."
    ]
  },
  "Crush": {
    quotes: [
      "You’re in a car with a beautiful boy, and he won’t tell you that he loves you, but he loves you.",
      "I take down the glass, I fill it with water, I say your name into the sink."
    ],
    notes: [
      "Richard Siken writes poetry that feels like a panic attack inside an emergency room. Bloody, breathless, and desperately in love.",
      "To the boy I never had the courage to kiss in the parking lot: this whole book is the letter I never sent.",
      "Every single poem in Crush hits like a slammed door. Five cats isn't enough."
    ]
  },
  "Before the Coffee Gets Cold": {
    quotes: [
      "The past never changes, but the heart of the person who returns to it can.",
      "Drink the coffee before it gets cold."
    ],
    notes: [
      "A quiet, tender little novel set in a Tokyo basement cafe. Made me want to call my sister and just listen to her breathe.",
      "For anyone who wishes they could go back to one five-minute conversation just to say 'thank you' one more time.",
      "Gentle, cozy, but deeply bittersweet underneath."
    ]
  },
  "Piranesi": {
    quotes: [
      "The Beauty of the House is immeasurable; its Kindness infinite.",
      "May your Paths be safe, your Floors unbroken and may the House fill your eyes with Wonder."
    ],
    notes: [
      "Reading Piranesi felt like washing my brain in clean, cold saltwater. His innocence is the greatest antidote to cynicism.",
      "Five cats for the tides, the albatross, the statues, and the pure gentleness of the narrator.",
      "I read this during deep burnout. It reminded me that wonder is still possible."
    ]
  }
};

const NOTE_TEMPLATES = {
  heartbreak: [
    "I read this on the train ride home after we agreed to stop trying. Page {page} felt like you standing right in front of me with your coat already on.",
    "You gave me this copy when we still lived on {street}. I finally finished it today. You were right about the ending, but wrong about us.",
    "For {recipient}: I kept your boarding pass tucked into chapter four for two years. Yesterday I finally took it out. I hope the coast treats you well.",
    "We spent three summers pretending this wasn't going to end the way it did. Now every line reads like an autopsy report.",
    "I wanted to hate this because you loved it so much. Instead, it became the only thing that made sense during the months you stopped answering.",
    "I saw your handwriting on the inside back cover from when we shared that studio on {street}. It took me twenty minutes to turn the page.",
    "You told me once that the hardest part of leaving is the silence that follows the front door closing. This book sounds exactly like that silence."
  ],
  intimacy: [
    "To {recipient}—for the nights when the radiator clanked and we took turns reading the dialogue out loud until our voices gave out.",
    "Every time {author} writes about hands, I think of the way you hold the steering wheel when you're tired. I'll love you even when we're old and forgetful.",
    "You once told me that some books feel like coming home after walking through a blizzard. This is that book for me, and so are you.",
    "For the only person who understands why I cry at {scene}. Keep this on your bedside table.",
    "I bought two copies so we could read the final chapter at the exact same minute across two different time zones.",
    "I dog-eared page {page} because the narrator described the exact expression you make right before you fall asleep.",
    "For {recipient}: whenever the city gets too loud, open this to chapter three. It's our bench in the park in book form."
  ],
  situationship: [
    "For {recipient}: leaving this here because texting you felt like stepping onto thin ice. Page {page} is essentially the conversation we keep avoiding.",
    "We never gave it a name, but you gave me this book, and that felt heavier than any title we could have agreed on.",
    "For someone who refuses to define anything: here is a story where nobody defines anything either, and look how that turned out.",
    "Some people exist only in the margins of your year, but they leave the deepest pencil marks. I hope you find what you're looking for.",
    "I don't know what we were doing from October to March, but this was the soundtrack to every late night drive back from your apartment.",
    "To {recipient}: you sent me an Instagram reel of this quote at 1 AM and then didn't text for four days. Anyway, five cats.",
    "We are the champions of saying everything except the one thing that matters. Read chapter seven when you have ten quiet minutes."
  ],
  bestFriend: [
    "To {recipient}: you are literally the main character in chapter {page} and if you deny it I am leaking our group chat. Five cats, read it immediately.",
    "We stayed on FaceTime for three hours screaming about the plot twist on page {page}. My jaw was physically on the carpet.",
    "Passing this to my favorite human alive. If you don't love this as much as I do, our friendship is on probation for 30 business days.",
    "You brought this to the diner at 1 AM and forced me to read the prologue over lukewarm fries. Best recommendation you've ever made.",
    "For my ride-or-die: life has been completely chaotic lately, but sitting on your floor trading paperbacks makes everything feel survivable.",
    "If anyone else tries to speak to you before you finish chapter ten, tell them you are legally indisposed.",
    "To {recipient}: I know you've had a rough couple of months. Here is 300 pages of pure escapism and zero emotional damage."
  ],
  candidReview: [
    "Look, the prose is absolute poetry, but every single character in this novel desperately needs therapy and a tall glass of water. 3 cats for the writing alone.",
    "I wanted to love this so badly because everyone on literary TikTok was losing their minds, but the third act completely betrayed the first 200 pages. 2 cats.",
    "Five cats without hesitation. A slow, quiet unraveling that doesn't rely on cheap twists to devastate you. Kept me awake until dawn.",
    "The middle section dragged a little near page {page}, but that final sentence knocked the wind out of me. Worth every single minute.",
    "One cat for the plot, five cats for the atmosphere. I felt damp and cold the entire time I was reading it.",
    "A four-cat read that would have been a five-cat read if the author had deleted the last forty pages and left us in the rain.",
    "I read the opening chapter in a bookstore and had to buy it immediately. Beautiful, cruel, and impossible to forget."
  ],
  comfortGrief: [
    "Read this during the week my grandfather was in hospice. It didn't make the fluorescent lights any softer, but it kept me anchored to the earth.",
    "A quiet, tender sanctuary of a book. When everything in the world feels loud and hostile, this was the only room I wanted to sit in.",
    "For anyone who feels like they are walking through their own life as a ghost lately: this will gently remind you that you are made of flesh and bone.",
    "I picked this up off a library cart on a rainy Tuesday when I couldn't stop crying in my car. It saved me in ways I don't know how to explain.",
    "Some books don't try to teach you a lesson. They just sit beside you in the dark and hold your coat. This is one of them."
  ]
};

const STREETS = ["Bedford Ave", "Franklin St", "Lincoln Park", "Telegraph Ave", "Queen Street", "St. Marks", "Division St", "Parkway", "Commonwealth Ave", "Bleecker St"];
const SCENES = ["the train station farewell", "the kitchen scene in chapter six", "the final letter", "the monologue in the rain", "the morning after the storm", "the attic conversation"];

const GENERAL_QUOTES = [
  "In the end, we are only the stories we had the courage to tell.",
  "There is no loneliness like the loneliness of two people who once shared everything.",
  "Some doors only open when you stop trying to knock them down.",
  "I was never afraid of the dark until I saw how much light you carried with you.",
  "We forgave each other in silence, which is just another way of saying goodbye.",
  "A quiet persistent hunger for a life that felt honest.",
  "You cannot measure the weight of an empty chair.",
  "Let the morning come without apologies.",
  "And yet, despite everything, the garden grew back.",
  "I kept your name under my tongue like a secret coin.",
  "Between what was said and what was felt, an entire continent drifted away.",
  "I have loved you in three different cities and two different versions of myself.",
  "We are made of all the conversations we were too proud to have.",
  "The light that enters through a cracked window is still sunlight.",
  "To remember someone is to keep building a house for them in your head."
];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomWeightedChoice(items, weights) {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r <= acc) return items[i];
  }
  return items[items.length - 1];
}

async function main() {
  const requestedCount = Number.parseInt(process.argv[2] || "1238", 10);
  const totalToInsert = Math.min(Math.max(requestedCount, 1), 5000);

  console.log(`Connecting to Supabase at ${SUPABASE_URL}...`);
  const { data: books, error: booksErr } = await supabase.from("books").select("id, title, author, genre");
  if (booksErr || !books || !books.length) {
    console.error("Failed to fetch books:", booksErr);
    process.exit(1);
  }
  console.log(`Found ${books.length} books in catalog.`);

  const { count: initialCount } = await supabase.from("posts").select("id", { count: "exact", head: true });
  console.log(`Current posts in database: ${initialCount}`);
  console.log(`Preparing exactly ${totalToInsert} unique, emotional submissions...`);

  const now = Date.now();
  const ninetyDaysMs = 90 * 86400 * 1000;
  const submissions = [];

  for (let i = 0; i < totalToInsert; i++) {
    const book = randomChoice(books);
    const isDedication = Math.random() < 0.48;
    const lore = BOOK_LORE[book.title];

    let quote = "";
    let note = "";
    let rating = null;
    let relationship = null;
    let recipient = null;
    const hasSpoiler = Math.random() < 0.11;

    const page = Math.floor(Math.random() * 280) + 24;
    const street = randomChoice(STREETS);
    const scene = randomChoice(SCENES);
    const sender = randomChoice(SENDERS);
    const targetRecipient = randomChoice(RECIPIENTS);

    if (lore && Math.random() < 0.45) {
      quote = randomChoice(lore.quotes);
      note = randomChoice(lore.notes);
    } else {
      const moodKeys = Object.keys(NOTE_TEMPLATES);
      const chosenMood = randomChoice(moodKeys);
      const template = randomChoice(NOTE_TEMPLATES[chosenMood]);
      note = template
        .replace("{recipient}", targetRecipient)
        .replace("{page}", page.toString())
        .replace("{street}", street)
        .replace("{scene}", scene)
        .replace("{author}", book.author);

      quote = randomChoice(GENERAL_QUOTES);
    }

    if (isDedication) {
      relationship = randomWeightedChoice(RELATIONSHIPS, RELATIONSHIP_WEIGHTS);
      recipient = targetRecipient;
      rating = null;
    } else {
      rating = randomWeightedChoice([5, 4, 3, 2, 1], [0.52, 0.32, 0.10, 0.04, 0.02]);
      relationship = null;
      recipient = null;
    }

    const ageFactor = Math.pow(Math.random(), 1.7);
    const createdAt = new Date(now - ageFactor * ninetyDaysMs).toISOString();

    submissions.push({
      kind: isDedication ? "dedication" : "recommendation",
      book_id: book.id,
      rating,
      quote,
      note,
      recipient_name: recipient,
      relationship,
      sender_nickname: sender,
      spoiler: hasSpoiler,
      created_at: createdAt
    });
  }

  console.log(`Generated ${submissions.length} posts. Inserting in safe batches of 50...`);

  const BATCH_SIZE = 50;
  let insertedCount = 0;

  for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
    const batch = submissions.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("posts").insert(batch);
    if (error) {
      console.error(`Error inserting batch at ${i}:`, error.message);
      await new Promise((r) => setTimeout(r, 600));
      const retry = await supabase.from("posts").insert(batch);
      if (retry.error) {
        console.error(`Retry failed at ${i}:`, retry.error.message);
      } else {
        insertedCount += batch.length;
      }
    } else {
      insertedCount += batch.length;
    }
    if ((i + BATCH_SIZE) % 250 === 0 || i + BATCH_SIZE >= submissions.length) {
      console.log(`Progress: ${insertedCount}/${submissions.length} inserted...`);
    }
  }

  console.log(`\nSuccessfully inserted ${insertedCount} submissions!`);
  const { count: finalCount } = await supabase.from("posts").select("id", { count: "exact", head: true });
  console.log(`Previous count: ${initialCount} -> New total posts in database: ${finalCount}`);
}

main().catch((err) => {
  console.error("Fatal script error:", err);
  process.exit(1);
});
