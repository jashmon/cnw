import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToQuote } from "@/components/AddToQuote";
import { Arrow, SmartMark } from "@/components/Brand";
import { Gallery } from "@/components/Gallery";
import { MobileBar } from "@/components/MobileBar";
import { ProductCard } from "@/components/ProductCard";
import { SpecTables } from "@/components/SpecTables";
import { company, waLink } from "@/content/company";
import { getCategory, getProduct, getProducts, getSystems, productHref } from "@/lib/catalogue";
import s from "./pdp.module.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return getProducts().map((p) => ({ category: p.categorySlug, slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[category]/[slug]">): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const img = p.images[0];
  return {
    title: p.seoTitle, description: p.metaDescription,
    alternates: { canonical: productHref(p) },
    openGraph: img ? { images: [{ url: img.src, width: img.w, height: img.h, alt: img.alt }] } : undefined,
  };
}

const kb = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

// PDP spine (E2S + Talkaphone + Viking + Matrix): PDP-01 gallery · PDP-02 title/chips · PDP-08 actions · PDP-01 ideal-for ·
// intro + highlights · PDP-07 specs · PDP-03 compare · PDP-06 system · PDP-05 downloads · FAQ · PDP-09 related · CTA band.
export default async function ProductPage({ params }: PageProps<"/products/[category]/[slug]">) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = getCategory(p.categorySlug)!;
  const all = getProducts();
  const href = productHref(p);
  const code = p.model || p.name;
  const item = { slug: p.slug, model: code, name: p.name, href, img: p.images[0]?.src ?? null };
  const siblings = [...new Set([...p.variants, ...cat.products])].filter((x) => x !== p.slug).map((x) => all.find((a) => a.slug === x)!).filter(Boolean);
  const compare = [p, ...siblings].slice(0, 4);
  const compareKeys = [...new Set(compare.flatMap((c) => Object.values(c.specGroups).flatMap((g) => Object.keys(g))))].filter((k) => compare.filter((c) => Object.values(c.specGroups).some((g) => k in g)).length >= 2).slice(0, 10);
  const specOf = (c: typeof p, k: string) => { for (const g of Object.values(c.specGroups)) if (k in g) return g[k]; return "—"; };
  const related = (p.related.length ? p.related : siblings.map((x) => x.slug)).map((x) => all.find((a) => a.slug === x)!).filter(Boolean).slice(0, 4);
  const system = getSystems().find((sy) => sy.components?.includes(p.slug));

  const jsonld = [
    {
      "@context": "https://schema.org", "@type": "Product", name: `SMART ${p.model} ${p.name}`.replace("  ", " "), ...(p.model ? { sku: p.model, mpn: p.model } : {}), description: p.intro,
      brand: { "@type": "Brand", name: "SMART" }, manufacturer: { "@type": "Organization", name: company.name },
      image: p.images.map((i) => `${company.url}${i.src}`), category: p.category, url: `${company.url}${href}`,
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Products", item: `${company.url}/products` },
        { "@type": "ListItem", position: 2, name: cat.name, item: `${company.url}/products/${cat.slug}` },
        { "@type": "ListItem", position: 3, name: code, item: `${company.url}${href}` },
      ],
    },
  ];

  return (
    <>
      <div className="wrap">
        <nav aria-label="Breadcrumb" className={s.crumbs}>
          <Link href="/products">Products</Link><span aria-hidden="true">/</span>
          <Link href={`/products#${p.familySlug}`}>{p.family}</Link><span aria-hidden="true">/</span>
          <Link href={`/products/${cat.slug}`}>{cat.name}</Link><span aria-hidden="true">/</span>
          <span aria-current="page" className="mono">{code}</span>
        </nav>
      </div>

      <section className={`wrap ${s.top}`}>
        <div className={s.gal}><Gallery images={p.images} model={code} /></div>
        <div className={s.info}>
          <div className={s.brandRow}><SmartMark height={26} />{p.model && <span className="code code--lg">{p.model}</span>}</div>
          <h1 className={`h-1 ${s.h1}`}>{p.name}</h1>
          <p className="lede">{p.cardLine}</p>
          {p.keySpecs.length > 0 && <div className="chips" style={{ marginTop: 18 }}>{p.keySpecs.map((k) => <span key={k} className="spec-chip">{k}</span>)}</div>}
          <div className={s.actions}>
            <AddToQuote item={item} />
            {p.datasheet
              ? <a className="btn btn--ghost" href={p.datasheet.href} download={`SMART-${p.model || p.slug}-datasheet.pdf`}>Datasheet · PDF {kb(p.datasheet.bytes)} <span className="arr" aria-hidden="true"><i>↓</i><i>↓</i></span></a>
              : <a className="btn btn--ghost" href={waLink(`Hello, please send the datasheet for SMART ${code}.`)} target="_blank" rel="noopener">Datasheet on request</a>}
          </div>
          <p className={s.ask}><a className="link" href={waLink(`Hello, I have a question about SMART ${code}.`)} target="_blank" rel="noopener">Ask an engineer about {p.model || "this"} on WhatsApp →</a></p>
          <dl className={s.facts}>
            <div><dt className="label">Category</dt><dd><Link className="link" href={`/products/${cat.slug}`}>{cat.name}</Link></dd></div>
            {p.environment.length > 0 && <div><dt className="label">Environment</dt><dd>{p.environment.join(" · ")}</dd></div>}
            {p.interface && <div><dt className="label">Interface</dt><dd>{p.interface}</dd></div>}
          </dl>
        </div>
      </section>

      {p.idealFor.length > 0 && (
        <section className={s.ideal}>
          <div className="wrap">
            <h2 className="label" style={{ color: "var(--ink)" }}>Ideal for</h2>
            <ul className={s.pills}>{p.idealFor.map((x) => <li key={x}><span aria-hidden="true">✓</span>{x}</li>)}</ul>
          </div>
        </section>
      )}

      <section className={`wrap section ${s.two}`}>
        <div>
          <h2 className="h-1" style={{ marginBottom: 16 }}>What it does</h2>
          <p className="lede measure" style={{ maxWidth: "60ch" }}>{p.intro}</p>
        </div>
        {p.highlights.length > 0 && (
          <ol className={s.hl}>
            {p.highlights.map((h, n) => <li key={h}><span className="mono">{String(n + 1).padStart(2, "0")}</span><p>{h}</p></li>)}
          </ol>
        )}
      </section>

      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <SpecTables groups={p.specGroups} model={p.model} name={p.name} />
      </section>

      {compare.length > 1 && compareKeys.length > 0 && (
        <section className="band-surface section">
          <div className="wrap">
            <h2 className="h-1" style={{ marginBottom: 20 }}>Compare with similar models</h2>
            <div className={s.cmpWrap}>
              <table className={`table ${s.cmp}`}>
                <thead><tr><th scope="col" className="sr-only">Spec</th>{compare.map((c) => <th key={c.slug} scope="col" className={c.slug === p.slug ? s.me : ""}>{c.slug === p.slug ? <span className="code">{c.model || "This system"}</span> : <Link href={productHref(c)} className="code" style={{ background: "transparent", border: "1.5px solid var(--ink)" }}>{c.model || "Multi-channel"}</Link>}<div className={s.cname}>{c.name}</div></th>)}</tr></thead>
                <tbody>{compareKeys.map((k) => <tr key={k}><th scope="row">{k}</th>{compare.map((c) => <td key={c.slug} className={c.slug === p.slug ? s.me : ""}>{specOf(c, k)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {system && (
        <section className="wrap section">
          <div className={s.sys}>
            <div><p className="label">Part of a system</p><h2 className="h-2" style={{ margin: "6px 0 10px" }}>{system.name}</h2><p className="muted measure">{system.intro}</p></div>
            <Link className="btn" href={`/systems/${system.slug}`}>How the system works <Arrow /></Link>
          </div>
        </section>
      )}

      {(p.datasheet || p.faq.length > 0) && (
        <section className={`wrap section ${s.two}`} style={{ paddingTop: system ? 0 : undefined }}>
          {p.datasheet && (
            <div>
              <h2 className="h-2" style={{ marginBottom: 14 }}>Downloads</h2>
              <a className={s.file} href={p.datasheet.href} download={`SMART-${p.model || p.slug}-datasheet.pdf`}>
                <span className={s.ext}>PDF</span><span><b>SMART {code} datasheet</b><small className="mono">{kb(p.datasheet.bytes)}{p.datasheet.sharedWith.length > 0 ? ` · shared with ${p.datasheet.sharedWith.map((x) => all.find((a) => a.slug === x)?.model ?? x).join(", ")}` : ""}</small></span><span aria-hidden="true">↓</span>
              </a>
            </div>
          )}
          {p.faq.length > 0 && (
            <div>
              <h2 className="h-2" style={{ marginBottom: 14 }}>Questions</h2>
              {p.faq.map((f) => <details key={f.q} className={s.faq}><summary>{f.q}<span aria-hidden="true">+</span></summary><p>{f.a}</p></details>)}
            </div>
          )}
        </section>
      )}

      {related.length > 0 && (
        <section className="wrap section" style={{ paddingTop: 0 }}>
          <div className={s.relHead}><h2 className="h-1">Related models</h2><Link className="link" href={`/products/${cat.slug}`}>All {cat.name.toLowerCase()} →</Link></div>
          <div className={s.rel}>{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
        </section>
      )}

      <section className="band-dark section">
        <div className={`wrap ${s.cta}`}>
          <h2 className="h-xl" style={{ color: "var(--yellow)", maxWidth: "16ch" }}>Need {p.model || "this system"} for a project?</h2>
          <div className={s.ctaR}>
            <p className="muted">Tell us the quantity, the plant and the timeline. We reply with a quotation.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <AddToQuote item={item} variant="yellow" />
              <Link className="btn btn--ghost" href="/quote">Go to quote list <Arrow /></Link>
            </div>
          </div>
        </div>
      </section>
      <MobileBar item={item} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
    </>
  );
}
