// Internal link check: fetch every route in urls.txt, collect internal hrefs/srcs, verify each returns < 400.
import fs from "node:fs";
const base = process.argv[2] || "http://localhost:3200";
const routes = fs.readFileSync("../11-qa/urls.txt", "utf8").split("\n").filter((l) => l && !l.includes("nope"));
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
