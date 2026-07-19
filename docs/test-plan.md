# Test Plan — OpenCart QA Automation

## 1. Document Purpose

This test plan governs the automated regression suite built for the local
OpenCart 3.0.4.1 instance at `http://localhost/opencart/upload/` (storefront)
and `http://localhost/opencart/upload/admin/` (admin). It complements
`CLAUDE.md` (modules, scenarios, business workflows, test-case format) with
scope, approach, environment, risk, and traceability specific to this
automation pass.

## 2. Scope

### 2.1 In Scope
- Functional UI regression testing of the storefront shopping path: browse,
  search, product detail (incl. all option types), cart, checkout (guest and
  registered), account management, wishlist, compare.
- Functional UI regression testing of admin back-office operations that
  directly support the storefront: catalog product maintenance, order
  status lifecycle, coupon creation and validation.
- Cross-verification between storefront actions and their admin-side
  effects (e.g., an order placed on the storefront is checked in Admin →
  Sales → Orders in the same test).

### 2.2 Out of Scope (this pass)
- Performance/load testing, security penetration testing, visual/pixel-diff
  regression, payment gateway sandbox integrations beyond OpenCart's default
  offline methods (Cash on Delivery / Bank Transfer / Cheque).
- Reward Points redemption end-to-end (requires a prior completed order to
  bank points — a fragile multi-run dependency). Documented as a test case;
  not automated in this pass.
- Third-party OCMOD extensions not part of the base install.
- Every negative/boundary case enumerated in `CLAUDE.md` — those are all
  written up as test cases (Deliverable 2), but only the ones backing a
  Key Business Workflow are automated in this pass (see §6 Traceability).

## 3. Test Approach

**Hybrid MCP-authored / code-executed automation**, per project decision:
- The Playwright MCP server (configured in `.mcp.json`) and a scripted
  headless-Chromium exploration pass were used *during authoring* to
  capture real rendered markup (including AJAX-loaded checkout steps and
  authenticated admin screens) and confirm exact element IDs/roles before
  any locator was hard-coded.
- The delivered suite is standard **Playwright Test (TypeScript)** using a
  **Page Object Model**. It runs standalone via `npx playwright test` — no
  agent or LLM involved at run time, fully usable in an unattended CI
  pipeline.
- Page Objects locate elements by role/label/id confirmed from real markup,
  and navigate via UI interaction (search box, category links, admin
  sidebar) rather than constructing `product_id=`/`user_token=` URLs by
  guesswork, so tests tolerate a demo-data reset better than hard-coded IDs
  would.

## 4. Environment & Test Data Strategy

| Aspect | Approach |
|---|---|
| Storefront URL | `STOREFRONT_BASE_URL` env var (default `http://localhost/opencart/upload/`) |
| Admin URL | `ADMIN_BASE_URL` env var (default `http://localhost/opencart/upload/admin/`) |
| Admin credentials | `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars (`.env`, gitignored; `.env.example` committed) |
| Browser | Chromium (Desktop Chrome emulation), headless by default, `--headed`/`--ui` available for debugging |
| Customer test data | Generated at run time (`src/utils/randomData.ts`) — unique email/name per run via timestamp+random suffix, to avoid "duplicate email" collisions across repeat executions |
| Product test data | Referenced by **name** (e.g., "MacBook", "Apple Cinema 30\"") and located via storefront search/category navigation, not by hard-coded `product_id` |
| Known baseline (as of 2026-07-17) | OpenCart 3.0.4.1; demo catalog (Desktops/Laptops/Components/Tablets/Software/Phones/Cameras/MP3 Players); MacBook (id 43, no required options), Apple Cinema 30" (id 42, has radio/checkbox/select/text/textarea options) — re-verify by name lookup if the store is reseeded |

## 5. Entry / Exit Criteria

**Entry**: XAMPP/Apache+MySQL running, OpenCart reachable at the configured
URLs, admin credentials valid, `npm install` + `npx playwright install
chromium` completed.

**Exit**: All specs under "fully automated" (§6) pass on a clean run
(`npx playwright test`); documented-only specs report as **skipped**
(`test.fixme`), not failing; HTML report (`npx playwright show-report`)
reviewed for any flaky retries.

## 6. Traceability — Key Business Workflows (from `CLAUDE.md`) → Automation Status

| # | Workflow | Status | Spec file |
|---|---|---|---|
| 1 | Guest search → PDP → cart → guest checkout → confirmation | **Automated** (smoke) | `tests/storefront/smoke-guest-checkout.spec.ts` |
| 2 | Register → login → checkout → order history | **Automated** (smoke) | `tests/storefront/registration-checkout.spec.ts` |
| 3 | Product options → cart price recalculation → checkout → admin order detail shows options | **Automated** | `tests/storefront/product-options-cart-pricing.spec.ts` |
| 4 | Coupon/voucher applied at checkout → discounted total → confirmed in admin order detail | **Automated** (coupon only; voucher/reward-points documented only) | `tests/storefront/coupon-checkout.spec.ts` |
| 5 | Admin creates/updates product → storefront reflects change | **Automated** | `tests/admin/catalog-product-crud.spec.ts` |
| 6 | Admin updates order status → customer's order history reflects it | **Automated** | `tests/admin/order-lifecycle.spec.ts` |
| 7 | Customer return request → admin processes RMA | Documented only | `tests/admin/returns.spec.ts` (`test.fixme`) |
| 8 | Wishlist/Compare → move to cart → checkout | **Automated** | `tests/storefront/wishlist-compare-to-cart.spec.ts` |
| 9 | Account maintenance (address book, password, newsletter) persists | **Automated** | `tests/storefront/account-maintenance.spec.ts` |
| 10 | Admin access control (restricted user group negative test) | Documented only | `tests/admin/access-control.spec.ts` (`test.fixme`) |

Additional documented-only specs for module coverage not tied to a numbered
workflow: `tests/storefront/search-and-listing.spec.ts`,
`tests/storefront/specials-manufacturer-vouchers.spec.ts`,
`tests/storefront/currency-switch.spec.ts`,
`tests/admin/customers-marketing.spec.ts`.

## 7. Roles & Tools

- **Test framework**: Playwright Test 1.61.x, TypeScript, Node 24.
- **Design pattern**: Page Object Model, one class per page/major UI
  region, injected via a custom Playwright fixture (`src/fixtures/`).
- **Reporting**: built-in HTML reporter (`playwright-report/`) + list
  reporter for console/CI output; trace/video/screenshot captured only on
  failure.

## 8. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Demo data reset (product IDs/stock change) | Broken locators/assumptions | Page Objects navigate by name/UI interaction, not hard-coded IDs |
| Shared local MySQL state between runs (e.g., duplicate coupon codes, accumulating test customers/orders) | Flaky re-runs | Randomized unique data per run; coupon spec checks-then-creates idempotently |
| Reward Points flow needs a prior completed order | Fragile, multi-run dependent | Excluded from automated scope; documented only |
| AJAX-driven multi-step checkout (address → shipping → payment → confirm) timing | Flaky waits | Explicit waits on the next step's rendered content/button rather than fixed sleeps |
| Admin route names changed between OpenCart 3.0.x point releases (confirmed `catalog/product/edit`, `marketing/coupon/add`, not the older `.form` suffix) | Wrong routes 404/permission-denied | Confirmed live against this instance (3.0.4.1) during authoring |

## 9. Known Environment Issues Found During Automation Build

These were discovered while wiring up the checkout flow and affect real
shoppers, not just this test suite:

- **No payment method was enabled out of the box.** Cash on Delivery was
  present but disabled, and it additionally requires `hasShipping()` to be
  true for the cart — which fails for products like MacBook (product_id 43)
  that have `shipping = 0` in `oc_product`. **Bank Transfer** was installed
  and enabled instead (with required "Bank Transfer Instructions" text
  filled in) since it has no shipping dependency, only a geo-zone/minimum-
  total check (both set to no-restriction). Recorded here so the reason a
  specific payment method is used in tests isn't a mystery later.
- **Order confirmation is broken for every guest/customer, not just
  automation.** PHP's `mail()` call fails locally (no SMTP configured on
  this XAMPP install) and prints an inline warning *ahead of* the JSON body
  that `extension/payment/*/confirm` returns. The storefront's own jQuery
  handler expects pure JSON, fails to parse it, and shows a raw JS
  `alert()` instead of redirecting to the order confirmation page — the
  order is still created server-side, but the customer never sees
  confirmation and the cart is never visibly cleared client-side. The
  standard fix is `display_errors=Off` in `D:\xampp\php\php.ini` (errors
  still get logged, just not echoed into responses) plus an Apache restart.
  **This was raised with the project owner, who asked to work around it in
  the test suite rather than change PHP config.** `CheckoutPage.placeOrder()`
  therefore dismisses the resulting dialog and reads the redirect URL
  directly out of the raw response body instead of relying on the
  (currently broken) client-side redirect — see the comment in
  `src/pages/storefront/CheckoutPage.ts`. If `display_errors` is ever fixed
  server-side, this workaround still functions unchanged (the regex matches
  a clean JSON body just as well as one with a warning prefix).

## 10. Deliverables Summary

1. This test plan (`docs/test-plan.md`).
2. Test cases per module (`docs/test-cases/storefront/*.md`,
   `docs/test-cases/admin/*.md`), following `CLAUDE.md`'s Test Case Format.
3. The Playwright POM framework (`src/`, `tests/`, config at repo root).
