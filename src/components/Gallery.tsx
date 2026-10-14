"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Img } from "@/lib/catalogue";
import s from "./Gallery.module.css";

// PDP-01 gallery: large well, thumbnails, lightbox on click. Placeholder renders are flagged.
export function Gallery({ images, model }: { images: Img[]; model: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!zoom) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(false); if (e.key === "ArrowRight") setI((v) => (v + 1) % images.length); if (e.key === "ArrowLeft") setI((v) => (v - 1 + images.length) % images.length); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }, [zoom, images.length]);
  if (!images.length) return <div className={s.main}><span className="label">Image coming</span></div>;
  const img = images[i];
  return (
    <div className={s.g}>
      <button className={s.main} onClick={() => setZoom(true)} aria-label={`Enlarge image: ${img.alt}`}>
        <Image key={img.src} src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="(max-width: 1023px) 92vw, 56vw" priority quality={75} className={s.img} />
        {img.placeholder && <span className="flag">3D render · placeholder</span>}
        <span className={s.zoomHint} aria-hidden="true">⤢</span>
      </button>
      {images.length > 1 && (
        <ul className={s.thumbs} aria-label={`${model} images`}>
          {images.map((t, n) => (
            <li key={t.src}><button className={s.thumb} aria-current={n === i} onClick={() => setI(n)} aria-label={`Show image ${n + 1}: ${t.alt}`}>
              <Image src={t.src} alt="" width={t.w} height={t.h} sizes="96px" className={s.timg} />
              <span className={s.tlabel}>{t.source === "photo" ? "Photo" : "Render"}</span>
            </button></li>
          ))}
        </ul>
      )}
      {zoom && (
        <div className={s.lb} role="dialog" aria-modal="true" aria-label={img.alt} onClick={() => setZoom(false)}>
          <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes="100vw" quality={85} className={s.lbimg} />
          <button className={s.lbclose} aria-label="Close" autoFocus>×</button>
        </div>
      )}
    </div>
  );
}
