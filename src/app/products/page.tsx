import type { Metadata } from "next";
import Link from "next/link";
import { CatalogueBrowser } from "@/components/CatalogueBrowser";
import { getFamilies, getProduct, getProducts, toCard } from "@/lib/catalogue";

export const metadata: Metadata = { title: "All SMART products: 83 industrial communication models | Cables & Wireless Co.", description: "Browse every SMART model: industrial and weatherproof telephones, plant PA systems, clean-room phones, call boxes, hooters, voice alarms, bag counters, LED lights.", alternates: { canonical: "/products" } };

// Catalogue index: search + filters across all models (NAV-04, McMaster-style facets), then families as sections.
export default function ProductsIndex() {
  const fams = getFamilies();
  const all = getProducts();
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="label">Products</p>
          <h1 className="h-xl" style={{ marginTop: 8 }}>{all.length} models. One maker.</h1>
          <nav aria-label="Families" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {fams.map((f) => <a key={f.slug} href={`#${f.slug}`} className="chip" style={{ textDecoration: "none" }}>{f.name}</a>)}
          </nav>
        </div>
      </section>
      <CatalogueBrowser families={fams.map((f) => ({ slug: f.slug, name: f.name, categories: f.categories.map((c) => ({ slug: c.slug, name: c.name, intro: c.intro, products: c.products.map((sl) => toCard(getProduct(sl)!)) })) }))} />
      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <p className="muted">Can&apos;t find a model from an old purchase order? <Link className="inline" href="/cross-reference">Send us the code</Link> and we&apos;ll match it.</p>
      </section>
    </>
  );
}
