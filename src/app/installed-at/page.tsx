import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Brand";
import { ClientWall } from "@/components/ClientWall";
import { international, stats } from "@/content/clients";
import s from "./installed.module.css";

export const metadata: Metadata = {
  title: "Installed at: SMART clients in cement, steel, power and pharma | Cables & Wireless Co.",
  description: `SMART industrial communication equipment is installed with ${stats.groups}+ client groups in ${stats.plants}+ plants across India and on ${stats.intl} projects in ${stats.countries} countries.`,
};

// TRUST-02 client wall by sector (Joiwo, Matrix) + TRUST-05 site photos. Source: client's 2025 user list.
export default function InstalledAt() {
  const countries = [...new Set(international.map((c) => c.country))];
  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <p className="label">Installed at</p>
          <h1 className="h-xl" style={{ marginTop: 8, maxWidth: "20ch" }}>In the control rooms of India&apos;s cement belt, and beyond.</h1>
          <dl className={s.stats}>
            <div><dt className="label">Client groups</dt><dd>{stats.groups}+</dd></div>
            <div><dt className="label">Plants and units</dt><dd>{stats.plants}+</dd></div>
            <div><dt className="label">Countries</dt><dd>{stats.countries}</dd></div>
          </dl>
          <p className="mono" style={{ fontSize: ".8125rem", marginTop: 18 }}>Source: the company&apos;s {stats.asOf}. Abroad: {countries.join(", ")}.</p>
        </div>
      </section>
      <ClientWall />
      <section className="band-surface section">
        <div className="wrap">
          <h2 className="h-1" style={{ marginBottom: 24 }}>On site</h2>
          <div className={s.photos}>
            <figure className={s.big}><Image src="/media/site/site-emergency-call-box.jpg" alt="SMART emergency call box mounted on a wall" fill sizes="(max-width:767px) 92vw, 420px" style={{ objectFit: "cover" }} /></figure>
            <figure><Image src="/media/site/site-stairway.jpg" alt="Yellow SMART telephone on a cement plant stairway" fill sizes="240px" style={{ objectFit: "cover" }} /></figure>
            <figure><Image src="/media/site/site-plant-floor.jpg" alt="Engineer beside a SMART telephone in a cement plant" fill sizes="240px" style={{ objectFit: "cover" }} /></figure>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
            <Link className="btn" href="/quote">Request a quote <Arrow /></Link>
            <Link className="btn btn--ghost" href="/vendor-kit">Vendor registration kit</Link>
          </div>
        </div>
      </section>
    </>
  );
}
