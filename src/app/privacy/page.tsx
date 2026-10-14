import type { Metadata } from "next";
import { LegalDoc } from "@/components/LegalDoc";

export const metadata: Metadata = { title: "Privacy notice | Cables & Wireless Co.", robots: { index: false } };

export default function Page() {
  return (
    <section className="wrap section">
      <p className="label">Legal</p>
      <h1 className="h-xl" style={{ margin: "8px 0 32px" }}>Privacy notice</h1>
      <LegalDoc file="privacy.md" />
    </section>
  );
}
