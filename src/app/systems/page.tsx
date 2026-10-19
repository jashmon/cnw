import type { Metadata } from "next";
import Link from "next/link";
import { Arrow } from "@/components/Brand";
import { getSystems } from "@/lib/catalogue";

export const metadata: Metadata = { title: "SMART systems: plant PA, hotline, highway call boxes, bag counting | Cables & Wireless Co.", description: "How SMART products connect into complete systems: plant-wide PA and paging, hotline networks, highway emergency call boxes and bag-counting dispatch lines." };

export default function Systems() {
  const systems = getSystems();
  return (
    <>
      <section className="page-head">
        <div className="wrap"><p className="label">Systems</p><h1 className="h-xl" style={{ marginTop: 8, maxWidth: "16ch" }}>How the pieces connect.</h1></div>
      </section>
      <section className="wrap section" style={{ display: "grid", gap: 14 }}>
        {systems.map((sy, i) => (
          <Link key={sy.slug} href={`/systems/${sy.slug}`} className="lift reveal" style={{ "--d": `${i * 60}ms`, display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 20, alignItems: "center", padding: "26px 24px", border: "2px solid var(--ink)", borderRadius: "var(--radius-md)", background: "var(--surface-2)", textDecoration: "none" } as React.CSSProperties}>
            <span className="mono" style={{ fontSize: "1.25rem" }}>{String(i + 1).padStart(2, "0")}</span>
            <span><span className="h-2" style={{ display: "block" }}>{sy.name}</span><span className="muted" style={{ display: "block", marginTop: 6, maxWidth: "80ch" }}>{sy.intro}</span></span>
            <span className="btn btn--ghost" aria-hidden="true">See it <Arrow /></span>
          </Link>
        ))}
      </section>
    </>
  );
}
