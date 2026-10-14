"use client";
import { useState } from "react";

// Model-code ticker under the hero. Moving content longer than 5 s needs a pause control (WCAG 2.2.2).
export function Ticker({ codes, className, trackClass }: { codes: string[]; className: string; trackClass: string }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={className} style={{ position: "relative" }}>
      <div className={trackClass} aria-hidden="true" style={{ animationPlayState: paused ? "paused" : undefined }}>
        {[0, 1].map((k) => <span key={k}>{codes.map((c) => <b key={c + k} style={{ fontWeight: 500 }}>{c}</b>)}</span>)}
      </div>
      <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "Play model ticker" : "Pause model ticker"} aria-pressed={paused}
        style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 2, border: "1.5px solid var(--yellow)", background: "var(--ink)", color: "var(--yellow)", cursor: "pointer", fontSize: 11 }}>
        {paused ? "▶" : "❚❚"}
      </button>
    </div>
  );
}
