"use client";
import { useMemo, useState } from "react";
import type { CardProduct as Product } from "@/lib/catalogue";
import { ProductCard } from "./ProductCard";

// Filter chips (environment / interface) + grid. Filtering is client-side; all cards are server-rendered first.
export function CategoryGrid({ products }: { products: Product[] }) {
  const envs = useMemo(() => [...new Set(products.flatMap((p) => p.environment))].sort(), [products]);
  const ifs = useMemo(() => [...new Set(products.map((p) => p.interface).filter(Boolean))].sort(), [products]);
  const [env, setEnv] = useState<string | null>(null);
  const [itf, setItf] = useState<string | null>(null);
  const list = products.filter((p) => (!env || p.environment.includes(env)) && (!itf || p.interface === itf));
  const showFilters = envs.length > 1 || ifs.length > 1;
  return (
    <>
      {showFilters && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 24 }} role="group" aria-label="Filter models">
          <span className="label" style={{ marginRight: 6 }}>Filter</span>
          {envs.length > 1 && envs.map((e) => <button key={e} type="button" className="chip" aria-pressed={env === e} onClick={() => setEnv(env === e ? null : e)} style={{ textTransform: "capitalize" }}>{e}</button>)}
          {ifs.length > 1 && ifs.map((e) => <button key={e} type="button" className="chip" aria-pressed={itf === e} onClick={() => setItf(itf === e ? null : e)}>{e}</button>)}
          {(env || itf) && <button type="button" className="link" style={{ border: 0, background: "none", cursor: "pointer", marginLeft: 6 }} onClick={() => { setEnv(null); setItf(null); }}>Clear</button>}
          <span className="mono muted" aria-live="polite" style={{ marginLeft: "auto", fontSize: ".875rem" }}>{list.length} shown</span>
        </div>
      )}
      {list.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))", gap: 16 }}>
          {list.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 3} />)}
        </div>
      ) : (
        <div role="status" style={{ border: "2px dashed var(--line)", borderRadius: "var(--radius-md)", padding: "clamp(24px,4vw,48px)", textAlign: "center" }}>
          <p className="h-3">No models match these filters.</p>
          <p className="muted" style={{ marginTop: 6 }}>{[env, itf].filter(Boolean).join(" + ")} has no model in this category.</p>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 16 }} onClick={() => { setEnv(null); setItf(null); }}>Reset filters</button>
        </div>
      )}
    </>
  );
}
