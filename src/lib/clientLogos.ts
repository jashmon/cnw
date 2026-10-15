import "server-only";
import fs from "node:fs";
import path from "node:path";

// Client logo files from 07-imagery/client-logos (synced to public/clients). Trademarks of their owners,
// shown because the client listed these companies as SMART users (USERSLIST-2025).
export type Logo = { src: string; w: number; h: number; brand: string };
export function clientLogos(): Map<string, Logo> {
  try {
    const list = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/content/data/client-logos.json"), "utf8")) as { slug: string; brand: string; file: string; width?: number; height?: number }[];
    return new Map(list.filter((l) => l.file).map((l) => [l.slug, { src: `/clients/${path.basename(l.file)}`, w: l.width || 240, h: l.height || 80, brand: l.brand }]));
  } catch { return new Map(); }
}
