"use client";
import { useRef, useState } from "react";
import type { SpecGroups } from "@/lib/catalogue";

// PDP-07 spec tables (E2S). The first two groups start open, the rest are one click away ("Expand all").
// "Copy spec text" produces plain text for tender documents; the result is announced, and if the clipboard is
// blocked the text is shown selected so it can be copied by hand.
const OPEN_FIRST = 2;
export function SpecTables({ groups, model, name }: { groups: SpecGroups; model: string; name: string }) {
  const [copy, setCopy] = useState<"idle" | "done" | "failed">("idle");
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  const fallback = useRef<HTMLTextAreaElement>(null);
  const entries = Object.entries(groups).filter(([, g]) => g && Object.keys(g).length);
  const asText = () => [`SMART ${model} ${name}`, ...entries.flatMap(([gname, g]) => [``, gname.toUpperCase(), ...Object.entries(g).map(([k, v]) => `${k}: ${v}`)])].join("\n");
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(asText()); setCopy("done"); setTimeout(() => setCopy("idle"), 2500); }
    catch { setCopy("failed"); requestAnimationFrame(() => { fallback.current?.focus(); fallback.current?.select(); }); }
  };
  const collapsible = entries.length > OPEN_FIRST;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
        <h2 className="h-1">Specifications</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {collapsible && <button type="button" className="btn btn--ghost btn--sm" aria-pressed={allOpen === true} onClick={() => setAllOpen(allOpen === true ? false : true)}>{allOpen === true ? "Collapse groups" : "Expand all"}</button>}
          <button type="button" className="btn btn--ghost btn--sm" onClick={doCopy}>{copy === "done" ? "✓ Copied" : "Copy spec text for tender"}</button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{copy === "done" ? "Specification text copied to the clipboard." : copy === "failed" ? "Copying was blocked. The text is selected below; press Control or Command C to copy it." : ""}</p>
      {copy === "failed" && (
        <div style={{ marginBottom: 18 }}>
          <label htmlFor="spec-text" className="label" style={{ color: "var(--ink)" }}>Copy blocked by the browser: select and copy this text</label>
          <textarea id="spec-text" ref={fallback} readOnly value={asText()} rows={8} style={{ width: "100%", marginTop: 6, padding: 12, border: "1.5px solid var(--ink)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-mono)", fontSize: ".875rem", background: "var(--surface-2)" }} />
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))", gap: "8px 40px" }}>
        {entries.map(([gname, g], i) => (
          <details key={`${gname}-${allOpen}`} open={allOpen ?? i < OPEN_FIRST} className="spec-group">
            <summary className="label" style={{ color: "var(--ink)", padding: "14px 0 8px", borderBottom: "2px solid var(--ink)", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", minHeight: 44, alignItems: "end" }}>
              <span>{gname} <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>· {Object.keys(g).length}</span></span><span aria-hidden="true" className="spec-sign" />
            </summary>
            <table className="table"><tbody>{Object.entries(g).map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table>
          </details>
        ))}
      </div>
    </div>
  );
}
