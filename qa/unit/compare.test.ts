// Unit tests for lib/compare (node --test, TypeScript via Node's type stripping).
import { test } from "node:test";
import assert from "node:assert/strict";
import { compareRows, comparableTo, normalizeSpec, NOT_SPECIFIED } from "../../src/lib/compare.ts";

const m = (slug: string, specs: Record<string, string>, extra: Partial<{ interface: string; environment: string[]; categorySlug: string; variants: string[] }> = {}) => ({
  slug, categorySlug: extra.categorySlug ?? "cat", interface: extra.interface ?? "", environment: extra.environment ?? [], variants: extra.variants ?? [], specGroups: { Specs: specs },
});
const row = (rows: ReturnType<typeof compareRows>, key: string) => rows.find((r) => r.key === key);

test("equivalent units and spacing compare equal", () => {
  for (const [a, b] of [["30 W", "30W"], ["IP 65", "IP-65"], ["IP65", "ip 65"], ["0.6 kg (as printed)", "0.6 kg"], ["140 x 120 x 100 mm", "140 × 120 × 100 mm"], ["110 – 220 V AC", "110-220 V AC"]])
    assert.equal(normalizeSpec(a), normalizeSpec(b), `${a} vs ${b}`);
});

test("genuinely different values are different", () => {
  for (const [a, b] of [["30 W", "10 W"], ["IP 65", "IP 55"], ["Vertical wall", "Desk top"], ["0.6 kg", "6 kg"]])
    assert.notEqual(normalizeSpec(a), normalizeSpec(b), `${a} vs ${b}`);
});

test("identical specs → same, not differs", () => {
  const r = compareRows([m("a", { Weight: "2 kg" }), m("b", { Weight: "2 kg" })]);
  assert.equal(row(r, "Weight")?.state, "same");
});

test("unit spelling alone never marks a difference", () => {
  const r = compareRows([m("a", { "Power consumption": "30 W", "IP rating": "IP-65" }), m("b", { "Power consumption": "30W", "IP rating": "IP 65" })]);
  assert.equal(row(r, "Power consumption")?.state, "same");
  assert.equal(row(r, "IP rating")?.state, "same");
});

test("a missing value is 'partial', never 'differs', and shows Not specified", () => {
  const r = compareRows([m("a", { Humidity: "95% non-condensing" }), m("b", { Humidity: "95% non-condensing" }), m("c", {})]);
  const h = row(r, "Humidity");
  assert.equal(h?.state, "partial");
  assert.equal(h?.values[2], NOT_SPECIFIED);
});

test("a row given by only one model is left out", () => {
  const r = compareRows([m("a", { Keypad: "12 key" }), m("b", {})]);
  assert.equal(row(r, "Keypad"), undefined);
});

test("real differences rank first, in decision priority", () => {
  const r = compareRows([
    m("a", { Weight: "2 kg", "Power supply": "24 V DC", Mounting: "Wall" }, { interface: "analog" }),
    m("b", { Weight: "2 kg", "Power supply": "230 V AC", Mounting: "Desk" }, { interface: "ip" }),
  ]);
  assert.deepEqual(r.filter((x) => x.state === "differs").map((x) => x.key), ["Interface", "Power supply", "Mounting"]);
  assert.equal(r.at(-1)?.key, "Weight");
});

test("comparable models: variants and same category first; other categories excluded", () => {
  const p = m("p", { "Power supply": "24 V DC" }, { interface: "analog", variants: ["v"] });
  const pool = [p, m("x", {}, { categorySlug: "other" }), m("c", { "Power supply": "24 V DC" }, { interface: "analog" }), m("v", {}, { categorySlug: "other" }), m("d", {})];
  // c: same category + interface + shared decision spec (6.25) · v: declared variant (6) · d: same category (4) · x: excluded
  assert.deepEqual(comparableTo(p, pool).map((x) => x.slug), ["c", "v", "d"]);
});

test("R01: engineering qualifiers in brackets stay significant; provenance notes do not", () => {
  assert.notEqual(normalizeSpec("30 W (RMS)"), normalizeSpec("30 W (peak)"));
  assert.equal(normalizeSpec("0.6 kg (as printed)"), normalizeSpec("0.6 kg"));
  assert.equal(normalizeSpec("IP 65 (cnwcom PDF)"), normalizeSpec("IP65"));
  assert.equal(normalizeSpec("2 kg (web page)"), normalizeSpec("2 kg (datasheet)"));
});

test("F08: equivalent range notation compares equal", () => {
  assert.equal(normalizeSpec("40–100 V AC @ 16–25 Hz"), normalizeSpec("40 to 100 V AC @ 16–25 Hz"));
  assert.equal(normalizeSpec("110 – 220 V AC"), normalizeSpec("110-220 V AC"));
  assert.notEqual(normalizeSpec("40–100 V AC"), normalizeSpec("40–110 V AC"));
});

test("F08: capability fields are rows and rank before specs", () => {
  const a = { ...m("a", { Weight: "5 kg" }), capabilities: { "Paging / talkback": { value: "PAGE and TALKBACK buttons" } } };
  const b = { ...m("b", { Weight: "5 kg" }), capabilities: { "Paging / talkback": { value: "No", detail: "telephone only" } } };
  const r = compareRows([a, b]);
  assert.equal(r[0].key, "Paging / talkback"); assert.equal(r[0].state, "differs");
  assert.equal(row(r, "Weight")?.state, "same");
});

test("A02: same capability value with different explanatory detail is 'same', and the details are kept", () => {
  const a = { ...m("a", {}), capabilities: { "Hands-free": { value: "Yes" }, "Vandal-resistant": { value: "No", detail: "handset model" } } };
  const b = { ...m("b", {}), capabilities: { "Hands-free": { value: "Yes", detail: "true hands-free" }, "Vandal-resistant": { value: "No", detail: "desktop, ABS" } } };
  const r = compareRows([a, b]);
  assert.equal(row(r, "Hands-free")?.state, "same");
  assert.equal(row(r, "Vandal-resistant")?.state, "same");
  assert.deepEqual(row(r, "Vandal-resistant")?.notes, ["handset model", "desktop, ABS"]);
});

test("A02: the real catalogue never tags equal capability values as differing", async () => {
  const { default: cf } = await import("../../src/content/compare-fields.json", { with: { type: "json" } });
  const products = cf.products as Record<string, Record<string, string[]>>;
  const asModel = (slug: string) => ({ ...m(slug, {}), capabilities: Object.fromEntries(Object.entries(products[slug]).map(([k, [value, detail]]) => [k, { value, detail }])) });
  const slugs = Object.keys(products);
  for (const a of slugs) for (const b of slugs) {
    if (a >= b) continue;
    for (const r of compareRows([asModel(a), asModel(b)], 99))
      if (r.key in products[a] && r.key in products[b] && products[a][r.key][0] === products[b][r.key][0]) assert.notEqual(r.state, "differs", `${a} vs ${b}: ${r.key}`);
  }
});
