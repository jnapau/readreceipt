export function CatRating({ rating }: { rating: number }) {
  return (
    <div className="cat-rating" role="img" aria-label={`${rating} out of 5 cats`}>
      {Array.from({ length: 5 }, (_, index) => (
        <svg className={index < rating ? "cat-active" : "cat-inactive"} key={index} width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M4.4 4.6c-.4-.7-.3-1.2.3-1.1l4.7 2.6a10.3 10.3 0 0 1 5.2 0l4.7-2.6c.6-.1.7.4.3 1.1l-1.1 5.2c1 1.4 1.5 3.1 1.5 4.9 0 4.3-3.4 7.1-8 7.1s-8-2.8-8-7.1c0-1.8.5-3.5 1.5-4.9L4.4 4.6Zm4.9 8.7a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm5.4 0a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm-4.1 3.5c.6.5 1 .7 1.4.7s.8-.2 1.4-.7l-1.4-1.1-1.4 1.1Z" />
        </svg>
      ))}
    </div>
  );
}
