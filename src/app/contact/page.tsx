import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { company, waLink } from "@/content/company";

export const metadata: Metadata = { title: "Contact | Cables & Wireless Co., Nagpur", description: "Call, WhatsApp or write to Cables & Wireless Co., makers of SMART industrial communication equipment. MIDC T-Point, Amravati Road, Wadi, Nagpur 440023." };

export default function ContactPage() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address.mapsQuery)}`;
  return (
    <>
      <section className="band-yellow" style={{ paddingBlock: "var(--space-8) var(--space-7)" }}>
        <div className="wrap"><p className="label">Contact</p><h1 className="h-xl" style={{ marginTop: 8 }}>Talk to the people who build it.</h1></div>
      </section>
      <div className="hazard" aria-hidden="true" />
      <section className="wrap section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "clamp(28px,5vw,80px)", alignItems: "start" }}>
        <div style={{ display: "grid", gap: 28 }}>
          <div><p className="label">Call</p>{company.phones.map((p) => <p key={p.tel}><a href={`tel:${p.tel}`} className="h-3" style={{ textDecoration: "none" }}>{p.display}</a> <span className="mono muted" style={{ fontSize: ".8125rem" }}>{p.label}</span></p>)}</div>
          <div><p className="label">WhatsApp</p><a className="btn" href={waLink("Hello Cables & Wireless Co.")} target="_blank" rel="noopener" style={{ marginTop: 8 }}>Message us on WhatsApp</a></div>
          <div><p className="label">Email</p>{company.emails.map((e) => <p key={e}><a className="inline" href={`mailto:${e}`}>{e}</a></p>)}</div>
          <div><p className="label">Hours</p><p>{company.hours}</p></div>
          <div><p className="label">Works & office</p><address style={{ fontStyle: "normal", fontSize: "var(--step-1)", lineHeight: 1.4 }}>{company.address.lines.map((l) => <span key={l} style={{ display: "block" }}>{l}</span>)}<span style={{ display: "block" }}>{company.address.region}, {company.address.country}</span></address><a className="link" href={maps} target="_blank" rel="noopener" style={{ fontWeight: 600, display: "inline-block", marginTop: 10 }}>Get directions →</a></div>
        </div>
        <div><h2 className="h-2" style={{ marginBottom: 16 }}>Send a message</h2><EnquiryForm kind="contact" /></div>
      </section>
    </>
  );
}
