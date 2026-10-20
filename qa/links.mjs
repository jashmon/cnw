// Internal link check: fetch every route (sitemap, or a urls.txt passed as argv[3]), collect internal hrefs/srcs, verify each returns < 400.
import fs from "node:fs";
const base = process.argv[2] || "http://localhost:3200";
// routes: a list file if given (argv[3]), otherwise every route in the site's own sitemap
const routes = (process.argv[3] && fs.existsSync(process.argv[3])
  ? fs.readFileSync(process.argv[3], "utf8").split("\n")
  : [...(await (await fetch(base + "/sitemap.xml")).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname)
).filter((l) => l && !l.includes("nope"));
const seen = new Map(); const bad = [];
for (const r of routes) {
  const html = await (await fetch(base + r)).text();
  for (const m of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) { const u = m[1]; if (!seen.has(u)) seen.set(u, r); }
}
for (const [u, from] of seen) {
  if (u.startsWith("/_next/")) continue;
  const res = await fetch(base + u, { redirect: "manual", method: "GET" });
  if (res.status >= 400) bad.push(`${res.status} ${u}  (from ${from})`);
}
console.log(`${seen.size} unique internal URLs checked; ${bad.length} broken`); bad.slice(0, 20).forEach((b) => console.log(b));
process.exitCode = bad.length ? 1 : 0;
