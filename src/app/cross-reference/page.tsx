import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";

export const metadata: Metadata = { title: "Replacing another brand? Find the SMART equivalent | Cables & Wireless Co.", description: "Send the brand and model of the industrial phone, hooter or PA unit you are replacing. We suggest the matching SMART model and quote." };

// CONV-05 cross-reference (Pfannenberg "Request crossreference").
export default function CrossReference() {
  return (
    <>
      <section className="band-yellow" style={{ paddingBlock: "var(--space-8) var(--space-7)" }}>
        <div className="wrap"><p className="label">Cross-reference</p><h1 className="h-xl" style={{ marginTop: 8 }}>Replacing another brand?</h1><p className="lede" style={{ marginTop: 14 }}>Send the brand and model from the nameplate or old purchase order. We suggest the SMART equivalent and quote it.</p></div>
      </section>
      <div className="hazard" aria-hidden="true" />
      <section className="wrap section" style={{ maxWidth: 820 }}>
        <EnquiryForm kind="cross-reference" extra="cross-reference" submitLabel="Find the SMART equivalent" />
      </section>
    </>
  );
}
