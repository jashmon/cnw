// Site lock (2026-10-16): on the deployed site every request (pages, images, datasheets, API, sitemap) gets a
// self-contained "WIP" page. Localhost stays open for development.
// Override with SITE_LOCKED=0 (unlock on Vercel) or SITE_LOCKED=1 (lock locally).
const LOCKED = process.env.SITE_LOCKED ? process.env.SITE_LOCKED !== "0" : process.env.VERCEL === "1";

const WIP = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>WIP</title>
<style>
*{box-sizing:border-box;margin:0}
html,body{height:100%}
body{background:#FFC20A;color:#111110;font-family:"Arial Narrow",Arial,Helvetica,sans-serif;display:grid;place-items:center;text-align:center;padding:24px;position:relative}
h1{font-size:clamp(5rem,22vw,16rem);font-weight:900;letter-spacing:-.04em;line-height:.85}
p{margin-top:18px;font-family:ui-monospace,Menlo,monospace;font-size:14px;letter-spacing:.08em;text-transform:uppercase}
body::after{content:"";position:fixed;left:0;right:0;bottom:0;height:14px;background:repeating-linear-gradient(-45deg,#111110 0 14px,#FFC20A 14px 28px)}
</style></head><body><main><h1>WIP</h1><p>Work in progress</p></main></body></html>`;

export function proxy() {
  if (!LOCKED) return;
  return new Response(WIP, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "86400",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}
