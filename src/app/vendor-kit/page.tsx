import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = { title: "Vendor registration kit | Cables & Wireless Co.", description: "Registration documents for purchase and tender teams: GST, Udyam/MSME, PAN, bank details, approvals and client credentials for Cables & Wireless Co." };

// TRUST-03 vendor kit (Ravel credentials + Indian PSU checklists). Documents pending from the client.
const DOCS = ["GST registration certificate", "Udyam / MSME certificate", "PAN", "Cancelled cheque / bank letter", "Quality and product approvals (ISO, IP test reports, others)", "GeM seller ID", "Client credential letters", "Company profile PDF"];

export default function VendorKit() {
  return (
    <>
      <section className="band-yellow" style={{ paddingBlock: "var(--space-8) var(--space-7)" }}>
        <div className="wrap"><p className="label">Vendor kit</p><h1 className="h-xl" style={{ marginTop: 8 }}>Everything purchase needs to register us.</h1><p className="lede" style={{ marginTop: 14 }}>One request, one reply with the full set of documents for vendor registration, tenders and GeM.</p></div>
      </section>
      <div className="hazard" aria-hidden="true" />
      <section className="wrap section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "clamp(28px,5vw,80px)", alignItems: "start" }}>
        <div>
          <h2 className="h-2" style={{ marginBottom: 16 }}>What&apos;s in the kit</h2>
          <ul style={{ listStyle: "none", padding: 0, borderTop: "2px solid var(--ink)" }}>
            {DOCS.map((d, i) => <li key={d} className="reveal" style={{ "--d": `${i * 40}ms`, display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--line)" } as React.CSSProperties}><span>{d}</span><span className="mono muted" style={{ fontSize: ".8125rem", whiteSpace: "nowrap" }}>On request</span></li>)}
          </ul>
        </div>
        <div><h2 className="h-2" style={{ marginBottom: 16 }}>Request the kit</h2><EnquiryForm kind="vendor-kit" submitLabel="Request vendor kit" /></div>
      </section>
    </>
  );
}
