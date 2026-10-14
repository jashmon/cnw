import Link from "next/link";
import { company } from "@/content/company";

// 404 with a route back (anti-pattern: never a bare template).
export default function NotFound() {
  return (
    <section className="wrap section" style={{ minHeight: "60vh" }}>
      <p className="label">404</p>
      <h1 className="h-hero" style={{ margin: "10px 0 18px" }}>Line busy.</h1>
      <p className="lede">That page isn&apos;t here. The old cnwcom.in and voizlink.in addresses forward automatically. If you followed one and landed here, the model may have a new name.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
        <Link className="btn" href="/products">Browse all models</Link>
        <Link className="btn btn--ghost" href="/contact">Ask us</Link>
        <a className="btn btn--ghost" href={`tel:${company.phones[0].tel}`}>Call {company.phones[0].display}</a>
      </div>
    </section>
  );
}
