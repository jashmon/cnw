"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuote } from "@/lib/quote";
import { company, waLink } from "@/content/company";
import { Arrow } from "./Brand";
import s from "./EnquiryForm.module.css";

// HOME-04 / CONV-01 / CONV-02 enquiry form: buyer type first (Ahuja, Matrix), phone OR email, honeypot, inline errors.
const BUYERS = [["end-user", "Plant / end user"], ["epc", "EPC / consultant"], ["dealer", "Dealer / integrator"], ["government", "Government / PSU"]] as const;
type Kind = "quote" | "contact" | "cross-reference" | "vendor-kit";

export function EnquiryForm({ kind = "contact", withList = false, submitLabel = "Send enquiry", extra }: { kind?: Kind; withList?: boolean; submitLabel?: string; extra?: "cross-reference" }) {
  const q = useQuote();
  const [buyer, setBuyer] = useState<string>("end-user");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "fail">("idle");
  const [ref, setRef] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget).entries());
    setState("sending"); setErrors({});
    try {
      const r = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...fd, kind, buyer, lines: withList ? q.lines : [] }) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors ?? {}); setState("idle"); return; }
      if (!r.ok) throw new Error();
      setRef(j.ref); setState("done"); if (withList) q.clear();
    } catch { setState("fail"); }
  }
  if (state === "done") return (
    <div className={s.done} role="status">
      <span className={s.tick} aria-hidden="true">✓</span>
      <h3 className="h-2">Enquiry received.</h3>
      <p>Reference <b className="mono">{ref}</b>. We reply on working days between {company.hours}.</p>
      <p className="muted" style={{ fontSize: ".875rem" }}>Saved locally on this preview site; email delivery switches on at launch.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        <a className="btn" href={waLink(`Hello, following up on enquiry ${ref}.`)} target="_blank" rel="noopener">Follow up on WhatsApp</a>
        <Link className="btn btn--ghost" href="/products">Keep browsing</Link>
      </div>
    </div>
  );
  const err = (k: string) => errors[k] ? <span className="err" id={`e-${k}`}>{errors[k]}</span> : null;
  return (
    <form className={s.form} onSubmit={submit} noValidate>
      <fieldset className={s.buyers}>
        <legend className="label" style={{ color: "var(--ink)", marginBottom: 8 }}>I am</legend>
        <div className="chips">{BUYERS.map(([v, l]) => <button key={v} type="button" className="chip" aria-pressed={buyer === v} onClick={() => setBuyer(v)}>{l}</button>)}</div>
      </fieldset>
      <div className={s.row}>
        <div className="field"><label htmlFor="f-name">Name</label><input id="f-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />{err("name")}</div>
        <div className="field"><label htmlFor="f-company">Company / plant</label><input id="f-company" name="company" autoComplete="organization" placeholder="e.g. cement plant, Chandrapur" /></div>
      </div>
      <div className={s.row}>
        <div className="field"><label htmlFor="f-phone">Phone / WhatsApp</label><input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" aria-invalid={!!errors.phone || !!errors.contact} />{err("phone")}</div>
        <div className="field"><label htmlFor="f-email">Email</label><input id="f-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email || !!errors.contact} />{err("email")}</div>
      </div>
      {err("contact")}
      {extra === "cross-reference" && (
        <div className={s.row}>
          <div className="field"><label htmlFor="f-brand">Current brand</label><input id="f-brand" name="brand" /></div>
          <div className="field"><label htmlFor="f-old">Model you are replacing</label><input id="f-old" name="oldModel" /></div>
        </div>
      )}
      {kind === "quote" && (
        <div className={s.row}>
          <div className="field"><label htmlFor="f-city">Site location</label><input id="f-city" name="city" placeholder="City / state / country" /></div>
          <div className="field"><label htmlFor="f-time">Needed by</label>
            <select id="f-time" name="timeline" defaultValue=""><option value="">Not decided</option><option>Within 2 weeks</option><option>Within a month</option><option>1–3 months</option><option>Tender / budgeting</option></select></div>
        </div>
      )}
      <div className="field"><label htmlFor="f-msg">{kind === "quote" ? "Notes (optional)" : "Message"}</label><textarea id="f-msg" name="message" aria-invalid={!!errors.message} placeholder={kind === "quote" ? "Cable lengths, number of zones, power supply, anything we should know" : "What do you need, and where will it be installed?"} />{err("message")}</div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <div className={s.submit}>
        <button className="btn btn--hazard" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : submitLabel} <Arrow /></button>
        <span className="muted" style={{ fontSize: ".875rem" }}>Or call <a className="inline" href={`tel:${company.phones[0].tel}`}>{company.phones[0].display}</a></span>
      </div>
      {state === "fail" && <p className="err" role="alert">Couldn&apos;t send just now. Please try again, or <a className="inline" href={waLink("Hello, the website form didn't go through. I'd like a quote.")}>message us on WhatsApp</a>.</p>}
    </form>
  );
}
