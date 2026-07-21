# Test Execution Details — SCRUM-101: E-commerce Checkout Process

**Application Under Test:** SauceDemo (https://www.saucedemo.com)
**Report Date:** 2026-07-21
**Automation Suite:** [tests/saucedemo-checkout/](../tests/saucedemo-checkout/)
**Companion Summary Report:** [SCRUM-101-checkout-test-report.md](SCRUM-101-checkout-test-report.md) / [.html](SCRUM-101-checkout-test-report.html)

This document lists **every one of the 32 automated test cases individually**, with per-browser pass/fail status and the specific business use case (Acceptance Criteria) and Business Rule each one validates. It supplements the summary report, which aggregates by suite rather than by individual test.

Run command: `npx playwright test tests/saucedemo-checkout --project=chromium --project=firefox --project=webkit --reporter=list`
Total: **96/96 executions passed** (32 test cases × 3 browsers), 0 failed, 0 skipped, 20.8 minutes.

---

## Business Use Case Legend

| Code | Business Use Case (from user story SCRUM-101) |
|---|---|
| AC1 | Cart Review — user reviews cart contents and totals before checkout |
| AC2 | Checkout Information Entry — user provides shipping/contact info |
| AC3 | Order Overview — user reviews order summary, payment/shipping, and totals before confirming |
| AC4 | Order Completion — user confirms the order and receives confirmation |
| AC5 | Error Handling — invalid/incomplete input is rejected with clear feedback |
| NAV | Navigation Flow — cancel/back-button behavior across the checkout flow (cross-cutting, supports AC1–AC4) |

| Code | Business Rule (from user story SCRUM-101) |
|---|---|
| BR1 | All checkout form fields are mandatory |
| BR2 | Users must be logged in to access checkout |
| BR3 | Cart cannot be empty when proceeding to checkout |
| BR4 | Order confirmation should clear the cart |
| BR5 | Users can cancel checkout at any step and return to cart |

---

## Full Test Execution Matrix

| # | Test Case ID | Title | Business Use Case | Business Rule(s) | Chromium | Firefox | WebKit | Overall |
|---|---|---|---|---|---|---|---|---|
| 1 | `TC-CART-001` | Cart displays single added item with correct name, description, price, and quantity | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 2 | `TC-CART-002` | Cart displays multiple items with correct per-item details | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 3 | `TC-CART-003` | Removing an item from the cart updates the list and badge count | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 4 | `TC-CART-004` | Continue Shopping returns to Products page without altering cart contents | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 5 | `TC-CART-005` | Checkout button from cart navigates to Checkout Information page | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 6 | `TC-CART-006-EmptyCart` | Cart page with zero items shows no line items and no totals | AC1 | BR3 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 7 | `TC-CHECKOUT-INFO-001` | Checkout Information page displays all mandatory fields | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 8 | `TC-CHECKOUT-INFO-002` | Valid First Name, Last Name, and Zip proceeds to Overview page | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 9 | `TC-CHECKOUT-INFO-003-EmptyFirstName` | Leaving First Name empty blocks progression and shows required-field error | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 10 | `TC-CHECKOUT-INFO-004-EmptyLastName` | Leaving Last Name empty blocks progression and shows required-field error | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 11 | `TC-CHECKOUT-INFO-005-EmptyZip` | Leaving Zip/Postal Code empty blocks progression and shows required-field error | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 12 | `TC-CHECKOUT-INFO-006-AllFieldsEmpty` | Submitting a completely blank form shows the First Name error first | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 13 | `TC-CHECKOUT-INFO-007` | Checkout Information page requires an active login session | AC2 | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 14 | `TC-CHECKOUT-INFO-008-EmptyCart` | Reaching Checkout Information with an empty cart does not block the form | AC2 | BR3 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-001)* |
| 15 | `TC-CHECKOUT-OVERVIEW-001` | Overview page shows correct item summary for a single-item cart | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 16 | `TC-CHECKOUT-OVERVIEW-002` | Overview page totals recalculate correctly for a multi-item cart | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 17 | `TC-CHECKOUT-OVERVIEW-003` | Cancel on Overview page returns to Products page (not Cart) | AC3 | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-002)* |
| 18 | `TC-CHECKOUT-OVERVIEW-004-EmptyCart` | Overview page with an empty cart shows zeroed totals and an empty item table | AC3 | BR3 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-001)* |
| 19 | `TC-CHECKOUT-COMPLETE-001` | Clicking Finish completes the order and shows the confirmation page | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 20 | `TC-CHECKOUT-COMPLETE-002` | Order completion clears the cart | AC4 | BR4 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 21 | `TC-CHECKOUT-COMPLETE-003` | Back Home returns to the Products page | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 22 | `TC-CHECKOUT-COMPLETE-004` | Browser Back button after order completion does not restore the purchased cart | AC4 | BR4 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 23 | `TC-CHECKOUT-INFO-009-SpecialCharacters` | Special characters and markup in Name fields are accepted (no format validation) | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-004)* |
| 24 | `TC-CHECKOUT-INFO-010-WhitespaceOnly` | Whitespace-only input in a required field is treated as non-empty (accepted) | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-003)* |
| 25 | `TC-CHECKOUT-INFO-011-LongInput` | Very long input values are accepted in all three fields | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 26 | `TC-CHECKOUT-INFO-012-SingleCharacter` | Minimum boundary — single-character values in each field are accepted | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 27 | `TC-CHECKOUT-INFO-013-ReSubmitAfterError` | Correcting a flagged field and resubmitting clears the error and proceeds | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 28 | `TC-CHECKOUT-NAV-001` | Cancel on Checkout Information returns to the Cart page with cart intact | NAV | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 29 | `TC-CHECKOUT-NAV-002` | End-to-end cancel-and-resume: cancelling at Overview and re-entering checkout preserves cart and requires re-entry of info | NAV | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 30 | `TC-CHECKOUT-NAV-003` | Browser Back button from Checkout Information returns to Cart without data loss | NAV | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 31 | `TC-CHECKOUT-NAV-004` | Browser Back button from Checkout Overview returns to Checkout Information with fields cleared | NAV | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(note: BUG-005)* |
| 32 | `TC-CHECKOUT-NAV-005` | Full guest-to-confirmation happy path in a single continuous run | AC1–AC4 | BR1–BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |

**Totals: 32/32 test cases pass on all 3 browsers = 96/96 executions, 100% success rate, 0 failures, 0 skips.**

---

## Test Coverage by Business Use Case

| Business Use Case | Test Cases | Count | Executions (×3 browsers) | Status |
|---|---|---|---|---|
| AC1 — Cart Review | `TC-CART-001` … `TC-CART-006-EmptyCart` | 6 | 18 | ✅ 18/18 |
| AC2 — Checkout Information Entry | `TC-CHECKOUT-INFO-001` … `TC-CHECKOUT-INFO-008-EmptyCart` | 8 | 24 | ✅ 24/24 |
| AC3 — Order Overview | `TC-CHECKOUT-OVERVIEW-001` … `TC-CHECKOUT-OVERVIEW-004-EmptyCart` | 4 | 12 | ✅ 12/12 |
| AC4 — Order Completion | `TC-CHECKOUT-COMPLETE-001` … `TC-CHECKOUT-COMPLETE-004` | 4 | 12 | ✅ 12/12 |
| AC5 — Error Handling | `TC-CHECKOUT-INFO-009-SpecialCharacters` … `TC-CHECKOUT-INFO-013-ReSubmitAfterError` | 5 | 15 | ✅ 15/15 |
| NAV — Navigation Flow (cross-cutting) | `TC-CHECKOUT-NAV-001` … `TC-CHECKOUT-NAV-005` | 5 | 15 | ✅ 15/15 |
| **Total** | | **32** | **96** | ✅ **96/96** |

## Test Coverage by Business Rule

| Business Rule | Test Cases Exercising It | Result |
|---|---|---|
| BR1 — All checkout fields mandatory | `TC-CHECKOUT-INFO-001…006`, `009…013` (9 cases) | ✅ Passes; format/whitespace gaps logged as BUG-003/BUG-004 |
| BR2 — Login required for checkout | `TC-CHECKOUT-INFO-007` | ✅ Passes as expected |
| BR3 — Cart cannot be empty at checkout | `TC-CART-006-EmptyCart`, `TC-CHECKOUT-INFO-008-EmptyCart`, `TC-CHECKOUT-OVERVIEW-004-EmptyCart` | ✅ Tests pass (they assert actual behavior), but the **rule itself is violated by the app** — logged as BUG-001 |
| BR4 — Order confirmation clears the cart | `TC-CHECKOUT-COMPLETE-002`, `TC-CHECKOUT-COMPLETE-004` | ✅ Passes as expected |
| BR5 — Cancel at any step returns to cart | `TC-CHECKOUT-NAV-001`, `TC-CHECKOUT-NAV-002`, `TC-CHECKOUT-OVERVIEW-003` | ✅ Tests pass (assert actual behavior), but Overview's Cancel goes to Products, not Cart — logged as BUG-002 |

**Note on "✅ Pass" vs. business-rule compliance:** every row above is a passing *automation* result — the assertions match the application's real, observed behavior. Three rows are flagged with a gap reference (BUG-001 through BUG-004) because the *application itself* deviates from the business rule as literally stated in the user story, not because the test failed. See [SCRUM-101-checkout-test-report.md, Section 4](SCRUM-101-checkout-test-report.md#4-defects--behavior-findings-log) for full details on each.

---

## Environment

| Item | Value |
|---|---|
| Test runner | Playwright 1.61.1 |
| Browsers | Chromium (Desktop Chrome), Firefox (Desktop Firefox), WebKit (Desktop Safari) |
| Workers | 1 (sequential) |
| Retries | 0 (local run) |
| Run duration | 20.8 minutes |
| Application URL | https://www.saucedemo.com |
| Test account | `standard_user` / `secret_sauce` |
