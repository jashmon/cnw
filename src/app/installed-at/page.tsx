import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/Brand";
import { CLIENT_NAMES_CONSENT, SECTORS, domestic, international, stats } from "@/content/clients";
import s from "./installed.module.css";

export const metadata: Metadata = { title: "Installed at: SMART in Indian cement, steel and power plants | Cables & Wireless Co.", description: `SMART industrial communication equipment is installed across ${stats.groups}+ Indian industrial groups and in ${stats.countries} countries abroad, led by cement and steel plants.` };

// TRUST-02 client wall by sector (Joiwo, Matrix) + TRUST-05 site photos. Names gated by CLIENT_NAMES_CONSENT.
export default function InstalledAt() {
  const countries = [...new Set(international.map((c) => c.country))];
  return (
    <>
      <section className="band-yellow" style={{ paddingBlock: "var(--space-8)" }}>
        <div className="wrap">
          <p className="label">Installed at</p>
          <h1 className="h-xl" style={{ marginTop: 8, maxWidth: "18ch" }}>In the control rooms of India&apos;s cement belt.</h1>
          <dl className={s.stats}>
            <div><dt className="label">Indian client groups</dt><dd>{stats.groups}+</dd></div>
            <div><dt className="label">Plants and units</dt><dd>{stats.plants}+</dd></div>
            <div><dt className="label">Countries abroad</dt><dd>{stats.countries}</dd></div>
          </dl>
          <p className="mono" style={{ fontSize: ".8125rem", marginTop: 18 }}>From the company&apos;s {stats.asOf}. An updated list is on its way.</p>
        </div>
      </section>
      <div className="hazard" aria-hidden="true" />
      <section className="wrap section">
        <h2 className="h-1" style={{ marginBottom: 24 }}>By sector</h2>
        <div className={s.sectors}>
          {SECTORS.map((sec) => {
            const list = domestic.filter((c) => c.sector === sec);
            if (!list.length) return null;
            return (
              <div key={sec} className={`${s.sector} reveal`}>
                <div className={s.sh}><h3 className="h-3">{sec}</h3><span className="mono">{list.reduce((a, c) => a + c.sites, 0)} plants · {list.length} groups</span></div>
                {CLIENT_NAMES_CONSENT ? <ul className={s.names}>{list.map((c) => <li key={c.name}>{c.name}{c.sites > 1 && <span className="mono muted"> ×{c.sites}</span>}</li>)}</ul>
                  : <div className={s.bar} aria-hidden="true"><span style={{ width: `${Math.min(100, (list.reduce((a, c) => a + c.sites, 0) / 75) * 100)}%` }} /></div>}
              </div>
            );
          })}
        </div>
        {!CLIENT_NAMES_CONSENT && <p className="muted" style={{ marginTop: 18, fontSize: ".9375rem" }}>Client names are shared on request for vendor registration and tenders.</p>}
      </section>
      <section className="band-dark section">
        <div className={`wrap ${s.intl}`}>
          <div><p className="label">Abroad</p><h2 className="h-1" style={{ color: "var(--yellow)", marginTop: 6 }}>Exported to {stats.countries} countries</h2></div>
          <ul className={s.countries}>{countries.map((c) => <li key={c}>{c}</li>)}</ul>
        </div>
      </section>
      <section className="wrap section">
        <h2 className="h-1" style={{ marginBottom: 24 }}>On site</h2>
        <div className={s.photos}>
          <figure className={s.big}><Image src="/media/site/site-emergency-call-box.jpg" alt="SMART emergency call box mounted on a wall" fill sizes="(max-width:767px) 92vw, 55vw" style={{ objectFit: "cover" }} /></figure>
          <figure><Image src="/media/site/site-stairway.jpg" alt="Yellow SMART telephone on a cement plant stairway landing" fill sizes="(max-width:767px) 92vw, 35vw" style={{ objectFit: "cover" }} /></figure>
          <figure><Image src="/media/site/site-plant-floor.jpg" alt="Engineer beside a SMART telephone in a cement plant" fill sizes="(max-width:767px) 92vw, 35vw" style={{ objectFit: "cover" }} /></figure>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
          <Link className="btn" href="/vendor-kit">Vendor registration kit <Arrow /></Link>
          <Link className="btn btn--ghost" href="/quote">Request a quote</Link>
        </div>
      </section>
    </>
  );
}
