import type { Book } from "@/lib/books";

export type SamplePost = {
  id?: string;
  /** Defaults to "recommendation" when omitted. */
  kind?: "recommendation" | "dedication";
  book: Book;
  /** Cat rating for recommendations; 0 for dedications. */
  rating: number;
  quote: string;
  note: string;
  from: string;
  spoiler?: boolean;
  /** Dedication recipient ("For [Name]"). */
  recipient?: string;
  createdAt?: string;
};

export const isDedication = (post: SamplePost) => post.kind === "dedication";

/** Presents a dedication in the shared feed-item shape. */
export function dedicationToFeedItem(dedication: Dedication, createdAt?: string): SamplePost {
  return {
    id: dedication.id,
    kind: "dedication",
    book: dedication.book,
    rating: 0,
    quote: dedication.quote,
    note: dedication.message,
    from: dedication.from,
    spoiler: dedication.spoiler,
    recipient: dedication.recipient,
    createdAt,
  };
}

export type Dedication = {
  id?: string;
  recipient: string;
  book: Book;
  quote: string;
  message: string;
  from: string;
  spoiler?: boolean;
};

export const quoteSuggestions: Record<string, string[]> = {
  "Pride and Prejudice": [
    "For anyone learning that being understood is its own kind of love.",
    "A sharp little reminder that first impressions are only the first page.",
  ],
  Circe: [
    "Some stories arrive exactly when you need them.",
    "A voice that turns solitude into a kind of strength.",
  ],
  "The Secret History": [
    "I closed the book and needed a minute.",
    "The kind of story that keeps rearranging itself in your memory.",
  ],
};

export const collageBooks: Book[] = [
  { key: "/works/OL66554W", title: "Pride and Prejudice", author: "Jane Austen", coverId: 14348537, color: "#665065" },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", coverId: 10590366, color: "#314668" },
  { title: "Jane Eyre", author: "Charlotte Brontë", coverId: 8235363, color: "#764a52" },
  { title: "The Secret History", author: "Donna Tartt", coverId: 744854, color: "#473f53" },
  { title: "Little Women", author: "Louisa May Alcott", coverId: 8775559, color: "#875d58" },
  { title: "The Picture of Dorian Gray", author: "Oscar Wilde", coverId: 14314858, color: "#314d46" },
  { key: "/works/OL27482W", title: "The Hobbit", author: "J. R. R. Tolkien", coverId: 14627509, color: "#56664e" },
  { title: "Beloved", author: "Toni Morrison", coverId: 8261367, color: "#755e4d" },
  { title: "The Bell Jar", author: "Sylvia Plath", coverId: 8477115, color: "#315c67" },
  { title: "Dune", author: "Frank Herbert", coverId: 11481354, color: "#8c6141" },
  { title: "The Catcher in the Rye", author: "J. D. Salinger", coverId: 9273490, color: "#944d46" },
  { title: "The Book Thief", author: "Markus Zusak", coverId: 8153054, color: "#4a505f" },
  { key: "/works/OL18012166W", title: "Circe", author: "Madeline Miller", coverId: 8739376, color: "#8c6336" },
  { title: "Normal People", author: "Sally Rooney", coverId: 8794265, color: "#617478" },
  { title: "The Night Circus", author: "Erin Morgenstern", coverId: 8773134, color: "#292b3d" },
  { title: "Frankenstein", author: "Mary Shelley", coverId: 15118068, color: "#596458" },
  { title: "Wuthering Heights", author: "Emily Brontë", coverId: 12818862, color: "#4b5e66" },
  { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", coverId: 8354226, color: "#536a4d" },
  { title: "A Little Life", author: "Hanya Yanagihara", coverId: 12065783, color: "#526474" },
  { title: "The Song of Achilles", author: "Madeline Miller", coverId: 7098465, color: "#81959a" },
  { title: "Rebecca", author: "Daphne du Maurier", coverId: 8238729, color: "#485a5c" },
  { title: "To Kill a Mockingbird", author: "Harper Lee", coverId: 14351077, color: "#805e47" },
  { key: "/works/OL20965973W", title: "The Midnight Library", author: "Matt Haig", color: "#315363" },
  // Expanded shelf (v2): keeps the hero collage free of visible repeats.
  // Keep this list at 62 entries — see the grid index note in app/page.tsx.
  { key: "/works/OL228702W", title: "Giovanni's Room", author: "James Baldwin", coverId: 97395, color: "#4b5e66" },
  { key: "/works/OL2046427W", title: "Bel Canto", author: "Ann Patchett", coverId: 5253806, color: "#764a52" },
  { key: "/works/OL17202418W", title: "Station Eleven", author: "Emily St. John Mandel", coverId: 7369961, color: "#315363" },
  { key: "/works/OL21784995W", title: "If on a winter's night a traveler", author: "Italo Calvino", coverId: 12007967, color: "#665065" },
  { key: "/works/OL20883297W", title: "Klara and the Sun", author: "Kazuo Ishiguro", coverId: 10648686, color: "#8c6336" },
  { key: "/works/OL17762217W", title: "Pachinko", author: "Min Jin Lee", coverId: 8044605, color: "#314d46" },
  { key: "/works/OL59038W", title: "Never Let Me Go", author: "Kazuo Ishiguro", coverId: 1047334, color: "#526474" },
  { key: "/works/OL59048W", title: "The Remains of the Day", author: "Kazuo Ishiguro", coverId: 95742, color: "#755e4d" },
  { key: "/works/OL43108828W", title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", coverId: 15185412, color: "#8c6141" },
  { key: "/works/OL39349W", title: "Mrs Dalloway", author: "Virginia Woolf", coverId: 6397580, color: "#617478" },
  { key: "/works/OL39396W", title: "To the Lighthouse", author: "Virginia Woolf", coverId: 8231846, color: "#315c67" },
  { key: "/works/OL20867W", title: "Middlemarch", author: "George Eliot", coverId: 252882, color: "#56664e" },
  { key: "/works/OL32525579W", title: "Crime and Punishment", author: "Fyodor Dostoyevsky", coverId: 13116014, color: "#944d46" },
  { key: "/works/OL66544W", title: "Persuasion", author: "Jane Austen", coverId: 12824691, color: "#485a5c" },
  { key: "/works/OL66513W", title: "Emma", author: "Jane Austen", coverId: 9278312, color: "#875d58" },
  { key: "/works/OL675783W", title: "The Handmaid's Tale", author: "Margaret Atwood", coverId: 8231851, color: "#764a52" },
  { key: "/works/OL2625457W", title: "Norwegian Wood", author: "Haruki Murakami", coverId: 2237620, color: "#536a4d" },
  { key: "/works/OL1052133W", title: "The God of Small Things", author: "Arundhati Roy", coverId: 10513792, color: "#805e47" },
  { key: "/works/OL1855944W", title: "Atonement", author: "Ian McEwan", coverId: 8381043, color: "#4a505f" },
  { key: "/works/OL16809803W", title: "The Goldfinch", author: "Donna Tartt", coverId: 8771366, color: "#473f53" },
  { key: "/works/OL891786W", title: "Things Fall Apart", author: "Chinua Achebe", coverId: 12816943, color: "#8c6141" },
  { key: "/works/OL27778127W", title: "Their Eyes Were Watching God", author: "Zora Neale Hurston", coverId: 12752055, color: "#596458" },
  { key: "/works/OL23166W", title: "East of Eden", author: "John Steinbeck", coverId: 11386937, color: "#755e4d" },
  { key: "/works/OL98491W", title: "The Age of Innocence", author: "Edith Wharton", coverId: 11196262, color: "#665065" },
  { key: "/works/OL5721394W", title: "Brideshead Revisited", author: "Evelyn Waugh", coverId: 2560441, color: "#314668" },
  { key: "/works/OL88813W", title: "A Room with a View", author: "E. M. Forster", coverId: 1748132, color: "#81959a" },
  { key: "/works/OL26004554W", title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", coverId: 12859975, color: "#315363" },
  { key: "/works/OL20743965W", title: "Hamnet", author: "Maggie O'Farrell", coverId: 10306590, color: "#56664e" },
  { key: "/works/OL20799434W", title: "The Vanishing Half", author: "Brit Bennett", coverId: 10095692, color: "#764a52" },
  { key: "/works/OL17795349W", title: "Homegoing", author: "Yaa Gyasi", coverId: 8081171, color: "#8c6336" },
  { key: "/works/OL20893680W", title: "Piranesi", author: "Susanna Clarke", coverId: 10226290, color: "#4b5e66" },
  { key: "/works/OL482454W", title: "Cloud Atlas", author: "David Mitchell", coverId: 6714077, color: "#315c67" },
  { key: "/works/OL1875009W", title: "Gilead", author: "Marilynne Robinson", coverId: 1472533, color: "#617478" },
  { key: "/works/OL872932W", title: "Siddhartha", author: "Hermann Hesse", coverId: 6562535, color: "#805e47" },
  { key: "/works/OL24259583W", title: "The Little Prince", author: "Antoine de Saint-Exupéry", coverId: 10746692, color: "#314668" },
  { key: "/works/OL77746W", title: "Anne of Green Gables", author: "L. M. Montgomery", coverId: 14641084, color: "#536a4d" },
  { key: "/works/OL69612W", title: "The Secret Garden", author: "Frances Hodgson Burnett", coverId: 12622062, color: "#314d46" },
  { key: "/works/OL50567W", title: "Sula", author: "Toni Morrison", coverId: 8384008, color: "#944d46" },
  { key: "/works/OL88881W", title: "Howards End", author: "E. M. Forster", coverId: 8235207, color: "#596458" },
];

export const samplePosts: SamplePost[] = [
  {
    book: collageBooks[0], rating: 5,
    quote: "For anyone learning that being understood is its own kind of love.",
    note: "Come for the wit, stay for the quiet courage of changing your mind. This is the book I hand to people who think the classics can't surprise them.",
    from: "a fellow overthinker",
  },
  {
    book: collageBooks[12], rating: 5,
    quote: "Some stories arrive exactly when you need them.",
    note: "Lush, bright, and impossible to put down. I wanted to live inside these pages for a little longer.",
    from: "M.",
  },
  {
    book: collageBooks[3], rating: 4,
    quote: "I closed the book and needed a minute.",
    note: "A slow unraveling with a mood that follows you around afterward.",
    from: "an anonymous reader",
    spoiler: true,
  },
  {
    book: collageBooks[9], rating: 5,
    quote: "A whole world in the palm of your hand.",
    note: "For when you want a story big enough to disappear into.",
    from: "Jules",
  },
  {
    book: collageBooks[20], rating: 4,
    quote: "The atmosphere stayed with me long after the ending.",
    note: "The perfect rainy-day read: haunting, romantic, and a little wild.",
    from: "someone who loves old houses",
  },
];

export const sampleDedications: Dedication[] = [
  {
    id: "dedication-1",
    recipient: "Maria",
    book: collageBooks[12],
    quote: "Some stories arrive exactly when you need them.",
    message: "For the season when you are becoming someone new. I hope Circe keeps you company.",
    from: "a friend who is cheering for you",
  },
  {
    id: "dedication-2",
    recipient: "James",
    book: collageBooks[6],
    quote: "There is some good in this world, and it is worth fighting for.",
    message: "For your next brave beginning.",
    from: "M.",
  },
  {
    id: "dedication-3",
    recipient: "Bea",
    book: collageBooks[20],
    quote: "The atmosphere stayed with me long after the ending.",
    message: "A rainy afternoon read, for a person who makes every room feel like home.",
    from: "someone who knows",
    spoiler: true,
  },
];
