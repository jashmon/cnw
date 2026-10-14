"use client";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { CardProduct as Product } from "@/lib/catalogue";
import { useSearch } from "./Header";
import { ProductCard } from "./ProductCard";

type Fam = { slug: string; name: string; categories: { slug: string; name: string; intro: string; products: Product[] }[] };

// ?q= from the header search is read after hydration (server snapshot ""), so the full catalogue is server-rendered.
const noop = () => () => {};
function Inner({ families }: { families: Fam[] }) {
  const urlQ = useSyncExternalStore(noop, () => new URLSearchParams(location.search).get("q") ?? "", () => "");
  const [typed, setQ] = useState<string | null>(null);
  const q = typed ?? urlQ;
  const [env, setEnv] = useState<string | null>(null);
  const all = useMemo(() => families.flatMap((f) => f.categories.flatMap((c) => c.products)), [families]);
  const index = useMemo(() => all.map((p) => ({ slug: p.slug, model: p.model, name: p.name, category: p.category, href: "", img: null, aliases: p.legacyNames })), [all]);
  const hits = useSearch(index, q);
  const envs = useMemo(() => [...new Set(all.flatMap((p) => p.environment))].sort(), [all]);
  const searching = q.trim().length > 1;
  const visible = (p: Product) => (!env || p.environment.includes(env)) && (!searching || hits.some((h) => h.slug === p.slug));
  const count = all.filter(visible).length;
  return (
    <>
      <div className="wrap" style={{ position: "sticky", top: "var(--header-h)", zIndex: 5, background: "var(--ground)", paddingBlock: 16, borderBottom: "1px solid var(--line)", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label htmlFor="cat-q" className="sr-only">Search models</label>
        <input id="cat-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Model code or name, e.g. CR-IIIPE, hooter" style={{ flex: "1 1 260px", height: 46, border: "2px solid var(--ink)", borderRadius: "var(--radius-sm)", padding: "0 14px", fontFamily: "var(--font-mono)", background: "var(--surface-2)" }} />
        <div role="group" aria-label="Environment" className="chips">
          {envs.map((e) => <button key={e} type="button" className="chip" aria-pressed={env === e} onClick={() => setEnv(env === e ? null : e)} style={{ textTransform: "capitalize" }}>{e}</button>)}
        </div>
        <span className="mono muted" aria-live="polite" style={{ fontSize: ".875rem", marginLeft: "auto" }}>{count} of {all.length}</span>
      </div>
      {families.map((f) => {
        const cats = f.categories.map((c) => ({ ...c, list: c.products.filter(visible) })).filter((c) => c.list.length);
        if (!cats.length) return null;
        return (
          <section key={f.slug} id={f.slug} className="wrap" style={{ paddingTop: "var(--space-8)", scrollMarginTop: 160 }}>
            <h2 className="h-1" style={{ borderBottom: "3px solid var(--ink)", paddingBottom: 10 }}>{f.name}</h2>
            {cats.map((c) => (
              <div key={c.slug} style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                  <h3 className="h-3"><Link href={`/products/${c.slug}`} style={{ textDecoration: "none" }}>{c.name}</Link></h3>
                  <Link className="link" href={`/products/${c.slug}`} style={{ fontWeight: 600, fontSize: ".9375rem" }}>Category page · compare {c.products.length} →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 14 }}>{c.list.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
              </div>
            ))}
          </section>
        );
      })}
      {count === 0 && <div className="wrap section"><p className="h-3">No model matches “{q}”.</p><p className="muted">Try fewer letters, or <Link className="inline" href="/cross-reference">send us the code</Link>.</p></div>}
      <div style={{ height: "var(--space-8)" }} />
    </>
  );
}
export function CatalogueBrowser(props: { families: Fam[] }) {
  return <Inner {...props} />;
}
