"use client";
import { useRef } from "react";
import { useQuote, type QuoteLine } from "@/lib/quote";

// PDP-08 add to quote list. Signal ripple from the click point (09-motion/buttons.css), label flips.
export function AddToQuote({ item, variant = "primary", compact = false }: { item: Omit<QuoteLine, "qty">; variant?: "primary" | "ghost" | "yellow"; compact?: boolean }) {
  const q = useQuote();
  const ref = useRef<HTMLButtonElement>(null);
  const added = q.has(item.slug);
  const onClick = (e: React.MouseEvent) => {
    const b = ref.current!;
    const r = b.getBoundingClientRect();
    b.style.setProperty("--rx", `${e.clientX ? e.clientX - r.left : r.width / 2}px`);
    b.style.setProperty("--ry", `${e.clientY ? e.clientY - r.top : r.height / 2}px`);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < 3; i++) { const s = document.createElement("span"); s.className = "ripple"; b.appendChild(s); setTimeout(() => s.remove(), 1000); }
    }
    if (added) q.setOpen(true); else q.add(item);
  };
  const cls = ["btn", "btn--quote", variant === "ghost" ? "btn--ghost" : variant === "yellow" ? "btn--yellow" : "", added ? "is-added" : ""].join(" ");
  return (
    <button ref={ref} type="button" className={cls} onClick={onClick} style={compact ? { padding: ".7em 1em", fontSize: ".9375rem" } : undefined}>
      <span className="lbl" aria-hidden={added}>+ Add to quote<span className="sr-only">: {item.model}</span></span>
      <span className="lbl-done" aria-hidden={!added}>✓ In quote list<span className="sr-only">: {item.model}. Open the list</span></span>
    </button>
  );
}
