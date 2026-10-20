"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useQuote, type QuoteLine } from "@/lib/quote";
import { company, waLink } from "@/content/company";
import { Arrow } from "./Brand";
import s from "./EnquiryForm.module.css";

// HOME-04 / CONV-01 / CONV-02 enquiry form: buyer type first (Ahuja, Matrix), name + phone OR email required.
// Delivery: until a server mail provider is configured (NEXT_PUBLIC_ENQUIRY_API=1), the form hands the finished
// enquiry to WhatsApp or the visitor's email app, so every accepted enquiry reaches the business with models + quantities.
const BUYERS = [["end-user", "Plant / end user"], ["epc", "EPC / consultant"], ["dealer", "Dealer / integrator"], ["government", "Government / PSU"]] as const;
type Kind = "quote" | "contact" | "cross-reference" | "vendor-kit";
type Fields = Record<string, string>;
const API = process.env.NEXT_PUBLIC_ENQUIRY_API === "1";
const KIND_LABEL: Record<Kind, string> = { quote: "Quote request", contact: "Enquiry", "cross-reference": "Cross-reference request", "vendor-kit": "Vendor kit request" };

function validate(f: Fields, kind: Kind, lines: QuoteLine[]) {
  const e: Record<string, string> = {};
  if ((f.name ?? "").trim().length < 2) e.name = "Enter your name.";
  const phone = (f.phone ?? "").trim(), email = (f.email ?? "").trim();
  if (!phone && !email) { e.phone = "Enter a phone number or an email address."; }
  if (phone && !/^[+()\d\s-]{7,}$/.test(phone)) e.phone = "Use digits, spaces, + or - (at least 7).";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) e.email = "That email address looks incomplete.";
  const msg = (f.message ?? "").trim();
  if (kind === "quote" && !lines.length && msg.length < 5) e.message = "Add models to the quote list, or describe what you need.";
  if (kind !== "quote" && msg.length < 5) e.message = "Tell us briefly what you need.";
  return e;
}

function compose(f: Fields, kind: Kind, buyer: string, lines: QuoteLine[]) {
  const row = (k: string, v?: string) => (v && v.trim() ? `${k}: ${v.trim()}` : null);
  return [
    `${KIND_LABEL[kind]} — website`,
    row("Name", f.name), row("Company / plant", f.company), row("Phone", f.phone), row("Email", f.email),
    row("Buyer", BUYERS.find(([v]) => v === buyer)?.[1]), row("Site", f.city), row("Needed by", f.timeline),
    row("Current brand", f.brand), row("Model replacing", f.oldModel),
    lines.length ? ["", "Models:", ...lines.map((l) => `• ${l.model} ${l.name} × ${l.qty}${l.note ? ` (${l.note})` : ""}`)].join("\n") : null,
    f.message?.trim() ? `\n${f.message.trim()}` : null,
  ].filter(Boolean).join("\n");
}

export function EnquiryForm({ kind = "contact", withList = false, submitLabel = "Send enquiry", extra }: { kind?: Kind; withList?: boolean; submitLabel?: string; extra?: "cross-reference" }) {
  const q = useQuote();
  const form = useRef<HTMLFormElement>(null);
  const [buyer, setBuyer] = useState<string>("end-user");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "handed" | "fail">("idle");
  const [via, setVia] = useState<"whatsapp" | "email">("whatsapp");
  const [ref, setRef] = useState("");
  // the last validated draft: the hand-off branch unmounts the form, so re-sending on another channel and
  // "Edit enquiry" (which restores these values as defaults) work from this, not from the DOM
  const [draft, setDraft] = useState<Fields>({});
  const lines = withList ? q.lines : [];

  function check(): Fields | null {
    const f = Object.fromEntries(new FormData(form.current!).entries()) as Fields;
    const e = validate(f, kind, lines);
    setErrors(e); setDraft(f);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[name="${Object.keys(e)[0]}"]`)?.focus());
      return null;
    }
    return f;
  }

  function send(channel: "whatsapp" | "email", f: Fields) {
    const text = compose(f, kind, buyer, lines);
    if (channel === "whatsapp") window.open(waLink(text), "_blank", "noopener");
    else window.location.href = `mailto:${company.emails[0]}?subject=${encodeURIComponent(`${KIND_LABEL[kind]} from the website`)}&body=${encodeURIComponent(text)}`;
    setVia(channel); setState("handed");
  }
  // from the form: validate (and save the draft) first. From the confirmation: resend the saved draft.
  function handoff(channel: "whatsapp" | "email") { const f = form.current ? check() : draft; if (f) send(channel, f); }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!API) { handoff("whatsapp"); return; }
    const f = check(); if (!f) return;
    setState("sending");
    try {
      const r = await fetch("/api/enquiry", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, kind, buyer, lines }) });
      const j = await r.json();
      if (r.status === 422) { setErrors(j.errors ?? {}); setState("idle"); return; }
      if (!r.ok) throw new Error();
      setRef(j.ref); setState("done"); if (withList) q.clear();
    } catch { setState("fail"); }
  }

  if (state === "done" || state === "handed") return (
    <div className={s.done} role="status" tabIndex={-1} ref={(el) => el?.focus()}>
      <span className={s.tick} aria-hidden="true">✓</span>
      {state === "done" ? (
        <>
          <h3 className="h-2">Enquiry received.</h3>
          <p>Reference <b className="mono">{ref}</b>. We reply on working days, {company.hours}.</p>
        </>
      ) : (
        <>
          <h3 className="h-2">{via === "whatsapp" ? "WhatsApp is open with your enquiry." : "Your email app is open with your enquiry."}</h3>
          <p>Press <b>send</b> there to reach us. {withList && lines.length > 0 && `All ${lines.length} model${lines.length > 1 ? "s" : ""} and quantities are included.`}</p>
          <p className="muted" style={{ fontSize: ".9375rem" }}>Nothing opened? Call <a className="inline" href={`tel:${company.phones[0].tel}`}>{company.phones[0].display}</a> or <button type="button" className={s.linkBtn} onClick={() => handoff(via === "whatsapp" ? "email" : "whatsapp")}>{via === "whatsapp" ? "send by email instead" : "send on WhatsApp instead"}</button>.</p>
        </>
      )}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
        {state === "handed" && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setState("idle")}>Edit enquiry</button>}
        {state === "handed" && withList && lines.length > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => { q.clear(); setState("idle"); }}>Clear quote list</button>}
        <Link className="btn btn--ghost btn--sm" href="/products">Keep browsing</Link>
      </div>
    </div>
  );

  const errIds = (k: string) => (errors[k] ? `e-${k}` : undefined);
  const errorList = Object.entries(errors);
  return (
    <form ref={form} className={s.form} onSubmit={submit} noValidate>
      {!API && (
        <p className={s.notice}>
          <b>How this form sends:</b> it opens WhatsApp or your email app with your details{withList ? " and model list" : ""} filled in, ready to send to us. Prefer to talk? Call <a className="inline" href={`tel:${company.phones[0].tel}`}>{company.phones[0].display}</a>.
        </p>
      )}
      <p className={s.req} id="req-note"><span aria-hidden="true">*</span> Required: your name, and <b>one</b> way to reach you (phone or email).</p>
      {errorList.length > 0 && (
        <div className={s.summary} role="alert">
          <b>Please fix {errorList.length === 1 ? "this" : `these ${errorList.length}`} before sending:</b>
          <ul>{errorList.map(([k, v]) => <li key={k}><a href={`#f-${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(`f-${k}`)?.focus(); }}>{v}</a></li>)}</ul>
        </div>
      )}
      <fieldset className={s.buyers}>
        <legend className="label" style={{ color: "var(--ink)", marginBottom: 8 }}>I am</legend>
        <div className="chips">{BUYERS.map(([v, l]) => <button key={v} type="button" className="chip" aria-pressed={buyer === v} onClick={() => setBuyer(v)}>{l}</button>)}</div>
      </fieldset>
      <div className={s.row}>
        <div className="field"><label htmlFor="f-name">Name <span aria-hidden="true">*</span></label><input id="f-name" name="name" defaultValue={draft.name} autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errIds("name")} />{errors.name && <span className="err" id="e-name">{errors.name}</span>}</div>
        <div className="field"><label htmlFor="f-company">Company / plant</label><input id="f-company" name="company" defaultValue={draft.company} autoComplete="organization" placeholder="e.g. cement plant, Chandrapur" /></div>
      </div>
      <div className={s.row}>
        <div className="field"><label htmlFor="f-phone">Phone / WhatsApp <span className={s.either}>phone or email</span></label><input id="f-phone" name="phone" defaultValue={draft.phone} type="tel" autoComplete="tel" inputMode="tel" aria-invalid={!!errors.phone} aria-describedby={[errIds("phone"), "req-note"].filter(Boolean).join(" ")} />{errors.phone && <span className="err" id="e-phone">{errors.phone}</span>}</div>
        <div className="field"><label htmlFor="f-email">Email <span className={s.either}>phone or email</span></label><input id="f-email" name="email" defaultValue={draft.email} type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={[errIds("email"), "req-note"].filter(Boolean).join(" ")} />{errors.email && <span className="err" id="e-email">{errors.email}</span>}</div>
      </div>
      {extra === "cross-reference" && (
        <div className={s.row}>
          <div className="field"><label htmlFor="f-brand">Current brand</label><input id="f-brand" name="brand" defaultValue={draft.brand} /></div>
          <div className="field"><label htmlFor="f-old">Model you are replacing</label><input id="f-old" name="oldModel" defaultValue={draft.oldModel} /></div>
        </div>
      )}
      {kind === "quote" && (
        <div className={s.row}>
          <div className="field"><label htmlFor="f-city">Site location</label><input id="f-city" name="city" defaultValue={draft.city} placeholder="City / state / country" /></div>
          <div className="field"><label htmlFor="f-time">Needed by</label>
            <select id="f-time" name="timeline" defaultValue={draft.timeline ?? ""}><option value="">Not decided</option><option>Within 2 weeks</option><option>Within a month</option><option>1–3 months</option><option>Tender / budgeting</option></select></div>
        </div>
      )}
      <div className="field"><label htmlFor="f-message">{kind === "quote" ? "Notes" : "Message"}{kind !== "quote" && <span aria-hidden="true"> *</span>}</label><textarea id="f-message" name="message" defaultValue={draft.message} aria-invalid={!!errors.message} aria-describedby={errIds("message")} placeholder={kind === "quote" ? "Cable lengths, number of zones, power supply, anything we should know" : "What do you need, and where will it be installed?"} />{errors.message && <span className="err" id="e-message">{errors.message}</span>}</div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      <div className={s.submit}>
        {API ? (
          <button className="btn btn--hazard" type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : submitLabel} <Arrow /></button>
        ) : (
          <>
            <button className="btn btn--hazard" type="submit">{submitLabel} on WhatsApp <Arrow /></button>
            <button className="btn btn--ghost" type="button" onClick={() => handoff("email")}>Send by email</button>
          </>
        )}
      </div>
      {state === "fail" && <p className="err" role="alert">Couldn&apos;t send just now. Please try again, or <a className="inline" href={waLink("Hello, the website form didn't go through. I'd like a quote.")}>message us on WhatsApp</a>.</p>}
    </form>
  );
}
