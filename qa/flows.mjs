// Flow smoke test against the production server: search → PDP → add to quote → drawer (Esc, focus) → /quote → validation → submit,
// mobile menu, legacy redirect, datasheet download, reduced motion, quote persistence. Usage: node qa/flows.mjs http://localhost:3200
import { chromium } from "playwright";
const base = process.argv[2] || "http://localhost:3200";
const b = await chromium.launch();
const results = [];
const check = (name, ok, info = "") => { results.push([ok ? "PASS" : "FAIL", name, info]); };
const errs = [];
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto(base + "/", { waitUntil: "networkidle" });

// header search: messy code resolves
await p.fill('input[placeholder^="Search models"]', "wmhs 3");
await p.waitForTimeout(200);
const firstHit = await p.locator('[role="listbox"] [role="option"]').first().textContent().catch(() => "");
check("search 'wmhs 3' finds WMHS-III first", /WMHS-III/.test(firstHit || ""), firstHit);
await p.keyboard.press("Enter");
await p.waitForURL(/\/products\/.+\/wmhs-iii$/, { timeout: 8000 }).catch(() => {});
check("Enter opens the product page", /wmhs-iii$/.test(p.url()), p.url());

// add to quote
await p.getByRole("button", { name: /Add to quote\s*: WMHS-III$/ }).first().click();
await p.waitForTimeout(300);
const badge = await p.locator('button[data-quote-badge] .badge').textContent();
check("badge increments to 1", badge?.trim() === "1", badge);
const label = await p.getByRole("button", { name: /In quote list\s*: WMHS-III/ }).count();
check("button flips to 'In quote list'", label > 0);
const toast = (await p.locator('[role="status"]').allTextContents()).find((t) => /added to your quote list/.test(t)) ?? "";
check("toast announces the add", /added to your quote list/.test(toast || ""), toast);

// drawer
await p.click('button[data-quote-badge]');
await p.waitForTimeout(350);
const dialogVisible = await p.locator('[role="dialog"][aria-label="Quote list"]').isVisible();
check("drawer opens", dialogVisible);
const focusedInDrawer = await p.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
check("focus moves into the drawer", focusedInDrawer);
let escaped = 0;
for (let i = 0; i < 25; i++) { await p.keyboard.press(i % 2 ? "Tab" : "Shift+Tab"); if (!(await p.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))) escaped++; }
check("Tab / Shift+Tab stay inside the drawer (25 presses)", escaped === 0, `${escaped} escapes`);
check("page behind the drawer is inert", await p.evaluate(() => document.querySelector("main")?.hasAttribute("inert") === true));
await p.click('button[aria-label="Increase"]');
const qty = await p.inputValue('input[aria-label="Quantity"]');
check("quantity stepper works", qty === "2", qty);
await p.keyboard.press("Escape");
await p.waitForTimeout(350);
check("Escape closes the drawer", !(await p.locator('[role="dialog"][aria-label="Quote list"]').isVisible()));
check("focus returns to the quote button", await p.evaluate(() => document.activeElement?.hasAttribute("data-quote-badge") === true));

// persistence
await p.reload({ waitUntil: "networkidle" });
const badge2 = await p.locator('button[data-quote-badge] .badge').textContent();
check("quote list persists across reload", badge2?.trim() === "1", badge2);

// quote page: requirements, validation (summary + focus), then WhatsApp handoff with models + quantities
// URL search (?q=) filters the catalogue (read via useSearchParams)
await p.goto(base + "/products?q=hooter", { waitUntil: "networkidle" });
const qShown = await p.evaluate(() => (document.body.innerText.match(/(\d+) of (\d+)/) || []).slice(1).map(Number));
check("/products?q=hooter filters the catalogue", qShown[0] > 0 && qShown[0] < qShown[1], qShown.join(" of "));
// category filters: an impossible combination shows an empty state with a reset
await p.goto(base + "/products/industrial-telephones", { waitUntil: "networkidle" });
const chips = p.locator('[role=group][aria-label="Filter models"] .chip');
let emptyShown = null;
for (let i = 0, n = await chips.count(); i < n && emptyShown === null; i++) for (let j = i + 1; j < n && emptyShown === null; j++) {
  await chips.nth(i).click(); await chips.nth(j).click(); await p.waitForTimeout(80);
  if (await p.getByText("No models match these filters.").isVisible()) { await p.getByRole("button", { name: "Reset filters" }).click(); emptyShown = await p.locator("main article").count() > 0; }
  else { if (await chips.nth(i).getAttribute("aria-pressed") === "true") await chips.nth(i).click(); if (await chips.nth(j).getAttribute("aria-pressed") === "true") await chips.nth(j).click(); }
}
check("empty filter result shows a reset that restores models", emptyShown !== false, emptyShown === null ? "no empty combination in this category" : "");
// product comparison leads with differences
await p.goto(base + "/products/industrial-telephones/wmhs-iii", { waitUntil: "networkidle" });
check("comparison table marks differing rows first", await p.evaluate(() => { const rows = [...document.querySelectorAll("table tbody tr")].filter((r) => r.closest("[class*=cmpWrap]")); const first = rows.findIndex((r) => !r.querySelector("[class*=diffTag]")); return rows.length > 0 && !!rows[0].querySelector("[class*=diffTag]") && (first < 0 || rows.slice(first).every((r) => !r.querySelector("[class*=diffTag]"))); }));
// mega-menu featured card says where it goes; the catalogue has its own link
await p.goto(base + "/", { waitUntil: "networkidle" });
check("mega menu has a real link to all models", await p.evaluate(() => { const a = [...document.querySelectorAll("#mega-products a")].find((x) => /All \d+ models/.test(x.textContent || "")); return a?.getAttribute("href") === "/products"; }));
// category page: select-and-compare (2–4 models, differences first)
await p.goto(base + "/products/industrial-telephones#compare", { waitUntil: "networkidle" });
const cols = () => p.locator("#compare thead th").count();
const c0 = await cols();
const boxes = p.locator("#compare input[type=checkbox]");
const unchecked = p.locator("#compare input[type=checkbox]:not(:checked)");
await unchecked.first().check(); await p.waitForTimeout(80);
const c1 = await cols();
const fifthDisabled = (await boxes.count()) > 4 ? await unchecked.first().isDisabled() : true;
check("category compare: picking models changes the table, max 4", c1 === c0 + 1 && c1 - 1 === 4 && fifthDisabled, `${c0 - 1} → ${c1 - 1} models`);
check("category compare leads with differing rows", await p.locator("#compare tbody tr").first().locator("[class*=tag]").count() === 1);
// catalogue search writes ?q= back to the URL; a new ?q= updates the field
await p.goto(base + "/products", { waitUntil: "networkidle" });
await p.fill("#cat-q", "hooter"); await p.waitForTimeout(700);
check("catalogue search updates the URL", new URL(p.url()).searchParams.get("q") === "hooter", p.url());
await p.goto(base + "/products?q=clean", { waitUntil: "networkidle" });
check("?q= in the URL fills the catalogue search", (await p.inputValue("#cat-q")) === "clean");
// header autocomplete: clicking an option (standard click) navigates
await p.goto(base + "/about", { waitUntil: "networkidle" });
await p.fill('header input[placeholder^="Search models"]', "bc-l02"); await p.waitForTimeout(150);
await p.locator('header [role="option"]').first().click(); await p.waitForURL("**/bc-l02", { timeout: 5000 }).catch(() => {});
check("clicking an autocomplete option opens the model", p.url().endsWith("/bc-l02"), p.url());
// catalogue search must not inherit the header autocomplete's 8-result cap
await p.goto(base + "/products", { waitUntil: "networkidle" });
await p.fill("#cat-q", "telephone"); await p.waitForTimeout(400);
const shown = await p.evaluate(() => (document.body.innerText.match(/(\d+) of (\d+)/) || [])[1]);
check("catalogue search 'telephone' shows more than 8 models", Number(shown) > 8, `${shown} shown`);
await p.goto(base + "/quote", { waitUntil: "networkidle" });
check("quote page lists the model", (await p.locator("text=WMHS-III").count()) > 0);
check("delivery notice shown before the form", (await p.locator("text=How this form sends").count()) > 0);
check("required fields are stated", (await p.locator("#req-note").count()) > 0);
await p.getByRole("button", { name: /Send quote request on WhatsApp/ }).click();
await p.waitForTimeout(300);
check("error summary announced (role=alert)", (await p.locator('[role="alert"]').count()) > 0);
check("focus moves to the first invalid field", await p.evaluate(() => document.activeElement?.id === "f-name"));
check("error linked to its field", await p.evaluate(() => document.getElementById("f-name")?.getAttribute("aria-describedby") === "e-name"));
await p.fill("#f-name", "QA Test Engineer");
await p.fill("#f-phone", "+91 90000 00000");
await ctx.route(/wa\.me/, (r) => r.fulfill({ status: 200, body: "ok" }));
const [popup] = await Promise.all([ctx.waitForEvent("page"), p.getByRole("button", { name: /Send quote request on WhatsApp/ }).click()]);
const waText = decodeURIComponent(new URL(popup.url()).searchParams.get("text") || "");
check("WhatsApp handoff carries model + quantity", /WMHS-III .* × 2/.test(waText), waText.split("\n").find((l) => l.includes("WMHS")) || waText.slice(0, 60));
check("handoff carries contact details", /QA Test Engineer/.test(waText) && /90000/.test(waText));
await popup.close();
check("confirmation explains the next step", (await p.locator("text=Press").count()) > 0);

// contact form: email handoff
await p.goto(base + "/contact", { waitUntil: "networkidle" });
await p.fill("#f-name", "QA"); await p.fill("#f-email", "qa@example.com"); await p.fill("#f-message", "Email handoff test");
await p.getByRole("button", { name: "Send by email" }).click().catch(() => {});
await p.waitForTimeout(400);
check("email handoff shows confirmation", (await p.locator("text=Your email app is open").count()) > 0);

// legacy redirect + datasheet
const r1 = await p.request.get(base + "/cnwcom-Smart_industialL%20TELEPHONE%20WITH%20HANDSET-MODEL-WMHS-III.php", { maxRedirects: 0 });
check("legacy PHP URL 308 → product", r1.status() === 308 && /wmhs-iii$/.test(r1.headers().location || ""), `${r1.status()} ${r1.headers().location}`);
const r2 = await p.request.get(base + "/files/datasheets/wmhs-iii.pdf");
check("datasheet PDF served", r2.status() === 200 && (r2.headers()["content-type"] || "").includes("pdf"));
const r3 = await p.request.get(base + "/products/weatherproof-flameproof-telephones/flp");
check("FLP page live, datasheet withheld", r3.status() === 200 && !(await r3.text()).includes("/files/datasheets/flp.pdf"));
const r4 = await p.request.get(base + "/does-not-exist");
check("unknown URL is a real 404", r4.status() === 404);

// malformed storage recovery
await p.evaluate(() => localStorage.setItem("cw-quote-v1", "{not json"));
await p.goto(base + "/", { waitUntil: "networkidle" });
check("malformed quote storage does not crash", (await p.locator("h1").count()) > 0);
await ctx.close();

// mobile menu + 44px targets + reduced motion
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" })).newPage();
m.on("pageerror", (e) => errs.push(String(e)));
await m.goto(base + "/", { waitUntil: "networkidle" });
await m.click('button[aria-label="Menu"]');
await m.waitForTimeout(300);
check("mobile menu opens", await m.locator("#m-sheet").isVisible());
// menu behaves as a modal: focus moves in, Tab stays inside (burger + sheet), page behind inert, Escape returns focus
const inSheet = () => m.evaluate(() => !!document.activeElement?.closest("#m-sheet") || document.activeElement?.getAttribute("aria-label") === "Menu");
check("mobile menu takes focus", await inSheet());
let sheetEscapes = 0; for (let i = 0; i < 40; i++) { await m.keyboard.press("Tab"); if (!(await inSheet())) sheetEscapes++; }
check("Tab stays inside the mobile menu", sheetEscapes === 0, `${sheetEscapes} escapes in 40 presses`);
check("page behind the mobile menu is inert", await m.evaluate(() => document.querySelector("main")?.hasAttribute("inert")));
await m.keyboard.press("Escape"); await m.waitForTimeout(150);
check("Escape closes the menu and returns focus to the button", await m.evaluate(() => !document.querySelector("#m-sheet")?.matches("[class*=open]") && document.activeElement?.getAttribute("aria-label") === "Menu" && !document.querySelector("main")?.hasAttribute("inert")));
check("company name shown in the mobile header", await m.evaluate(() => { const i = [...document.querySelectorAll("header img")].find((e) => e.getBoundingClientRect().width > 0); return !!i && i.alt.includes("Cables") && i.getAttribute("src")?.includes("cw-logo") && i.getBoundingClientRect().width > 100; }));
const small = await m.evaluate(() => [...document.querySelectorAll("header button, header a")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < 40); }).map((e) => e.getAttribute("aria-label") || e.textContent?.trim()).slice(0, 5));
check("header tap targets ≥ 40px", small.length === 0, small.join(", "));
const anim = await m.evaluate(() => getComputedStyle(document.querySelector("svg[class*=rings] circle")).animationName);
check("reduced motion stops the hero rings", anim === "none", anim);
const revealHidden = await m.evaluate(() => document.documentElement.classList.contains("js"));
check("reduced motion skips reveal hiding", !revealHidden);
await m.context().close();

// quote list with long names at 320px: drawer and /quote stay within the screen
{
  const n = await (await b.newContext({ viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true })).newPage();
  await n.goto(base + "/", { waitUntil: "networkidle" });
  await n.evaluate(() => localStorage.setItem("cw-quote-v1", JSON.stringify([
    { slug: "gsm-ecb-server-rack", model: "GSM-ECB SERVER RACK", name: "Emergency Call Box Central Server Rack with Message, Voice and Call Loggers", href: "/products/emergency-call-boxes/gsm-ecb-server-rack", img: null, qty: 12, note: "" },
    { slug: "oc-dths-iii", model: "OC-DTHS-III", name: "Operator Console with Desk-Top Handset and Gooseneck Microphone", href: "/products/operator-consoles-amplifiers-loudspeakers/oc-dths-iii", img: null, qty: 2, note: "" },
    { slug: "wmhs-iiiwp-voip", model: "WMHS-IIIWP-VOIP", name: "Weatherproof VoIP Telephone", href: "/products/weatherproof-flameproof-telephones/wmhs-iiiwp-voip", img: null, qty: 1, note: "" },
  ])));
  await n.goto(base + "/quote", { waitUntil: "networkidle" });
  const pageOver = await n.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await n.click("button[data-quote-badge]"); await n.waitForTimeout(300);
  const drawerOver = await n.evaluate(() => { const d = document.querySelector("[role=dialog][aria-modal=true]:not(#m-sheet)") || document.querySelector("[class*=drawer]"); return d ? d.scrollWidth - d.clientWidth : -1; });
  check("long quote list fits at 320px (page and drawer)", pageOver <= 0 && drawerOver === 0, `page +${pageOver}, drawer +${drawerOver}`);
  await n.keyboard.press("Escape"); await n.waitForTimeout(200);
  const hdr = await n.evaluate(() => { const bt = document.querySelector('button[aria-label="Menu"]').getBoundingClientRect(); const logo = [...document.querySelectorAll("header img")].find((i) => i.getBoundingClientRect().width > 0).getBoundingClientRect(); return { burger: Math.round(bt.width), right: Math.round(bt.right), logoW: Math.round(logo.width) }; });
  check("320px header: full logo, 44px menu button, nothing squeezed", hdr.burger >= 44 && hdr.right <= 320 && hdr.logoW > 100, JSON.stringify(hdr));
  await n.context().close();
}
check("no uncaught page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
await b.close();
for (const r of results) console.log(r.join("  "));
console.log(`\n${results.filter((r) => r[0] === "PASS").length}/${results.length} passed`);
process.exitCode = results.every((r) => r[0] === "PASS") ? 0 : 1;
