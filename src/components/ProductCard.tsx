import Link from "next/link";
import type { CardProduct as Product } from "@/lib/catalogue";
import { productHref } from "@/lib/href";
import { AddToQuote } from "./AddToQuote";
import { ProductImage } from "./ProductImage";
import s from "./ProductCard.module.css";

// PDP-02 card (Viking popular products): image well · code tag · name · card line · key-spec chips · add to quote.
export function ProductCard({ p, priority = false }: { p: Product; priority?: boolean }) {
  const href = productHref(p);
  return (
    <article className={`${s.card} lift`}>
      <Link href={href} className={s.media} aria-hidden="true" tabIndex={-1}>
        <ProductImage img={p.images[0]} sizes="(max-width: 767px) 92vw, (max-width: 1023px) 46vw, 30vw" priority={priority} className={s.well} />
      </Link>
      <div className={s.body}>
        {p.model && <span className="code">{p.model}</span>}
        <h3 className={s.name}><Link href={href} className={s.title}>{p.name}</Link></h3>
        <p className={s.line}>{p.cardLine}</p>
        {p.keySpecs.length > 0 && <div className="chips">{p.keySpecs.slice(0, 3).map((k) => <span key={k} className="spec-chip">{k}</span>)}</div>}
        <div className={s.act}>
          <AddToQuote item={{ slug: p.slug, model: p.model || p.name, name: p.name, href, img: p.images[0]?.src ?? null }} variant="ghost" compact />
        </div>
      </div>
    </article>
  );
}
