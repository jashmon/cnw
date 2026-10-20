// Pure quote-list data rules (no React): shared by the store and unit-tested in qa/unit.
export type QuoteLine = { slug: string; model: string; name: string; href: string; img: string | null; qty: number; note?: string };

export const MAX_QTY = 9999;
export const clampQty = (n: number) => (Number.isFinite(n) ? Math.max(1, Math.min(MAX_QTY, Math.round(n))) : 1);
// Anything read back from storage is untrusted (old versions, other tabs, hand edits): keep only well-formed lines,
// coerce quantities, merge duplicates. Malformed JSON or the wrong shape gives an empty list, never a crash.
export function sanitize(raw: unknown): QuoteLine[] {
  if (!Array.isArray(raw)) return [];
  const out = new Map<string, QuoteLine>();
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.slug !== "string" || !/^[a-z0-9-]{1,80}$/.test(o.slug)) continue;
    if (typeof o.href !== "string" || !o.href.startsWith("/products/")) continue;
    const model = typeof o.model === "string" && o.model.trim() ? o.model.slice(0, 60) : o.slug.toUpperCase();
    const name = typeof o.name === "string" ? o.name.slice(0, 160) : model;
    const img = typeof o.img === "string" && o.img.startsWith("/") ? o.img : null;
    const qty = clampQty(typeof o.qty === "number" ? o.qty : parseInt(String(o.qty), 10));
    const note = typeof o.note === "string" ? o.note.slice(0, 300) : undefined;
    const prev = out.get(o.slug);
    out.set(o.slug, prev ? { ...prev, qty: clampQty(prev.qty + qty) } : { slug: o.slug, model, name, href: o.href, img, qty, ...(note ? { note } : {}) });
  }
  return [...out.values()];
}
