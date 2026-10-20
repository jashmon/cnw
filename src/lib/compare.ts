import type { Product } from "./catalogue";
import { environmentLabel, interfaceLabel } from "./labels.ts";

// Model comparison: which models to compare, and which rows to show.

type Comparable = Pick<Product, "slug" | "categorySlug" | "interface" | "environment" | "specGroups" | "variants"> & { capabilities?: Record<string, { value: string; detail?: string }> };

// Buyer-decision order: interface and line, power, protection, environment, output, installation, features.
const PRIORITY = [
  /^interface$/i, /protocol|phone line|line voltage|loop current|dialling|gsm/i,
  /power supply|power consumption|standby|rated power|ups/i,
  /ip rating|protection|enclosure|dust|moisture|insulation/i, /^environment$/i, /temperature|humidity/i,
  /amplifier|speaker|sound output|horn|ringer output|led count|beam|display|message length/i,
  /mounting|connection|cabl|connector|ports/i, /dimensions|weight|housing/i,
  /keypad|handset|count input|working mode|output contact|reset|flasher/i,
];
const rank = (k: string, caps?: Set<string>) => { if (caps?.has(k)) return -1; const i = PRIORITY.findIndex((r) => r.test(k)); return i < 0 ? PRIORITY.length : i; };
// source-provenance notes that may be dropped when comparing values; engineering qualifiers such as (RMS) or (peak) stay
const PROVENANCE = /^(?:[\w .&'’-]*?(?:pdf|web|printed|catalogue|catalog|datasheet|manual|spec(?:ification)?s?(?: table)?|features|page|site|version|standard|deck|brochure|per web|as printed)[\w .&'’/,-]*)$/i;

export const NOT_SPECIFIED = "Not specified";

const keysOf = (c: Comparable) => new Set([...Object.keys(c.capabilities ?? {}), ...Object.values(c.specGroups).flatMap((g) => Object.keys(g))]);

export function specValue(c: Comparable, k: string): string {
  if (k === "Interface") return c.interface ? interfaceLabel(c.interface) : NOT_SPECIFIED;
  if (k === "Environment") return c.environment.length ? c.environment.map(environmentLabel).join(", ") : NOT_SPECIFIED;
  if (c.capabilities?.[k]?.value.trim()) return c.capabilities[k].value;
  for (const g of Object.values(c.specGroups)) if (k in g && String(g[k]).trim()) return g[k];
  return NOT_SPECIFIED;
}

// Comparison key for a value: equal engineering values compare equal even when written differently
// ("30 W" / "30W", "IP-65" / "IP 65", "0.6 kg (as printed)" / "0.6 kg", "140 x 120" / "140 × 120").
// Only used to decide same/different; the table always shows the original text.
export function normalizeSpec(v: string): string {
  return v
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\(([^)]*)\)/g, (m, inner: string) => (PROVENANCE.test(inner.trim()) ? " " : m))  // drop only source notes
    .replace(/(\d)\s*(?:to|upto|up to)\s*(?=[+-]?\d)/g, "$1-")       // "40 to 100 V" = "40–100 V"
    .replace(/(\d)\s*\/\s*(?=\d)/g, "$1/")
    .replace(/['"‘’“”]/g, "")
    .replace(/[×✕]/g, "x")
    .replace(/[–—−]/g, "-")
    .replace(/\bip\s*-?\s*(\d)/g, "ip$1")  // IP 65, IP-65 → ip65
    .replace(/\s+/g, "")
    .replace(/[.,;:]+$/, "");
}

export type RowState = "differs" | "same" | "partial";
/** values: what is compared; notes: explanatory detail under a capability value (never compared) */
export type Row = { key: string; state: RowState; values: string[]; notes: (string | undefined)[] };

// Rows present on at least two models. States:
//   differs  two or more different specified values
//   same     every model specifies it, all equal
//   partial  equal wherever specified, but some models don't specify it (never reported as a difference)
// Order: differs, same, partial; each block in buyer-decision priority.
export function compareRows(models: Comparable[], limit = 12): Row[] {
  const keys = [...new Set(["Interface", "Environment", ...models.flatMap((c) => [...keysOf(c)])])];
  const caps = new Set(models.flatMap((c) => Object.keys(c.capabilities ?? {})));
  const order: Record<RowState, number> = { differs: 0, same: 1, partial: 2 };
  return keys
    .map((key) => {
      const values = models.map((c) => specValue(c, key));
      const given = values.filter((v) => v !== NOT_SPECIFIED);
      const distinct = new Set(given.map(normalizeSpec)).size;
      const state: RowState = distinct > 1 ? "differs" : given.length === values.length ? "same" : "partial";
      return { key, state, values, notes: models.map((c) => c.capabilities?.[key]?.detail), given: given.length };
    })
    .filter((r) => r.given >= 2)
    .sort((a, b) => order[a.state] - order[b.state] || rank(a.key, caps) - rank(b.key, caps))
    .slice(0, limit)
    .map(({ key, state, values, notes }) => ({ key, state, values, notes }));
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
