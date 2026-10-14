// Accessibility scan + console errors per route.
// Usage (from the site folder): node qa/a11y.mjs http://localhost:3100 ../11-qa/urls.txt
// Requires: npm i -D playwright @axe-core/playwright
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const [base, listFile] = process.argv.slice(2);
if (!base || !listFile) {
  console.error("usage: node qa/a11y.mjs <base-url> <urls.txt>");
  process.exit(2);
}
const routes = readFileSync(listFile, "utf8")
  .split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"))
  .map((u) => (u.startsWith("http") ? new URL(u).pathname : u));

const browser = await chromium.launch();
let serious = 0;
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const r of routes) {
    const errors = [];
    page.removeAllListeners("console");
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(base.replace(/\/$/, "") + r, { waitUntil: "networkidle" });
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    const bad = res.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    serious += bad.length;
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${viewport.width}px ${r}  axe:${bad.length} serious/critical, ${res.violations.length} total  console:${errors.length}  overflow:${overflow}px`);
    for (const v of bad) console.log(`   - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} nodes)`);
    for (const e of errors.slice(0, 5)) console.log(`   ! ${e.slice(0, 200)}`);
  }
  await context.close();
}
await browser.close();
process.exit(serious ? 1 : 0);
