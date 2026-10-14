import Link from "next/link";
import { company, waLink } from "@/content/company";
import { getFamilies, getIndustries } from "@/lib/catalogue";
import { Logo } from "./Brand";
import s from "./Footer.module.css";

export function Footer() {
  const families = getFamilies();
  const industries = getIndustries();
  return (
    <footer className={s.foot}>
      <div className="hazard" aria-hidden="true" />
      <div className={`wrap ${s.grid}`}>
        <div className={s.brand}>
          <Logo variant="dark" height={52} />
          <p className={s.blurb}>Designers and makers of SMART industrial telephones, plant PA systems and alarms for harsh, noisy and life-safety sites. Nagpur, India.</p>
          <address className={s.addr}>
            {company.address.lines.map((l) => <span key={l}>{l}</span>)}
            <span>{company.address.region}, {company.address.country}</span>
          </address>
          <ul className={s.contact}>
            {company.phones.slice(0, 2).map((p) => <li key={p.tel}><a href={`tel:${p.tel}`}>{p.display}</a></li>)}
            <li><a href={`mailto:${company.emails[0]}`}>{company.emails[0]}</a></li>
            <li><a href={waLink("Hello Cables & Wireless Co.")} target="_blank" rel="noopener">WhatsApp</a> · {company.hours}</li>
          </ul>
        </div>
        <nav aria-label="Products" className={s.col}>
          <h2>Products</h2>
          <ul>{families.map((f) => <li key={f.slug}><Link className="link" href={`/products#${f.slug}`}>{f.name}</Link></li>)}<li><Link className="link" href="/products">All models</Link></li></ul>
        </nav>
        <nav aria-label="Industries" className={s.col}>
          <h2>Industries</h2>
          <ul>{industries.map((i) => <li key={i.slug}><Link className="link" href={`/industries/${i.slug}`}>{i.name}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Company" className={s.col}>
          <h2>Company</h2>
          <ul>
            {[["/about", "About"], ["/installed-at", "Installed at"], ["/systems", "Systems"], ["/downloads", "Downloads"], ["/vendor-kit", "Vendor kit"], ["/cross-reference", "Replacing another brand?"], ["/contact", "Contact"]].map(([h, l]) => <li key={h}><Link className="link" href={h}>{l}</Link></li>)}
          </ul>
        </nav>
      </div>
      <div className={`wrap ${s.bottom}`}>
        <span>© {new Date().getFullYear()} {company.legalName ?? company.name}{company.gst ? ` · GST ${company.gst}` : ""}</span>
        <span>SMART is a brand of {company.name}</span>
        <span><Link className="link" href="/privacy">Privacy</Link> · <Link className="link" href="/terms">Terms</Link></span>
      </div>
    </footer>
  );
}
