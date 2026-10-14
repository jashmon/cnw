"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// MOTION-01 reveal once on scroll. Content stays visible without JS (the `js` class is added after hydration).
export function RevealInit() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("js");
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    const scan = () => document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.95) el.classList.add("in"); else io.observe(el);
    });
    scan(); const t = setTimeout(scan, 300);
    return () => { clearTimeout(t); io.disconnect(); };
  }, [pathname]);
  return null;
}
