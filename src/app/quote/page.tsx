import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { QuoteList } from "@/components/QuoteList";

export const metadata: Metadata = { title: "Request a quote | SMART by Cables & Wireless Co.", description: "Send one enquiry for every SMART model you need: industrial telephones, PA systems, call boxes, alarms and bag counters. Reply on working days.", robots: { index: false } };

// CONV-01 quote list + CONV-02 buyer-type form (E2S quote basket, Ahuja/Matrix buyer type).
export default function QuotePage() {
  return (
    <>
      <section className="band-yellow" style={{ paddingBlock: "var(--space-8) var(--space-7)" }}>
        <div className="wrap"><p className="label">Quote list</p><h1 className="h-xl" style={{ marginTop: 8 }}>One list. One enquiry.</h1><p className="lede" style={{ marginTop: 14 }}>Check the models and quantities, tell us about the site, and send. Prices depend on quantity and configuration, so every quote is prepared for the project.</p></div>
      </section>
      <div className="hazard" aria-hidden="true" />
      <section className="wrap section" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "clamp(28px,5vw,72px)", alignItems: "start" }}>
        <div><h2 className="h-2" style={{ marginBottom: 16 }}>Models</h2><QuoteList /></div>
        <div className="quote-form"><h2 className="h-2" style={{ marginBottom: 16 }}>About the project</h2><EnquiryForm kind="quote" withList submitLabel="Send quote request" /></div>
      </section>
    </>
  );
}
