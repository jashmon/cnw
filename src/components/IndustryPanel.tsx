"use client";
import Link from "next/link";
import { useState } from "react";

// Home industries (NAV-01 second axis, Talkaphone applications): list on the left, panel swaps on hover/focus.
export type IndustryLite = { slug: string; name: string; intro: string; models: { model: string; href: string }[] };
export function IndustryPanel({ items }: { items: IndustryLite[] }) {
  const [i, setI] = useState(0);
  const cur = items[i];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,5fr) minmax(0,7fr)", gap: "clamp(20px,4vw,64px)" }} className="ind-grid">
      <ul style={{ listStyle: "none", padding: 0, borderTop: "1px solid var(--charcoal-line)" }}>
        {items.map((it, n) => (
          <li key={it.slug}>
            <Link href={`/industries/${it.slug}`} onMouseEnter={() => setI(n)} onFocus={() => setI(n)} aria-current={n === i ? "true" : undefined} className="ind-link">
              <span>{it.name}</span><span aria-hidden="true" className="ind-arrow">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="ind-panel" key={cur.slug} aria-live="polite">
        <p className="label">{String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
        <p className="h-2" style={{ color: "var(--yellow)", margin: "10px 0 14px" }}>{cur.name}</p>
        <p style={{ maxWidth: "56ch" }}>{cur.intro}</p>
        <div className="chips" style={{ marginTop: 22 }}>{cur.models.map((m) => <Link key={m.model} href={m.href} className="code" style={{ textDecoration: "none" }}>{m.model}</Link>)}</div>
        <Link href={`/industries/${cur.slug}`} className="btn btn--yellow" style={{ marginTop: 26 }}>{cur.name} products <span className="arr" aria-hidden="true"><i>→</i><i>→</i></span></Link>
      </div>
    </div>
  );
}
