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
const toast = await p.locator('[role="status"]').first().textContent();
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
const small = await m.evaluate(() => [...document.querySelectorAll("header button, header a")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < 40); }).map((e) => e.getAttribute("aria-label") || e.textContent?.trim()).slice(0, 5));
check("header tap targets ≥ 40px", small.length === 0, small.join(", "));
const anim = await m.evaluate(() => getComputedStyle(document.querySelector("svg[class*=rings] circle")).animationName);
check("reduced motion stops the hero rings", anim === "none", anim);
const revealHidden = await m.evaluate(() => document.documentElement.classList.contains("js"));
check("reduced motion skips reveal hiding", !revealHidden);
await m.context().close();

check("no uncaught page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
await b.close();
for (const r of results) console.log(r.join("  "));
console.log(`\n${results.filter((r) => r[0] === "PASS").length}/${results.length} passed`);
process.exitCode = results.every((r) => r[0] === "PASS") ? 0 : 1;
