# Verification

## Automated: runs on every push (GitHub Actions → `npm run qa`)

| Check | Script | What it proves |
|---|---|---|
| Lint, types | `npm run lint`, `npm run typecheck` | Code health |
| Unit tests (15) | `qa/unit/*.test.ts` | Comparison logic: units, missing values and real differences. Quote storage: wrong shapes, clamping, merging |
| User flows (56) | `qa/flows.mjs` | Search, autocomplete (keyboard and click), quote basket (including corrupted storage, partial quantities, two tabs), drawer focus, mobile menu as a modal, filters and empty states, category compare (add, cap, remove, reset), URL search sync, gallery dialog, forms, redirects, 404 |
| Links | `qa/links.mjs` | Every internal link from every sitemap route returns < 400 |
| Widths | `qa/widths.mjs` | No horizontal overflow or clipped controls at 320–1920px (13 widths) |
| Collisions | `qa/overlap.mjs` | No overlapping text or controls on 7 key pages (quote list populated) at 320, 390, 768, 1024, 1280 and 1440px. Self-test: `QA_INJECT_CSS='main h1{margin-bottom:-60px}'` makes it fail |
| Keyboard and zoom | `qa/keyboard.mjs` | Every Tab stop on 8 key pages at desktop and phone width: visible focus, not hidden by sticky bars, named, visible label included in the name (WCAG 2.4.7, 2.4.11, 2.5.3). Reflow at 200% and 400% zoom (1.4.10) |
| axe (WCAG 2.1 AA rules) | `qa/a11y.mjs` | Every sitemap route at 390 and 1440px: 0 serious or critical issues |

Lab performance on a production build (Lighthouse mobile, warm image cache), 2026-10-20:

| Page | Score | LCP |
|---|---|---|
| Home | 98 | |
| /products | 97 | |
| Category | 94–96 | |
| Product | 95–97 | 2.6s |
| Installed at | 96 | |
| System | 95–96 | |
| /quote | 96 | |

- CLS is 0 and TBT is 70ms or less on every page.
- Accessibility, best practices and SEO score 100 (/quote's SEO score is 66 because it is noindex by design).

## Manual: needs people or devices CI does not have

### 1. Screen readers (about 2 hours)

Use VoiceOver with Safari on macOS and NVDA with Firefox or Chrome on Windows. For each journey, the expected result is that everything is announced and reachable without a mouse.

1. Header search: type "wmhs". The result count is announced. Down arrow reads each option and Enter opens it. In VoiceOver's virtual cursor, activating an option opens it too.
2. Mobile menu, at a 390px window: the menu button opens a dialog, focus moves in, Tab stays inside it, and Escape returns focus to the button.
3. Category page: Filters, then an empty combination. "No models match" is announced and Reset restores the list.
4. Category compare: add a model (the announcement lists the models being compared), remove one with ×, then Reset. The table is announced with its caption and the specification column is read as row headers.
5. Product page gallery: the enlarged-image dialog opens, the close button has focus, and Escape closes it.
6. Specifications: Expand all, then Copy spec text. "Copied" is announced.
7. Quote list: change a quantity (the field announces "Quantity of WMHS-III"), remove a line, then open the drawer. Focus is trapped and Escape restores it.

Also check at 200% and 400% browser zoom that nothing is cut off.

### 2. Buyer task test (5 people, 30 minutes each)

Recruit five technically informed buyers: plant engineers, EPC buyers or dealers. Give no hints about where to click. Record task success, time, errors and hesitation.

| Task | Success means |
|---|---|
| Find the WMHS-IIIWP-VOIP datasheet | PDF opened in under 1 minute |
| You need a wall phone for a dusty outdoor kiln area on IP: find one and an alternative | Two suitable models identified |
| Compare three clean-room phones and say which uses PoE | Correct model, using the compare table |
| Build a quote list: 4 × WMHS-III, 2 × BC-L02, 1 × MCS-III | Quote list has the right items and quantities |
| Send the list to the company | WhatsApp or email hand-off reached |

Fix anything that two or more people stumble on, then re-test those tasks with two new people.

### 3. Real-user performance (after launch)

Lab scores are not field data. Once the site is public, read Core Web Vitals at the 75th percentile, mobile and desktop separately. Targets are LCP ≤ 2.5s, INP ≤ 200ms and CLS ≤ 0.1. Sources:

- PageSpeed Insights, which shows CrUX field data once there is enough traffic
- Vercel Speed Insights, if enabled on the project

The site is password-locked until launch, so no field data exists yet.
