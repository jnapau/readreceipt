import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pmrcizghnvjpawkzawej.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_PeuFFl5qLIgTWlubzIfxWQ_hwUJaT97";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Voice archetypes and emotional patterns
const RELATIONSHIPS = ["lover", "situationship", "ex", "friend", "bff", "crush", "family", null];
const RELATIONSHIP_WEIGHTS = [0.20, 0.18, 0.16, 0.18, 0.12, 0.08, 0.06, 0.02];

const RECIPIENTS = [
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

// Rich, specific quotes and emotional reflections per major book
const BOOK_LORE = {
  "The Secret History": {
    quotes: [
      "Beauty is terror. Whatever we call beautiful, we quiver before it.",
      "Does such a thing as 'the fatal flaw,' that poetic dark hairline fracture, exist outside of literature?",
      "I suppose there is a certain cruel charm to snow falling on graves.",
      "I loved them so much that I wanted to die with them, or at least let them ruin me."
    ],
    notes: [
      "I read this in four days while ignoring every deadline in my life. It makes you want to wear wool coats, drink black coffee at 2 AM, and make terrible moral compromises with people you barely know.",
      "For anyone who knows the specific, intoxicating poison of wanting to belong to a circle of people who are completely rotten at the core. Five cats, obviously.",
      "Richard Papen is one of the most pathetic, captivating narrators in modern literature. He would have watched Rome burn just to stand near Francis Abernathy.",
      "You recommended this to me the first week of college. Looking back, you were warning me about yourself, weren't you?",
      "The winter section in Hampden is the most atmospheric fifty pages ever written in the English language. I could feel the frost on the window panes."
    ]
  },
  "Normal People": {
    quotes: [
      "Life offers up these moments of joy despite everything.",
      "It's not like this with other people.",
      "No one can be independent of other people completely, so why not agree to begin by being dependent on each other?",
      "He brought her goodness like a gift and she received it."
    ],
    notes: [
      "This book felt like being hit by a slow-moving truck that reverses over you just to make sure. Connell and Marianne communicate worse than two malfunctioning fax machines and yet I sobbed on page 200.",
      "Read this if you want to remember what it was like to be twenty and utterly convinced that wanting someone desperately was the same thing as possessing them.",
      "I left this on your nightstand the morning I left Dublin. Neither of us said what we actually meant. We never do.",
      "Four cats because Rooney refuses to use quotation marks and yet captures the cadence of intimacy better than anyone writing today.",
      "It’s not a love story. It’s a book about how the people who love us have the power to reshape the physical architecture of our self-worth."
    ]
  },
  "The Song of Achilles": {
    quotes: [
      "He was half of my soul, as the poets say.",
      "I could recognize him by touch alone, by smell; I would know him blind, by the way his breaths came and his feet struck the earth.",
      "In the darkness, two shadows, reaching through the hopeless, heavy dusk.",
      "Tears came, and fell. Above us, the constellations wheeled and murmured."
    ],
    notes: [
      "I finished this at 3:15 AM and stared at my ceiling until the sun came up. The tenderness in the first half makes the inevitable conclusion feel like physical punishment.",
      "For the only person I would have followed across the sea, even knowing how the prophecy ends.",
      "Miller writes grief like an open wound that has refused to heal for three thousand years. Five cats, though my eyes still hurt.",
      "You asked me once what it felt like to love someone completely. Read the peach scene on page 84.",
      "A book that ruins you for ordinary sentences. The final three words are still ringing in my ears."
    ]
  },
  "Stoner": {
    quotes: [
      "He was forty-three years old, and he could see nothing before him that he wished to enjoy and little behind him that he cared to remember.",
      "A quiet, persistent sorrow that had no name.",
      "In his forty-second year William Stoner learned what others much younger had learned before him: that the person one loves at first is not the person one loves at last.",
      "He had dreamed of a kind of integrity, of a kind of purity that was whole."
    ],
    notes: [
      "Nothing happens in this book and yet everything happens. A quiet, devastating masterpiece about a man who lived a modest life, loved books, endured a cruel marriage, and died without making a sound. It broke my heart in the most dignified way possible.",
      "Williams writes about ordinary failure with more grace than most authors give to epic triumphs. Five cats. Keep a quiet afternoon for it.",
      "I think about William Stoner sitting in his study in Columbia, Missouri every time I feel like my own life is slipping away unnoticed.",
      "For my father, who worked forty years in the same building and never once complained about the dust."
    ]
  },
  "The Bell Jar": {
    quotes: [
      "I saw my life branching out before me like the green fig tree in the story.",
      "I took a deep breath and listened to the old brag of my heart: I am, I am, I am.",
      "To the person in the bell jar, blank and stopped as a dead baby, the world itself is the bad dream.",
      "If being neurotic is wanting two mutually exclusive things at one and the same time, then I'm neurotic as hell."
    ],
    notes: [
      "Plath’s prose is razor sharp. It doesn't ask for your pity; it just lays out the suffocating glass bell with clinical, terrifying honesty.",
      "The fig tree passage should be required reading for anyone in their twenties paralyzed by the sheer terror of choosing who to become.",
      "Read this during the worst winter of my life. It didn't fix the cold, but it gave a voice to the numbness.",
      "Dark, funny, lacerating, and alive. Don't let the tragedy of her life overshadow the absolute genius of her sentences."
    ]
  },
  "Tomorrow, and Tomorrow, and Tomorrow": {
    quotes: [
      "To allow yourself to play with another person is no small risk. It means allowing yourself to be open, to be exposed, to be hurt.",
      "There is a time for any relationship when it is at its most potent.",
      "What is a game? It’s the possibility of being someone else, of having another chance.",
      "Memory, you wrote, is a game that can never be won."
    ],
    notes: [
      "The best exploration of creative partnership and non-romantic soulmates since Michael Chabon's Kavalier & Clay. Marx Watanabe deserved the entire world.",
      "For my best friend: we built so many imaginary worlds together when we were sixteen. I miss working on things with you.",
      "Zevin understands that sometimes the deepest love of your life is the person you argue with about pixels at four in the morning.",
      "Five cats. The chapter inside the simulated town broke something in me that hasn't quite healed."
    ]
  },
  "Bluets": {
    quotes: [
      "1. Suppose I were to begin by saying that I had fallen in love with a color.",
      "I have been trying to place myself close to things that are not my grief.",
      "To love someone who has no more use for you is a peculiar form of haunting.",
      "We cannot write about the blue of the sky without admitting that it is an illusion caused by scattering."
    ],
    notes: [
      "Maggie Nelson wrote the definitive text on heartbreak, acute longing, and the color blue. 240 propositions that feel like glass shards you can't stop turning in your hand.",
      "I underlined almost every line in this book until the margins were completely ink-stained. For the blue that stayed after you left.",
      "Short enough to read in one sitting, heavy enough to carry around for months. A true companion for grief."
    ]
  },
  "Crush": {
    quotes: [
      "Tell me about the dream where we pull the bodies out of the lake and wipe the mud from their eyes.",
      "You’re in a car with a beautiful boy, and he won’t tell you that he loves you, but he loves you.",
      "I take down the glass, I fill it with water, I say your name into the sink.",
      "We are all going forward, into the dark, and we cannot keep our hands off each other."
    ],
    notes: [
      "Richard Siken writes poetry that feels like a panic attack inside an emergency room. Visceral, bloody, breathless, and desperately in love.",
      "To the boy I never had the courage to kiss in the parking lot: this whole book is the letter I never sent.",
      "Every single poem in Crush hits like a slammed door. Five cats isn't enough."
    ]
  },
  "Before the Coffee Gets Cold": {
    quotes: [
      "The past never changes, but the heart of the person who returns to it can.",
      "Even if the present does not change, how you live through it will.",
      "Drink the coffee before it gets cold.",
      "Water flows from higher places to lower places. That is the nature of gravity, and of sorrow."
    ],
    notes: [
      "A quiet, tender little novel set in a Tokyo basement cafe with rules for traveling back in time. It made me want to call my sister and just listen to her breathe.",
      "Gentle, cozy, but deeply sad underneath. The rule that you cannot change the present is what makes every conversation so poignant.",
      "For anyone who wishes they could go back to one five-minute conversation just to say 'thank you' one more time."
    ]
  },
  "Piranesi": {
    quotes: [
      "The Beauty of the House is immeasurable; its Kindness infinite.",
      "May your Paths be safe, your Floors unbroken and may the House fill your eyes with Wonder.",
      "The tides came in, and I was safe in the vestibule.",
      "I am the Beloved Child of the House."
    ],
    notes: [
      "Reading Piranesi felt like washing my brain in clean, cold saltwater. His innocence and reverence for the House are the greatest antidote to cynicism I've ever found.",
      "Five cats for the tides, the albatross, the statues, and the pure, radiant gentleness of the narrator. Susanna Clarke is a sorceress.",
      "I read this during a period of intense burnout. It reminded me that wonder is still possible in a broken world."
    ]
  },
  "Giovanni's Room": {
    quotes: [
      "You want to be clean. But you will never be clean again.",
      "Perhaps home is not a place but simply an irrevocable condition.",
      "I wanted to be with him, but I was terrified of what the morning light would reveal.",
      "Love him and let him love you. Do you think anything else under heaven really matters?"
    ],
    notes: [
      "Baldwin wrote a tragedy of cowardice so agonizing it physically hurts to read. David choosing safety and respectability over Giovanni is the darkest horror story.",
      "For anyone who ever denied who they were because the world told them their love was dirty. A masterpiece without a single wasted word.",
      "The room itself becomes a character—suffocating, cluttered, stained with longing and shame. Baldwin's sentences are unmatched."
    ]
  },
  "Kitchen": {
    quotes: [
      "The place I like best in this world is the kitchen.",
      "When you're completely exhausted, the sound of the refrigerator humming is the most comforting thing on earth.",
      "Someday we'll all die. But until then, we have to eat warm food and take care of each other.",
      "The sky was that strange, tender indigo that only happens right before dawn."
    ],
    notes: [
      "Banana Yoshimoto writes about grief and food with such delicate, soothing warmth. Reading Kitchen feels like someone wrapping a hot wool blanket around your shoulders.",
      "For my roommate during the year everything fell apart: thank you for making soup when I couldn't get out of bed.",
      "A short, luminous book about survival, found family, and the holy ritual of cooking for people you love."
    ]
  },
  "Station Eleven": {
    quotes: [
      "Because survival is insufficient.",
      "What was lost in the collapse: almost everything, almost everyone, but there is still such beauty.",
      "First we only want to be seen, but once we're seen, that's not enough anymore. After that, we want to be remembered.",
      "I have walked across an empty continent, and yet there are still paperweights and symphony orchestras."
    ],
    notes: [
      "Not your typical post-apocalyptic grimdark. Mandel wrote a love letter to human civilization—to Shakespeare, to warm running water, to airplanes, to the fragile magic of live music.",
      "Five cats. The Traveling Symphony reminds you why art matters even when the world is ending.",
      "For the musicians in the rehearsal hall on cold Tuesday evenings: survival is insufficient."
    ]
  },
  "Drive Your Plow Over the Bones of the Dead": {
    quotes: [
      "Anger always leaves behind a large amount of space, into which sorrow immediately pours.",
      "The human psyche evolved in order to protect us from seeing the truth.",
      "We look at the world through a crack in the door and pretend we see the entire garden.",
      "Astrology is just the ancient art of admitting that everything is connected by invisible threads."
    ],
    notes: [
      "A darkly comedic, feminist, ecological murder mystery narrated by an eccentric elderly Polish woman who translates William Blake and loves animals more than people. Extraordinary.",
      "Mrs. Duszejko is my spirit animal. Olga Tokarczuk's Nobel Prize was so richly deserved.",
      "If you hate smug hunters and love snowy forests, herbal tea, and righteous vengeance, this is your holy text."
    ]
  },
  "No Longer Human": {
    quotes: [
      "Mine has been a life of much shame. I can't even guess myself what it must be to live the life of a human being.",
      "As long as I can make them laugh, it doesn't matter how, I'll be alright.",
      "The weak fear happiness itself. They can get hurt just on cotton wool.",
      "Everything passes. That is the only thing that I have learned in this world."
    ],
    notes: [
      "Terrifying in how accurately Dazai captures the feeling of performing humanness like a circus clown while feeling like an alien inside.",
      "Read this with caution if you struggle with depression. It doesn't offer hope, but it offers the terrifying comfort of not being alone in your alienation.",
      "Three cats because it's bleak beyond measure, but an essential historical artifact of post-war existential crisis."
    ]
  },
  "A Little Life": {
    quotes: [
      "You won't understand until you have a child of your own what it means to want to protect someone from the world.",
      "Things get broken, and sometimes they can't be fixed.",
      "He had loved him so much that he had forgotten to keep a part of himself safe.",
      "You are my favorite person, and you always will be."
    ],
    notes: [
      "I cannot in good conscience recommend this without a massive trigger warning for literally everything. It is torture porn dressed in high literary drag, and yet Jude St. Francis will stay in my head forever.",
      "Giving it 4 cats because Yanagihara's prose regarding friendship is breathtaking, even as the plot descends into relentless misery.",
      "For the friend who sat with me on the floor while I cried through the final eighty pages."
    ]
  },
  "Convenience Store Woman": {
    quotes: [
      "A convenience store is not just a place where customers go to buy practical necessities. It is a place where customers go to find normalcy.",
      "I had never once thought about whether I was happy or unhappy until people started asking me.",
      "The manual told me how to speak, how to smile, how to bow. For the first time, I knew how to exist.",
      "The world demands that you be cured, even when there is nothing wrong with you."
    ],
    notes: [
      "Hilarious, deadpan, and deeply subversive. Murata defends the right to be weird, functional, and content in a society obsessed with romantic and career milestones.",
      "For anyone who feels like everyone else got an instruction manual for being an adult that you somehow missed.",
      "Short, punchy, and utterly original. Five cats for Keiko Furukura."
    ]
  },
  "My Year of Rest and Relaxation": {
    quotes: [
      "I wanted to sleep for a year and wake up renewed, entirely purged of the past.",
      "Reva was like a pebble in my shoe that I couldn't be bothered to remove.",
      "There was a terrible beauty in not feeling anything at all.",
      "Pain is not the only touchstone for growth, but it's the only one people believe in."
    ],
    notes: [
      "The narrator is completely awful, selfish, rich, and heavily sedated, and I found every single page darkly entertaining.",
      "Moshfegh writes female detachment and depression with such sharp teeth. Four cats for the art gallery scenes alone.",
      "Leaving this for my roommate in Brooklyn: remember when we both thought staying in bed for 72 hours was self-care?"
    ]
  },
  "Crying in H Mart": {
    quotes: [
      "Food was how my mother expressed her love, and how she forgave me.",
      "Am I still Korean if there’s no one left to call and ask which brand of seaweed to buy?",
      "I realized that to lose your mother is to lose your first and most ferocious audience.",
      "Every dish was an attempt to summon her back into the kitchen."
    ],
    notes: [
      "I cried in the grocery store aisle three days after finishing this. Michelle Zauner writes about grief through the taste of fermented kimchi and charred pork belly with so much tenderness.",
      "For Mom: I know we argue about everything, but I promise I will learn how to make your stew.",
      "Five cats. The chapter about her mother's skin in Seoul will dismantle you completely."
    ]
  },
  "The Summer Book": {
    quotes: [
      "An island can be dreadful for someone who wants to escape it, but for someone who wants to stay, it is paradise.",
      "You can't depend on people who just say what they think without thinking first.",
      "The sea does what it wants. It doesn't care about your little boat.",
      "They lived together in the small cottage and respected each other's silences."
    ],
    notes: [
      "Tove Jansson's quiet masterpiece about a six-year-old girl and her grandmother on a tiny Finnish island. It tastes like salt spray and moss.",
      "No sentimentality, no false lessons—just the fierce honesty of an old woman and a young child facing the Baltic Sea together.",
      "For my grandmother: I still hear your voice when the wind picks up off the water."
    ]
  }
};

// Emotional pool generator for dynamic generation across all 81 books
const NOTE_TEMPLATES = {
  heartbreak: [
    "I read this on the train ride home after we agreed to stop trying. Page {page} felt like you standing right in front of me with your coat already on.",
    "You gave me this copy when we still lived on {street}. I finally finished it today. You were right about the ending, but wrong about us.",
    "For {recipient}: I kept your boarding pass tucked into chapter four for two years. Yesterday I finally took it out. I hope the coast treats you well.",
    "We spent three summers pretending this wasn't going to end the way it did. Now every line reads like an autopsy report.",
    "I wanted to hate this because you loved it so much. Instead, it became the only thing that made sense during the months you stopped answering."
  ],
  intimacy: [
    "To {recipient}—for the nights when the radiator clanked and we took turns reading the dialogue out loud until our voices gave out.",
    "Every time {author} writes about hands, I think of the way you hold the steering wheel when you're tired. I'll love you even when we're old and forgetful.",
    "You once told me that some books feel like coming home after walking through a blizzard. This is that book for me, and so are you.",
    "For the only person who understands why I cry at {scene}. Keep this on your bedside table.",
    "I bought two copies so we could read the final chapter at the exact same minute across two different time zones."
  ],
  situationship: [
    "For {recipient}: leaving this here because texting you felt like stepping onto thin ice. Page {page} is essentially the conversation we keep avoiding.",
    "We never gave it a name, but you gave me this book, and that felt heavier than any title we could have agreed on.",
    "For someone who refuses to define anything: here is a story where nobody defines anything either, and look how that turned out.",
    "Some people exist only in the margins of your year, but they leave the deepest pencil marks. I hope you find what you're looking for.",
    "I don't know what we were doing from October to March, but this was the soundtrack to every late night drive back from your apartment."
  ],
  bestFriend: [
    "To {recipient}: you are literally the main character in chapter {page} and if you deny it I am leaking our group chat. Five cats, read it immediately.",
    "We stayed on FaceTime for three hours screaming about the plot twist on page {page}. My jaw was physically on the carpet.",
    "Passing this to my favorite human alive. If you don't love this as much as I do, our friendship is on probation for 30 business days.",
    "You brought this to the diner at 1 AM and forced me to read the prologue over lukewarm fries. Best recommendation you've ever made.",
    "For my ride-or-die: life has been completely chaotic lately, but sitting on your floor trading paperbacks makes everything feel survivable."
  ],
  candidReview: [
    "Look, the prose is absolute poetry, but every single character in this novel desperately needs therapy and a tall glass of water. 3 cats for the writing alone.",
    "I wanted to love this so badly because everyone on literary TikTok was losing their minds, but the third act completely betrayed the first 200 pages. 2 cats.",
    "Five cats without hesitation. A slow, quiet unraveling that doesn't rely on cheap twists to devastate you. Kept me awake until dawn.",
    "The middle section dragged a little near page {page}, but that final sentence knocked the wind out of me. Worth every single minute.",
    "One cat for the plot, five cats for the atmosphere. I felt damp and cold the entire time I was reading it."
  ],
  comfortGrief: [
    "Read this during the week my grandfather was in hospice. It didn't make the fluorescent lights any softer, but it kept me anchored to the earth.",
    "A quiet, tender sanctuary of a book. When everything in the world feels loud and hostile, this was the only room I wanted to sit in.",
    "For anyone who feels like they are walking through their own life as a ghost lately: this will gently remind you that you are made of flesh and bone.",
    "I picked this up off a library cart on a rainy Tuesday when I couldn't stop crying in my car. It saved me in ways I don't know how to explain."
  ]
};

const STREETS = ["Bedford Ave", "Franklin St", "Lincoln Park", "Telegraph Ave", "Queen Street", "St. Marks", "Division St", "Parkway"];
const SCENES = ["the train station farewell", "the kitchen scene in chapter six", "the final letter", "the monologue in the rain", "the morning after the storm"];

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
  console.log("Fetching existing books from database...");
  const { data: books, error: booksErr } = await supabase.from("books").select("id, title, author, genre");
  if (booksErr || !books || !books.length) {
    console.error("Failed to fetch books:", booksErr);
    process.exit(1);
  }
  console.log(`Found ${books.length} books in catalog.`);

  const requestedCount = Number.parseInt(process.argv[2] || "1000", 10);
  const totalToInsert = Math.min(Math.max(requestedCount, 100), 2000);
  console.log(`Preparing ${totalToInsert} authentic, emotionally rich submissions...`);

  const now = Date.now();
  const ninetyDaysMs = 90 * 86400 * 1000;
  const submissions = [];

  for (let i = 0; i < totalToInsert; i++) {
    const book = randomChoice(books);
    const isDedication = Math.random() < 0.48; // 48% dedications, 52% recommendations
    const lore = BOOK_LORE[book.title];

    let quote = "";
    let note = "";
    let rating = null;
    let relationship = null;
    let recipient = null;
    const hasSpoiler = Math.random() < 0.12;

    const page = Math.floor(Math.random() * 280) + 24;
    const street = randomChoice(STREETS);
    const scene = randomChoice(SCENES);
    const sender = randomChoice(SENDERS);
    const targetRecipient = randomChoice(RECIPIENTS);

    if (lore && Math.random() < 0.45) {
      // Use book specific lore
      quote = randomChoice(lore.quotes);
      note = randomChoice(lore.notes);
    } else {
      // Use thematic emotional patterns
      const moodKeys = Object.keys(NOTE_TEMPLATES);
      const chosenMood = randomChoice(moodKeys);
      const template = randomChoice(NOTE_TEMPLATES[chosenMood]);
      note = template
        .replace("{recipient}", targetRecipient)
        .replace("{page}", page.toString())
        .replace("{street}", street)
        .replace("{scene}", scene)
        .replace("{author}", book.author);

      const genericQuotes = [
        "In the end, we are only the stories we had the courage to tell.",
        "There is no loneliness like the loneliness of two people who once shared everything.",
        "Some doors only open when you stop trying to knock them down.",
        "I was never afraid of the dark until I saw how much light you carried with you.",
        "We forgave each other in silence, which is just another way of saying goodbye.",
        "A quiet persistent hunger for a life that felt honest.",
        "You cannot measure the weight of an empty chair.",
        "Let the morning come without apologies.",
        "And yet, despite everything, the garden grew back.",
        "I kept your name under my tongue like a secret coin."
      ];
      quote = randomChoice(genericQuotes);
    }

    if (isDedication) {
      relationship = randomWeightedChoice(RELATIONSHIPS, RELATIONSHIP_WEIGHTS);
      recipient = targetRecipient;
      rating = null;
    } else {
      // Recommendations get 1-5 cats
      rating = randomWeightedChoice([5, 4, 3, 2, 1], [0.52, 0.32, 0.10, 0.04, 0.02]);
      relationship = null;
      recipient = null;
    }

    // Spread timestamps naturally across last 90 days with clustering towards recent
    const ageFactor = Math.pow(Math.random(), 1.6);
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

  console.log(`Generated ${submissions.length} posts. Inserting in batches of 50...`);

  const BATCH_SIZE = 50;
  let insertedCount = 0;

  for (let i = 0; i < submissions.length; i += BATCH_SIZE) {
    const batch = submissions.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("posts").insert(batch);
    if (error) {
      console.error(`Error inserting batch at ${i}:`, error.message);
      // Wait slightly and retry once
      await new Promise((r) => setTimeout(r, 500));
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

  console.log(`\nSuccessfully inserted ${insertedCount} submissions into the live database!`);

  // Verify total count in DB
  const { count } = await supabase.from("posts").select("id", { count: "exact", head: true });
  console.log(`New total posts in database: ${count}`);
}

main().catch((err) => {
  console.error("Fatal script error:", err);
  process.exit(1);
});
