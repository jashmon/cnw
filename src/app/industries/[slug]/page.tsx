import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Brand";
import { ProductCard } from "@/components/ProductCard";
import { CLIENT_NAMES_CONSENT } from "@/content/clients";
import { getIndustries, getProduct, getSystems } from "@/lib/catalogue";
import { clean } from "@/lib/text";

export const dynamicParams = false;
export function generateStaticParams() { return getIndustries().map((i) => ({ slug: i.slug })); }
export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const ind = getIndustries().find((x) => x.slug === slug);
  return ind ? { title: ind.seoTitle, description: ind.metaDescription } : {};
}

// Industry template: dark hero with problems · recommended products · sector proof (names gated by consent) · related system.
export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const ind = getIndustries().find((x) => x.slug === slug);
  if (!ind) notFound();
  const prods = ind.recommendedProducts.map((p) => getProduct(p)).filter((p): p is NonNullable<typeof p> => !!p);
  const sys = getSystems().find((sy) => sy.components.some((c) => ind.recommendedProducts.includes(c)));
  return (
    <>
      <section className="band-dark" style={{ paddingBlock: "var(--space-8)" }}>
        <div className="wrap">
          <nav aria-label="Breadcrumb" className="mono" style={{ fontSize: ".8125rem" }}><Link href="/industries">Industries</Link></nav>
          <h1 className="h-xl" style={{ color: "var(--yellow)", marginTop: 10 }}>{ind.name}</h1>
          <p className="lede" style={{ marginTop: 14, maxWidth: "70ch" }}>{clean(ind.intro)}</p>
          <ol style={{ listStyle: "none", padding: 0, marginTop: 36, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 12 }}>
            {ind.problems.map((pr, i) => <li key={i} className="reveal" style={{ "--d": `${i * 80}ms`, borderTop: "2px solid var(--yellow)", paddingTop: 14 } as React.CSSProperties}><span className="mono" style={{ color: "var(--yellow)" }}>{String(i + 1).padStart(2, "0")}</span><p style={{ marginTop: 6 }}>{pr}</p></li>)}
          </ol>
        </div>
      </section>
      <section className="wrap section">
        <h2 className="h-1" style={{ marginBottom: 20 }}>Recommended for {ind.name.toLowerCase()}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 14 }}>{prods.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
      {ind.clientsInSector.length > 0 && (
        <section className="band-yellow section"><div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div><p className="label">Installed in this sector</p><p className="h-1" style={{ marginTop: 6 }}>{ind.clientsInSector.length} client group{ind.clientsInSector.length > 1 ? "s" : ""} on the 2014 list</p>
            {CLIENT_NAMES_CONSENT && <p style={{ marginTop: 10 }}>{ind.clientsInSector.map((c) => c.name).join(" · ")}</p>}</div>
          <Link className="btn" href="/installed-at">Where SMART is installed <Arrow /></Link>
        </div></section>
      )}
      {sys && (
        <section className="wrap section"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", border: "2px solid var(--ink)", borderRadius: "var(--radius-md)", padding: 28, background: "var(--surface-2)" }}>
          <div><p className="label">Related system</p><h2 className="h-2" style={{ marginTop: 6 }}>{sys.name}</h2></div>
          <Link className="btn" href={`/systems/${sys.slug}`}>How it connects <Arrow /></Link>
        </div></section>
      )}
    </>
  );
}
