import { chromium } from "playwright"; import AxeBuilder from "@axe-core/playwright";
const [url, w] = process.argv.slice(2);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: +w || 390, height: 844 }, reducedMotion: "reduce" })).newPage();
await p.goto(url, { waitUntil: "networkidle" });
const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
for (const v of r.violations) for (const n of v.nodes) console.log(v.id, "|", n.target.join(" "), "|", n.html.slice(0, 160), "|", (n.failureSummary || "").split("\n").slice(1, 3).join(" "));
await b.close();
