// One normaliser for every model-code search (header, catalogue, downloads): case, spacing and punctuation are
// ignored and Roman numerals match digits, so "wmhs3", "WMHS III" and "WMHS-III" are the same query.
export const normModel = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/iii/g, "3").replace(/ii/g, "2").replace(/iv/g, "4").replace(/(?<![a-z])i(?![a-z])/g, "1");

/** true when the query matches the code, any alias, the name or the category */
export function modelMatches(q: string, it: { model: string; name: string; category?: string; aliases?: string[] }) {
  const n = normModel(q);
  if (n.length < 2) return true;
  return [it.model, ...(it.aliases ?? []), it.name, it.category ?? ""].some((x) => normModel(x).includes(n));
}
