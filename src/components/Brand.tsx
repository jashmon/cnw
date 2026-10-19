/* eslint-disable @next/next/no-img-element */
// Brand marks. The SMART wordmark is the exact Lithograph outline from the client's datasheets: never typeset it.
export function Logo({ variant = "yellow", className, height = 44 }: { variant?: "light" | "yellow" | "dark"; className?: string; height?: number }) {
  return <img src={`/brand/cw-logo-${variant}.svg`} alt="Cables & Wireless Co." height={height} width={Math.round(height * 4.67)} className={className} style={{ height, width: "auto" }} />;
}
export function Tile({ variant = "yellow", size = 40 }: { variant?: "light" | "yellow" | "dark"; size?: number }) {
  return <img src={`/brand/cw-tile-${variant}.svg`} alt="Cables & Wireless Co." width={size} height={size} />;
}
export function SmartMark({ white = false, height = 32, className, label = "SMART" }: { white?: boolean; height?: number; className?: string; label?: string }) {
  return <img src={white ? "/brand/smart-wordmark-tm-white.svg" : "/brand/smart-wordmark-tm.svg"} alt={label} height={height} width={Math.round(height * 5.1)} className={className} style={{ height, width: "auto" }} />;
}
export function Arrow({ down = false }: { down?: boolean }) {
  const c = down ? "↓" : "→";
  return <span className="arr" aria-hidden="true"><i>{c}</i><i>{c}</i></span>;
}
