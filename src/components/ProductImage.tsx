import Image from "next/image";
import type { Img } from "@/lib/catalogue";

// Image well used by cards and galleries. Renders carry a visible "3D render · placeholder" flag (07-imagery policy).
export function ProductImage({ img, sizes, priority = false, flag = true, className }: { img?: Img; sizes: string; priority?: boolean; flag?: boolean; className?: string }) {
  if (!img) return <div className={className} aria-hidden="true" style={{ display: "grid", placeItems: "center" }}><span className="label">Image coming</span></div>;
  return (
    <div className={className} style={{ position: "relative" }}>
      <Image src={img.src} alt={img.alt} width={img.w} height={img.h} sizes={sizes} priority={priority} quality={85}
        style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      {flag && img.placeholder && <span className="flag">3D render · placeholder</span>}
    </div>
  );
}
