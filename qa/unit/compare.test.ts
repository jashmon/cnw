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
