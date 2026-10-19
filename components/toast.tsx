"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const TOAST_EVENT = "rr:toast";

/** Shows a small, polite toast from anywhere in the client app. */
export function showToast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}

export function Toaster() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    function handle(event: Event) {
      const message = (event as CustomEvent<string>).detail;
      setToast({ id: Date.now(), message });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setToast(null), 3600);
    }
    window.addEventListener(TOAST_EVENT, handle);
    return () => { window.removeEventListener(TOAST_EVENT, handle); window.clearTimeout(timer); };
  }, []);

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && <div className="toast" key={toast.id}><Check size={15} aria-hidden="true" /> {toast.message}</div>}
    </div>
  );
}
