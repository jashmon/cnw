import Link from "next/link";
import { NOT_SPECIFIED, type Row } from "@/lib/compare";
import s from "./CompareTable.module.css";

type Col = { slug: string; model: string; name: string; href: string };

// Shared comparison table (product page + category compare). Rows: differs (tagged) · same · partial
// ("Not specified" is shown muted and never counts as a difference). The wrapper is a focusable, labelled
// region so keyboard users can scroll it sideways; the spec-name column stays put while scrolling.
export function CompareTable({ cols, rows, current, label }: { cols: Col[]; rows: Row[]; current?: string; label: string }) {
  return (
    <>
      <p className={s.hint} aria-hidden="true">Swipe sideways to see every model →</p>
      <div className={s.wrap} role="region" aria-label={label} tabIndex={0}>
        <table className={`table ${s.cmp}`}>
          <caption className="sr-only">{label}. Rows that differ come first; “Not specified” means the datasheet does not list it.</caption>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Specification</span></th>
              {cols.map((c) => (
                <th key={c.slug} scope="col" className={c.slug === current ? s.me : ""}>
                  {c.slug === current ? <span className="code">{c.model || c.name}</span> : <Link href={c.href} className="code" style={{ textDecoration: "none" }}>{c.model || c.name}</Link>}
                  <div className={s.cname}>{c.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className={s[r.state]}>
                <th scope="row">{r.key}{r.state === "differs" && <span className={s.tag}>differs</span>}</th>
                {r.values.map((v, i) => (
                  <td key={cols[i].slug} className={cols[i].slug === current ? s.me : ""}>
                    {v === NOT_SPECIFIED ? <span className={s.ns}>Not specified</span> : v}
                    {r.notes[i] && <span className={s.note}>{r.notes[i]}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
