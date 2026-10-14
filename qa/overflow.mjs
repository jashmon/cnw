import { chromium } from "playwright";
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
await p.goto(process.argv[2], { waitUntil: "networkidle" });
console.log(await p.evaluate(() => { const W = document.documentElement.clientWidth; return [document.documentElement.scrollWidth, ...[...document.querySelectorAll("body *")].filter((e) => e.getBoundingClientRect().right > W + 1).slice(0, 6).map((e) => e.tagName + "." + String(e.className).slice(0, 40) + " r" + Math.round(e.getBoundingClientRect().right) + " " + (e.textContent || "").slice(0, 40))]; }));
await b.close();
