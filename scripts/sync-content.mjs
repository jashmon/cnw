// Copies the pipeline outputs into the site: catalogue (01-brief), copy deck (06-voice),
// imagery manifest + processed images (07-imagery), datasheet PDFs (00-intake).
// Run: node scripts/sync-content.mjs   (idempotent)
import fs from "node:fs";
import path from "node:path";

const site = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const proj = path.resolve(site, "..");
const data = path.join(site, "src/content/data");
fs.mkdirSync(data, { recursive: true });

const copy = (from, to) => { if (fs.existsSync(from)) { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); return true; } return false; };
const log = (k, ok) => console.log(`${ok ? "ok  " : "miss"} ${k}`);

log("catalogue.json", copy(path.join(proj, "01-brief/catalogue.json"), path.join(data, "catalogue.json")));
for (const f of ["products.json", "categories.json", "industries.json", "systems.json"]) log(f, copy(path.join(proj, "06-voice", f), path.join(data, f)));
log("manifest.json", copy(path.join(proj, "07-imagery/manifest.json"), path.join(data, "manifest.json")));

// processed product + site images → public/media
const src = path.join(proj, "07-imagery/processed");
if (fs.existsSync(src)) { fs.cpSync(src, path.join(site, "public/media"), { recursive: true }); console.log("ok   media"); }

// datasheets: catalogue `pdf` (relative to 00-intake) → public/files/datasheets/<slug>.pdf
const cat = JSON.parse(fs.readFileSync(path.join(data, "catalogue.json"), "utf8"));
const out = path.join(site, "public/files/datasheets"); fs.mkdirSync(out, { recursive: true });
const sizes = {}; let n = 0;
for (const p of cat) {
  if (!p.pdf) continue;
  const from = path.join(proj, "00-intake", p.pdf);
  if (copy(from, path.join(out, `${p.slug}.pdf`))) { sizes[p.slug] = fs.statSync(from).size; n++; }
}
fs.writeFileSync(path.join(data, "datasheets.json"), JSON.stringify(sizes, null, 1));
console.log(`ok   ${n} datasheets`);

// demo audio
const rec = path.join(proj, "00-intake/cnwcom/recording");
if (fs.existsSync(rec)) {
  fs.mkdirSync(path.join(site, "public/files/audio"), { recursive: true });
  copy(path.join(rec, "01- Induction_Eng.mp3"), path.join(site, "public/files/audio/voice-alarm-demo-english.mp3"));
  copy(path.join(rec, "01-Induction safety_Hindi.mp3"), path.join(site, "public/files/audio/voice-alarm-demo-hindi.mp3"));
  console.log("ok   audio");
}
