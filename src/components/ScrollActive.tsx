"use client";
import { useEffect } from "react";

// Scrolls a horizontally scrolling list so its aria-current item is visible (category switcher on phones).
export function ScrollActive({ selector }: { selector: string }) {
  useEffect(() => {
    const list = document.querySelector<HTMLElement>(selector);
    const cur = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !cur || list.scrollWidth <= list.clientWidth) return;
    const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
    const x = cur.offsetLeft - list.offsetLeft;
    if (x + cur.offsetWidth > list.clientWidth - pad) list.scrollLeft = x - pad; // only when the active chip is off-screen
  }, [selector]);
  return null;
}
