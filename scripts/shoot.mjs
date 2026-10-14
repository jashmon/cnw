// Full-page desktop (1440) + mobile (390) screenshots of key routes, with overflow check.
// Usage: node scripts/shoot.mjs [outdir] [route ...]
import { chromium } from "playwright";
import path from "node:path";
const out = process.argv[2] || "../11-qa/shots";
const routes = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/products", "/products/industrial-telephones", "/products/industrial-telephones/wmhs-iii", "/products/bag-counters/bc-l02", "/systems/plant-pa-system", "/industries/cement", "/installed-at", "/about", "/downloads", "/quote", "/contact", "/vendor-kit", "/cross-reference", "/nope-404"];
const b = await chromium.launch();
for (const [label, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2, hasTouch: true }]]) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, deviceScaleFactor: vp.deviceScaleFactor ?? 1, hasTouch: vp.hasTouch, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto(`${process.env.BASE || "http://localhost:3000"}${r}`, { waitUntil: "networkidle" });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(500);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    const name = (r === "/" ? "home" : r.slice(1).replace(/\//g, "_")) + `__${label}.jpg`;
    await p.screenshot({ path: path.join(out, name), fullPage: true, type: "jpeg", quality: 70 });
    console.log(`${label} ${r} scrollWidth=${sw}${sw > vp.width + 1 ? "  OVERFLOW" : ""}`);
  }
  await ctx.close();
}
await b.close();
