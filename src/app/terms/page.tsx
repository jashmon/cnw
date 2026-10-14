import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = { title: "Terms of use | Cables & Wireless Co.", robots: { index: false } };

export default function Page() {
  return (
    <section className="wrap section">
      <p className="label">Legal</p>
      <h1 className="h-xl" style={{ margin: "8px 0 32px" }}>Terms of use</h1>
      <LegalDoc file="terms.md" />
    </section>
  );
}
