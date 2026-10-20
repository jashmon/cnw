// Unit tests for the quote-list storage rules (lib/quote-data).
import { test } from "node:test";
import assert from "node:assert/strict";
import { clampQty, sanitize } from "../../src/lib/quote-data.ts";

const ok = { slug: "wmhs-iii", model: "WMHS-III", name: "Industrial Telephone", href: "/products/industrial-telephones/wmhs-iii", img: "/media/x.webp", qty: 2 };

test("wrong shapes give an empty list, never a throw", () => {
  for (const raw of [null, 42, "x", {}, { lines: [ok] }, [null], [42], ["wmhs-iii"]]) assert.deepEqual(sanitize(raw), [], JSON.stringify(raw));
});

test("valid lines survive unchanged", () => {
  assert.deepEqual(sanitize([ok]), [ok]);
});

test("invalid lines are dropped, valid neighbours kept", () => {
  const out = sanitize([ok, { ...ok, slug: 5 }, { ...ok, slug: "../x" }, { ...ok, slug: "evil", href: "https://example.com" }, { ...ok, slug: "bc-l02", href: "/products/bag-counters/bc-l02" }]);
  assert.deepEqual(out.map((l) => l.slug), ["wmhs-iii", "bc-l02"]);
});

test("quantities are coerced and clamped to 1–9999", () => {
  const q = (qty: unknown) => sanitize([{ ...ok, qty }])[0].qty;
  assert.equal(q("3"), 3); assert.equal(q(0), 1); assert.equal(q(-5), 1); assert.equal(q(2.6), 3);
  assert.equal(q(123456), 9999); assert.equal(q("abc"), 1); assert.equal(q(null), 1); assert.equal(q(Infinity), 1);
});

test("duplicate slugs merge their quantities", () => {
  assert.deepEqual(sanitize([ok, { ...ok, qty: 5 }]).map((l) => [l.slug, l.qty]), [["wmhs-iii", 7]]);
});

test("unsafe or oversized fields are trimmed or dropped", () => {
  const [l] = sanitize([{ ...ok, img: "javascript:alert(1)", note: "n".repeat(500), name: "x".repeat(400) }]);
  assert.equal(l.img, null); assert.equal(l.note?.length, 300); assert.equal(l.name.length, 160);
});

test("clampQty", () => {
  assert.equal(clampQty(NaN), 1); assert.equal(clampQty(10000), 9999); assert.equal(clampQty(7), 7);
});
