# SauceDemo Checkout Process Test Plan (SCRUM-101)

## Application Overview

**Application Under Test:** https://www.saucedemo.com (Swag Labs demo e-commerce app)
**Test Credentials:** standard_user / secret_sauce
**Source Requirement:** user-stories/request-qaaiautomation-20260722-060822.md — SCRUM-101 "E-commerce Checkout Process"

**Scope:** This plan covers the full checkout journey — Cart Review (AC1), Checkout Information Entry (AC2), Order Overview (AC3), Order Completion (AC4), and Error Handling (AC5) — plus cross-cutting negative, boundary, and navigation-flow scenarios, validated against the five stated business rules:
1. All checkout form fields are mandatory.
2. Users must be logged in to access checkout.
3. Cart cannot be empty when proceeding to checkout.
4. Order confirmation should clear the cart.
5. Users can cancel checkout at any step and return to cart.

**Test Case ID Convention:** `TC-<MODULE>-<NNN>` per project convention (CLAUDE.md), grouped into six suites: CART, CHECKOUT, OVERVIEW, COMPLETE, ERROR, NAV.

**Assumptions / starting state:** Unless a test case states otherwise, assume a fresh browser session, user not yet logged in, and an empty cart. Tests are written to be independent and runnable in any order; each test performs its own login/cart-seeding setup.

**Important findings from exploratory testing (live app, verified 2026-07-22) that affect expected results below — flagged inline as "Actual behavior" / "Gap vs AC/Rule" where the live application's real behavior differs from the literal wording of the acceptance criteria or business rules:**
- The Cart page (`cart.html`) does **not** display a subtotal/total price anywhere — no price total is shown until the Order Overview (checkout-step-two) page. This contradicts AC1's "I should see the total price calculation" as written for the cart page.
- Field validation errors are surfaced **one at a time**, in the order First Name → Last Name → Postal Code; the app does not show all missing-field errors simultaneously.
- Field validation only checks for non-empty (presence). It does NOT reject whitespace-only values, special characters, script/SQL-injection-style strings, unicode/emoji, or unusually long strings in First Name/Last Name/Zip — all are silently accepted and the user proceeds to the Overview page. This is a gap vs AC5's expectation of "appropriate validation error messages" for invalid data.
- Cancel on the Checkout Information page (step one) returns the user to the **Cart** page, matching business rule 5.
- Cancel on the Order Overview page (step two) returns the user to the **Products (inventory) page**, NOT the Cart page — a discrepancy vs the literal wording of business rule 5 ("return to cart"), though cart contents remain intact either way.
- Business rule 3 ("cart cannot be empty when proceeding to checkout") is **not enforced**: the Checkout button remains active on an empty cart, and checkout-step-one.html / checkout-step-two.html can be reached directly via URL with zero items in cart.
- The Checkout Information page (step one) can be bypassed entirely: navigating directly to `checkout-step-two.html` with items in the cart renders a full Order Overview without ever requiring First Name/Last Name/Zip to be entered — a gap vs AC2/business rule 1 ("all fields mandatory").
- Business rule 2 (must be logged in) IS enforced server-side: unauthenticated direct access to `/cart.html`, `/checkout-step-one.html`, `/checkout-step-two.html`, or `/checkout-complete.html` redirects to the login page with the message: `Epic sadface: You can only access '<path>' when you are logged in.`
- Business rule 4 (order confirmation clears cart) IS correctly implemented: after Finish, the cart badge disappears and all product tiles revert to "Add to cart".
- Using the browser Back button after order completion returns to a stale Order Overview page showing an empty item list and $0.00 totals, but with an active Finish button; clicking Finish again re-navigates to the Confirmation page despite the cart being empty — a potential defect worth flagging to the dev team.
- The Order Confirmation page also exposes a "Generate PDF order" button not mentioned in the AC, and cart/order data (Payment Info: "SauceCard #31337", Shipping Info: "Free Pony Express Delivery!") is fixed/static across all orders.

These findings are written into the relevant test cases below as the expected (actual) result, with explicit notes where the result diverges from the AC/business-rule wording so failures are self-explanatory and traceable to a specific finding rather than a mis-specified test.

## Test Scenarios

### 1. Cart Review

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CART-001: Cart displays all added items with name, description, and price

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login as standard_user / secret_sauce
    - expect: Redirected to /inventory.html (Products page)
  2. Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to cart from the Products page
    - expect: Cart badge in header shows '2'
    - expect: Each item's button changes from 'Add to cart' to 'Remove'
  3. Navigate to the Cart page (click cart icon)
    - expect: URL is /cart.html
    - expect: Page heading reads 'Your Cart'
    - expect: Both items are listed with their name, full description text, and price ($29.99 and $9.99 respectively)

#### 1.2. TC-CART-002: Cart shows correct quantity per line item

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login and add one item to the cart, then open the Cart page
    - expect: QTY column shows '1' for the added item

#### 1.3. TC-CART-003: 'Continue Shopping' button returns to Products page

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login, add an item to cart, open Cart page, click 'Continue Shopping'
    - expect: Redirected to /inventory.html
    - expect: Cart badge count is preserved (item still in cart)

#### 1.4. TC-CART-004: 'Checkout' button navigates to Checkout Information page

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login, add an item to cart, open Cart page, click 'Checkout'
    - expect: Redirected to /checkout-step-one.html
    - expect: Page heading reads 'Checkout: Your Information'

#### 1.5. TC-CART-005: Removing an item from the cart updates the list and badge count

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login and add two different items to cart, open Cart page
    - expect: Cart badge shows '2', both items listed
  2. Click 'Remove' on one of the line items
    - expect: That item disappears from the cart list immediately
    - expect: Cart badge updates to '1'

#### 1.6. TC-CART-006-EmptyCart: Cart page renders correctly with zero items

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login with a fresh session (no items ever added), navigate directly to /cart.html
    - expect: Page loads without error, heading 'Your Cart' is shown
    - expect: No line items and no cart badge count are displayed
    - expect: 'Continue Shopping' and 'Checkout' buttons are both still visible and enabled

#### 1.7. TC-CART-007: Cart persists across navigation to a product detail page and back

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login, add an item to cart, click into a product's detail page, then navigate back to the Cart page
    - expect: The previously added item is still present in the cart with correct price

#### 1.8. TC-CART-008: Cart contents persist after a full page refresh

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login, add two items to cart, open Cart page, refresh the browser
    - expect: Both items remain listed after reload
    - expect: Cart badge count is unchanged

#### 1.9. TC-CART-009-AllProducts: Adding all six catalog products displays each correctly in cart

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login and click 'Add to cart' for all six products on the Products page
    - expect: Cart badge shows '6'
  2. Open the Cart page
    - expect: All six products are listed, each with correct name, description, and price, and no items are missing or duplicated

#### 1.10. TC-CART-010: Cart item name is a clickable link to its Product Detail page

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login, add an item to cart, open Cart page, click the item's name link
    - expect: Navigates to that product's detail page showing the same product name and price

#### 1.11. TC-CART-011-NoTotalOnCartPage: Cart page does not display a subtotal/total price (AC1 discrepancy)

**File:** `tests/cart-review/cart-review.spec.ts`

**Steps:**
  1. Login, add two items with known prices to the cart, open the Cart page
    - expect: No subtotal, tax, or total price element is rendered anywhere on the Cart page — actual app behavior differs from AC1's stated expectation that cart review includes 'the total price calculation'; the total first appears later on the Order Overview page

### 2. Checkout Information Entry

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CHECKOUT-001: Checkout button redirects to Checkout Information page with required fields

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Login, add an item to cart, go to Cart page, click 'Checkout'
    - expect: Redirected to /checkout-step-one.html
    - expect: Fields for First Name, Last Name, and Zip/Postal Code are visible
    - expect: 'Cancel' and 'Continue' buttons are visible

#### 2.2. TC-CHECKOUT-002: Valid data in all fields and Continue proceeds to Overview page

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. On Checkout Information page, enter First Name='Jane', Last Name='Smith', Zip='12345', click Continue
    - expect: Redirected to /checkout-step-two.html
    - expect: Page heading reads 'Checkout: Overview'

#### 2.3. TC-CHECKOUT-003-EmptyFirstName: Error shown when First Name is empty

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. On Checkout Information page, leave all fields empty, click Continue
    - expect: Page remains on /checkout-step-one.html
    - expect: Error banner reads 'Error: First Name is required'
    - expect: First Name field is visually flagged with an error indicator

#### 2.4. TC-CHECKOUT-004-EmptyLastName: Error shown when Last Name is empty

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Enter First Name='John' only, leave Last Name and Zip empty, click Continue
    - expect: Error banner reads 'Error: Last Name is required'
    - expect: Page remains on /checkout-step-one.html

#### 2.5. TC-CHECKOUT-005-EmptyZip: Error shown when Postal Code is empty

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Enter First Name='John', Last Name='Doe', leave Zip empty, click Continue
    - expect: Error banner reads 'Error: Postal Code is required'
    - expect: Page remains on /checkout-step-one.html

#### 2.6. TC-CHECKOUT-006-AllFieldsEmpty: Only the first missing-field error is shown when all fields are empty

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. With all three fields empty, click Continue
    - expect: Only the First Name required error is displayed (not a combined list of all three errors) — confirms sequential single-error validation behavior

#### 2.7. TC-CHECKOUT-007: Error banner dismiss (X) control clears the message

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Trigger the First Name required error, then click the 'X' dismiss icon on the error banner
    - expect: Error banner is removed from the page
    - expect: Form fields remain empty/unchanged

#### 2.8. TC-CHECKOUT-008: Invalid field is visually highlighted with an error icon

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Click Continue with all fields empty
    - expect: First Name, Last Name, and Zip input containers each display a red error icon/outline, not only a text banner

#### 2.9. TC-CHECKOUT-009-WhitespaceOnly: Whitespace-only values are accepted (validation gap)

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Enter three spaces ('   ') into First Name, Last Name, and Zip, then click Continue
    - expect: Actual behavior: no validation error is raised and the app proceeds to /checkout-step-two.html — this is a gap vs the intent of 'mandatory fields', since whitespace is not trimmed/rejected

#### 2.10. TC-CHECKOUT-010-SpecialCharacters: Special characters in Zip are accepted (AC5 gap)

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Enter First Name='John', Last Name='Doe', Zip='!@#$%', click Continue
    - expect: Actual behavior: no format-validation error is shown; the app proceeds to the Overview page — this contradicts AC5's expectation of a validation error for special characters/invalid data

#### 2.11. TC-CHECKOUT-011-LongInput: Very long input string in First Name is accepted

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Enter a 250+ character string into First Name, valid Last Name and Zip, click Continue
    - expect: No client-side max-length error occurs; the app proceeds to the Overview page without truncation errors or a crash (note actual rendering behavior of the long value, if any, on the Overview page)

#### 2.12. TC-CHECKOUT-012-NumericAndAlphaZip: Zip field accepts both numeric and alphanumeric postal codes

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Complete checkout info with Zip='12345' (numeric) and Continue
    - expect: Proceeds to Overview page successfully
  2. Repeat with Zip='A1B 2C3' (alphanumeric, Canadian-style)
    - expect: Proceeds to Overview page successfully with no format error, confirming no country-specific postal format validation exists

#### 2.13. TC-CHECKOUT-013: Cancel button on Checkout Information page returns to Cart with items intact

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. From Checkout Information page (reached with 2 items in cart), click 'Cancel'
    - expect: Redirected to /cart.html
    - expect: Both cart items are still listed (cart not cleared)

#### 2.14. TC-CHECKOUT-014: Cart badge count persists on the Checkout Information page header

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Add 2 items to cart and proceed to Checkout Information page
    - expect: Header cart icon shows badge count '2' on this page as well

#### 2.15. TC-CHECKOUT-015-DirectURLWithItems: Direct URL navigation to checkout-step-one.html works when logged in with items in cart

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Login, add an item to cart, then navigate directly to https://www.saucedemo.com/checkout-step-one.html via the address bar
    - expect: Page loads normally showing the Checkout Information form (no redirect/error), since the user is authenticated

#### 2.16. TC-CHECKOUT-016-EmptyCartAccess: Checkout Information page is reachable even with an empty cart (business rule 3 gap)

**File:** `tests/checkout-information/checkout-information.spec.ts`

**Steps:**
  1. Login with an empty cart, navigate directly to /checkout-step-one.html
    - expect: Actual behavior: the page loads normally with the form fields available and no 'cart is empty' block/redirect — this contradicts business rule 3 ('cart cannot be empty when proceeding to checkout')

### 3. Order Overview

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-OVERVIEW-001: Overview page lists all cart items with qty, name, description, price

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Login, add 2 items to cart, complete Checkout Information with valid data, arrive at Overview page
    - expect: Both items are listed with correct QTY (1 each), name, description text, and price, matching what was shown on the Cart page

#### 3.2. TC-OVERVIEW-002: Payment Information section is displayed

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Reach the Overview page with valid checkout info
    - expect: 'Payment Information:' section is shown with value 'SauceCard #31337'

#### 3.3. TC-OVERVIEW-003: Shipping Information section is displayed

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Reach the Overview page with valid checkout info
    - expect: 'Shipping Information:' section is shown with value 'Free Pony Express Delivery!'

#### 3.4. TC-OVERVIEW-004: Item Total equals the sum of individual item prices

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to cart, proceed to Overview
    - expect: 'Item total: $39.98' is displayed, matching the sum of the two item prices

#### 3.5. TC-OVERVIEW-005: Tax and Total amounts are displayed and Total = Item Total + Tax

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. With Item total of $39.98 on the Overview page, read the Tax and Total lines
    - expect: A 'Tax:' line and a 'Total:' line are both present
    - expect: Total value equals Item total + Tax value (e.g. $39.98 + $3.20 = $43.18) within expected rounding

#### 3.6. TC-OVERVIEW-006: Cancel and Finish buttons are both present and enabled

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Reach the Overview page
    - expect: 'Cancel' button is visible and enabled
    - expect: 'Finish' button is visible and enabled

#### 3.7. TC-OVERVIEW-007: Cancel button on Overview redirects to Products page (actual behavior)

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. From the Overview page (with items in cart), click 'Cancel'
    - expect: Actual behavior: redirected to /inventory.html (Products page), NOT back to /cart.html — a discrepancy vs the literal wording of business rule 5 ('return to cart'); cart contents remain intact (badge count unchanged)

#### 3.8. TC-OVERVIEW-008: Finish button navigates to the Order Confirmation page

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. From the Overview page, click 'Finish'
    - expect: Redirected to /checkout-complete.html
    - expect: Page heading reads 'Checkout: Complete!'

#### 3.9. TC-OVERVIEW-009-MultipleItems: Totals recalculate correctly with 3+ differently priced items

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Add 'Sauce Labs Backpack' ($29.99), 'Sauce Labs Fleece Jacket' ($49.99), and 'Sauce Labs Onesie' ($7.99) to cart, proceed to Overview
    - expect: Item total equals $87.97
    - expect: Tax and Total are recalculated to reflect this new item total, with Total = Item total + Tax

#### 3.10. TC-OVERVIEW-010-SingleItem: Totals are correct with exactly one item in cart

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Add only 'Sauce Labs Onesie' ($7.99) to cart, proceed to Overview
    - expect: Item total: $7.99
    - expect: Total = $7.99 + displayed Tax value

#### 3.11. TC-OVERVIEW-011-SkipInformationPage: Overview page is directly reachable, bypassing Checkout Information entirely

**File:** `tests/order-overview/order-overview.spec.ts`

**Steps:**
  1. Login, add an item to cart, then navigate directly to /checkout-step-two.html without ever visiting /checkout-step-one.html
    - expect: Actual behavior: the full Order Overview page renders normally with item list, payment/shipping info, and correct totals — First Name/Last Name/Zip were never required, which is a gap vs AC2/business rule 1 ('all checkout form fields are mandatory')

### 4. Order Completion

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-COMPLETE-001: Finish displays the order confirmation success message

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. Complete the full checkout flow (cart -> info -> overview -> Finish)
    - expect: Redirected to /checkout-complete.html
    - expect: Heading 'Thank you for your order!' is displayed
    - expect: Descriptive text 'Your order has been dispatched, and will arrive just as fast as the pony can get there!' is displayed

#### 4.2. TC-COMPLETE-002: Pony Express confirmation image is displayed

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. Reach the Order Confirmation page
    - expect: A 'Pony Express' image/icon is visible above the thank-you message

#### 4.3. TC-COMPLETE-003: 'Back Home' button is present and navigates to the Products page

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. On the Order Confirmation page, click 'Back Home'
    - expect: Redirected to /inventory.html
    - expect: Page heading reads 'Products'

#### 4.4. TC-COMPLETE-004: Cart is cleared immediately after order completion (business rule 4)

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. Complete checkout for 2 items and reach the Order Confirmation page
    - expect: The header cart badge/count is no longer displayed on the confirmation page
  2. Click 'Back Home' to return to the Products page
    - expect: Every product tile shows 'Add to cart' (not 'Remove'), confirming the cart was fully cleared

#### 4.5. TC-COMPLETE-005: Cart remains empty after returning to Products page post-completion

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. After completing an order and clicking Back Home, navigate to /cart.html directly
    - expect: Cart page shows zero line items and no total, confirming persistence of the cleared state

#### 4.6. TC-COMPLETE-006: 'Generate PDF order' button is present on the confirmation page

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. Reach the Order Confirmation page
    - expect: A 'Generate PDF order' button is visible alongside 'Back Home' (an extra UI element not mentioned in AC4, worth confirming with product owner if intentional)

#### 4.7. TC-COMPLETE-007-RefreshConfirmation: Refreshing the confirmation page preserves the completion state

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. On the Order Confirmation page, refresh the browser
    - expect: The 'Thank you for your order!' message and Back Home button still render correctly
    - expect: Cart remains empty (no badge reappears)

#### 4.8. TC-COMPLETE-008: Header shows no cart badge on the confirmation page

**File:** `tests/order-completion/order-completion.spec.ts`

**Steps:**
  1. Reach the Order Confirmation page after checking out with items
    - expect: No numeric badge is rendered on the cart icon in the header

### 5. Error Handling / Boundary

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-ERROR-001-UnauthCart: Unauthenticated direct access to Cart page is blocked

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. Without logging in (or after logging out), navigate directly to https://www.saucedemo.com/cart.html
    - expect: Redirected to the login page (/)
    - expect: Error banner reads: "Epic sadface: You can only access '/cart.html' when you are logged in."

#### 5.2. TC-ERROR-002-UnauthCheckoutInfo: Unauthenticated direct access to Checkout Information page is blocked

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. While logged out, navigate directly to /checkout-step-one.html
    - expect: Redirected to login page with error: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 5.3. TC-ERROR-003-UnauthOverview: Unauthenticated direct access to Order Overview page is blocked

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. While logged out, navigate directly to /checkout-step-two.html
    - expect: Redirected to login page with a corresponding 'you are logged in' required error naming '/checkout-step-two.html'

#### 5.4. TC-ERROR-004-UnauthComplete: Unauthenticated direct access to Order Confirmation page is blocked

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. While logged out, navigate directly to /checkout-complete.html
    - expect: Redirected to login page with a corresponding 'you are logged in' required error naming '/checkout-complete.html'

#### 5.5. TC-ERROR-005-InvalidLogin: Invalid login credentials block all checkout access

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. On the login page, enter an invalid username/password combination and submit
    - expect: Login fails with an error message and the user remains on the login page
  2. Attempt to navigate directly to /checkout-step-one.html afterward
    - expect: Still blocked and redirected to login (user was never authenticated)

#### 5.6. TC-ERROR-006-SequentialValidation: Field validation errors surface one at a time in a fixed order

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. On Checkout Information page with all fields empty, click Continue
    - expect: 'First Name is required' error shown
  2. Fill First Name only, click Continue again
    - expect: 'Last Name is required' error shown (First Name error no longer present)
  3. Fill Last Name, click Continue again
    - expect: 'Postal Code is required' error shown, confirming the fixed First Name -> Last Name -> Zip validation order

#### 5.7. TC-ERROR-007-EmptyCartCheckoutButtonEnabled: Checkout button remains active on an empty cart (business rule 3 gap)

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. Login with an empty cart and open the Cart page
    - expect: 'Checkout' button is rendered and clickable even though there are zero items — clicking it proceeds to /checkout-step-one.html rather than being blocked, contradicting business rule 3

#### 5.8. TC-ERROR-008-ScriptInjection: Script-tag input is rendered as literal text, not executed

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. On Checkout Information page, enter '<script>alert(1)</script>' as First Name, valid Last Name and Zip, click Continue
    - expect: No JavaScript alert/dialog is triggered
    - expect: The app proceeds normally (or shows a standard required-field error only if another field is empty) with the string treated as inert text, confirming no XSS execution

#### 5.9. TC-ERROR-009-SQLInjection: SQL-injection-style input is treated as literal text

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. Enter Zip = "' OR '1'='1" with valid First/Last Name, click Continue
    - expect: No error, crash, or unexpected behavior occurs; the app proceeds to the Overview page treating the value as an ordinary string

#### 5.10. TC-ERROR-010-UnicodeEmoji: Unicode/emoji characters in Last Name are accepted without crashing

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. Enter an emoji/unicode string (e.g. 'Smîth 😀') as Last Name, valid First Name and Zip, click Continue
    - expect: No client error occurs; the app proceeds to the Overview page without garbling or crashing

#### 5.11. TC-ERROR-011-FixOneFieldAtATime: Correcting fields one at a time surfaces the correct next error with no stale message

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. Trigger the First Name required error, then fill in First Name and Last Name (leaving Zip empty), click Continue
    - expect: Only the 'Postal Code is required' error is now shown
    - expect: The earlier First Name/Last Name error text is no longer present anywhere on the page

#### 5.12. TC-ERROR-012-RefreshMidEntry: Refreshing the Checkout Information page mid-entry clears typed values

**File:** `tests/error-handling/error-handling.spec.ts`

**Steps:**
  1. On the Checkout Information page, type values into First Name and Last Name but do not submit, then refresh the browser
    - expect: After reload, all three fields are empty again — confirms unsaved form input is not persisted client-side

### 6. Navigation Flow / Cross-Cutting

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-NAV-001-HappyPathE2E: Full end-to-end checkout smoke path

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Login as standard_user/secret_sauce
    - expect: Redirected to /inventory.html
  2. Add 'Sauce Labs Backpack' to cart and open the Cart page
    - expect: Item is listed on /cart.html
  3. Click Checkout, fill First Name/Last Name/Zip with valid data, click Continue
    - expect: Overview page (/checkout-step-two.html) shows the item, payment/shipping info, and totals
  4. Click Finish
    - expect: Confirmation page (/checkout-complete.html) shows 'Thank you for your order!'
  5. Click 'Back Home'
    - expect: Returned to /inventory.html with an empty cart (all buttons read 'Add to cart')

#### 6.2. TC-NAV-002-CancelFromInfoToCart: Cancel on Checkout Information returns to Cart with items intact

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Add 2 items to cart, proceed to Checkout Information, click Cancel
    - expect: Redirected to /cart.html
    - expect: Both items remain listed (cart not cleared) — matches business rule 5

#### 6.3. TC-NAV-003-CancelFromOverviewToProducts: Cancel on Overview returns to Products page, cart intact

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Add items to cart, complete Checkout Information, reach Overview, click Cancel
    - expect: Redirected to /inventory.html (Products), not /cart.html — the actual redirect target for business rule 5 at this step
  2. Open the Cart page afterward
    - expect: The cart items added earlier are still present, confirming cart data was preserved despite the different redirect target

#### 6.4. TC-NAV-004-BrowserBackAfterCompletion: Browser Back after order completion shows a stale, empty Overview page

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Complete a full checkout to reach the Order Confirmation page
    - expect: Confirmation page is shown
  2. Press the browser Back button
    - expect: Actual behavior: browser navigates to /checkout-step-two.html again, but it now shows an empty item list with 'Item total: $0', 'Tax: $0.00', 'Total: $0.00' (since the cart was already cleared) while the Finish button remains active — flag to dev team as a potential UX defect

#### 6.5. TC-NAV-005-ReFinishStaleOverview: Clicking Finish again from the stale post-completion Overview page still submits

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. From the stale, empty Overview page reached via Back after a completed order (see TC-NAV-004), click 'Finish' again
    - expect: Actual behavior: the app navigates to /checkout-complete.html and shows the thank-you message again, despite the cart/order being empty — indicates the app does not guard against re-submitting a stale/completed order

#### 6.6. TC-NAV-006-BrowserBackFromCheckoutInfo: Browser Back from Checkout Information returns to Cart page

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Add an item to cart, navigate Cart -> Checkout Information, then press the browser Back button
    - expect: Browser returns to /cart.html with the item still listed

#### 6.7. TC-NAV-007-DirectSkipToOverview: User can skip the mandatory Checkout Information step via direct URL

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Login, add an item to cart, and navigate directly to /checkout-step-two.html (skipping /checkout-step-one.html entirely)
    - expect: Actual behavior: the Overview page renders fully with correct item/price/tax/total data, and clicking Finish successfully completes the order — confirming First Name/Last Name/Zip entry can be bypassed altogether, a gap vs business rule 1

#### 6.8. TC-NAV-008-LogoutMidCheckout: Logging out mid-checkout redirects to Login and blocks further checkout access

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Login, add an item to cart, reach the Checkout Information page, then open the side menu and click 'Logout'
    - expect: Redirected to the login page (/)
  2. Attempt to navigate back to /checkout-step-one.html directly
    - expect: Blocked with the 'Epic sadface: you can only access ... when logged in' message, confirming the session was fully terminated

#### 6.9. TC-NAV-009-RefreshOverviewPage: Refreshing the Overview page (before completion) preserves order summary data

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Add an item to cart, complete Checkout Information, reach the Overview page, then refresh the browser
    - expect: The same item, payment/shipping info, and item total/tax/total values are displayed after reload — no data loss occurs since the order has not yet been finished

#### 6.10. TC-NAV-010-ResetAppState: 'Reset App State' menu option clears the cart

**File:** `tests/navigation-flow/navigation-flow.spec.ts`

**Steps:**
  1. Login and add 2 items to cart, then open the side menu and click 'Reset App State'
    - expect: Cart badge disappears from the header
  2. Open the Cart page
    - expect: Cart is empty, confirming 'Reset App State' clears cart contents
