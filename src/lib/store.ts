import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

// Local JSONL store for enquiries on localhost (no live email until the client provides an inbox + keys).
const DIR = path.join(process.cwd(), ".data");
export async function append(file: string, row: Record<string, unknown>) {
  await fs.mkdir(DIR, { recursive: true });
  await fs.appendFile(path.join(DIR, file), JSON.stringify(row) + "\n", "utf8");
}
