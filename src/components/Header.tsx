"use client";
/* eslint-disable @next/next/no-img-element */
// NAV-01 dual-axis mega-menu (GAI-Tronics, Viking) + NAV-02 utility strip + NAV-03 project CTA (Talkaphone) + NAV-04 model search.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQuote } from "@/lib/quote";
import { company, waLink } from "@/content/company";
import { Arrow, Logo, Tile } from "./Brand";
import s from "./Header.module.css";

export type NavFamily = { slug: string; name: string; categories: { slug: string; name: string; count: number }[] };
export type SearchItem = { slug: string; model: string; name: string; category: string; href: string; img: string | null; aliases: string[] };
type Props = { families: NavFamily[]; industries: { slug: string; name: string }[]; index: SearchItem[]; featured: SearchItem | null };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2").replace(/iv/g, "4").replace(/(?<![a-z])i(?![a-z])/g, "1");

export function useSearch(index: SearchItem[], q: string) {
  return useMemo(() => {
    const n = norm(q);
    if (n.length < 2) return [];
    const scored = index.map((it) => {
      const m = norm(it.model), name = norm(it.name), al = it.aliases.map(norm);
      let sc = 0;
      if (m === n) sc = 100; else if (m.startsWith(n)) sc = 80; else if (m.includes(n)) sc = 60;
      else if (al.some((a) => a.includes(n))) sc = 45; else if (name.includes(n)) sc = 40; else if (norm(it.category).includes(n)) sc = 20;
      else {
        const words = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (words.length && words.every((w) => (it.name + " " + it.category + " " + it.model).toLowerCase().includes(w))) sc = 30;
      }
      return { it, sc };
    }).filter((x) => x.sc > 0).sort((a, b) => b.sc - a.sc || a.it.model.localeCompare(b.it.model));
    return scored.slice(0, 8).map((x) => x.it);
  }, [index, q]);
}

function Search({ index, onGo }: { index: SearchItem[]; onGo?: () => void }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const router = useRouter();
  const id = useId();
  const res = useSearch(index, q);
  const go = (href: string) => { setOpen(false); setQ(""); onGo?.(); router.push(href); };
  return (
    <div className={s.search}>
      <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M11 11l4 4" stroke="currentColor" strokeWidth="2" /></svg>
      <label htmlFor={`${id}-i`} className="sr-only">Search models</label>
      <input id={`${id}-i`} value={q} placeholder="Search models, e.g. WMHS-III" autoComplete="off" role="combobox" aria-expanded={open && q.trim().length > 1} aria-autocomplete="list" aria-controls={`${id}-r`} aria-activedescendant={open && res[sel] ? `${id}-o${sel}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setSel(0); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setSel((v) => Math.min(v + 1, res.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setSel((v) => Math.max(v - 1, 0)); }
          else if (e.key === "Enter") { e.preventDefault(); if (res[sel]) go(res[sel].href); else if (q) go(`/products?q=${encodeURIComponent(q)}`); }
          else if (e.key === "Escape") setOpen(false);
        }} />
      {open && q.trim().length > 1 && (
        <ul className={s.results} id={`${id}-r`} role="listbox">
          {res.length ? res.map((r, i) => (
            <li key={r.slug} id={`${id}-o${i}`} role="option" aria-selected={i === sel}>
              <a href={r.href} onMouseDown={(e) => { e.preventDefault(); go(r.href); }}><span className="code">{r.model}</span><b>{r.name}</b><small>{r.category}</small></a>
            </li>
          )) : <li className={s.none}>No model matches “{q}”. Try the code on your old PO, or <a className="inline" href={waLink(`Looking for: ${q}`)}>ask on WhatsApp</a>.</li>}
        </ul>
      )}
    </div>
  );
}

export function Header({ families, industries, index, featured }: Props) {
  const q = useQuote();
  const path = usePathname();
  const [mega, setMega] = useState<null | "products" | "industries">(null);
  const [sheet, setSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaSeen, setMegaSeen] = useState(false);
  if (mega === "products" && !megaSeen) setMegaSeen(true);
  const [lastPath, setLastPath] = useState(path);
  if (path !== lastPath) { setLastPath(path); setMega(null); setSheet(false); }
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { const f = () => setScrolled(scrollY > 80); f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f); }, []);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && setMega(null); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  useEffect(() => { document.body.style.overflow = sheet ? "hidden" : ""; }, [sheet]);
  const hover = (v: typeof mega) => { clearTimeout(timer.current); timer.current = setTimeout(() => setMega(v), v ? 120 : 180); };
  const cur = (href: string) => (path === href || path.startsWith(href + "/") ? "page" : undefined);

  return (
    <>
      <div className={s.util}>
        <div className="wrap">
          <div className={s.l}>
            <a href={`tel:${company.phones[0].tel}`}>☎ {company.phones[0].display}</a>
            <a href={waLink("Hello Cables & Wireless Co.")} target="_blank" rel="noopener"><span className={s.dot} />WhatsApp</a>
            <span>{company.hours}</span>
          </div>
          <div className={s.r}>
            <Link href="/downloads">Downloads</Link>
            <Link href="/vendor-kit">Vendor kit</Link>
            <Link href="/installed-at">Installed at</Link>
          </div>
        </div>
      </div>
      <header className={`${s.bar} ${scrolled ? s.scrolled : ""}`} onMouseLeave={() => hover(null)}>
        <div className={`wrap ${s.inner}`}>
          <Link href="/" className={s.logo} aria-label="Cables & Wireless Co. home">
            <span className="hide-sm"><Logo variant="yellow" height={scrolled ? 38 : 46} /></span>
            <span className="show-sm"><Tile variant="yellow" size={40} /></span>
          </Link>
          <nav aria-label="Main">
            <ul className={s.nav}>
              <li><button aria-expanded={mega === "products"} aria-controls="mega-products" onMouseEnter={() => hover("products")} onClick={() => setMega(mega === "products" ? null : "products")}>Products <span className={s.chev}>▼</span></button></li>
              <li><button aria-expanded={mega === "industries"} aria-controls="mega-industries" onMouseEnter={() => hover("industries")} onClick={() => setMega(mega === "industries" ? null : "industries")}>Industries <span className={s.chev}>▼</span></button></li>
              <li onMouseEnter={() => hover(null)}><Link href="/systems" aria-current={cur("/systems")}>Systems</Link></li>
              <li onMouseEnter={() => hover(null)}><Link href="/installed-at" aria-current={cur("/installed-at")}>Installed at</Link></li>
              <li onMouseEnter={() => hover(null)}><Link href="/about" aria-current={cur("/about")}>About</Link></li>
              <li onMouseEnter={() => hover(null)}><Link href="/contact" aria-current={cur("/contact")}>Contact</Link></li>
            </ul>
          </nav>
          <div className={s.right}>
            <Search index={index} />
            <button className={s.badgeBtn} onClick={() => q.setOpen(true)} data-quote-badge>
              <span className="txt">Quote</span><span key={q.bump} className={`badge ${q.bump ? "bump" : ""}`}>{q.count}</span><span className="sr-only"> items in quote list</span>
            </button>
            <Link href="/quote" className={`btn btn--yellow ${s.cta}`} style={{ "--btn-bg": "var(--ink)", "--btn-fg": "var(--yellow)", "--btn-sweep": "var(--surface-2)", "--btn-sweep-fg": "var(--ink)" } as React.CSSProperties}>Request a quote <Arrow /></Link>
            <button className={s.burger} aria-expanded={sheet} aria-controls="m-sheet" aria-label="Menu" onClick={() => setSheet(!sheet)}><i /><i /><i /></button>
          </div>
        </div>

        <div id="mega-products" className={`${s.mega} ${mega === "products" ? s.open : ""}`} onMouseEnter={() => hover("products")} inert={mega !== "products"}>
          <div className={`wrap ${s.megaGrid}`}>
            {families.map((f) => (
              <div key={f.slug} className={s.fam}>
                <h3>{f.name}</h3>
                <ul>{f.categories.map((c) => <li key={c.slug}><Link href={`/products/${c.slug}`}>{c.name}<span>{c.count}</span></Link></li>)}</ul>
              </div>
            ))}
            {featured && (
              <Link href={featured.href} className={s.feat}>
                <div><span className="code" style={{ background: "var(--ink)", color: "var(--yellow)" }}>{featured.model}</span></div>
                <strong>{featured.name}</strong>
                <span className="link" style={{ fontWeight: 600, position: "relative", zIndex: 1 }}>All {index.length} models →</span>
                {featured.img && megaSeen && <img src={`/_next/image?url=${encodeURIComponent(featured.img)}&w=640&q=75`} alt="" loading="lazy" />}
              </Link>
            )}
          </div>
        </div>
        <div id="mega-industries" className={`${s.mega} ${mega === "industries" ? s.open : ""}`} onMouseEnter={() => hover("industries")} inert={mega !== "industries"}>
          <div className="wrap" style={{ paddingBlock: 28, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {industries.map((i) => (
              <Link key={i.slug} href={`/industries/${i.slug}`} className="btn btn--ghost" style={{ justifyContent: "space-between" }}>{i.name} <Arrow /></Link>
            ))}
          </div>
        </div>
      </header>

      <div id="m-sheet" className={`${s.sheet} ${sheet ? s.open : ""}`} inert={!sheet}>
        <div style={{ margin: "6px 0 12px" }}><Search index={index} onGo={() => setSheet(false)} /></div>
        <details>
          <summary>Products <span>+</span></summary>
          <div className={s.sub}>
            {families.map((f) => (<div key={f.slug} style={{ display: "contents" }}><b>{f.name}</b>{f.categories.map((c) => <Link key={c.slug} href={`/products/${c.slug}`}>{c.name}</Link>)}</div>))}
          </div>
        </details>
        <details>
          <summary>Industries <span>+</span></summary>
          <div className={s.sub}>{industries.map((i) => <Link key={i.slug} href={`/industries/${i.slug}`}>{i.name}</Link>)}</div>
        </details>
        <Link href="/systems">Systems</Link>
        <Link href="/installed-at">Installed at</Link>
        <Link href="/about">About</Link>
        <Link href="/downloads">Downloads</Link>
        <Link href="/contact">Contact</Link>
        <div className={s.acts}>
          <a className="btn" href={`tel:${company.phones[0].tel}`}>Call</a>
          <a className="btn btn--ghost" href={waLink("Hello Cables & Wireless Co.")} target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </>
  );
}
