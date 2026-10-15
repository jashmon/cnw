"use client";
import { useState } from "react";
import type { SpecGroups } from "@/lib/catalogue";

// PDP-07 spec tables (E2S). "Copy spec text" produces plain text for tender documents.
export function SpecTables({ groups, model, name }: { groups: SpecGroups; model: string; name: string }) {
  const [copied, setCopied] = useState(false);
  const entries = Object.entries(groups).filter(([, g]) => g && Object.keys(g).length);
  const asText = () => [`SMART ${model} ${name}`, ...entries.flatMap(([gname, g]) => [``, gname.toUpperCase(), ...Object.entries(g).map(([k, v]) => `${k}: ${v}`)])].join("\n");
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 className="h-1">Specifications</h2>
        <button type="button" className="btn btn--ghost btn--sm"
          onClick={async () => { try { await navigator.clipboard.writeText(asText()); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {} }}>
          {copied ? "✓ Copied" : "Copy spec text for tender"}
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "8px 40px" }}>
        {entries.map(([gname, g]) => (
          <details key={gname} open className="spec-group">
            <summary className="label" style={{ color: "var(--ink)", padding: "14px 0 8px", borderBottom: "2px solid var(--ink)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between" }}>{gname}<span aria-hidden="true">−</span></summary>
            <table className="table"><tbody>{Object.entries(g).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table>
          </details>
        ))}
      </div>
    </div>
  );
}
