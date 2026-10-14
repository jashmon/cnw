import { append } from "@/lib/store";

// POST /api/enquiry — quote list, contact, cross-reference and vendor-kit requests.
// Validates, clips every field, writes to .data/enquiries.jsonl and returns a reference. No email is sent on localhost.
const BUYER = ["end-user", "epc", "dealer", "government", "other"] as const;
const KIND = ["quote", "contact", "cross-reference", "vendor-kit"] as const;

export async function POST(req: Request) {
  const d = await req.json().catch(() => null);
  const clip = (s: unknown, n: number) => String(s ?? "").trim().slice(0, n);
  if (!d || typeof d !== "object") return Response.json({ error: "Invalid request" }, { status: 400 });
  if (clip(d.website, 100)) return Response.json({ ok: true, ref: "CW-OK" }); // honeypot
  const errors: Record<string, string> = {};
  const name = clip(d.name, 120), company = clip(d.company, 160), phone = clip(d.phone, 40), email = clip(d.email, 200), message = clip(d.message, 4000);
  if (name.length < 2) errors.name = "Please tell us your name.";
  if (!phone && !email) errors.contact = "Add a phone number or an email so we can reply.";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "That email address doesn't look complete.";
  if (phone && !/^[+()\d\s-]{7,}$/.test(phone)) errors.phone = "Use digits, spaces, + or -.";
  const kind = KIND.includes(d.kind) ? d.kind : "contact";
  const lines = Array.isArray(d.lines) ? d.lines.slice(0, 60).map((l: Record<string, unknown>) => ({ model: clip(l.model, 40), qty: Math.max(1, Math.min(9999, Number(l.qty) || 1)), note: clip(l.note, 300) })) : [];
  if (kind === "quote" && !lines.length && message.length < 5) errors.message = "Add models to the list or describe what you need.";
  if (kind !== "quote" && message.length < 5) errors.message = "A line or two about what you need helps us reply properly.";
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });
  const ref = `CW-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  await append("enquiries.jsonl", {
    ref, kind, at: new Date().toISOString(), buyer: BUYER.includes(d.buyer) ? d.buyer : "other",
    name, company, phone, email, city: clip(d.city, 80), timeline: clip(d.timeline, 60), message, lines,
    brand: clip(d.brand, 80), oldModel: clip(d.oldModel, 80),
  });
  return Response.json({ ok: true, ref });
}
