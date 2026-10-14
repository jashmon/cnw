"use client";
import { waLink } from "@/content/company";
import { AddToQuote } from "./AddToQuote";
import type { QuoteLine } from "@/lib/quote";

// Mobile sticky action bar on product pages (LOCAL-01, CONV-03).
export function MobileBar({ item }: { item: Omit<QuoteLine, "qty"> }) {
  return (
    <>
    <div className="show-sm" aria-hidden="true" style={{ height: 76 }} />
    <div className="show-sm" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40, background: "var(--ground)", borderTop: "2px solid var(--ink)", padding: "10px 16px calc(10px + env(safe-area-inset-bottom))", display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
      <AddToQuote item={item} />
      <a className="btn btn--ghost" href={waLink(`Hello, I'd like a quote for SMART ${item.model} (${item.name}).`)} target="_blank" rel="noopener" aria-label={`Ask about ${item.model} on WhatsApp`}>WhatsApp</a>
    </div>
    </>
  );
}
