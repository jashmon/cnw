import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Brand";
import { getIndustries } from "@/lib/catalogue";

export const metadata: Metadata = { title: "Industries: SMART communication for cement, steel, power and more | Cables & Wireless Co.", description: "SMART industrial telephones, PA systems, alarms and bag counters by industry: cement, steel and metals, power, pharma clean rooms, fertiliser, ports and highways, rail, mining." };

export default function Industries() {
  return (
    <>
      <section className="band-dark" style={{ paddingBlock: "var(--space-8) var(--space-7)" }}>
        <div className="wrap"><p className="label">Industries</p><h1 className="h-xl" style={{ marginTop: 8, color: "var(--yellow)" }}>Where SMART works.</h1></div>
      </section>
      <section className="wrap section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 340px), 1fr))", gap: 12 }}>
        {getIndustries().map((ind, i) => (
          <Link key={ind.slug} href={`/industries/${ind.slug}`} className="lift reveal" style={{ "--d": `${i * 40}ms`, display: "grid", gap: 10, padding: 24, background: "var(--surface-2)", boxShadow: "var(--shadow-inset-line)", borderRadius: "var(--radius-md)", textDecoration: "none", borderTop: "4px solid var(--yellow)" } as React.CSSProperties}>
            <span className="h-2">{ind.name}</span><span className="muted" style={{ fontSize: ".9688rem" }}>{ind.intro.replace(/\[\[[^\]]+\]\]/g, "").slice(0, 150).replace(/\s+\S*$/, "")}…</span><span className="link" style={{ fontWeight: 600 }}>See products <Arrow /></span>
          </Link>
        ))}
      </section>
    </>
  );
}
