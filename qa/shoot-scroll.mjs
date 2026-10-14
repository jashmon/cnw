// Full-page screenshots that scroll first, so scroll-triggered reveals, lazy images and
// in-view videos render. Also reports horizontal overflow per viewport.
// Usage (from a folder where `playwright` is installed): node shoot-scroll.mjs <urls.txt> <outdir>
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";

const [list, out] = process.argv.slice(2);
if (!list || !out) { console.error("usage: node shoot-scroll.mjs <urls.txt> <outdir>"); process.exit(2); }
mkdirSync(out, { recursive: true });
const urls = readFileSync(list, "utf8").split("\n").map((s) => s.trim()).filter((s) => s && !s.startsWith("#"));
const slug = (u) => u.replace(/https?:\/\//, "").replace(/[/?=&.:]+/g, "-").replace(/-+$/, "").slice(0, 80);
const browser = await chromium.launch();
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: name === "mobile", hasTouch: name === "mobile" });
  const page = await ctx.newPage();
  for (const u of urls) {
    try {
      await page.goto(u, { waitUntil: "networkidle", timeout: 45000 });
      await page.evaluate(async () => {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
        window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 400));
      });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await page.screenshot({ path: `${out}/${slug(u)}__${name}.png`, fullPage: true });
      console.log(`${overflow > 1 ? "WARN overflow " + overflow + "px" : "ok"}  ${name}  ${u}`);
    } catch (e) { console.log(`FAIL ${name} ${u} ${String(e).slice(0, 120)}`); }
  }
  await ctx.close();
}
await browser.close();
