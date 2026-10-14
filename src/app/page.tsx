import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, SmartMark } from "@/components/Brand";
import { EnquiryForm } from "@/components/EnquiryForm";
import { IndustryPanel } from "@/components/IndustryPanel";
import { Ticker } from "@/motion/Ticker";
import { ProductCard } from "@/components/ProductCard";
import { SystemDiagram } from "@/components/SystemDiagram";
import { stats } from "@/content/clients";
import { company, waLink } from "@/content/company";
import { getFamilies, getIndustries, getProduct, getProducts, getSystems, productHref } from "@/lib/catalogue";
import { clean } from "@/lib/text";
import s from "./home.module.css";

export const metadata: Metadata = {
  title: "SMART industrial telephones & plant PA systems | Cables & Wireless Co., Nagpur",
  description: "SMART industrial telephones, plant PA systems, emergency call boxes, hooters, voice alarms and bag counters, designed and made in Nagpur by Cables & Wireless Co.",
  alternates: { canonical: "/" },
};

// Copy: 06-voice/copy/home.md (headline A, the company's own words). Layout: 08-layout/specs/home.md.
const FAMILY_IMG: Record<string, string> = { telephones: "wmhs-iii", "plant-pa-paging": "mcs-iii", "alarms-emergency": "gsm-ecb-box", "process-instruments": "bc-l02", lighting: "fl50" };
const FEATURED = ["wmhs-iiiwp", "wmhf-iiigsm", "cr-iiipe", "bc-l03-m"];
const WHY = [
  ["Designed in-house.", "Our own R&D and PCB design. Field units are built on a single plug-and-play PCB, so troubleshooting is quick."],
  ["Made for dust, water and noise.", "Encapsulated circuit boards, sealed one-piece keypads, noise-cancelling handsets and magnetic reed hook switches rated over 1,000,000 operations."],
  ["Simple cabling.", "Ordinary telephone cable, not specialist cable. MCS-II loops run up to 2000 m on 0.5 mm twisted pair, and each PA telephone carries its own 30 W amplifier."],
  ["Plan to commissioning.", "We plan, supply, commission and support on site, to your specification."],
];

export default function Home() {
  const fams = getFamilies();
  const all = getProducts();
  const hero = getProduct("wmhs-iii");
  const heroImg = hero?.images.find((i) => i.source === "render") ?? { src: "/media/hero/wmhs-iii-render.png", w: 1161, h: 1499, alt: "SMART WMHS-III industrial telephone, 3D render", source: "render" as const, placeholder: true };
  const codes = [...new Set(all.map((p) => p.model).filter(Boolean))];
  const industries = getIndustries().map((i) => ({ slug: i.slug, name: i.name, intro: clean(i.intro), models: i.recommendedProducts.slice(0, 5).map((sl) => getProduct(sl)).filter((p): p is NonNullable<typeof p> => !!p).map((p) => ({ model: p.model, href: productHref(p) })) }));
  const featured = FEATURED.map((sl) => getProduct(sl)).filter((p): p is NonNullable<typeof p> => !!p);
  const systems = getSystems();

  return (
    <>
      {/* home.hero: HERO-01 + HERO-03 (Talkaphone single product, DEWALT yellow) + MOTION-02 signal rings */}
      <section className={`band-yellow ${s.hero}`}>
        <div className={`wrap ${s.heroIn}`}>
          <div className={s.heroText}>
            <div className={s.eyebrow}><SmartMark height={40} /><span className="label">Industrial communication · Nagpur</span></div>
            <h1 className={s.h1}>Built for where water, dust and weather wreak havoc.</h1>
            <p className={s.sub}>SMART industrial telephones, plant PA systems, emergency call boxes and bag counters, designed and manufactured by Cables &amp; Wireless Co. Working in cement, steel and power plants across India and at export sites in {stats.countries} countries.</p>
            <div className={s.ctas}>
              <Link className="btn" href="/products">Browse {all.length} products <Arrow /></Link>
              <Link className="btn btn--ghost" href="/quote">Request a quote</Link>
            </div>
            <p className={s.call}>Call <a href={`tel:${company.phones[0].tel}`}>{company.phones[0].display}</a> · <a href={waLink("Hello Cables & Wireless Co.")} target="_blank" rel="noopener">WhatsApp</a> · {company.hours}</p>
          </div>
          <div className={s.media}>
            <svg className={s.rings} viewBox="0 0 100 100" aria-hidden="true">{[14, 24, 34, 44].map((r) => <circle key={r} cx="50" cy="50" r={r} />)}</svg>
            <Image className={s.render} src={heroImg.src} alt={heroImg.alt} width={heroImg.w} height={heroImg.h} priority sizes="(max-width:1023px) 78vw, 40vw" quality={85} />
          </div>
        </div>
        <div className="hazard" aria-hidden="true" />
        <Ticker codes={codes} className={s.ticker} trackClass={s.track} />
      </section>

      {/* home.families: HERO-02 category tiles (Viking, Joiwo) */}
      <section className="wrap section">
        <div className={s.secHead}>
          <div><p className="label">Products</p><h2 className="h-xl" style={{ marginTop: 6 }}>Five families. {all.length} models.</h2><p className="muted" style={{ marginTop: 10 }}>Start with the job. Every model has its datasheet one click away.</p></div>
          <Link className="link" href="/products" style={{ fontWeight: 600 }}>All {all.length} products →</Link>
        </div>
        <div className={s.fams}>
          {fams.map((f, i) => {
            const p = getProduct(FAMILY_IMG[f.slug]);
            const img = p?.images[0];
            const n = f.categories.reduce((a, c) => a + c.products.length, 0);
            return (
              <Link key={f.slug} href={`/products#${f.slug}`} className={`${s.fam} ${i === 0 ? s.big : ""} reveal`} style={{ "--d": `${i * 70}ms` } as React.CSSProperties}>
                <div><h3>{f.name}</h3><p style={{ marginTop: 8 }}>{f.cardLine}</p></div>
                <span className={s.count}>{n} models →</span>
                {img && <Image className={s.famImg} src={img.src} alt="" width={img.w} height={img.h} sizes="(max-width:600px) 46vw, 22vw" />}
              </Link>
            );
          })}
        </div>
      </section>

      {/* home.why: VOICE-02 + TRUST-04 */}
      <section className="wrap" style={{ paddingBottom: "var(--space-section)" }}>
        <h2 className="label" style={{ color: "var(--ink)", marginBottom: 12 }}>Why SMART</h2>
        <ol className={s.why}>{WHY.map(([t, b], i) => <li key={t} className="reveal" style={{ "--d": `${i * 80}ms` } as React.CSSProperties}><span className="mono muted">{String(i + 1).padStart(2, "0")}</span><b>{t}</b><p>{b}</p></li>)}</ol>
      </section>

      {/* home.industries: NAV-01 second axis (Talkaphone, Axis) */}
      <section className="band-dark section">
        <div className="wrap">
          <div className={s.secHead}><div><p className="label">Industries</p><h2 className="h-xl" style={{ color: "var(--yellow)", marginTop: 6 }}>Choose your plant.</h2></div><p className="muted" style={{ maxWidth: "46ch" }}>Each industry page lists the SMART models made for its conditions, and the problems they solve.</p></div>
          <IndustryPanel items={industries} />
        </div>
      </section>

      {/* home.installed: TRUST-02 + TRUST-05 (names withheld until consent) */}
      <section className="band-yellow section">
        <div className={`wrap ${s.inst}`}>
          <div>
            <p className="label">Installed at</p>
            <h2 className="h-xl" style={{ marginTop: 6 }}>On the plant floor, not just the brochure.</h2>
            <p className="lede" style={{ marginTop: 16 }}>Cement, steel, power, fertiliser and port clients across India, and export sites in {stats.countries} countries ({stats.asOf}).</p>
            <dl className={s.nums}>
              <div><dt className="label">Products</dt><dd>{all.length}</dd></div>
              <div><dt className="label">Categories</dt><dd>17</dd></div>
              <div><dt className="label">Indian client groups</dt><dd>{stats.groups}+</dd></div>
              <div><dt className="label">Export countries</dt><dd>{stats.countries}</dd></div>
            </dl>
            <Link className="btn" href="/installed-at" style={{ marginTop: 28 }}>See where SMART is installed <Arrow /></Link>
          </div>
          <div className={s.photos}>
            <figure className={s.ph1}><Image src="/media/site/site-emergency-call-box.jpg" alt="SMART emergency call box mounted on a wall" fill sizes="(max-width:1023px) 70vw, 34vw" style={{ objectFit: "cover" }} /></figure>
            <figure className={s.ph2}><Image src="/media/site/site-stairway.jpg" alt="Yellow SMART telephone on a cement plant stairway" fill sizes="(max-width:1023px) 50vw, 22vw" style={{ objectFit: "cover" }} /></figure>
          </div>
        </div>
      </section>

      {/* home.system: PDP-06 at homepage scale (Shure "How it connects") */}
      <section className="wrap section">
        <div className={s.sys}>
          <div>
            <p className="label">Systems</p>
            <h2 className="h-xl" style={{ marginTop: 6 }}>How the parts connect.</h2>
            <ul className={s.sysList}>
              {systems.map((sy, i) => <li key={sy.slug}><Link href={`/systems/${sy.slug}`}><span>{String(i + 1).padStart(2, "0")}</span><b>{sy.name}</b><small>{sy.intro.split(". ")[0]}.</small></Link></li>)}
            </ul>
          </div>
          <SystemDiagram slug="plant-pa-system" />
        </div>
      </section>

      {/* home.featured: product cards */}
      <section className="band-surface section">
        <div className="wrap">
          <div className={s.secHead}><div><p className="label">Field favourites</p><h2 className="h-1" style={{ marginTop: 6 }}>Start with these</h2></div><Link className="link" href="/products" style={{ fontWeight: 600 }}>All products →</Link></div>
          <div className={s.feat}>{featured.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        </div>
      </section>

      {/* home.enquiry: HOME-04 + CONV-02 + CONV-03 */}
      <section className="wrap section">
        <div className={s.enq}>
          <div>
            <p className="label">Quote</p>
            <h2 className="h-xl" style={{ marginTop: 6 }}>Send us your model list.</h2>
            <p className="lede" style={{ marginTop: 16 }}>Add models to your quote list, tell us the plant and quantities, and we reply with a quotation. Replacing another brand? Send us its model number.</p>
            <div style={{ marginTop: 28, display: "grid", gap: 6 }}>
              <a className={s.big2} href={`tel:${company.phones[0].tel}`}>{company.phones[0].display}</a>
              <a className={s.big2} href={`tel:${company.phones[1].tel}`}>{company.phones[1].display}</a>
              <a className="link" href={waLink("Hello Cables & Wireless Co.")} target="_blank" rel="noopener" style={{ fontWeight: 600, marginTop: 8, justifySelf: "start" }}>WhatsApp us →</a>
            </div>
          </div>
          <EnquiryForm kind="quote" withList submitLabel="Request a quote" />
        </div>
      </section>
    </>
  );
}
