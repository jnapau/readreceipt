"""
Read Receipts — Synthetic Dataset Generator for Data Science Portfolio
Generates realistic book recommendation and dedication data with:
- Books, authors, and genres
- Skewed cat rating distributions (1 to 5)
- Dedication recipient relationships (lover, situationship, ex, friend, bff, crush, family)
- Text lengths, sentiment scores, and spoiler flags
- Purr counts following a power-law distribution
"""

import csv
import json
import random
from datetime import datetime, timedelta

GENRES = [
    "Classics",
    "Romance",
    "Literary Fiction",
    "Fantasy",
    "Sci-Fi",
    "Mystery & Thriller",
    "Poetry",
    "Memoir & Biography",
    "Philosophy",
]

RELATIONSHIPS = [
    "lover",
    "situationship",
    "ex",
    "friend",
    "bff",
    "crush",
    "family",
    None,  # Passed / preferred not to say
]

RELATIONSHIP_WEIGHTS = [0.22, 0.18, 0.15, 0.20, 0.10, 0.08, 0.05, 0.02]

BOOKS = [
    ("Pride and Prejudice", "Jane Austen", "Classics"),
    ("The Great Gatsby", "F. Scott Fitzgerald", "Classics"),
    ("Jane Eyre", "Charlotte Brontë", "Classics"),
    ("The Secret History", "Donna Tartt", "Mystery & Thriller"),
    ("Little Women", "Louisa May Alcott", "Classics"),
    ("The Picture of Dorian Gray", "Oscar Wilde", "Classics"),
    ("The Hobbit", "J. R. R. Tolkien", "Fantasy"),
    ("Beloved", "Toni Morrison", "Literary Fiction"),
    ("The Bell Jar", "Sylvia Plath", "Classics"),
    ("Dune", "Frank Herbert", "Sci-Fi"),
    ("The Catcher in the Rye", "J. D. Salinger", "Classics"),
    ("The Book Thief", "Markus Zusak", "Literary Fiction"),
    ("Circe", "Madeline Miller", "Fantasy"),
    ("Normal People", "Sally Rooney", "Romance"),
    ("The Night Circus", "Erin Morgenstern", "Fantasy"),
    ("Frankenstein", "Mary Shelley", "Classics"),
    ("Wuthering Heights", "Emily Brontë", "Classics"),
    ("The Seven Husbands of Evelyn Hugo", "Taylor Jenkins Reid", "Romance"),
    ("A Little Life", "Hanya Yanagihara", "Literary Fiction"),
    ("The Song of Achilles", "Madeline Miller", "Romance"),
    ("Rebecca", "Daphne du Maurier", "Mystery & Thriller"),
    ("To Kill a Mockingbird", "Harper Lee", "Classics"),
    ("The Midnight Library", "Matt Haig", "Fantasy"),
    ("Giovanni's Room", "James Baldwin", "Classics"),
    ("Station Eleven", "Emily St. John Mandel", "Sci-Fi"),
    ("If on a winter's night a traveler", "Italo Calvino", "Literary Fiction"),
    ("Klara and the Sun", "Kazuo Ishiguro", "Sci-Fi"),
    ("Pachinko", "Min Jin Lee", "Literary Fiction"),
    ("Never Let Me Go", "Kazuo Ishiguro", "Sci-Fi"),
    ("Tomorrow, and Tomorrow, and Tomorrow", "Gabrielle Zevin", "Literary Fiction"),
    ("Piranesi", "Susanna Clarke", "Fantasy"),
    ("Norwegian Wood", "Haruki Murakami", "Romance"),
    ("East of Eden", "John Steinbeck", "Classics"),
]

FIRST_NAMES = [
    "Maria", "James", "Bea", "Elena", "Lucas", "Maya", "Julian", "Clara",
    "Theo", "Sophie", "Noah", "Camille", "Leo", "Aria", "Mateo", "Chloe",
    "Ethan", "Grace", "Sam", "Isla", "Oliver", "Hannah", "Gabriel", "Zoe"
]

SENDERS = [
    "a fellow overthinker", "an anonymous reader", "someone who knows",
    "a quiet admirer", "M.", "Jules", "someone who loves old houses",
    "a friend from the bookstore", "a stranger on the subway", "K.", "A."
]

NOTE_SNIPPETS = {
    "lover": [
        "Read this and thought of you on every single page.",
        "A story as quiet and deep as the way we talk late at night.",
        "You once told me you needed a book like this.",
        "For the person who turned every ordinary room into poetry.",
    ],
    "situationship": [
        "I don't know what we are, but I know you belong with this book.",
        "Maybe we never figured it out, but I hope this gives you some peace.",
        "Some stories exist in the space between goodbye and staying.",
        "Leaving this here because asking you directly felt like too much.",
    ],
    "ex": [
        "A reminder of a version of us that used to love without hesitation.",
        "I finally finished the book you left on my nightstand.",
        "No bitterness, just gratitude for the seasons we shared.",
        "For closure, or maybe just to say I hope you are doing well.",
    ],
    "friend": [
        "For your next brave beginning. You're going to do great things.",
        "Because you made this past year bearable.",
        "Next time you need an escape, start here.",
        "Laughed out loud and wished you were sitting next to me.",
    ],
    "bff": [
        "If you don't read this immediately I am revoking our friendship.",
        "This main character is literally you and you cannot deny it.",
        "Passing this to my favorite human on earth.",
        "Read it so we can dissect every chapter for three hours.",
    ],
    "recommendation": [
        "Lush, bright, and impossible to put down.",
        "Come for the wit, stay for the quiet courage of changing your mind.",
        "A slow unraveling with a mood that follows you around afterward.",
        "A whole world in the palm of your hand.",
        "The atmosphere stayed with me long after the ending.",
        "I closed the book and needed a minute to breathe.",
    ],
}

def generate_records(num_records=500):
    start_date = datetime.now() - timedelta(days=90)
    data = []

    for i in range(1, num_records + 1):
        kind = "recommendation" if random.random() < 0.65 else "dedication"
        title, author, genre = random.choice(BOOKS)
        created_at = start_date + timedelta(seconds=random.randint(0, 90 * 86400))

        if kind == "recommendation":
            rating = random.choices([5, 4, 3, 2, 1], weights=[0.55, 0.30, 0.10, 0.03, 0.02])[0]
            relationship = None
            recipient = None
            note = random.choice(NOTE_SNIPPETS["recommendation"])
            purrs = int(random.paretovariate(1.8) * 4)  # Power law distribution
        else:
            rating = None
            relationship = random.choices(RELATIONSHIPS, weights=RELATIONSHIP_WEIGHTS)[0]
            recipient = random.choice(FIRST_NAMES)
            rel_key = relationship if relationship in NOTE_SNIPPETS else "friend"
            note = random.choice(NOTE_SNIPPETS[rel_key])
            purrs = 0

        has_spoiler = random.random() < 0.14
        quote = f"A line from {title} that stays in your head."

        data.append({
            "post_id": f"rec-{i:04d}",
            "kind": kind,
            "book_title": title,
            "book_author": author,
            "genre": genre,
            "rating": rating,
            "quote": quote,
            "note": note,
            "note_length": len(note),
            "from_sender": random.choice(SENDERS),
            "recipient": recipient,
            "relationship": relationship,
            "purrs": purrs,
            "has_spoiler": has_spoiler,
            "created_at": created_at.isoformat(),
        })

    return data

if __name__ == "__main__":
    records = generate_records(500)

    # Save to CSV
    csv_file = "read_receipts_synthetic_500.csv"
    with open(csv_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(records[0].keys()))
        writer.writeheader()
        writer.writerows(records)

    # Save to JSON
    json_file = "read_receipts_synthetic_500.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {len(records)} records!")
    print(f"CSV saved to: {csv_file}")
    print(f"JSON saved to: {json_file}")
