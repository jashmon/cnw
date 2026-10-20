"use client";
import { useState } from "react";
import { MAX_QTY } from "@/lib/quote";

// Quantity field that tolerates editing: while focused it holds whatever digits are typed (including empty);
// a valid number (1–9999) is saved as you type; leaving it empty or invalid restores the saved quantity.
export function QtyInput({ value, onCommit, label, id, className, style }: { value: number; onCommit: (n: number) => void; label?: string; id?: string; className?: string; style?: React.CSSProperties }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input id={id} className={className} style={style} type="text" inputMode="numeric" pattern="[0-9]*" aria-label={label} maxLength={4}
      value={draft ?? String(value)}
      onFocus={(e) => { setDraft(String(value)); e.currentTarget.select(); }}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
        setDraft(d);
        const n = parseInt(d, 10);
        if (n >= 1 && n <= MAX_QTY) onCommit(n);
      }}
      onBlur={() => setDraft(null)}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setDraft(null); e.currentTarget.blur(); } }} />
  );
}
