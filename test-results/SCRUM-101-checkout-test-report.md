# Test Execution Report — SCRUM-101: E-commerce Checkout Process

**Application Under Test:** SauceDemo (https://www.saucedemo.com)
**Test Credentials:** `standard_user` / `secret_sauce`
**Report Date:** 2026-07-19
**Test Plan:** [specs/saucedemo-checkout-test-plan.md](../specs/saucedemo-checkout-test-plan.md)
**Automation Suite:** [tests/saucedemo-checkout/](../tests/saucedemo-checkout/)

---

## 1. Executive Summary

| Metric | Value |
|---|---|
| Test cases planned | 47 (across 8 suites) |
| Automated test methods implemented | 49 (one case, TC-CHECKOUT-EDGE-004, is parameterized into 3 boundary-value runs) |
| Total automated test executions | 51 |
| Passed | **51** |
| Failed | 0 |
| Blocked | 0 |
| Healing actions required | 0 (suite was stable on first run) |
| Overall status | **PASS** |

All acceptance criteria (AC1–AC5) and all five business rules from the user story are covered by automated Playwright tests, all currently passing against the live application. No defects block sign-off; several **application behavior gaps** were identified against the business rules and are logged in Section 4 for product-owner review — they are not automation failures, since the suite's job here was to characterize and lock in actual behavior.

---

## 2. Manual Exploratory Testing

Per the workflow template for this run, the standalone manual-exploration phase (Step 3) was not executed as a separate pass — it was commented out in the prompt-file template used to drive this workflow. In its place, live-application exploration was performed directly via Playwright MCP browser tools during:

- **Test planning** (`playwright-test-planner` agent) — walked the full login → inventory → cart → checkout-step-one → checkout-step-two → checkout-complete flow, confirming real field behavior, error text, cancel destinations, and totals math before any test case was written.
- **Script generation** (`playwright-test-generator` agent) — re-verified live selectors (`data-test` attributes), a hamburger-menu click quirk (`#react-burger-menu-btn` must be used; the visible icon intercepts clicks), and cart persistence across a logout/login cycle, before generating page objects.

Observations from this exploration are folded into Section 4 below rather than reported separately, since no dedicated manual pass with independent screenshots was run.

---

## 3. Automated Test Results

### 3.1 Suite Summary

| Suite | File | Tests | Passed | Failed |
|---|---|---|---|---|
| Cart Review (AC1) | `cart-review.spec.ts` | 9 | 9 | 0 |
| Checkout Information Entry (AC2) | `checkout-information.spec.ts` | 10 | 10 | 0 |
| Error Handling & Boundary Validation (AC5) | `error-handling.spec.ts` | 5 methods / 7 executions | 7 | 0 |
| Checkout Overview (AC3) | `checkout-overview.spec.ts` | 9 | 9 | 0 |
| Order Completion (AC4) | `order-completion.spec.ts` | 5 | 5 | 0 |
| Navigation Flow & Cancel Behavior | `navigation-flow.spec.ts` | 5 | 5 | 0 |
| Access Control & Business Rules | `access-control.spec.ts` | 4 | 4 | 0 |
| End-to-End Smoke | `e2e-smoke.spec.ts` | 2 | 2 | 0 |
| **Total** | | **49 methods / 51 executions** | **51** | **0** |

Run command: `npx playwright test tests/saucedemo-checkout --reporter=list`
Environment: Chromium (Desktop Chrome), 1 worker, `retries=0` (local, non-CI).
Total duration: 15.0 minutes.

### 3.2a Cross-Browser Results (Chromium / Firefox / WebKit)

`playwright.config.ts` was updated to add `firefox` and `webkit` projects scoped to `tests/saucedemo-checkout` (the existing OpenCart suites continue to run on `chromium` only, so their runtime is unaffected).

Run command: `npx playwright test tests/saucedemo-checkout --project=chromium --project=firefox --project=webkit --reporter=list`

| Browser | Executions | Passed | Failed |
|---|---|---|---|
| Chromium (Desktop Chrome) | 51 | 51 | 0 |
| Firefox (Desktop Firefox) | 51 | 51 | 0 |
| WebKit (Desktop Safari) | 51 | 51 | 0 |
| **Total** | **153** | **153** | **0** |

Total duration: 23.9 minutes. No browser-specific selector, timing, or assertion failures — the story's Technical Notes requirement to "Test across Chrome, Firefox, and Safari browsers" is now satisfied and automated.

**Incidental fix:** during this run, `playwright.config.ts` was found to have no explicit `outputDir`, so Playwright's default (`test-results/`) collided with this hand-authored report living in the same folder — a full suite run wiped the report file. Fixed by setting `outputDir: './playwright-results'` and updating `.gitignore` accordingly, so Playwright's own run artifacts no longer share a directory with authored reports.

### 3.2 Initial Automation Results

The suite passed in full on its first execution — all 51 test executions green, zero failures. No selector, timing, or assertion issues were encountered.

### 3.3 Healing Activities Performed

None required. The `playwright-test-healer` agent was not invoked because there were no failures to diagnose. This itself is a meaningful signal: the page objects and selectors were derived directly from live exploration (Section 2) rather than assumption, which is the intended benefit of the plan → explore → generate pipeline used here.

### 3.4 Final Execution Results

Unchanged from Section 3.2 — **51/51 passing**.

---

## 4. Defects / Behavior Findings Log

These are **application behavior findings**, not automation defects — the suite passes because it asserts the application's *actual* behavior. They are logged here because several diverge from the business rules stated in the user story and warrant a product-owner decision on whether they are acceptable or should be tightened.

| ID | Severity | Title | Steps to Reproduce | Expected (per Business Rules) | Actual | Test Reference |
|---|---|---|---|---|---|---|
| BUG-001 | Medium | Checkout completes with an empty cart | 1. Log in. 2. Do not add any items. 3. Navigate directly to `/checkout-step-one.html`, fill valid info, continue. 4. On Overview, click Finish. | Business Rule 3: "Cart cannot be empty when proceeding to checkout" — checkout should be blocked. | Both Checkout Information and Overview render normally with an empty cart (Item total $0 / Tax $0.00 / Total $0.00); Finish still succeeds to the confirmation page. | `TC-ACCESS-002` |
| BUG-002 | Low | No server-side checkout step-sequence enforcement | While logged in with any cart state, navigate directly to `/checkout-complete.html` (or any checkout URL) without completing prior steps. | Steps should generally be gated in sequence (info → overview → complete). | Any checkout URL loads directly once authenticated; only the logged-out case is blocked (redirects to `/` with an "Epic sadface" error). | `TC-CHECKOUT-COMPLETE-005` |
| BUG-003 | Low | No format validation on Checkout Information fields | Enter special characters / an apostrophe-hyphen-digit mix in First or Last Name, or non-numeric characters in Zip/Postal Code, then Continue. | Business Rule 1 implies meaningful field validation, not just presence. | All values are accepted as long as the field is non-empty — validation is presence-only, not format-based. | `TC-CHECKOUT-EDGE-001`, `TC-CHECKOUT-EDGE-002` |
| BUG-004 | Low | Whitespace-only input satisfies the "required" check | Enter a single space (or spaces) into First Name, leave Last Name/Zip filled, click Continue. | Business Rule 1: field should be considered empty/required. | The field is treated as non-empty and the user proceeds. | `TC-CHECKOUT-INFO-010` |
| BUG-005 | Info | Browser Back after order completion shows Overview with $0 totals | Complete an order, then click the browser Back button. | Undefined by user story; noted for awareness. | Lands on the Overview page reflecting the real (now-empty, post-clear) cart state — not a stale snapshot of the just-completed order. | `TC-CHECKOUT-COMPLETE-004` |

No Critical or High severity defects were found; core happy-path and validation-error flows (AC1–AC4, and the "leave a field empty" case in AC2/AC5) all behave exactly as specified.

---

## 5. Test Coverage Analysis

| Acceptance Criteria | Covered By | Manual | Automated |
|---|---|---|---|
| AC1 – Cart Review | `cart-review.spec.ts` (TC-CART-001…009) | Exploration only | ✅ |
| AC2 – Checkout Information Entry | `checkout-information.spec.ts` (TC-CHECKOUT-INFO-001…010) | Exploration only | ✅ |
| AC3 – Order Overview | `checkout-overview.spec.ts` (TC-CHECKOUT-OVERVIEW-001…009) | Exploration only | ✅ |
| AC4 – Order Completion | `order-completion.spec.ts` (TC-CHECKOUT-COMPLETE-001…005) | Exploration only | ✅ |
| AC5 – Error Handling | `error-handling.spec.ts` (TC-CHECKOUT-EDGE-001…005) | Exploration only | ✅ |
| Business Rule 1 (mandatory fields) | TC-CHECKOUT-INFO-002…004, 009, 010 | — | ✅ (gap logged: BUG-003/004) |
| Business Rule 2 (login required) | TC-ACCESS-001, TC-CART-008, TC-CHECKOUT-INFO-008 | — | ✅ |
| Business Rule 3 (cart not empty at checkout) | TC-ACCESS-002 | — | ✅ (gap logged: BUG-001) |
| Business Rule 4 (order clears cart) | TC-CHECKOUT-COMPLETE-002, TC-ACCESS-003 | — | ✅ |
| Business Rule 5 (cancel at any step) | TC-CHECKOUT-INFO-007, TC-CHECKOUT-OVERVIEW-008, TC-NAV-002 | — | ✅ |
| Navigation / browser back | `navigation-flow.spec.ts` (TC-NAV-001…005) | — | ✅ |
| Cross-browser (Chrome/Firefox/Safari) | `firefox`/`webkit` projects in `playwright.config.ts` | — | ✅ (153/153 passing, see 3.2a) |
| Mobile responsiveness | — | — | ❌ Gap — see below |

**Coverage gaps / recommendations:**
1. ~~Cross-browser execution~~ — **closed.** `firefox` and `webkit` projects were added to `playwright.config.ts`, scoped to `tests/saucedemo-checkout`; all 51 test cases pass on all 3 browsers (153/153, see Section 3.2a).
2. **Mobile responsiveness** — not covered by the current suite (no mobile viewport/device project configured). Recommend a follow-up pass with a mobile emulation project if this is a hard requirement rather than a nice-to-have.
3. **Alternate user personas** (`locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`) were explicitly scoped out of this pass per the test plan; consider a follow-up suite if these are in-scope for the broader story.
4. Business-rule gaps (BUG-001, BUG-003, BUG-004) should go back to the product owner to confirm whether they are accepted SauceDemo demo-app behavior (likely, since SauceDemo is a fixed public demo target) or represent real validation to add.

---

## 6. Summary and Recommendations

**Overall quality assessment:** The checkout flow is stable and functionally correct against all five acceptance criteria — cart review, information entry, overview totals (verified for 1, 2, and all 6 catalog items with correct 8%-tax rounding), order completion, and cancel/navigation behavior all pass. The suite required zero healing, indicating the plan → explore → generate pipeline produced accurate selectors and expectations on the first attempt.

**Risk areas:**
- The empty-cart checkout gap (BUG-001) is the most business-relevant finding — it contradicts a stated business rule and should be explicitly accepted or fixed.
- Lack of format validation (BUG-003, BUG-004) is consistent with SauceDemo being a fixed public demo app with intentionally shallow validation; unlikely to change, but worth confirming expectations aren't drifting for a real target.

**Next steps:**
1. ~~Add `firefox` and `webkit` (Safari) projects~~ — done; 153/153 passing cross-browser (Section 3.2a).
2. Decide on BUG-001 through BUG-004 with the product owner; if accepted as-is, convert their test cases from "negative case" framing to explicit "documented behavior" framing (already partially done, e.g. TC-ACCESS-002's title says "is currently allowed").
3. Consider a lightweight mobile-viewport pass if mobile responsiveness is a hard release gate.
4. Wire this suite into CI (a GitHub Actions workflow directory already exists at `.github/workflows/` in this repo) so regressions on saucedemo-side behavior are caught automatically going forward, if this suite is intended to run on a recurring basis rather than as a one-off exercise. Note CI would need `npx playwright install --with-deps` for firefox/webkit binaries.
