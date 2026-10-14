// Strip copy-deck review markers ([[NEEDS CLIENT: …]], [[CONSENT]]) from public text; they are listed in README/QA instead.
export const clean = (s: string) => s.replace(/\s*\[\[[^\]]+\]\]/g, "").replace(/\s+([.,;:])/g, "$1").trim();
