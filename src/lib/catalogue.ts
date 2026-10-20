import "server-only";
import { CAPABILITIES } from "@/content/compare-fields";
import fs from "node:fs";
import path from "node:path";

// Merges three pipeline outputs, synced into src/content/data by scripts/sync-content.mjs:
//   catalogue.json (facts + sources, 01-brief) · products.json etc. (copy deck, 06-voice) · manifest.json (07-imagery)
// The copy deck wins for wording; catalogue facts are the fallback so the site never shows an empty field.

const DATA = path.join(process.cwd(), "src/content/data");
function read<T>(file: string, fallback: T): T {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, file), "utf8")) as T; } catch { return fallback; }
}

export type Img = { src: string; w: number; h: number; alt: string; source: "photo" | "render"; placeholder: boolean };
export type SpecGroups = Record<string, Record<string, string>>;
export type Product = {
  slug: string; model: string; name: string; family: string; familySlug: string; category: string; categorySlug: string;
  cardLine: string; intro: string; idealFor: string[]; highlights: string[]; keySpecs: string[]; specGroups: SpecGroups;
  environment: string[]; interface: string; variants: string[]; related: string[]; faq: { q: string; a: string }[];
  seoTitle: string; metaDescription: string; needsClient: string[]; legacyNames: string[];
  images: Img[]; datasheet: { href: string; bytes: number; sharedWith: string[] } | null; applications: string[];
  /** The manufacturer's model code as printed. `model` adds a qualifier when two products share one code (F09). */
  modelCode: string;
  capabilities: Record<string, string>;
};
export type CardProduct = Pick<Product, "slug" | "model" | "name" | "category" | "categorySlug" | "cardLine" | "keySpecs" | "environment" | "interface" | "legacyNames"> & { images: Img[] };
export const toCard = (p: Product): CardProduct => ({ slug: p.slug, model: p.model, name: p.name, category: p.category, categorySlug: p.categorySlug, cardLine: p.cardLine, keySpecs: p.keySpecs, environment: p.environment, interface: p.interface, legacyNames: p.legacyNames, images: p.images.slice(0, 1) });
export type Category = { slug: string; name: string; family: string; familySlug: string; intro: string; cardLine: string; seoTitle: string; metaDescription: string; products: string[] };
export type Family = { slug: string; name: string; cardLine: string; categories: Category[] };
export type Industry = { slug: string; name: string; intro: string; problems: string[]; recommendedProducts: string[]; clientsInSector: { name: string; sites?: string; country?: string }[]; seoTitle: string; metaDescription: string };
export type ComponentGroup = { title: string; note?: string; items: { slug: string; role: string }[] };
export type System = { slug: string; name: string; intro: string; howItWorks: string[]; components: string[]; componentGroups?: ComponentGroup[]; diagramNotes?: string; seoTitle?: string; metaDescription?: string };
// Two products carry the same printed model code (WMHS-IP). Their display code gets a short qualifier everywhere
// (search, cards, chips, quote lines, filenames) so a purchase order is unambiguous. To confirm with the business.
const CODE_QUALIFIER: Record<string, string> = { "wmhs-ip-pa-telephone": "PA", "wmhs-ip-sip-phone": "SIP" };
/** Safe for a download filename: letters, digits, dots and dashes. */
export const fileCode = (s: string) => s.replace(/[^A-Za-z0-9.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// Family/category structure approved at checkpoint 1 (05-architecture).
export const FAMILY_ORDER: { slug: string; name: string; categories: string[] }[] = [
  { slug: "telephones", name: "Telephones", categories: ["Industrial Telephones", "PA Telephones", "Weatherproof & Flameproof Telephones", "IP / VoIP Telephones & Systems", "Clean Room Phones", "Hotline Systems", "Rail & Metro Telephones"] },
  { slug: "plant-pa-paging", name: "Plant PA & Paging", categories: ["Plant Communication (PA) Systems", "Operator Consoles, Amplifiers & Loudspeakers", "Crane Communication"] },
  { slug: "alarms-emergency", name: "Alarms & Emergency", categories: ["Emergency Call Boxes", "Hooters, Flashers & Loud Ringers", "Voice Alarms & Messagers", "Lift Alarm"] },
  { slug: "process-instruments", name: "Process Instruments", categories: ["Bag Counters", "Display Units"] },
  { slug: "lighting", name: "Lighting", categories: ["LED Lighting"] },
];

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type CatRaw = { slug: string; model: string; name: string; category: string; summary: string; features?: string[]; specs?: Record<string, unknown>; applications?: string[]; variants?: string[]; pdf?: string; notes?: string };
type VoiceRaw = Partial<Product> & { slug: string };
type ManRaw = { slug: string; primary?: { file: string; source: string; placeholder?: boolean; w: number; h: number; alt: string }; gallery?: { file: string; source: string; w: number; h: number; alt: string; placeholder?: boolean }[] };

// Datasheets withheld until the client confirms which version is current (catalogue-notes: FLP datasheets describe two different products).
const WITHHOLD_DATASHEET = new Set(["flp"]);

let cache: { products: Product[]; categories: Category[]; families: Family[] } | null = null;

const toMediaSrc = (f: string) => (f.startsWith("/") ? f : `/media/${f.replace(/^processed\//, "").replace(/^07-imagery\/processed\//, "")}`);
const flatSpecs = (s: Record<string, unknown> = {}): SpecGroups => {
  const g: Record<string, string> = {};
  for (const [k, v] of Object.entries(s)) g[k] = Array.isArray(v) ? v.join("; ") : typeof v === "object" && v ? Object.entries(v).map(([a, b]) => `${a}: ${b}`).join("; ") : String(v);
  return { Specifications: g };
};

function build() {
  const cat = read<CatRaw[]>("catalogue.json", []);
  const voice = new Map(read<VoiceRaw[]>("products.json", []).map((v) => [v.slug, v]));
  const man = new Map(read<ManRaw[]>("manifest.json", []).map((m) => [m.slug, m]));
  const sheets = read<Record<string, number>>("datasheets.json", {});
  const shared = read<Record<string, string[]>>("datasheet-shared.json", {});
  const catRaw = read<Category[] | { families: { slug: string; cardLine?: string; categories: Category[] }[] }>("categories.json", []);
  const catVoice: Category[] = Array.isArray(catRaw) ? catRaw : catRaw.families.flatMap((f) => f.categories);
  const famVoice = Array.isArray(catRaw) ? [] : catRaw.families;

  const famOf = (category: string) => FAMILY_ORDER.find((f) => f.categories.includes(category)) ?? FAMILY_ORDER[0];

  const products: Product[] = cat.map((c) => {
    const v = voice.get(c.slug) ?? ({ slug: c.slug } as VoiceRaw);
    const m = man.get(c.slug);
    const category = v.category ?? c.category;
    const fam = famOf(category);
    const images: Img[] = [];
    if (m?.primary) images.push({ src: toMediaSrc(m.primary.file), w: m.primary.w, h: m.primary.h, alt: m.primary.alt, source: m.primary.source === "photo" ? "photo" : "render", placeholder: m.primary.placeholder ?? m.primary.source !== "photo" });
    for (const gi of m?.gallery ?? []) images.push({ src: toMediaSrc(gi.file), w: gi.w, h: gi.h, alt: gi.alt, source: gi.source === "photo" ? "photo" : "render", placeholder: gi.placeholder ?? gi.source !== "photo" });
    const name = v.name ?? c.name.replace(/^SMART\s+/i, "");
    return {
      slug: c.slug,
      model: v.model ?? c.model ?? "",
      name,
      family: fam.name,
      familySlug: fam.slug,
      category,
      categorySlug: v.categorySlug ?? slugify(category),
      cardLine: v.cardLine ?? c.summary.split(". ")[0],
      intro: v.intro ?? c.summary,
      idealFor: v.idealFor ?? c.applications?.slice(0, 6) ?? [],
      highlights: v.highlights ?? c.features?.slice(0, 6) ?? [],
      keySpecs: v.keySpecs ?? [],
      specGroups: v.specGroups && Object.keys(v.specGroups).length ? v.specGroups : flatSpecs(c.specs),
      environment: v.environment ?? [],
      interface: v.interface ?? "",
      variants: (v.variants ?? c.variants ?? []).filter((s) => s !== c.slug),
      related: v.related ?? [],
      faq: v.faq ?? [],
      seoTitle: v.seoTitle ?? `${c.model ?? ""} ${name} | SMART`.trim(),
      metaDescription: v.metaDescription ?? c.summary.slice(0, 155),
      needsClient: v.needsClient ?? [],
      legacyNames: v.legacyNames ?? [],
      applications: c.applications ?? [],
      modelCode: v.model ?? c.model ?? "",
      capabilities: CAPABILITIES[c.slug] ?? {},
      images,
      datasheet: sheets[c.slug] && !WITHHOLD_DATASHEET.has(c.slug) ? { href: `/files/datasheets/${c.slug}.pdf`, bytes: sheets[c.slug], sharedWith: shared[c.slug] ?? [] } : null,
    };
  });
  // F09: qualify display codes that two products share
  const codeCount = new Map<string, number>();
  for (const p of products) if (p.model) codeCount.set(p.model, (codeCount.get(p.model) ?? 0) + 1);
  for (const p of products) if (p.model && (codeCount.get(p.model) ?? 0) > 1) {
    const q = CODE_QUALIFIER[p.slug];
    if (q) { if (!p.legacyNames.includes(p.model)) p.legacyNames = [...p.legacyNames, p.model]; p.model = `${p.model} · ${q}`; }
  }
  const slugs = new Set(products.map((p) => p.slug));
  for (const p of products) { p.variants = p.variants.filter((s) => slugs.has(s)); p.related = p.related.filter((s) => slugs.has(s)); }

  const categories: Category[] = [];
  for (const fam of FAMILY_ORDER) for (const name of fam.categories) {
    const cv = catVoice.find((c) => c.name === name);
    const members = products.filter((p) => p.category === name);
    if (!members.length) continue;
    const slug = cv?.slug ?? members[0].categorySlug;
    members.forEach((p) => (p.categorySlug = slug));
    categories.push({
      slug, name, family: fam.name, familySlug: fam.slug,
      intro: cv?.intro ?? "", cardLine: cv?.cardLine ?? "", seoTitle: cv?.seoTitle ?? `${name} | SMART by Cables & Wireless Co.`,
      metaDescription: cv?.metaDescription ?? `${members.length} SMART ${name.toLowerCase()} models with datasheets. Built in Nagpur by Cables & Wireless Co.`,
      products: members.map((p) => p.slug),
    });
  }
  const families: Family[] = FAMILY_ORDER.map((f) => ({ slug: f.slug, name: f.name, cardLine: famVoice.find((v) => v.slug === f.slug)?.cardLine ?? "", categories: categories.filter((c) => c.familySlug === f.slug) }));
  return { products, categories, families };
}

function data() { return (cache ??= build()); }
export const getProducts = () => data().products;
export const getProduct = (slug: string) => data().products.find((p) => p.slug === slug) ?? null;
export const getCategories = () => data().categories;
export const getCategory = (slug: string) => data().categories.find((c) => c.slug === slug) ?? null;
export const getFamilies = () => data().families;
export const getIndustries = () => read<Industry[]>("industries.json", []);
export const getSystems = () => read<System[]>("systems.json", []);
import { productHref } from "./href";
export { productHref };

/** Light index for the client-side search and quote list (no long copy). */
export function searchIndex() {
  return getProducts().map((p) => ({
    slug: p.slug, model: p.model || p.name, name: p.name, category: p.category, href: productHref(p),
    img: p.images[0]?.src ?? null, aliases: p.legacyNames,
  }));
}
