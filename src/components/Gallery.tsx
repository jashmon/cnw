"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type TouchEvent } from "react";
import type { Img } from "@/lib/catalogue";
import s from "./Gallery.module.css";

// PDP-01 gallery: large well, thumbnails, lightbox on click. Placeholder renders are flagged.
// The lightbox is a native modal <dialog> (showModal): it sits in the browser's top layer, above the sticky header and
// any stacking context on the page, and the page behind it is inert with focus kept inside.
export function Gallery({ images, model }: { images: Img[]; model: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [switched, setSwitched] = useState(false);
  const show = (n: number) => { setI(n); setSwitched(true); };
  const dlg = useRef<HTMLDialogElement>(null);
  // finger swipe left/right moves between images (main well and lightbox); a swipe does not also open or close the lightbox
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const go = (d: number) => { setI((v) => (v + d + images.length) % images.length); setSwitched(true); };
  const swipe = {
    onTouchStart: (e: TouchEvent) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; swiped.current = false; },
    onTouchEnd: (e: TouchEvent) => {
      const s0 = touch.current; touch.current = null; if (!s0 || images.length < 2) return;
      const t = e.changedTouches[0], dx = t.clientX - s0.x, dy = t.clientY - s0.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { swiped.current = true; go(dx < 0 ? 1 : -1); }
    },
  };
  const unlessSwiped = (f: () => void) => () => { if (swiped.current) { swiped.current = false; return; } f(); };
  useEffect(() => {
    const d = dlg.current; if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);
  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => { if (e.key === "ArrowRight") setI((v) => (v + 1) % images.length); if (e.key === "ArrowLeft") setI((v) => (v - 1 + images.length) % images.length); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [zoom, images.length]);
  if (!images.length) return <div className={s.main}><span className="label">Image coming</span></div>;
  const img = images[i];
  return (
    <div className={`${s.g} ${switched ? s.switched : ""}`}>
      <button className={s.main} onClick={unlessSwiped(() => setZoom(true))} {...swipe} aria-label={`Enlarge image${img.placeholder ? " (3D render · placeholder)" : img.note ? ` (${img.note})` : ""}: ${img.alt}`}>
        <Image key={img.src} src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(max-width: 1023px) 92vw, 56vw" priority quality={75} className={s.img} />
        {img.placeholder ? <span className="flag">3D render · placeholder</span> : img.note ? <span className="flag">{img.note}</span> : null}
        <span className={s.zoomHint} aria-hidden="true">⤢</span>
      </button>
      {images.length > 1 && (
        <ul className={s.thumbs} aria-label={`${model} images`}>
          {images.map((t, n) => (
            <li key={t.src}><button className={s.thumb} aria-current={n === i} onClick={() => show(n)} aria-label={`${t.source === "photo" ? "Photo" : "Render"} ${n + 1}: ${t.alt}`}>
              <Image src={t.src} alt="" width={t.w} height={t.h} sizes="96px" className={s.timg} />
              <span className={s.tlabel}>{t.source === "photo" ? "Photo" : "Render"}</span>
            </button></li>
          ))}
        </ul>
      )}
      <dialog ref={dlg} className={s.lb} aria-label={img.alt} onClose={() => setZoom(false)} onClick={unlessSwiped(() => setZoom(false))} {...swipe}>
        {zoom && <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="100vw" quality={85} className={s.lbimg} />}
        <button className={s.lbclose} aria-label="Close" autoFocus>×</button>
        {images.length > 1 && (
          <>
            <button type="button" className={`${s.lbnav} ${s.prev}`} aria-label="Previous image" onClick={(e) => { e.stopPropagation(); setI((v) => (v - 1 + images.length) % images.length); }}>‹</button>
            <button type="button" className={`${s.lbnav} ${s.next}`} aria-label="Next image" onClick={(e) => { e.stopPropagation(); setI((v) => (v + 1) % images.length); }}>›</button>
            <p className={s.lbcount} aria-live="polite">{i + 1} / {images.length}</p>
          </>
        )}
      </dialog>
    </div>
  );
}
