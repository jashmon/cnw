// Horizontal overflow + clipped controls across widths. Usage: node qa/widths.mjs http://localhost:3000 [routes...]
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:3000";
const routes = process.argv.slice(3).length ? process.argv.slice(3) : ["/", "/products", "/products/industrial-telephones", "/products/industrial-telephones/wmhs-iii", "/systems/plant-pa-system", "/installed-at", "/quote", "/contact", "/downloads"];
const widths = [360, 390, 600, 768, 900, 1024, 1180, 1280, 1363, 1440, 1920];
const b = await chromium.launch(); let bad = 0;
for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 768, hasTouch: w < 768, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  for (const r of routes) {
    await p.goto(base + r, { waitUntil: "domcontentloaded" }); await p.waitForTimeout(300);
    const res = await p.evaluate(() => {
      const W = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
      const clipped = [...document.querySelectorAll("header a, header button, header input")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && getComputedStyle(e).visibility !== "hidden" && (r.right > W + 1 || r.left < -1); }).map((e) => (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().slice(0, 24));
      return { sw, W, clipped };
    });
    if (res.sw > res.W + 1 || res.clipped.length) { bad++; console.log(`${w}px ${r}: scrollWidth ${res.sw} > ${res.W}  clipped: ${res.clipped.join(", ")}`); }
  }
  await ctx.close();
}
await b.close(); console.log(bad ? `${bad} problems` : "no overflow at any width");
process.exitCode = bad ? 1 : 0;
