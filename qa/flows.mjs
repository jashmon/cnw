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
await p.click('button[aria-label="Increase"]');
const qty = await p.inputValue('input[aria-label="Quantity"]');
check("quantity stepper works", qty === "2", qty);
await p.keyboard.press("Escape");
await p.waitForTimeout(350);
check("Escape closes the drawer", !(await p.locator('[role="dialog"][aria-label="Quote list"]').isVisible()));

// persistence
await p.reload({ waitUntil: "networkidle" });
const badge2 = await p.locator('button[data-quote-badge] .badge').textContent();
check("quote list persists across reload", badge2?.trim() === "1", badge2);

// quote page: validation then submit
await p.goto(base + "/quote", { waitUntil: "networkidle" });
check("quote page lists the model", (await p.locator("text=WMHS-III").count()) > 0);
await p.getByRole("button", { name: /Send quote request/ }).click();
await p.waitForTimeout(400);
const nameErr = await p.locator("#e-name").textContent().catch(() => "");
check("validation error shown for empty name", /name/i.test(nameErr || ""), nameErr);
await p.fill("#f-name", "QA Test Engineer");
await p.fill("#f-phone", "+91 90000 00000");
await p.getByRole("button", { name: /Send quote request/ }).click();
await p.waitForSelector("text=Enquiry received.", { timeout: 6000 }).catch(() => {});
const ref = await p.locator("b.mono").first().textContent().catch(() => "");
check("submission returns a reference", /^CW-\d{6}-[A-Z0-9]{4}$/.test(ref || ""), ref);
const badge3 = await p.locator('button[data-quote-badge] .badge').textContent();
check("quote list clears after sending", badge3?.trim() === "0", badge3);

// network failure path
await p.goto(base + "/contact", { waitUntil: "networkidle" });
await p.route("**/api/enquiry", (r) => r.abort());
await p.fill("#f-name", "QA"); await p.fill("#f-email", "qa@example.com"); await p.fill("#f-msg", "Network failure test");
await p.getByRole("button", { name: /Send enquiry/ }).click();
await p.waitForTimeout(500);
check("network failure shows a recoverable error", (await p.locator('[role="alert"]').count()) > 0);
await p.unroute("**/api/enquiry");

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
const anim = await m.evaluate(() => getComputedStyle(document.querySelector('[class*="track"]')).animationName);
check("reduced motion stops the ticker", anim === "none", anim);
const revealHidden = await m.evaluate(() => document.documentElement.classList.contains("js"));
check("reduced motion skips reveal hiding", !revealHidden);
await m.context().close();

check("no uncaught page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
await b.close();
for (const r of results) console.log(r.join("  "));
console.log(`\n${results.filter((r) => r[0] === "PASS").length}/${results.length} passed`);
