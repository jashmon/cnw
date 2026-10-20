"use client";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { modelMatches, normModel } from "@/lib/model-search";
import s from "@/app/downloads/downloads.module.css";

// F11: the datasheet index with a local model/name filter and family anchors, so a buyer who starts at
// Downloads types a code and reaches the PDF without scanning 70+ rows. All rows are server-rendered first.
export type SheetRow = { slug: string; model: string; aliases: string[]; name: string; href: string; size: string; filename: string; productHref: string; family: string; familySlug: string; category: string; catSlug: string };


export function DatasheetList({ rows, families }: { rows: SheetRow[]; families: { slug: string; name: string }[] }) {
  const [q, setQ] = useState("");
  const id = useId();
  // A04: same normaliser and aliases as the header search ("wmhs3" finds WMHS-III here too)
  const n = normModel(q);
  const shown = useMemo(() => (n.length < 2 ? rows : rows.filter((r) => modelMatches(q, r))), [rows, n, q]);
  const fams = families.filter((f) => shown.some((r) => r.familySlug === f.slug));
  return (
    <div>
      <div className={s.filterBar}>
        <label htmlFor={`${id}-q`} className="sr-only">Filter datasheets by model or name</label>
        <input id={`${id}-q`} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by model or name, e.g. CR-IIIPE" className={s.filter} />
        <nav aria-label="Datasheets by family" className={s.famJump}>{fams.map((f) => <a key={f.slug} href={`#ds-${f.slug}`}>{f.name}</a>)}</nav>
        <span className="mono muted" aria-live="polite" style={{ fontSize: ".875rem" }}>{shown.length} of {rows.length} datasheets</span>
      </div>
      {shown.length === 0 && (
        <div role="status" style={{ border: "2px dashed var(--line)", borderRadius: "var(--radius-md)", padding: 24, marginTop: 18 }}>
          <p className="h-3">No datasheet matches “{q}”.</p>
          <p className="muted" style={{ marginTop: 6 }}>Some models share a document, and a few are on request. <Link className="inline" href="/contact">Ask for a document</Link>, or <button type="button" className="link" style={{ border: 0, background: "none", cursor: "pointer", padding: 0 }} onClick={() => setQ("")}>clear the filter</button>.</p>
        </div>
      )}
      {fams.map((f) => (
        <div key={f.slug} id={`ds-${f.slug}`} className={s.fam} style={{ scrollMarginTop: "calc(var(--sticky-top) + 12px)" }}>
          <h3 className="h-3">{f.name}</h3>
          {[...new Map(shown.filter((r) => r.familySlug === f.slug).map((r) => [r.catSlug, r.category])).entries()].map(([catSlug, category]) => (
            <div key={catSlug} className={s.cat}>
              <p className="label">{category}</p>
              <ul className={s.list}>
                {shown.filter((r) => r.catSlug === catSlug).map((r) => (
                  <li key={r.slug}>
                    <a className={s.file} href={r.href} download={r.filename}>
                      <span className="code">{r.model}</span><span className={s.n}>{r.name}</span><span className="mono muted">PDF · {r.size}</span><span aria-hidden="true" className={s.dl}>↓</span>
                    </a>
                    <Link href={r.productHref} className={s.view}>View product</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
