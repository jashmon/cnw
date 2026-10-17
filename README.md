# Cables & Wireless Co: SMART website (localhost build)

A Next.js 16 (App Router, TypeScript, CSS Modules) catalogue and enquiry site for Cables & Wireless Co. and its SMART product range. It is built from the pipeline folders next to this one (`../01-brief` … `../09-motion`).

**Not deployed.** It runs on localhost only, and the live cnwcom.in and voizlink.in sites are untouched.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm run start -- -p 3200   # production build, used for QA
```

To refresh content after editing the copy deck or imagery:

```bash
node scripts/sync-content.mjs     # catalogue, copy deck JSON, image manifest + processed images, datasheets, audio
node scripts/build-redirects.mjs  # 301 map from the old cnwcom.in / voizlink.in URLs (330 URLs, 512 rules)
```

## What's where

- **Content** (`src/content/data/*.json`): synced, do not edit here. Product facts come from `01-brief/catalogue.json` and the wording from `06-voice/*.json`; `lib/catalogue.ts` merges them.
- **Company details:** `src/content/company.ts`.
- **Clients:** `src/content/clients.ts`, from the client's 2025 user list (`00-intake/client-2025/USERSLIST-2025.pdf`). Logos are in `public/clients/`, synced from `07-imagery/client-logos/`.
- **Legal copy:** `src/content/legal/*.md`, copied from `06-voice/copy`. "To confirm" highlights show the gaps.
- **Brand:** `public/brand/`.
  - The SMART wordmark is the exact Lithograph outline from the client's datasheets. It is never typeset.
  - The company logo is Concept C, Signal Block, in Barlow Condensed (outlined SVG, so it keeps that lettering).
  - Every other piece of text uses Overused Grotesk (OFL, variable 300–900): `src/fonts/`, loaded with `next/font/local`. The WIP lock page loads the copy in `public/fonts/`, the only path open while the site is locked.
- **Tokens:** `src/styles/tokens.css`, generated from `04-tokens/tokens.json`.
- **Motion:** `src/styles/buttons.css` and `src/motion/`, as specified in `09-motion/motion.md`.

## Enquiries

The quote list is stored in localStorage. Forms post to `POST /api/enquiry`, which validates the input, returns a reference (CW-YYMMDD-XXXX) and appends to `.data/enquiries.jsonl` (gitignored).

**No email is sent.** To go live, add an email provider (for example the Resend free tier) inside `src/app/api/enquiry/route.ts`, and put the API key and inbox in `.env.local`. Never commit them.

## Placeholders still to replace

- **Product images:** 75 of the 83 products use **3D renders** labelled "3D render · placeholder" (see `07-imagery/manifest.md` and `shot-list.md`).
- **Client gaps:** everything in `../CLIENT-TODO.md`, including legal entity, GST, founding year, certificates, client-name consent, the WhatsApp number and the enquiry inbox.
- **FLP datasheet:** the download is withheld (`WITHHOLD_DATASHEET` in `lib/catalogue.ts`) until the client confirms which version is current.
- **Datasheet contents:** the PDFs are the client's originals, with old contact details.
- **Live URL:** `company.url` is `http://localhost:3000`. Set it to the production domain at launch, for canonical URLs, OG tags and the sitemap.

## QA

See `../11-qa/report.md`. Re-run with:

```bash
node qa/a11y.mjs http://localhost:3200 ../11-qa/urls.txt
node qa/flows.mjs http://localhost:3200
node qa/links.mjs http://localhost:3200
```

## Access lock (deployed site)

On Vercel, `src/proxy.ts` serves a WIP page with a password field for every request. The right password sets a signed HttpOnly cookie that lasts 30 days.

- **Password and signing secret:** the Vercel env vars `SITE_PASSWORD` and `SITE_SECRET` (Production and Preview). They are never committed. Changing either one logs everyone out.
- **Images:** they are served unoptimised while locked, because the optimiser's internal fetches carry no cookie.
- **Unlock:** set `SITE_LOCKED=0` in Vercel and redeploy.
- **Test the lock locally:** run `SITE_LOCKED=1 SITE_PASSWORD=… SITE_SECRET=… npm run build && npm run start`.
