import Image from "next/image";
import Link from "next/link";
import { SECTORS, domestic, international, stats } from "@/content/clients";
import { clientLogos } from "@/lib/clientLogos";
import { Arrow } from "./Brand";
import { ClientDirectory } from "./ClientDirectory";
import s from "./Clients.module.css";

// Home "clients" section: logo wall (TRUST-02, Joiwo / Matrix) + every client by sector from the 2025 user list.
export function ClientWall() {
  const logos = clientLogos();
  const seen = new Set<string>();
  const wall = [...domestic, ...international]
    .filter((c) => c.logo && logos.has(c.logo) && !seen.has(c.logo) && seen.add(c.logo))
    .map((c) => ({ name: c.name, ...logos.get(c.logo!)! }));
  return (
    <section className="wrap section" aria-labelledby="clients-h">
      <div className={s.head}>
        <div>
          <p className="label">Clients · {stats.asOf}</p>
          <h2 id="clients-h" className="h-xl" style={{ marginTop: 6 }}>SMART users across India and {stats.countries} countries.</h2>
        </div>
        <dl className={s.stats}>
          <div><dt className="label">Client groups</dt><dd>{stats.groups}+</dd></div>
          <div><dt className="label">Plants &amp; units</dt><dd>{stats.plants}+</dd></div>
          <div><dt className="label">International</dt><dd>{stats.intl}</dd></div>
        </dl>
      </div>
      {wall.length > 0 && (
        <ul className={s.wall} aria-label="Client logos">
          {wall.map((l, i) => (
            <li key={l.src} className={`${s.tile} reveal`} style={{ "--d": `${(i % 8) * 40}ms` } as React.CSSProperties}>
              <span className={s.box}><Image src={l.src} alt={l.name} fill sizes="160px" className={s.logo} unoptimized={l.src.endsWith(".svg")} /></span>
            </li>
          ))}
        </ul>
      )}
      <ClientDirectory sectors={SECTORS} domestic={domestic} international={international} />
      <p className={s.foot}>Logos are trademarks of their owners and are shown to identify SMART installations. <Link className="link" href="/installed-at" style={{ fontWeight: 600 }}>Where SMART is installed <Arrow /></Link></p>
    </section>
  );
}
