"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { compareRows } from "@/lib/compare";
import type { SpecGroups } from "@/lib/catalogue";
import { CompareTable } from "./CompareTable";
import s from "./CategoryCompare.module.css";

type M = { slug: string; model: string; name: string; href: string; categorySlug: string; interface: string; environment: string[]; specGroups: SpecGroups; variants: string[]; capabilities?: Record<string, string> };
const PARAM = "cmp";
const MAX = 4;

// Category-wide comparison. Selected models are chips (remove with ×); "Add a model" picks from the rest, so
// replacing one is remove + add; Reset returns to the first three. Up to four models; table from lib/compare.
function Inner({ models, category, fromUrl }: { models: M[]; category: string; fromUrl?: string | null }) {
  const initial = useMemo(() => models.slice(0, Math.min(3, models.length)).map((m) => m.slug), [models]);
  // F07: the selection starts from ?cmp= (valid slugs of this category only) and every change is mirrored back
  // into the URL with replaceState, so Back restores a custom shortlist and the link can be shared
  const [picked, setPicked] = useState<string[]>(() => {
    const valid = (fromUrl ?? "").split(",").filter((sl, i, a) => sl && models.some((m) => m.slug === sl) && a.indexOf(sl) === i).slice(0, MAX);
    return valid.length ? valid : initial;
  });
  useEffect(() => {
    if (fromUrl === undefined) return; // server fallback render: no URL to write
    const u = new URL(location.href);
    if (picked.join() === initial.join()) u.searchParams.delete(PARAM); else u.searchParams.set(PARAM, picked.join(","));
    if (u.search !== location.search) history.replaceState(history.state, "", u.pathname + u.search + u.hash);
  }, [picked, initial, fromUrl]);
  const chosen = useMemo(() => picked.map((sl) => models.find((m) => m.slug === sl)!).filter(Boolean), [models, picked]);
  const rest = models.filter((m) => !picked.includes(m.slug));
  const rows = useMemo(() => (chosen.length > 1 ? compareRows(chosen, 14) : []), [chosen]);
  const label = (m: M) => m.model || m.name;
  const full = picked.length >= MAX;
  return (
    <div>
      <div className={s.bar}>
        <ul className={s.sel} aria-label="Models being compared">
          {chosen.map((m) => (
            <li key={m.slug} className={s.chip}>
              <span className="code">{label(m)}</span>
              <button type="button" className={s.x} aria-label={`Remove ${label(m)} from comparison`} onClick={() => setPicked((p) => p.filter((x) => x !== m.slug))}>×</button>
            </li>
          ))}
        </ul>
        <div className={s.actions}>
          <label htmlFor="cmp-add" className="sr-only">Add a model to the comparison</label>
          <select id="cmp-add" className={s.add} value="" disabled={full || !rest.length}
            onChange={(e) => { const v = e.target.value; if (v) setPicked((p) => (p.length < MAX ? [...p, v] : p)); }}>
            <option value="">{full ? `Maximum ${MAX} models` : rest.length ? "+ Add a model…" : "All models added"}</option>
            {rest.map((m) => <option key={m.slug} value={m.slug}>{label(m)} · {m.name}</option>)}
          </select>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPicked(initial)} disabled={picked.join() === initial.join()}>Reset</button>
        </div>
      </div>
      <p className={s.note}>{full ? `Comparing the maximum of ${MAX}. Remove one (×) to add another.` : `${chosen.length} of up to ${MAX} ${category.toLowerCase()} selected.`}</p>
      <p className="sr-only" aria-live="polite">{chosen.length > 1 ? `Comparing ${chosen.map(label).join(", ")}` : "Select at least two models to compare"}</p>
      {chosen.length < 2 ? (
        <p className={s.empty}>Add at least two models to compare.</p>
      ) : (
        <CompareTable cols={chosen} rows={rows} label={`Comparison of ${chosen.map(label).join(", ")}`} />
      )}
    </div>
  );
}

// ?cmp= is read with useSearchParams; the Suspense fallback renders the default selection so the page stays static.
function WithParams(props: { models: M[]; category: string }) {
  const cmp = useSearchParams().get(PARAM);
  return <Inner {...props} fromUrl={cmp} />;
}
export function CategoryCompare(props: { models: M[]; category: string }) {
  return <Suspense fallback={<Inner {...props} />}><WithParams {...props} /></Suspense>;
}
