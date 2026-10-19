import type { Book } from "@/lib/books";

export type SamplePost = {
  id?: string;
  book: Book;
  rating: number;
  quote: string;
  note: string;
  from: string;
  spoiler?: boolean;
};

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
