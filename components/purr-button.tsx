"use client";

import { useState } from "react";

export type PurrState = { count: number; purred: boolean; onPurr: () => void };

function PawIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <ellipse cx="6.2" cy="9.4" rx="2.1" ry="2.7" />
      <ellipse cx="10.1" cy="5.9" rx="2.1" ry="2.8" />
      <ellipse cx="14.4" cy="5.9" rx="2.1" ry="2.8" />
      <ellipse cx="18.2" cy="9.5" rx="2.1" ry="2.7" />
      <path d="M12.2 11.2c-3.1 0-6.3 3.6-6.3 6.3 0 1.9 1.4 2.9 3.1 2.9 1.4 0 2.1-.7 3.2-.7s1.8.7 3.2.7c1.7 0 3.1-1 3.1-2.9 0-2.7-3.2-6.3-6.3-6.3Z" />
    </svg>
  );
}

/** Anonymous, one-per-browser "purr" (like) for recommendations. */
export function PurrButton({ count, purred, onPurr, compact = false }: PurrState & { compact?: boolean }) {
  const [wiggle, setWiggle] = useState(0);
  const label = `${count} ${count === 1 ? "purr" : "purrs"}`;
  return (
    <button
      className={`purr-button${purred ? " purr-button-active" : ""}${compact ? " purr-button-compact" : ""}`}
      type="button"
      aria-pressed={purred}
      aria-label={purred ? `You purred this · ${label}` : `Give a purr · ${label}`}
      title={purred ? "You purred this" : "Give a purr"}
      onClick={(event) => {
        event.stopPropagation();
        setWiggle((value) => value + 1);
        if (!purred) onPurr();
      }}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <span className="purr-icon" key={wiggle} data-wiggle={wiggle > 0 || undefined}><PawIcon /></span>
      <span>{compact ? count : label}</span>
    </button>
  );
}
