"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { CardProduct as Product } from "@/lib/catalogue";
import { useSearch } from "./Header";
import { ProductCard } from "./ProductCard";
import s from "./CatalogueBrowser.module.css";

type Fam = { slug: string; name: string; categories: { slug: string; name: string; intro: string; products: Product[] }[] };

function Inner({ families, urlQ, syncUrl = false }: { families: Fam[]; urlQ: string; syncUrl?: boolean }) {
  const [q, setQ] = useState(urlQ);
  // a new ?q= from outside (header search, back/forward) replaces the field; our own URL writes match q, so they don't.
  // Adjusting state when a prop changes, per react.dev/learn/you-might-not-need-an-effect
  const [seenUrlQ, setSeenUrlQ] = useState(urlQ);
  if (urlQ !== seenUrlQ) { setSeenUrlQ(urlQ); if (urlQ !== q.trim()) setQ(urlQ); }
  // typing writes ?q= back to the address bar (debounced, other params kept) so searches can be shared and bookmarked
  useEffect(() => {
    if (!syncUrl) return;
    const t = setTimeout(() => {
      const u = new URL(location.href);
      const v = q.trim();
      if ((u.searchParams.get("q") ?? "") === v) return;
      if (v) u.searchParams.set("q", v); else u.searchParams.delete("q");
      history.replaceState(history.state, "", u.pathname + u.search + u.hash);
    }, 350);
    return () => clearTimeout(t);
  }, [q, syncUrl]);
  const [env, setEnv] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const all = useMemo(() => families.flatMap((f) => f.categories.flatMap((c) => c.products)), [families]);
  const index = useMemo(() => all.map((p) => ({ slug: p.slug, model: p.model, name: p.name, category: p.category, href: "", img: null, aliases: p.legacyNames })), [all]);
  const hits = useSearch(index, q, Infinity);
  // header search icon links to /products#cat-q: land with the cursor in the field
  useEffect(() => { if (location.hash === "#cat-q") document.getElementById("cat-q")?.focus(); }, []);
  const envs = useMemo(() => [...new Set(all.flatMap((p) => p.environment))].sort(), [all]);
  const searching = q.trim().length > 1;
  const visible = (p: Product) => (!env || p.environment.includes(env)) && (!searching || hits.some((h) => h.slug === p.slug));
  const count = all.filter(visible).length;
  // the first visible card is above the fold (and usually the Largest Contentful Paint): load it eagerly
  const firstSlug = all.find(visible)?.slug;
  const reset = () => { setQ(""); setEnv(null); document.getElementById("cat-q")?.focus(); };
  return (
    <>
      {/* sticky bar: one compact row on phones (search · Filters · count); chips fold into a panel */}
      <div className={`wrap ${s.bar}`}>
        <label htmlFor="cat-q" className="sr-only">Search models</label>
        <input id="cat-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Model code or name, e.g. CR-IIIPE, hooter" className={s.input} />
        <button type="button" className={s.toggle} aria-expanded={filtersOpen} aria-controls="cat-filters" onClick={() => setFiltersOpen((v) => !v)}>
          Filters{env ? " · 1" : ""}
        </button>
        <div id="cat-filters" role="group" aria-label="Environment" className={`chips ${s.chips}`} data-open={filtersOpen}>
          {envs.map((e) => <button key={e} type="button" className="chip" aria-pressed={env === e} onClick={() => setEnv(env === e ? null : e)} style={{ textTransform: "capitalize" }}>{e}</button>)}
        </div>
        <span className={`mono muted ${s.count}`} aria-live="polite">{count} of {all.length}</span>
        <label htmlFor="cat-fam" className="sr-only">Jump to a family</label>
        <select id="cat-fam" className={s.fam} data-open={filtersOpen} value="" onChange={(e) => { const v = e.target.value; if (v) document.getElementById(v)?.scrollIntoView({ block: "start" }); }}>
          <option value="">Jump to family…</option>
          {families.filter((f) => f.categories.some((c) => c.products.some(visible))).map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
        </select>
      </div>
      {families.map((f) => {
        const cats = f.categories.map((c) => ({ ...c, list: c.products.filter(visible) })).filter((c) => c.list.length);
        if (!cats.length) return null;
        return (
          <section key={f.slug} id={f.slug} className="wrap" style={{ paddingTop: "var(--space-7)", scrollMarginTop: 160 }}>
            <h2 className="h-1" style={{ borderBottom: "3px solid var(--ink)", paddingBottom: 10 }}>{f.name}</h2>
            {cats.map((c) => (
              <div key={c.slug} style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                  <h3 className="h-3"><Link href={`/products/${c.slug}`} style={{ textDecoration: "none" }}>{c.name}</Link></h3>
                  <Link className="link" href={c.products.length > 1 ? `/products/${c.slug}#compare` : `/products/${c.slug}`} style={{ fontWeight: 600, fontSize: ".9375rem" }}>{c.products.length > 1 ? `Compare ${c.products.length} models →` : "View category →"}</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 14 }}>{c.list.map((p) => <ProductCard key={p.slug} p={p} priority={p.slug === firstSlug} />)}</div>
              </div>
            ))}
          </section>
        );
      })}
      {count === 0 && (
        <div className="wrap section" role="status">
          <p className="h-3">{searching ? <>No model matches “{q}”{env ? <> in {env}</> : null}.</> : <>No models match these filters.</>}</p>
          <p className="muted" style={{ marginTop: 6 }}>Try fewer letters, or <Link className="inline" href="/cross-reference">send us the code</Link>.</p>
          <button type="button" className="btn btn--ghost btn--sm" style={{ marginTop: 16 }} onClick={reset}>Reset search and filters</button>
        </div>
      )}
      <div style={{ height: "var(--space-7)" }} />
    </>
  );
}

// ?q= is read with useSearchParams and kept in sync both ways (see Inner).
// The Suspense fallback renders the full, unfiltered catalogue, so the page stays static and indexable.
function WithParams({ families }: { families: Fam[] }) {
  const q = useSearchParams().get("q") ?? "";
  return <Inner families={families} urlQ={q} syncUrl />;
}
export function CatalogueBrowser({ families }: { families: Fam[] }) {
  return <Suspense fallback={<Inner families={families} urlQ="" />}><WithParams families={families} /></Suspense>;
}
