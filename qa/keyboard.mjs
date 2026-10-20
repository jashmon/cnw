// Keyboard + zoom checks (WCAG 2.2: 2.1.1 keyboard, 2.4.7/2.4.11 focus visible and not obscured, 2.5.3 label in
// name, 1.4.10 reflow). Tabs through each key page and checks every focus stop is visible, unobscured by sticky
// layers, and named; then checks 400% zoom (1280px wide → 320 CSS px) and 200% zoom for horizontal scrolling.
// Usage: node qa/keyboard.mjs http://localhost:3200
import { chromium } from "playwright";

const base = process.argv[2] || "http://localhost:3200";
const pages = ["/", "/products", "/products/industrial-telephones", "/products/industrial-telephones/wmhs-iii", "/systems/plant-pa-system", "/downloads", "/quote", "/contact"];
const b = await chromium.launch();
const problems = [];

for (const vw of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const ctx = await b.newContext({ viewport: vw, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  for (const r of pages) {
    await p.goto(base + r, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    const seen = new Set();
    for (let i = 0; i < 70; i++) {
      await p.keyboard.press("Tab");
      const f = await p.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        const ring = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow && cs.boxShadow !== "none");
        const rc = e.getBoundingClientRect();
        // obscured: centre point covered by a sticky/fixed layer that is not the element or its ancestor
        const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, rc.left + rc.width / 2)), Math.min(innerHeight - 1, Math.max(0, rc.top + Math.min(rc.height / 2, 8))));
        const obscured = !!top && !e.contains(top) && !top.contains(e) && !!top.closest("header,[class*=bar],[style*=sticky]") && !e.closest("header");
        const name = (e.getAttribute("aria-label") || e.textContent || (e.labels?.[0]?.textContent ?? "") || e.getAttribute("placeholder") || e.getAttribute("title") || "").trim();
        const visible = (e.labels?.[0]?.textContent || (e.matches("a,button,summary") ? e.textContent : "") || "").replace(/\s+/g, " ").trim();
        const aria = e.getAttribute("aria-label");
        const labelInName = !aria || !visible || aria.toLowerCase().includes(visible.toLowerCase().replace(/[→↓+×]/g, "").trim().slice(0, 12));
        const id = `${e.tagName.toLowerCase()} "${(aria || e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30)}"`;
        return { id, ring, obscured, named: !!name, labelInName, inView: rc.bottom > 0 && rc.top < innerHeight };
      });
      if (!f) continue;
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      const where = `${vw.width}px ${r}: ${f.id}`;
      if (!f.ring) problems.push(`no visible focus ring · ${where}`);
      if (f.obscured) problems.push(`focus obscured by a sticky layer · ${where}`);
      if (!f.named) problems.push(`no accessible name · ${where}`);
      if (!f.labelInName) problems.push(`visible label not in accessible name · ${where}`);
      if (!f.inView) problems.push(`focused element off-screen · ${where}`);
    }
  }
  await ctx.close();
}

// reflow: 400% zoom of a 1280px window = 320 CSS px; 200% = 640 CSS px
for (const width of [320, 640]) {
  const p = await b.newPage({ viewport: { width, height: 720 } });
  for (const r of pages) {
    await p.goto(base + r, { waitUntil: "load" });
    const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (o > 0) problems.push(`horizontal scroll at ${width === 320 ? "400%" : "200%"} zoom (+${o}px) · ${r}`);
  }
  await p.close();
}
await b.close();
for (const x of problems.slice(0, 40)) console.log(x);
console.log(problems.length ? `${problems.length} keyboard/zoom problems` : "keyboard and zoom: no problems");
process.exitCode = problems.length ? 1 : 0;
