"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { compareRows } from "@/lib/compare";
import type { SpecGroups } from "@/lib/catalogue";
import s from "./CategoryCompare.module.css";

type M = { slug: string; model: string; name: string; href: string; categorySlug: string; interface: string; environment: string[]; specGroups: SpecGroups; variants: string[] };
const MAX = 4;

// Category-wide comparison: pick up to four models; rows show differences first in buyer-decision order (lib/compare).
export function CategoryCompare({ models, category }: { models: M[]; category: string }) {
  const [picked, setPicked] = useState<string[]>(() => models.slice(0, Math.min(3, models.length)).map((m) => m.slug));
  const chosen = useMemo(() => models.filter((m) => picked.includes(m.slug)), [models, picked]);
  const rows = useMemo(() => (chosen.length > 1 ? compareRows(chosen, 14) : []), [chosen]);
  const toggle = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((x) => x !== slug) : p.length < MAX ? [...p, slug] : p));
  return (
    <div>
      <fieldset className={s.pick}>
        <legend className="label" style={{ color: "var(--ink)" }}>Choose up to {MAX} {category.toLowerCase()} to compare <span className="muted">({picked.length} selected)</span></legend>
        <div className={s.opts}>
          {models.map((m) => {
            const on = picked.includes(m.slug);
            return (
              <label key={m.slug} className={s.opt} data-on={on}>
                <input type="checkbox" checked={on} disabled={!on && picked.length >= MAX} onChange={() => toggle(m.slug)} />
                <span className="code">{m.model || m.name}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <p className="sr-only" aria-live="polite">{chosen.length > 1 ? `Comparing ${chosen.map((m) => m.model || m.name).join(", ")}` : "Select at least two models to compare"}</p>
      {chosen.length < 2 ? (
        <p className={s.hint}>Select at least two models.</p>
      ) : (
        <div className={s.wrap}>
          <table className={`table ${s.cmp}`}>
            <caption className="sr-only">Comparison of {chosen.map((m) => m.model || m.name).join(", ")}; rows that differ come first</caption>
            <thead><tr><th scope="col"><span className="sr-only">Specification</span></th>{chosen.map((m) => <th key={m.slug} scope="col"><Link href={m.href} className="code" style={{ textDecoration: "none" }}>{m.model || m.name}</Link><div className={s.cname}>{m.name}</div></th>)}</tr></thead>
            <tbody>{rows.map((r) => <tr key={r.key} className={r.differs ? s.diff : s.same}><th scope="row">{r.key}{r.differs && <span className={s.tag}>differs</span>}</th>{r.values.map((v, i) => <td key={chosen[i].slug}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
