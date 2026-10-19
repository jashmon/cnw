import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, SmartMark } from "@/components/Brand";
import { stats } from "@/content/clients";
import { company } from "@/content/company";
import s from "./about.module.css";

export const metadata: Metadata = {
  title: "About Cables & Wireless Co. | Makers of SMART, Nagpur",
  description: "Cables & Wireless Co. designs, makes and commissions SMART industrial telephones, PA systems and alarms in Nagpur, with in-house R&D and PCB design.",
};

// Copy: 06-voice/copy/about.md (CEO note edited lightly from Sanjay Gandhi's own text; edit log in the deck).
const CAPS = [
  ["In-house R&D", "Products designed by our own engineers."],
  ["PCB design and development", "Our own circuit boards. Field units use a single plug-and-play PCB for quick troubleshooting."],
  ["Customisation", "Dial plates, colours (subject to minimum quantities), operating modes and voice messages built to your specification."],
  ["Project planning", "System layout, zones and cabling planned with your engineers."],
  ["Commissioning", "We commission what we supply."],
  ["Site support", "Support after handover."],
];
const BUILD = ["Encapsulated circuit boards that resist water and condensation", "Magnetic reed hook switches rated over 1,000,000 operations", "16-gauge steel or cast-aluminium housings with integrated canopies", "Sealed one-piece keypads", "Noise-cancelling handsets"];

export default function About() {
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="label">About Cables &amp; Wireless Co.</p>
          <h1 className="h-xl" style={{ marginTop: 10, maxWidth: "20ch" }}>We design, make and commission SMART industrial communication equipment.</h1>
          <p className="lede" style={{ marginTop: 18 }}>Wired and wireless PA systems, telephones and alarms for severe climates, harsh operating conditions and life-safety-critical jobs. From Nagpur, India.</p>
        </div>
      </section>

      <section className={`wrap section ${s.story}`}>
        <h2 className="h-1">What we do</h2>
        <div className="prose" style={{ fontSize: "var(--step-1)", lineHeight: 1.5 }}>
          <p>Cables &amp; Wireless Co. designs, manufactures and supplies SMART industrial communication equipment. The range covers page/party PA telephones; weatherproof, IP and GSM phones; plant-wide PA systems; hotlines; clean-room phones; emergency call boxes; crane communication; and hooters and voice alarms. We also build bag counters and 4–20 mA displays for process plants, and LED lighting.</p>
          <p>Our equipment installs simply and cheaply on ordinary field cabling, with no specialist cable needed. Field units are surface-mounted: they install quickly, weigh little, open easily for routine maintenance and keep through-life costs down.</p>
          <p>SMART equipment works in plants across India and at export sites in {stats.countries} countries.</p>
          <p>We supply single units and complete packages built to your specification, including project planning, commissioning and site support. That covers everything from a stand-alone PA telephone for local paging to multi-line paging systems.</p>
        </div>
      </section>

      <section className="band-dark section">
        <div className={`wrap ${s.note}`}>
          <div className={s.portrait} aria-hidden="true"><SmartMark white height={30} /><span className="label">Founder portrait to come</span></div>
          <figure>
            <p className="label">A note from our founder</p>
            <blockquote className={s.quote}>
              <p className={s.pull}>“SMART industrial communication products that are attractive in looks, easy to install, locate, use and maintain, and difficult to damage.”</p>
              <p>I am {company.ceo}, Founder &amp; CEO of Cables &amp; Wireless Co. The vision behind our business is to build SMART industrial communication products that are attractive in looks (a new concept in industry), easy to install, locate, use and maintain, and difficult to damage. Our products share one goal: to give you the tools to take full advantage of a simplified industrial communication platform.</p>
              <p>Our products help people and plants communicate better and work more efficiently. From a basic single-location telephone to systems tailored for specific industries, we have the mix of products to enable, enhance and simplify your communication.</p>
              <p>We have a great team turning out some of the coolest products in industrial communication, here at Cables &amp; Wireless Co. Our people are passionate about their daily work, because they can see that their contribution makes a difference.</p>
              <p>As we have grown in clients, people and revenue, our work culture has let us keep the advantages of a small company. Decisions are taken quickly. We are nimble and responsive to change.</p>
              <p>I welcome you to explore our products. If you are seriously considering industrial communication products, you should be seriously considering SMART.</p>
            </blockquote>
            <figcaption className={s.sig}><b>{company.ceo}</b><span className="label">Founder &amp; CEO, Cables &amp; Wireless Co.</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="wrap section">
        <h2 className="h-1" style={{ marginBottom: 24 }}>What we do in-house</h2>
        <ol className={s.caps}>{CAPS.map(([t, b], i) => <li key={t} className="reveal" style={{ "--d": `${i * 60}ms` } as React.CSSProperties}><span className="mono muted">{String(i + 1).padStart(2, "0")}</span><b>{t}</b><p>{b}</p></li>)}</ol>
      </section>

      <section className="band-surface section">
        <div className={`wrap ${s.build}`}>
          <h2 className="h-1">How SMART field units are built</h2>
          <ul>{BUILD.map((b) => <li key={b}><span aria-hidden="true">■</span>{b}</li>)}</ul>
        </div>
      </section>

      <section className="wrap section">
        <div className={s.vz}>
          <div><p className="label">Voizlink</p><p className="h-3" style={{ marginTop: 6 }}>Voizlink was a second trading name of Cables &amp; Wireless Co.</p><p className="muted" style={{ marginTop: 8 }}>Same founder, address, products and SMART brand. Old voizlink.in addresses forward to this site.</p></div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn" href="/quote">Request a quote <Arrow /></Link><Link className="btn btn--ghost" href="/contact">Contact us</Link></div>
        </div>
      </section>
    </>
  );
}
