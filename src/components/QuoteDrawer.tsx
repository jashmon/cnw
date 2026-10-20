"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { QtyInput } from "./QtyInput";
import { useEffect, useRef } from "react";
import { useQuote } from "@/lib/quote";
import { waLink } from "@/content/company";
import { Arrow } from "./Brand";
import s from "./QuoteDrawer.module.css";

// Global quote drawer (CONV-01). Opens from the header badge; Esc closes; focus moves into the panel.
export function QuoteDrawer() {
  const q = useQuote();
  const panel = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  // Modal dialog: focus moves in, Tab/Shift+Tab are contained, the page behind is inert, Escape closes, focus returns.
  useEffect(() => {
    if (!q.open) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () => [...(panel.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])].filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { q.setOpen(false); return; }
      if (e.key !== "Tab") return;
      const f = focusables(); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !panel.current?.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    };
    const behind = [...document.body.children].filter((el) => el !== layer.current && !el.contains(layer.current) && el.tagName !== "SCRIPT" && !el.matches('[role="status"]')) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey); document.body.style.overflow = "";
      behind.forEach((el) => el.removeAttribute("inert"));
      prev?.focus?.();
    };
  }, [q.open]); // eslint-disable-line react-hooks/exhaustive-deps
  const wa = waLink(`Hello Cables & Wireless Co., please quote for:\n${q.lines.map((l) => `• ${l.model} ${l.name} × ${l.qty}`).join("\n")}`);
  return (
    <>
      <div className={s.layer} ref={layer}>
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
                  <button type="button" className={s.rm} onClick={() => q.remove(l.slug)} aria-label={`Remove ${l.model} from the quote list`}>Remove</button>
                </div>
                <div className={s.qty} role="group" aria-label={`Quantity for ${l.model}`}>
                  <button type="button" onClick={() => q.setQty(l.slug, l.qty - 1)} aria-label={`Decrease quantity of ${l.model}`} disabled={l.qty <= 1}>−</button>
                  <QtyInput value={l.qty} onCommit={(n) => q.setQty(l.slug, n)} label={`Quantity of ${l.model}`} />
                  <button type="button" onClick={() => q.setQty(l.slug, l.qty + 1)} aria-label={`Increase quantity of ${l.model}`}>+</button>
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
