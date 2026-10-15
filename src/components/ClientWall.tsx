import Image from "next/image";
import { SECTORS, domestic, international, stats } from "@/content/clients";
import { clientLogos } from "@/lib/clientLogos";
import { ClientDirectory } from "./ClientDirectory";
import s from "./Clients.module.css";

// Order for a short wall: one or two recognisable names per sector before the long tail (homepage shows 24).
const PRIORITY = [
  "ultratech-cement", "tata-steel", "sail", "cipla", "abb", "siemens", "ambuja-cements", "jsw-steel", "hindalco", "sun-pharma", "iffco", "mrf",
  "acc-limited", "vedanta", "biocon", "schneider-electric", "shree-cement", "dalmia-bharat", "raymond", "sandoz", "thyssenkrupp", "nuvoco-vistas", "qantas", "larsen-toubro",
];

function wallItems() {
  const logos = clientLogos();
  const seen = new Set<string>();
  const items = [...domestic, ...international]
    .filter((c) => c.logo && logos.has(c.logo) && !seen.has(c.logo) && seen.add(c.logo))
    .map((c) => ({ key: c.logo!, name: c.name, ...logos.get(c.logo!)! }));
  const rank = (k: string) => { const i = PRIORITY.indexOf(k); return i === -1 ? 999 : i; };
  return items.sort((a, b) => rank(a.key) - rank(b.key));
}

/** Logo wall (TRUST-02, Joiwo / Matrix): greyscale, colour on hover, uniform tiles. */
export function LogoWall({ limit }: { limit?: number }) {
  const wall = wallItems().slice(0, limit ?? Infinity);
  if (!wall.length) return null;
  return (
    <ul className={s.wall} aria-label="Client logos">
      {wall.map((l) => (
        <li key={l.src} className={s.tile}>
          <span className={s.box}><Image src={l.src} alt={l.name} fill sizes="160px" className={s.logo} unoptimized={l.src.endsWith(".svg")} /></span>
        </li>
      ))}
    </ul>
  );
}

/** Full client section for /installed-at: every logo + every client by sector from the 2025 user list. */
export function ClientWall() {
  return (
    <section className="wrap section" aria-labelledby="clients-h">
      <div className={s.head}>
        <div>
          <p className="label">Clients · {stats.asOf}</p>
          <h2 id="clients-h" className="h-xl" style={{ marginTop: 6 }}>Every SMART user, by sector.</h2>
        </div>
      </div>
      <LogoWall />
      <ClientDirectory sectors={SECTORS} domestic={domestic} international={international} />
      <p className={s.foot}>Logos are trademarks of their owners and are shown to identify SMART installations.</p>
    </section>
  );
}
