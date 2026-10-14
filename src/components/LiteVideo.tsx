"use client";
import { useState } from "react";

// Click-to-load YouTube (no third-party requests until the visitor asks for the video).
export function LiteVideo({ id, title }: { id: string; title: string }) {
  const [on, setOn] = useState(false);
  return (
    <div style={{ position: "relative", aspectRatio: "16/9", background: "var(--charcoal)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
      {on ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
      ) : (
        <button type="button" onClick={() => setOn(true)} aria-label={`Play video: ${title}`} className="lite-play"
          style={{ position: "absolute", inset: 0, width: "100%", border: 0, cursor: "pointer", color: "var(--on-charcoal)", background: "repeating-linear-gradient(-45deg, #1d1d1a 0 18px, #171715 18px 36px)", display: "grid", placeItems: "center", gap: 10, padding: 20 }}>
          <span style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--yellow)", color: "var(--ink)", display: "grid", placeItems: "center", fontSize: 28, transition: "transform var(--dur-ui) var(--ease-out)" }} aria-hidden="true">▶</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem" }}>{title}</span>
          <span className="mono" style={{ fontSize: ".75rem", color: "var(--on-charcoal-muted)" }}>Loads from YouTube when played</span>
        </button>
      )}
    </div>
  );
}
