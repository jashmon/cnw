import fs from "node:fs";
import path from "node:path";
import { Fragment } from "react";

// Renders the copy deck's legal markdown (06-voice/copy/privacy.md, terms.md): **lead.** paragraphs.
// [[NEEDS CLIENT …]] markers stay visible as highlighted gaps until the client's adviser fills them.
function inline(t: string) {
  return t.split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g).map((part, i) => {
    if (part.startsWith("**")) return <b key={i}>{part.slice(2, -2)}</b>;
    if (part.startsWith("[[")) return <mark key={i} className="mono" style={{ background: "var(--yellow-tint)", fontSize: ".8125em", padding: "0 4px", borderRadius: 2 }}>{part.slice(2, -2).replace(/^NEEDS CLIENT:\s*/, "To confirm: ")}</mark>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}
export function LegalDoc({ file }: { file: string }) {
  const md = fs.readFileSync(path.join(process.cwd(), "src/content/legal", file), "utf8");
  const body = md.split(/^## body\s*$/m)[1] ?? md;
  const paras = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return <div className="prose measure" style={{ display: "grid", gap: "1em" }}>{paras.map((p, i) => <p key={i}>{inline(p)}</p>)}</div>;
}
