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
        // outline contrast vs the first opaque background behind the element (WCAG 1.4.11 needs 3:1)
        const rgb = (str) => { const m = str.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = "1"] = m[1].split(",").map((x) => x.trim()); return parseFloat(a) === 0 ? null : [r, g, b].map(Number); };
        const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        let bg = null; for (let n = e; n && !bg; n = n.parentElement) bg = rgb(getComputedStyle(n).backgroundColor);
        const oc = cs.outlineStyle !== "none" ? rgb(cs.outlineColor) : null;
        // a spread box-shadow is an inner ring between the element and the outline: then the outline's adjacent
        // colour is that ring, and the ring itself must contrast with the element
        const sh = cs.boxShadow && cs.boxShadow !== "none" ? cs.boxShadow.match(/(rgba?\([^)]+\)) 0px 0px 0px (\d+)px/) : null;
        const ringCol = sh && parseInt(sh[2], 10) >= 2 ? rgb(sh[1]) : null;
        const cr = (x, y) => (Math.max(lum(x), lum(y)) + 0.05) / (Math.min(lum(x), lum(y)) + 0.05);
        const ringContrast = oc && bg ? (ringCol ? Math.min(cr(oc, ringCol), cr(ringCol, bg)) : cr(oc, bg)) : null;
        const rc = e.getBoundingClientRect();
        // obscured: centre point covered by a sticky/fixed layer that is not the element or its ancestor
        const top = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(0, rc.left + rc.width / 2)), Math.min(innerHeight - 1, Math.max(0, rc.top + Math.min(rc.height / 2, 8))));
        const obscured = !!top && !e.contains(top) && !top.contains(e) && !!top.closest("header,[class*=bar],[style*=sticky]") && !e.closest("header");
        const name = (e.getAttribute("aria-label") || e.textContent || (e.labels?.[0]?.textContent ?? "") || e.getAttribute("placeholder") || e.getAttribute("title") || "").trim();
        const visible = (e.labels?.[0]?.textContent || (e.matches("a,button,summary") ? e.textContent : "") || "").replace(/\s+/g, " ").trim();
        const aria = e.getAttribute("aria-label");
        const labelInName = !aria || !visible || aria.toLowerCase().includes(visible.toLowerCase().replace(/[→↓+×]/g, "").trim().slice(0, 12));
        const id = `${e.tagName.toLowerCase()} "${(aria || e.textContent || "").replace(/\s+/g, " ").trim().slice(0, 30)}"`;
        return { id, ring, ringContrast, obscured, named: !!name, labelInName, inView: rc.bottom > 0 && rc.top < innerHeight };
      });
      if (!f) continue;
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      const where = `${vw.width}px ${r}: ${f.id}`;
      if (!f.ring) problems.push(`no visible focus ring · ${where}`);
      if (f.ringContrast !== null && f.ringContrast < 3) problems.push(`focus ring contrast ${f.ringContrast.toFixed(2)}:1 (< 3:1) · ${where}`);
      if (f.obscured) problems.push(`focus obscured by a sticky layer · ${where}`);
      if (!f.named) problems.push(`no accessible name · ${where}`);
      if (!f.labelInName) problems.push(`visible label not in accessible name · ${where}`);
      if (!f.inView) problems.push(`focused element off-screen · ${where}`);
    }
  }
  await ctx.close();
}

// F02: arrow-selected search results stay visible (phone height, mobile menu search)
{
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(base + "/", { waitUntil: "load" });
  await p.click('button[aria-label="Menu"]'); await p.waitForTimeout(250);
  const input = p.locator('#m-sheet input[placeholder^="Search models"]');
  await input.fill("telephone"); await p.waitForTimeout(150);
  for (let i = 0; i < 7; i++) await p.keyboard.press("ArrowDown");
  await p.waitForTimeout(100);
  const r = await p.evaluate(() => { const inp = document.querySelector('#m-sheet input[role=combobox]'); const opt = document.getElementById(inp.getAttribute("aria-activedescendant") || ""); const list = opt?.closest("[role=listbox]"); if (!opt || !list) return "no option"; const o = opt.getBoundingClientRect(), l = list.getBoundingClientRect(); return o.top >= l.top - 1 && o.bottom <= l.bottom + 1 ? "visible" : `hidden (${Math.round(o.top)}–${Math.round(o.bottom)} vs ${Math.round(l.top)}–${Math.round(l.bottom)})`; });
  if (r !== "visible") problems.push(`arrow-selected search result not visible: ${r} · 390px mobile menu`);
  await p.close();
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
