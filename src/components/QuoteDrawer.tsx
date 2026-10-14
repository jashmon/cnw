"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useQuote } from "@/lib/quote";
import { waLink } from "@/content/company";
import { Arrow } from "./Brand";
import s from "./QuoteDrawer.module.css";

// Global quote drawer (CONV-01). Opens from the header badge; Esc closes; focus moves into the panel.
export function QuoteDrawer() {
  const q = useQuote();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!q.open) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") q.setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus?.(); };
  }, [q.open]); // eslint-disable-line react-hooks/exhaustive-deps
  const wa = waLink(`Hello Cables & Wireless Co., please quote for:\n${q.lines.map((l) => `• ${l.model} ${l.name} × ${l.qty}`).join("\n")}`);
  return (
    <>
      <div className={s.layer}>
      <div className={`${s.scrim} ${q.open ? s.open : ""}`} onClick={() => q.setOpen(false)} aria-hidden="true" />
      <div ref={panel} className={`${s.panel} ${q.open ? s.open : ""}`} role="dialog" aria-modal="true" aria-label="Quote list" aria-hidden={!q.open} inert={!q.open}>
        <div className={s.head}>
          <h2>Quote list <span className="badge">{q.count}</span></h2>
          <button className={s.close} onClick={() => q.setOpen(false)} aria-label="Close quote list">×</button>
        </div>
        {q.count === 0 ? (
          <div className={s.empty}>
            <p className="h-4">Nothing on the list yet.</p>
            <p className="muted">Add models from any product page, then send one enquiry for all of them.</p>
            <Link href="/products" className="link" onClick={() => q.setOpen(false)}>Browse all models →</Link>
          </div>
        ) : (
          <ul className={s.list}>
            {q.lines.map((l) => (
              <li key={l.slug} className={s.line}>
                <div className={s.thumb}>{l.img && <img src={l.img} alt="" />}</div>
                <div>
                  <span className="code">{l.model}</span>
                  <Link href={l.href} className={s.name} onClick={() => q.setOpen(false)}>{l.name}</Link>
                  <button className={s.rm} onClick={() => q.remove(l.slug)}>Remove</button>
                </div>
                <div className={s.qty} role="group" aria-label={`Quantity for ${l.model}`}>
                  <button onClick={() => q.setQty(l.slug, l.qty - 1)} aria-label="Decrease">−</button>
                  <input inputMode="numeric" value={l.qty} onChange={(e) => q.setQty(l.slug, parseInt(e.target.value, 10))} aria-label="Quantity" />
                  <button onClick={() => q.setQty(l.slug, l.qty + 1)} aria-label="Increase">+</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {q.count > 0 && (
          <div className={s.foot}>
            <Link href="/quote" className="btn btn--hazard" onClick={() => q.setOpen(false)}>Continue to enquiry <Arrow /></Link>
            <a href={wa} className="btn btn--ghost" target="_blank" rel="noopener">Send list on WhatsApp</a>
          </div>
        )}
      </div>
      </div>
      <div className={`${s.toast} ${q.toast ? s.show : ""}`} role="status" aria-live="polite">{q.toast}</div>
    </>
  );
}
