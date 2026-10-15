"use client";
import { useState } from "react";
import type { Client, IntlClient, Sector } from "@/content/clients";
import s from "./Clients.module.css";

// Full client list from the 2025 user list, by sector (tabs), with plant units. TRUST-02 (Joiwo, Matrix).
type Tab = Sector | "International";
export function ClientDirectory({ sectors, domestic, international }: { sectors: Sector[]; domestic: Client[]; international: IntlClient[] }) {
  const tabs: Tab[] = [...sectors, "International"];
  const [tab, setTab] = useState<Tab>(tabs[0]);
  const [all, setAll] = useState(false);
  const LIMIT = 12;
  const count = (t: Tab) => (t === "International" ? international.length : domestic.filter((c) => c.sector === t).length);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const next = tabs[(n + tabs.length) % tabs.length];
    setTab(next); setAll(false);
    document.getElementById(`ctab-${tabs.indexOf(next)}`)?.focus();
  };
  return (
    <div className={s.dir}>
      <div role="tablist" aria-label="Clients by sector" className={s.tabs}>
        {tabs.map((t, i) => (
          <button key={t} id={`ctab-${i}`} role="tab" type="button" aria-selected={tab === t} aria-controls="cpanel" tabIndex={tab === t ? 0 : -1}
            className={s.tab} onClick={() => { setTab(t); setAll(false); }} onKeyDown={(e) => onKey(e, i)}>
            {t}<span className={s.n}>{count(t)}</span>
          </button>
        ))}
      </div>
      <div id="cpanel" role="tabpanel" aria-labelledby={`ctab-${tabs.indexOf(tab)}`} className={s.panel} key={tab}>
        {tab === "International" ? (
          <ul className={s.list}>
            {(all ? international : international.slice(0, LIMIT)).map((c) => (
              <li key={c.name} className={s.item}>
                <b>{c.name}</b>
                <span className={s.meta}><span className={s.country}>{c.country}</span> · {c.product}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={s.list}>
            {(all ? domestic.filter((c) => c.sector === tab) : domestic.filter((c) => c.sector === tab).slice(0, LIMIT)).map((c) => (
              <li key={c.name} className={s.item}>
                <b>{c.name}{c.units && c.units.length > 1 && <span className={s.units}>{c.units.length} units</span>}</b>
                {c.units && <span className={s.meta}>{c.units.slice(0, 8).join(" · ")}{c.units.length > 8 ? ` · +${c.units.length - 8} more` : ""}</span>}
              </li>
            ))}
          </ul>
        )}
        {!all && count(tab) > LIMIT && (
          <button type="button" className={`btn btn--ghost ${s.more}`} onClick={() => setAll(true)}>Show all {count(tab)} {tab === "International" ? "international clients" : `${tab.toLowerCase()} clients`}</button>
        )}
      </div>
    </div>
  );
}
