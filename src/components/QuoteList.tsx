"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useQuote } from "@/lib/quote";

// Editable quote list on /quote (qty + per-line note).
export function QuoteList() {
  const q = useQuote();
  if (!q.count) return (
    <div style={{ border: "2px dashed var(--line)", borderRadius: "var(--radius-md)", padding: 28, display: "grid", gap: 10 }}>
      <p className="h-3">Your list is empty.</p>
      <p className="muted">Add models from product pages, or just describe what you need in the form. Both work.</p>
      <Link className="link" href="/products" style={{ fontWeight: 600, justifySelf: "start" }}>Browse all models →</Link>
    </div>
  );
  return (
    <ul style={{ listStyle: "none", padding: 0, borderTop: "2px solid var(--ink)" }}>
      {q.lines.map((l) => (
        <li key={l.slug} style={{ display: "grid", gridTemplateColumns: "72px 1fr auto", gap: 14, padding: "16px 0", borderBottom: "1px solid var(--line)", alignItems: "start" }}>
          <div style={{ width: 72, height: 72, background: "var(--surface)", borderRadius: "var(--radius-sm)", display: "grid", placeItems: "center" }}>{l.img && <img src={l.img} alt="" style={{ width: "86%", height: "86%", objectFit: "contain" }} />}</div>
          <div style={{ display: "grid", gap: 6 }}>
            <div><span className="code">{l.model}</span> <Link href={l.href} style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.125rem", textDecoration: "none" }}>{l.name}</Link></div>
            <label className="sr-only" htmlFor={`n-${l.slug}`}>Note for {l.model}</label>
            <input id={`n-${l.slug}`} value={l.note ?? ""} onChange={(e) => q.setNote(l.slug, e.target.value)} placeholder="Note (variant, colour, cable length…)" style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-sm)", padding: "8px 10px", background: "var(--surface-2)", fontSize: ".9375rem" }} />
          </div>
          <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
            <label className="label" htmlFor={`q-${l.slug}`}>Qty</label>
            <input id={`q-${l.slug}`} type="number" min={1} max={9999} value={l.qty} onChange={(e) => q.setQty(l.slug, parseInt(e.target.value, 10))} style={{ width: 84, padding: "8px 10px", border: "1.5px solid var(--ink)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)" }} />
            <button type="button" onClick={() => q.remove(l.slug)} style={{ border: 0, background: "none", textDecoration: "underline", color: "var(--muted)", cursor: "pointer", fontSize: ".8125rem" }}>Remove</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
