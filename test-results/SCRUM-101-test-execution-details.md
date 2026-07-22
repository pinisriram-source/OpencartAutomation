# Test Execution Details — SCRUM-101: E-commerce Checkout Process

**Application Under Test:** SauceDemo (https://www.saucedemo.com)
**Report Date:** 2026-07-22
**Automation Suite:** [tests/saucedemo-checkout/](../tests/saucedemo-checkout/)
**Companion Summary Report:** [SCRUM-101-checkout-test-report.md](SCRUM-101-checkout-test-report.md) / [.html](SCRUM-101-checkout-test-report.html)

This document lists **every one of the 68 automated test cases individually**, with per-browser pass/fail status and the specific business use case (Acceptance Criteria) and Business Rule each one validates. It supplements the summary report, which aggregates by suite rather than by individual test.

Run command: `npx playwright test tests/saucedemo-checkout --project=chromium --project=firefox --project=webkit --reporter=list`
Total: **204/204 executions passed** (68 test cases × 3 browsers), 0 failed, 0 skipped, 30.8 minutes.

---

## Business Use Case Legend

| Code | Business Use Case (from user story SCRUM-101) |
|---|---|
| AC1 | Cart Review — user reviews cart contents and totals before checkout |
| AC2 | Checkout Information Entry — user provides shipping/contact info |
| AC3 | Order Overview — user reviews order summary, payment/shipping, and totals before confirming |
| AC4 | Order Completion — user confirms the order and receives confirmation |
| AC5 | Error Handling — invalid/incomplete input is rejected with clear feedback |
| NAV | Navigation Flow — cancel/back-button behavior and cross-cutting session/state handling |

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
| 1 | `TC-CART-001` | Cart displays all added items with name, description, and price | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 2 | `TC-CART-002` | Cart shows correct quantity per line item | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 3 | `TC-CART-003` | \ | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 4 | `TC-CART-004` | \ | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 5 | `TC-CART-005` | Removing an item from the cart updates the list and badge count | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 6 | `TC-CART-006-EmptyCart` | Cart page renders correctly with zero items | AC1 | BR3 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-002)* |
| 7 | `TC-CART-007` | Cart persists across navigation to a product detail page and back | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 8 | `TC-CART-008` | Cart contents persist after a full page refresh | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 9 | `TC-CART-009-AllProducts` | Adding all six catalog products displays each correctly in cart | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 10 | `TC-CART-010` | Cart item name is a clickable link to its Product Detail page | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 11 | `TC-CART-011-NoTotalOnCartPage` | Cart page does not display a subtotal/total price (AC1 discrepancy) | AC1 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-001)* |
| 12 | `TC-CHECKOUT-001` | Checkout button redirects to Checkout Information page with required fields | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 13 | `TC-CHECKOUT-002` | Valid data in all fields and Continue proceeds to Overview page | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 14 | `TC-CHECKOUT-003-EmptyFirstName` | Error shown when First Name is empty | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 15 | `TC-CHECKOUT-004-EmptyLastName` | Error shown when Last Name is empty | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 16 | `TC-CHECKOUT-005-EmptyZip` | Error shown when Postal Code is empty | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 17 | `TC-CHECKOUT-006-AllFieldsEmpty` | Only the first missing-field error is shown when all fields are empty | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 18 | `TC-CHECKOUT-007` | Error banner dismiss (X) control clears the message | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 19 | `TC-CHECKOUT-008` | Invalid field is visually highlighted with an error icon | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 20 | `TC-CHECKOUT-009-WhitespaceOnly` | Whitespace-only values are accepted (validation gap) | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-004)* |
| 21 | `TC-CHECKOUT-010-SpecialCharacters` | Special characters in Zip are accepted (AC5 gap) | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-004)* |
| 22 | `TC-CHECKOUT-011-LongInput` | Very long input string in First Name is accepted | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-004)* |
| 23 | `TC-CHECKOUT-012-NumericAndAlphaZip` | Zip field accepts both numeric and alphanumeric postal codes | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 24 | `TC-CHECKOUT-013` | Cancel button on Checkout Information page returns to Cart with items intact | AC2 | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 25 | `TC-CHECKOUT-014` | Cart badge count persists on the Checkout Information page header | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 26 | `TC-CHECKOUT-015-DirectURLWithItems` | Direct URL navigation to checkout-step-one.html works when logged in with items in cart | AC2 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 27 | `TC-CHECKOUT-016-EmptyCartAccess` | Checkout Information page is reachable even with an empty cart (business rule 3 gap) | AC2 | BR3 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-002)* |
| 28 | `TC-OVERVIEW-001` | Overview page lists all cart items with qty, name, description, price | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 29 | `TC-OVERVIEW-002` | Payment Information section is displayed | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 30 | `TC-OVERVIEW-003` | Shipping Information section is displayed | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 31 | `TC-OVERVIEW-004` | Item Total equals the sum of individual item prices | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 32 | `TC-OVERVIEW-005` | Tax and Total amounts are displayed and Total = Item Total + Tax | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 33 | `TC-OVERVIEW-006` | Cancel and Finish buttons are both present and enabled | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 34 | `TC-OVERVIEW-007` | Cancel button on Overview redirects to Products page (actual behavior) | AC3 | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-005)* |
| 35 | `TC-OVERVIEW-008` | Finish button navigates to the Order Confirmation page | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 36 | `TC-OVERVIEW-009-MultipleItems` | Totals recalculate correctly with 3+ differently priced items | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 37 | `TC-OVERVIEW-010-SingleItem` | Totals are correct with exactly one item in cart | AC3 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 38 | `TC-OVERVIEW-011-SkipInformationPage` | Overview page is directly reachable, bypassing Checkout Information entirely | AC3 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-003)* |
| 39 | `TC-COMPLETE-001` | Finish displays the order confirmation success message | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 40 | `TC-COMPLETE-002` | Pony Express confirmation image is displayed | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 41 | `TC-COMPLETE-003` | \ | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 42 | `TC-COMPLETE-004` | Cart is cleared immediately after order completion (business rule 4) | AC4 | BR4 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 43 | `TC-COMPLETE-005` | Cart remains empty after returning to Products page post-completion | AC4 | BR4 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 44 | `TC-COMPLETE-006` | \ | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-007)* |
| 45 | `TC-COMPLETE-007-RefreshConfirmation` | Refreshing the confirmation page preserves the completion state | AC4 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 46 | `TC-COMPLETE-008` | Header shows no cart badge on the confirmation page | AC4 | BR4 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 47 | `TC-ERROR-001-UnauthCart` | Unauthenticated direct access to Cart page is blocked | AC5 | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 48 | `TC-ERROR-002-UnauthCheckoutInfo` | Unauthenticated direct access to Checkout Information page is blocked | AC5 | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 49 | `TC-ERROR-003-UnauthOverview` | Unauthenticated direct access to Order Overview page is blocked | AC5 | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 50 | `TC-ERROR-004-UnauthComplete` | Unauthenticated direct access to Order Confirmation page is blocked | AC5 | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 51 | `TC-ERROR-005-InvalidLogin` | Invalid login credentials block all checkout access | AC5 | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 52 | `TC-ERROR-006-SequentialValidation` | Field validation errors surface one at a time in a fixed order | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 53 | `TC-ERROR-007-EmptyCartCheckoutButtonEnabled` | Checkout button remains active on an empty cart (business rule 3 gap) | AC5 | BR3 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-002)* |
| 54 | `TC-ERROR-008-ScriptInjection` | Script-tag input is rendered as literal text, not executed | AC5 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 55 | `TC-ERROR-009-SQLInjection` | SQL-injection-style input is treated as literal text | AC5 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 56 | `TC-ERROR-010-UnicodeEmoji` | Unicode/emoji characters in Last Name are accepted without crashing | AC5 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 57 | `TC-ERROR-011-FixOneFieldAtATime` | Correcting fields one at a time surfaces the correct next error with no stale message | AC5 | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 58 | `TC-ERROR-012-RefreshMidEntry` | Refreshing the Checkout Information page mid-entry clears typed values | AC5 | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 59 | `TC-NAV-001-HappyPathE2E` | Full end-to-end checkout smoke path | NAV | BR1-BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 60 | `TC-NAV-002-CancelFromInfoToCart` | Cancel on Checkout Information returns to Cart with items intact | NAV | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 61 | `TC-NAV-003-CancelFromOverviewToProducts` | Cancel on Overview returns to Products page, cart intact | NAV | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-005)* |
| 62 | `TC-NAV-004-BrowserBackAfterCompletion` | Browser Back after order completion shows a stale, empty Overview page | NAV | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-006)* |
| 63 | `TC-NAV-005-ReFinishStaleOverview` | Clicking Finish again from the stale post-completion Overview page still submits | NAV | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-006)* |
| 64 | `TC-NAV-006-BrowserBackFromCheckoutInfo` | Browser Back from Checkout Information returns to Cart page | NAV | BR5 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 65 | `TC-NAV-007-DirectSkipToOverview` | User can skip the mandatory Checkout Information step via direct URL | NAV | BR1 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** *(gap: BUG-003)* |
| 66 | `TC-NAV-008-LogoutMidCheckout` | Logging out mid-checkout redirects to Login and blocks further checkout access | NAV | BR2 | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 67 | `TC-NAV-009-RefreshOverviewPage` | Refreshing the Overview page (before completion) preserves order summary data | NAV | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
| 68 | `TC-NAV-010-ResetAppState` | \ | NAV | — | ✅ Pass | ✅ Pass | ✅ Pass | ✅ **PASS** |
