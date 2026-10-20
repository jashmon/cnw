import type { Product } from "./catalogue";

// Model comparison: which models to compare, and which rows to show.

type Comparable = Pick<Product, "slug" | "categorySlug" | "interface" | "environment" | "specGroups" | "variants">;

// Buyer-decision order: interface and line, power, protection, environment, output, installation, features.
const PRIORITY = [
  /^interface$/i, /protocol|phone line|line voltage|loop current|dialling|gsm/i,
  /power supply|power consumption|standby|rated power|ups/i,
  /ip rating|protection|enclosure|dust|moisture|insulation/i, /^environment$/i, /temperature|humidity/i,
  /amplifier|speaker|sound output|horn|ringer output|led count|beam|display|message length/i,
  /mounting|connection|cabl|connector|ports/i, /dimensions|weight|housing/i,
  /keypad|handset|count input|working mode|output contact|reset|flasher/i,
];
const rank = (k: string) => { const i = PRIORITY.findIndex((r) => r.test(k)); return i < 0 ? PRIORITY.length : i; };

export function specValue(c: Comparable, k: string): string {
  if (k === "Interface") return c.interface || "—";
  if (k === "Environment") return c.environment.length ? c.environment.join(", ") : "—";
  for (const g of Object.values(c.specGroups)) if (k in g) return g[k];
  return "—";
}

const keysOf = (c: Comparable) => new Set(Object.values(c.specGroups).flatMap((g) => Object.keys(g)));

// Rows present on at least two models; differing rows first, each block in priority order.
export function compareRows(models: Comparable[], limit = 12) {
  const keys = [...new Set(["Interface", "Environment", ...models.flatMap((c) => [...keysOf(c)])])]
    .filter((k) => models.filter((c) => specValue(c, k) !== "—").length >= 2);
  const differs = (k: string) => new Set(models.map((c) => specValue(c, k))).size > 1;
  return keys
    .map((k) => ({ key: k, differs: differs(k), values: models.map((c) => specValue(c, k)) }))
    .sort((a, b) => Number(b.differs) - Number(a.differs) || rank(a.key) - rank(b.key))
    .slice(0, limit);
}

// The most useful alternatives to compare against: explicit variants, then the same category, the same interface,
// a shared environment and overlapping decision specs. Ties keep catalogue order.
export function comparableTo<T extends Comparable>(p: T, pool: T[], n = 3): T[] {
  const pk = keysOf(p);
  const score = (c: T) =>
    (p.variants.includes(c.slug) || c.variants.includes(p.slug) ? 6 : 0) +
    (c.categorySlug === p.categorySlug ? 4 : 0) +
    (c.interface && c.interface === p.interface ? 2 : 0) +
    (c.environment.some((e) => p.environment.includes(e)) ? 1 : 0) +
    [...keysOf(c)].filter((k) => pk.has(k) && rank(k) < PRIORITY.length).length * 0.25;
  return pool
    .filter((c) => c.slug !== p.slug)
    .map((c, i) => ({ c, s: score(c), i }))
    .filter((x) => x.s >= 4) // stay within the category or a declared variant
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, n)
    .map((x) => x.c);
}
