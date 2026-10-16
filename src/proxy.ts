import { NextResponse, type NextRequest } from "next/server";

// Site lock (2026-10-16): on the deployed site every request (pages, images, datasheets, API, sitemap) gets a
// self-contained "WIP" page with a password field. The right password sets a signed, HttpOnly cookie for 30 days.
// Secrets live in Vercel env vars, never in this (public) repo:
//   SITE_PASSWORD  the access password
//   SITE_SECRET    random string used to sign the access cookie
// Localhost stays open. SITE_LOCKED=0 unlocks everywhere; SITE_LOCKED=1 locks locally for testing.
const LOCKED = process.env.SITE_LOCKED ? process.env.SITE_LOCKED !== "0" : process.env.VERCEL === "1";
const COOKIE = "cw_access";
const UNLOCK_PATH = "/__unlock";
const MAX_AGE = 60 * 60 * 24 * 30;

const enc = new TextEncoder();
async function hmac(key: string, msg: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
// The cookie value changes whenever the password or the secret changes, so rotating either logs everyone out.
const accessToken = () => hmac(process.env.SITE_SECRET ?? "", `cw-access-v1:${process.env.SITE_PASSWORD ?? ""}`);
function same(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") && !n.startsWith(UNLOCK_PATH) ? n : "/");
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function wip(next: string, error = false, status = 503) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>WIP</title>
<style>
*{box-sizing:border-box;margin:0}
html,body{height:100%}
body{background:#FFC20A;color:#111110;font-family:"Arial Narrow",Arial,Helvetica,sans-serif;display:grid;place-items:center;text-align:center;padding:24px 24px 48px}
h1{font-size:clamp(5rem,22vw,16rem);font-weight:900;letter-spacing:-.04em;line-height:.85}
p{margin-top:18px;font-family:ui-monospace,Menlo,monospace;font-size:14px;letter-spacing:.08em;text-transform:uppercase}
form{margin:36px auto 0;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;max-width:420px}
label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
input{flex:1 1 220px;height:48px;padding:0 14px;border:2px solid #111110;border-radius:2px;background:#fff;font:16px ui-monospace,Menlo,monospace;color:#111110}
input:focus-visible,button:focus-visible{outline:3px solid #0A58CA;outline-offset:2px}
button{height:48px;padding:0 22px;border:2px solid #111110;border-radius:2px;background:#111110;color:#FFC20A;font:700 16px Arial,sans-serif;cursor:pointer}
button:hover{background:#000}
.err{margin-top:14px;font-family:ui-monospace,Menlo,monospace;font-size:13px;color:#7a0d0d}
body::after{content:"";position:fixed;left:0;right:0;bottom:0;height:14px;background:repeating-linear-gradient(-45deg,#111110 0 14px,#FFC20A 14px 28px)}
</style></head><body><main><h1>WIP</h1><p>Work in progress</p>
<form method="post" action="${UNLOCK_PATH}">
<input type="hidden" name="next" value="${esc(next)}">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" placeholder="Password" autocomplete="current-password" required${error ? ' aria-invalid="true" aria-describedby="err" autofocus' : ""}>
<button type="submit">Enter</button>
</form>${error ? '<p class="err" id="err" role="alert">Incorrect password.</p>' : ""}</main></body></html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow", ...(status === 503 ? { "retry-after": "86400" } : {}) },
  });
}

export async function proxy(req: NextRequest) {
  if (!LOCKED) return;
  const { pathname, search } = req.nextUrl;
  const configured = !!process.env.SITE_PASSWORD && !!process.env.SITE_SECRET;

  if (pathname === UNLOCK_PATH && req.method === "POST") {
    const form = await req.formData().catch(() => null);
    const next = safeNext(form?.get("next"));
    const given = String(form?.get("password") ?? "");
    if (!configured || !same(given, process.env.SITE_PASSWORD!)) return wip(next, true, 401);
    const res = NextResponse.redirect(new URL(next, req.url), 303);
    res.cookies.set(COOKIE, await accessToken(), { httpOnly: true, secure: req.nextUrl.protocol === "https:", sameSite: "lax", path: "/", maxAge: MAX_AGE });
    res.headers.set("cache-control", "no-store");
    return res;
  }

  const cookie = req.cookies.get(COOKIE)?.value;
  if (configured && cookie && same(cookie, await accessToken())) {
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }
  return wip(pathname + search);
}
