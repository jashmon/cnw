"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { clampQty, sanitize, type QuoteLine } from "./quote-data";
export { MAX_QTY, clampQty, type QuoteLine } from "./quote-data";

// CONV-01 quote list (E2S quote basket / Viking pick list). Client-side store persisted to localStorage,
// read through useSyncExternalStore so server HTML (empty list) and hydration stay consistent.
const KEY = "cw-quote-v1";
const EMPTY: QuoteLine[] = [];
let lines: QuoteLine[] | null = null;
const listeners = new Set<() => void>();
function load(): QuoteLine[] {
  if (lines) return lines;
  try { lines = sanitize(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { lines = []; }
  return lines!;
}
function set(next: QuoteLine[]) {
  lines = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { lines = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
};

type Ctx = {
  lines: QuoteLine[]; count: number; open: boolean; setOpen: (v: boolean) => void;
  add: (l: Omit<QuoteLine, "qty">, qty?: number) => void; remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void; setNote: (slug: string, note: string) => void; has: (slug: string) => boolean; clear: () => void;
  bump: number; toast: string | null;
};
const QuoteCtx = createContext<Ctx | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(subscribe, load, () => EMPTY);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  const add = useCallback((l: Omit<QuoteLine, "qty">, qty = 1) => {
    const prev = load();
    set(prev.some((p) => p.slug === l.slug) ? prev.map((p) => (p.slug === l.slug ? { ...p, qty: clampQty(p.qty + qty) } : p)) : [...prev, { ...l, qty: clampQty(qty) }]);
    setBump((b) => b + 1); setToast(`${l.model} added to your quote list`);
  }, []);
  const remove = useCallback((slug: string) => { set(load().filter((p) => p.slug !== slug)); setBump((b) => b + 1); }, []);
  const setQty = useCallback((slug: string, qty: number) => set(load().map((p) => (p.slug === slug ? { ...p, qty: clampQty(qty) } : p))), []);
  const setNote = useCallback((slug: string, note: string) => set(load().map((p) => (p.slug === slug ? { ...p, note: note.slice(0, 300) } : p))), []);
  const value = useMemo<Ctx>(() => ({
    lines: current, count: current.length, open, setOpen, add, remove, setQty, setNote,
    has: (s) => current.some((l) => l.slug === s), clear: () => set([]), bump, toast,
  }), [current, open, add, remove, setQty, setNote, bump, toast]);
  return <QuoteCtx.Provider value={value}>{children}</QuoteCtx.Provider>;
}

export function useQuote() {
  const c = useContext(QuoteCtx);
  if (!c) throw new Error("useQuote outside QuoteProvider");
  return c;
}
