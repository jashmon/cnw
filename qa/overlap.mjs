// Visual-collision check: on key pages (quote list populated) at 320–1440px, find visible text/controls whose boxes
// overlap another unrelated one (neither contains the other), plus controls clipped by their own box.
// Usage: node qa/overlap.mjs http://localhost:3200 [shotsDir]   (shotsDir: also save a full-page PNG per page×width)
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.argv[2] || "http://localhost:3200";
const shots = process.argv[3];
const widths = [320, 390, 768, 1024, 1280, 1440];
const pages = ["/", "/products", "/products/industrial-telephones", "/products/industrial-telephones/wmhs-iii", "/systems/plant-pa-system", "/downloads", "/quote"];
const quote = [
  { slug: "gsm-ecb-server-rack", model: "GSM-ECB SERVER RACK", name: "Emergency Call Box Central Server Rack", href: "/products/emergency-call-boxes/gsm-ecb-server-rack", img: "/media/products/gsm-ecb-server-rack/primary.webp", qty: 12 },
  { slug: "wmhs-iiiwp-voip", model: "WMHS-IIIWP-VOIP", name: "Weatherproof VoIP Telephone", href: "/products/weatherproof-flameproof-telephones/wmhs-iiiwp-voip", img: null, qty: 3 },
];
if (shots) fs.mkdirSync(shots, { recursive: true });
const b = await chromium.launch();
let problems = 0;
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript((q) => localStorage.setItem("cw-quote-v1", JSON.stringify(q)), quote);
  // self-test hook: QA_INJECT_CSS='…' adds CSS to every page (e.g. a forced collision) to prove the check fires
  if (process.env.QA_INJECT_CSS) await ctx.addInitScript((css) => addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = css; document.head.append(st); }), process.env.QA_INJECT_CSS);
  const p = await ctx.newPage();
  for (const r of pages) {
    await p.goto(base + r, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    const hits = await p.evaluate(() => {
      const vis = (e) => { const cs = getComputedStyle(e); const rc = e.getBoundingClientRect(); return rc.width > 1 && rc.height > 1 && cs.visibility !== "hidden" && cs.opacity !== "0" && !e.closest(".sr-only,[inert],[aria-hidden=true],dialog:not([open])") && !(e.closest("details:not([open])") && !e.closest("summary")); };
      // leaf-ish text holders and controls
      const els = [...document.querySelectorAll("main h1,main h2,main h3,main p,main li,main a,main button,main label,main input,main select,main th,main td,main dt,main dd,main .code,main .chip,main .spec-chip,header a,header button,header input")]
        .filter(vis).filter((e) => !e.closest("svg"));
      const out = [];
      // inline elements that wrap: use their per-line boxes, not the bounding box that spans the lines
      const rects = els.map((e) => (getComputedStyle(e).display === "inline" ? [...e.getClientRects()] : [e.getBoundingClientRect()]));
      for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
        const a = els[i], c = els[j];
        if (a.contains(c) || c.contains(a)) continue;
        let ix = 0, iy = 0;
        for (const A of rects[i]) for (const C of rects[j]) {
          const x = Math.min(A.right, C.right) - Math.max(A.left, C.left), y = Math.min(A.bottom, C.bottom) - Math.max(A.top, C.top);
          if (x > 3 && y > 3 && x * y > ix * iy) { ix = x; iy = y; }
        }
        if (ix > 3 && iy > 3) {
          // sticky/fixed layers legitimately sit over content
          const layered = (e) => { for (let n = e; n; n = n.parentElement) { const ps = getComputedStyle(n).position; if (ps === "sticky" || ps === "fixed") return true; } return false; };
          if (layered(a) !== layered(c)) continue;
          out.push(`${a.tagName.toLowerCase()} "${(a.textContent || a.getAttribute("aria-label") || "").trim().slice(0, 28)}" × ${c.tagName.toLowerCase()} "${(c.textContent || c.getAttribute("aria-label") || "").trim().slice(0, 28)}" (${Math.round(ix)}×${Math.round(iy)})`);
        }
      }
      for (const e of els.filter((x) => x.matches("a,button,label,.code,.chip"))) if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== "visible" && !e.querySelector(".arr,[class*=arr]")) out.push(`clipped: ${e.tagName.toLowerCase()} "${(e.textContent || "").trim().slice(0, 30)}"`);
      return out.slice(0, 6);
    });
    if (hits.length) { problems += hits.length; console.log(`${w}px ${r}\n   ${hits.join("\n   ")}`); }
    if (shots) await p.screenshot({ path: `${shots}/${w}${r.replace(/\//g, "_") || "_"}.png`, fullPage: true });
  }
  await ctx.close();
}
await b.close();
console.log(problems ? `${problems} overlap/clip findings` : "no overlaps or clipped controls");
process.exitCode = problems ? 1 : 0;
