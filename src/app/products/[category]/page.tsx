import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Brand";
import { ScrollActive } from "@/components/ScrollActive";
import { CategoryGrid } from "@/components/CategoryGrid";
import { waLink } from "@/content/company";
import { getCategories, getCategory, getFamilies, getProduct, toCard } from "@/lib/catalogue";
import s from "./category.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return getCategories().map((c) => ({ category: c.slug })); }

export async function generateMetadata({ params }: PageProps<"/products/[category]">): Promise<Metadata> {
  const c = getCategory((await params).category);
  return c ? { title: c.seoTitle, description: c.metaDescription, alternates: { canonical: `/products/${c.slug}` } } : {};
}

// Category template: header band · family switcher · filter chips + grid (CategoryGrid) · compare table · CONV-04 three tiles (Kärcher).
export default async function CategoryPage({ params }: PageProps<"/products/[category]">) {
  const c = getCategory((await params).category);
  if (!c) notFound();
  const fam = getFamilies().find((f) => f.slug === c.familySlug)!;
  const products = c.products.map((sl) => toCard(getProduct(sl)!));
  return (
    <>
      <section className={`band-surface ${s.head}`}>
        <div className="wrap">
          <nav aria-label="Breadcrumb" className={s.crumbs}><Link href="/products">Products</Link> / <Link href={`/products#${fam.slug}`}>{fam.name}</Link></nav>
          <div className={s.title}>
            <h1 className="h-xl">{c.name}</h1>
            <p className="mono">{products.length} model{products.length > 1 ? "s" : ""}</p>
          </div>
          {c.intro && <p className="lede" style={{ marginTop: 14 }}>{c.intro}</p>}
          <ul className={s.switch} id="cat-switch" aria-label={`Other ${fam.name.toLowerCase()} categories`}>
            {fam.categories.map((x) => <li key={x.slug}><Link href={`/products/${x.slug}`} className="chip" aria-current={x.slug === c.slug ? "page" : undefined}>{x.name}</Link></li>)}
          </ul>
          <ScrollActive selector="#cat-switch" />
        </div>
      </section>
      <section className="wrap section" style={{ paddingTop: "var(--space-7)" }}>
        <h2 className="sr-only">{c.name} models</h2>
        <CategoryGrid products={products} />
      </section>
      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <div className={s.tiles}>
          <Link href="/quote" className={`${s.tile} ${s.y}`}><span className="label" style={{ color: "var(--ink)" }}>01</span><b>Get a quote</b><span>Add models to your list and send one enquiry. <Arrow /></span></Link>
          <a href={waLink(`Hello, I need help choosing a ${c.name.toLowerCase()} model.`)} target="_blank" rel="noopener" className={s.tile}><span className="label">02</span><b>Help me choose</b><span>Tell an engineer about the site on WhatsApp. <Arrow /></span></a>
          <Link href="/cross-reference" className={s.tile}><span className="label">03</span><b>Replacing another brand?</b><span>Send the old model number and we suggest the SMART equivalent. <Arrow /></span></Link>
        </div>
      </section>
    </>
  );
}
