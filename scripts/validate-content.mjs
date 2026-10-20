// Build-time content contract (R02): the catalogue JSON is asserted into types at runtime, so malformed
// editorial input would otherwise surface as a broken page. Runs before `next build` (prebuild) and in `npm run qa`.
import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "src/content/data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

const cat = read("catalogue.json");
const voice = read("products.json");
const voiceList = Array.isArray(voice) ? voice : Object.values(voice);
const systems = read("systems.json");
const manifest = read("manifest.json");

if (!Array.isArray(cat) || !cat.length) err("catalogue.json: expected a non-empty array");
const slugs = new Set();
const codes = new Map();
for (const p of cat) {
  if (typeof p.slug !== "string" || !/^[a-z0-9-]+$/.test(p.slug)) { err(`catalogue: bad slug ${JSON.stringify(p.slug)}`); continue; }
  if (slugs.has(p.slug)) err(`catalogue: duplicate slug ${p.slug}`);
  slugs.add(p.slug);
  for (const k of ["name", "category", "summary"]) if (typeof p[k] !== "string" || !p[k].trim()) err(`catalogue ${p.slug}: missing ${k}`);
  if (p.model) codes.set(p.model, [...(codes.get(p.model) ?? []), p.slug]);
  if (p.specs && typeof p.specs === "object") for (const [k, v] of Object.entries(p.specs)) if (typeof v !== "string" && !(v && typeof v === "object")) err(`catalogue ${p.slug}: spec ${k} is ${typeof v}`);
  // catalogue variants are written as model codes (the copy deck gives slugs); either must resolve to a product
  // a code with no product page (sub-variants such as WMHS-IP-POE, LSOD-XT) is a note, not a broken link: warn only
  for (const v of p.variants ?? []) if (!cat.some((x) => x.slug === v || x.model === v)) warn(`catalogue ${p.slug}: variant ${v} has no product page`);
}
// Shared model codes must have a display qualifier (lib/catalogue CODE_QUALIFIER) or they stay ambiguous on orders.
const qualified = fs.readFileSync(path.join(process.cwd(), "src/lib/catalogue.ts"), "utf8").match(/CODE_QUALIFIER[^}]*\}/)?.[0] ?? "";
for (const [code, list] of codes) if (list.length > 1) for (const sl of list) if (!qualified.includes(`"${sl}"`)) err(`model code ${code} is shared by ${list.join(", ")}; ${sl} has no CODE_QUALIFIER`);

for (const v of voiceList) {
  if (!slugs.has(v.slug)) err(`products.json: ${v.slug} is not in the catalogue`);
  if (v.specGroups) for (const [g, kv] of Object.entries(v.specGroups)) {
    if (!kv || typeof kv !== "object") { err(`products ${v.slug}: spec group ${g} is not an object`); continue; }
    for (const [k, val] of Object.entries(kv)) if (typeof val !== "string") err(`products ${v.slug}: ${g} › ${k} is ${typeof val}`);
  }
  for (const k of ["variants", "related"]) for (const r of v[k] ?? []) if (!slugs.has(r)) err(`products ${v.slug}: ${k} → unknown ${r}`);
  for (const f of v.faq ?? []) if (!f.q || !f.a) err(`products ${v.slug}: FAQ entry missing q or a`);
}

for (const sy of systems) {
  for (const c of sy.components ?? []) if (!slugs.has(c)) err(`systems ${sy.slug}: unknown component ${c}`);
  for (const g of sy.componentGroups ?? []) {
    if (!g.title) err(`systems ${sy.slug}: component group without a title`);
    for (const it of g.items ?? []) { if (!slugs.has(it.slug)) err(`systems ${sy.slug}: group "${g.title}" → unknown ${it.slug}`); if (!it.role) err(`systems ${sy.slug}: ${it.slug} has no role`); }
  }
}

for (const m of manifest) {
  if (!slugs.has(m.slug)) err(`manifest: ${m.slug} is not in the catalogue`);
  for (const img of [m.primary, ...(m.gallery ?? [])].filter(Boolean)) {
    if (!img.file || !img.w || !img.h || !img.alt) err(`manifest ${m.slug}: image missing file, w, h or alt`);
    else if (!fs.existsSync(path.join(process.cwd(), "public", img.file.replace(/^processed\//, "media/")))) err(`manifest ${m.slug}: file not synced: ${img.file}`);
  }
}

// compare-fields: every slug exists, every key belongs to the category's field list
const cf = fs.readFileSync(path.join(process.cwd(), "src/content/compare-fields.ts"), "utf8");
for (const m of cf.matchAll(/^\s+"([a-z0-9-]+)":\s*\{/gm)) if (!slugs.has(m[1])) err(`compare-fields: unknown product ${m[1]}`);

if (errors.length) { console.error(`content validation: ${errors.length} problem${errors.length > 1 ? "s" : ""}`); errors.slice(0, 400).forEach((e) => console.error("  " + e)); process.exit(1); }
if (warnings.length) console.log(`content validation: ${warnings.length} note${warnings.length > 1 ? "s" : ""} (variant codes without a product page)`);
console.log(`content validation: ${cat.length} products, ${systems.length} systems, ${manifest.length} image sets OK`);
