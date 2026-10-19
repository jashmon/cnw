import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Arrow } from "@/components/Brand";
import { ProductCard } from "@/components/ProductCard";
import { SystemDiagram } from "@/components/SystemDiagram";
import { getProduct, getSystems } from "@/lib/catalogue";

export const dynamicParams = false;
export function generateStaticParams() { return getSystems().map((s) => ({ slug: s.slug })); }
export async function generateMetadata({ params }: PageProps<"/systems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const sy = getSystems().find((x) => x.slug === slug);
  return sy ? { title: sy.seoTitle ?? `${sy.name} | SMART systems`, description: sy.metaDescription ?? sy.intro.slice(0, 155) } : {};
}

// System template: yellow hero · full-width diagram (PDP-06, ART-04) · numbered steps · components grid · CTA.
export default async function SystemPage({ params }: PageProps<"/systems/[slug]">) {
  const { slug } = await params;
  const sy = getSystems().find((x) => x.slug === slug);
  if (!sy) notFound();
  const comps = sy.components.map((c) => getProduct(c)).filter((p): p is NonNullable<typeof p> => !!p);
  return (
    <>
      <section className="page-head">
        <div className="wrap"><nav aria-label="Breadcrumb" className="mono" style={{ fontSize: ".8125rem" }}><Link href="/systems">Systems</Link></nav><h1 className="h-xl" style={{ marginTop: 10 }}>{sy.name}</h1><p className="lede" style={{ marginTop: 14, maxWidth: "70ch" }}>{sy.intro}</p></div>
      </section>
      <section className="wrap section" style={{ paddingBottom: "var(--space-7)" }}><SystemDiagram slug={sy.slug} /></section>
      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <h2 className="h-1" style={{ marginBottom: 20 }}>How it works</h2>
        <ol style={{ listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 12 }}>
          {sy.howItWorks.map((st, i) => (
            <li key={i} style={{ background: "var(--surface-2)", boxShadow: "var(--shadow-inset-line)", borderRadius: "var(--radius-md)", padding: 20, borderTop: "4px solid var(--yellow)" } as React.CSSProperties}>
              <span className="mono muted">{String(i + 1).padStart(2, "0")}</span><p style={{ marginTop: 8 }}>{st}</p>
            </li>
          ))}
        </ol>
      </section>
      {comps.length > 0 && (
        <section className="band-surface section">
          <div className="wrap">
            <h2 className="h-1" style={{ marginBottom: 20 }}>Components</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", gap: 14 }}>{comps.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
          </div>
        </section>
      )}
      <section className="band-dark section"><div className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <h2 className="h-1" style={{ color: "var(--yellow)", maxWidth: "20ch" }}>Planning a {sy.name.toLowerCase()}?</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn btn--yellow" href="/quote">Request a quote <Arrow /></Link><Link className="btn btn--ghost" href="/contact">Talk to an engineer</Link></div>
      </div></section>
    </>
  );
}
