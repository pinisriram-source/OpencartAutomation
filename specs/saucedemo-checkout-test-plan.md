# SauceDemo E-Commerce Checkout Process Test Plan (SCRUM-101)

## Application Overview

## Application Under Test
SauceDemo (https://www.saucedemo.com) — a demo e-commerce storefront ("Swag Labs") used for QA training/automation practice. This plan covers the end-to-end checkout workflow for user story SCRUM-101: Cart Review -> Checkout Information -> Checkout Overview -> Order Completion.

Test credentials: username `standard_user`, password `secret_sauce` (same password applies to all accepted usernames: standard_user, locked_out_user, problem_user, performance_glitch_user, error_user, visual_user).

## Workflow Verified via Live Exploration (2026-07-21)
1. **Login** (`/`) — standard_user / secret_sauce logs in and lands on `/inventory.html`.
2. **Inventory / Products page** (`/inventory.html`) — 6 products, each with name, description, price, and an "Add to cart" button that toggles to "Remove" once added. A cart badge showing item count appears next to the cart icon in the header once 1+ items are added; the badge is absent when the cart is empty.
3. **Cart page** (`/cart.html`, "Your Cart") — lists each line item with QTY, product name (link), description, price, and a "Remove" button per line. No cart-level subtotal/total is shown on this page (totals first appear on the Overview page). Footer actions: "Continue Shopping" (returns to `/inventory.html`) and "Checkout" (proceeds to `/checkout-step-one.html`).
4. **Checkout Step One — Your Information** (`/checkout-step-one.html`) — First Name, Last Name, and Zip/Postal Code text fields (plain text inputs; no format/pattern enforcement observed — special characters, letters in the zip field, and HTML/script-like content are all accepted without a validation error as long as the field is non-empty). "Cancel" returns to `/cart.html`. "Continue" validates only for field presence, one error at a time, in field order: empty First Name shows "Error: First Name is required"; with First Name filled, empty Last Name shows "Error: Last Name is required"; with both filled, empty Zip/Postal Code shows "Error: Postal Code is required". The error banner has a red heading with an "x" dismiss icon, and the offending field(s) get a red input outline/icon.
5. **Checkout Step Two — Overview** (`/checkout-step-two.html`) — Shows QTY/Description table of cart items (name, description, price per line, no per-line total needed since qty is fixed at 1 per line in this app), "Payment Information: SauceCard #31337", "Shipping Information: Free Pony Express Delivery!", and a "Price Total" block with "Item total", "Tax", and "Total" (Total = Item total + Tax). Verified math: 1 item ($29.99) → Item total $29.99, Tax $2.40, Total $32.39; 2 items ($29.99 + $9.99 = $39.98) → Item total $39.98, Tax $3.20, Total $43.18 (tax computed at 8%, rounded to 2 decimals). "Cancel" returns to `/inventory.html` (NOT the cart — different from Step One's Cancel target). "Finish" completes the order.
6. **Checkout Complete** (`/checkout-complete.html`) — Shows a "Checkout: Complete!" header, pony image, "Thank you for your order!" heading, a dispatch message, a "Back Home" button (returns to `/inventory.html`), and a "Generate PDF order" button. The cart is emptied on order completion — the header cart badge disappears and cart/overview pages show 0 items/$0 totals afterward, including when reached via browser Back navigation after completion.

## Additional Behaviors Confirmed
- **Login required for checkout**: navigating directly to `/checkout-step-one.html` without an authenticated session redirects to the login page (`/`) and displays "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
- **Empty cart is NOT blocked by the UI**: navigating directly to `/checkout-step-one.html` with 0 items in the cart still renders the information form, and completing it advances to `/checkout-step-two.html` showing an empty item table with "Item total: $0", "Tax: $0.00", "Total: $0.00", and an enabled "Finish" button. This contradicts the stated business rule "Cart cannot be empty when proceeding to checkout" — treat as a rule to verify/flag as a defect if strict blocking is required by SCRUM-101.
- **No client-side format validation**: First/Last Name accept special characters, punctuation, and injected markup (e.g. `<script>...</script>`) without error and without executing as script (renders as inert text server-side/DOM-escaped); Zip/Postal Code accepts non-numeric characters. Only presence (non-empty) is validated.
- Cart quantity per product line is fixed at 1 in this app (no in-cart quantity stepper); "Remove" is the only per-line action in the cart.

## Test Scenarios

### 1. AC1 - Cart Review

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CART-001: Cart displays single added item with correct name, description, price, and quantity

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Test Case ID: TC-CART-001 | Module: Cart | Priority: Critical | Type: Functional / Smoke | Preconditions: User is logged in as standard_user; cart is empty. Test Data: Product = 'Sauce Labs Backpack' ($29.99). Traceability: AC1, Key Workflow #1
  2. 1. Login at https://www.saucedemo.com with standard_user / secret_sauce
    - expect: User is redirected to /inventory.html and the Products grid is visible
  3. 2. Click 'Add to cart' on 'Sauce Labs Backpack'
    - expect: Button label changes to 'Remove'
    - expect: Header cart badge shows '1'
  4. 3. Click the cart icon to open /cart.html
    - expect: Page title 'Your Cart' is displayed
  5. 4. Inspect the single line item row
    - expect: QTY column shows '1'
    - expect: Product name 'Sauce Labs Backpack' is shown as a link
    - expect: Full product description text matches the inventory page description
    - expect: Price shown is '$29.99'
    - expect: A 'Remove' button is present on the line item
  6. 5. Verify page-level controls
    - expect: 'Continue Shopping' button is visible and enabled
    - expect: 'Checkout' button is visible and enabled

#### 1.2. TC-CART-002: Cart displays multiple items with correct per-item details

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Test Case ID: TC-CART-002 | Module: Cart | Priority: High | Type: Functional | Preconditions: User logged in; cart empty. Test Data: 'Sauce Labs Backpack' ($29.99), 'Sauce Labs Bike Light' ($9.99). Traceability: AC1
  2. 1. Login as standard_user and on /inventory.html click 'Add to cart' for 'Sauce Labs Backpack' then for 'Sauce Labs Bike Light'
    - expect: Header cart badge shows '2'
    - expect: Both buttons now read 'Remove'
  3. 2. Navigate to /cart.html
    - expect: Two line items are listed, one per added product
  4. 3. Verify each row independently
    - expect: Row 1: QTY '1', name 'Sauce Labs Backpack', description present, price '$29.99', 'Remove' button
    - expect: Row 2: QTY '1', name 'Sauce Labs Bike Light', description present, price '$9.99', 'Remove' button
  5. 4. Verify item order and no cross-contamination of data between rows
    - expect: Each row's name, description, and price correspond correctly to the product that was added (no mismatches)

#### 1.3. TC-CART-003: Removing an item from the cart updates the list and badge count

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Test Case ID: TC-CART-003 | Module: Cart | Priority: High | Type: Functional | Preconditions: User logged in; 2 items in cart ('Sauce Labs Backpack', 'Sauce Labs Bike Light'). Test Data: same as TC-CART-002. Traceability: AC1
  2. 1. From /cart.html, click 'Remove' on the 'Sauce Labs Bike Light' row
    - expect: The 'Sauce Labs Bike Light' row disappears from the cart list
    - expect: Header cart badge updates from '2' to '1'
  3. 2. Verify remaining item
    - expect: Only 'Sauce Labs Backpack' row remains with correct name/description/price/qty
  4. 3. Remove the last remaining item ('Sauce Labs Backpack')
    - expect: Cart list is empty (no rows)
    - expect: Header cart badge disappears entirely (no count shown)

#### 1.4. TC-CART-004: 'Continue Shopping' returns to Products page without altering cart contents

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Test Case ID: TC-CART-004 | Module: Cart | Priority: Medium | Type: Functional | Preconditions: User logged in; 1 item in cart. Test Data: 'Sauce Labs Backpack'. Traceability: AC1
  2. 1. From /cart.html with 1 item present, click 'Continue Shopping'
    - expect: Browser navigates to /inventory.html
  3. 2. Verify cart state is preserved
    - expect: Header cart badge still shows '1'
    - expect: 'Sauce Labs Backpack' Add-to-cart button still reads 'Remove' on the Products grid
  4. 3. Re-open the cart via the cart icon
    - expect: The previously added item is still present in the cart with the same name/description/price/qty

#### 1.5. TC-CART-005: 'Checkout' button from cart navigates to Checkout Information page

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Test Case ID: TC-CART-005 | Module: Cart | Priority: Critical | Type: Functional / Smoke | Preconditions: User logged in; at least 1 item in cart. Test Data: 'Sauce Labs Backpack'. Traceability: AC1, AC2, Key Workflow #1
  2. 1. From /cart.html, click 'Checkout'
    - expect: Browser navigates to /checkout-step-one.html
    - expect: Page heading reads 'Checkout: Your Information'

#### 1.6. TC-CART-006-EmptyCart: Cart page with zero items shows no line items and no totals

**File:** `tests/checkout/cart-review.spec.ts`

**Steps:**
  1. Test Case ID: TC-CART-006-EmptyCart | Module: Cart | Priority: Medium | Type: Boundary | Preconditions: User logged in; cart empty (no items ever added, or all removed). Test Data: none. Traceability: AC1, Business Rule 3
  2. 1. Login as standard_user and navigate directly to /cart.html without adding any product
    - expect: Page loads with heading 'Your Cart'
    - expect: No line items are rendered
    - expect: Header cart badge is not shown
  3. 2. Verify page controls remain available
    - expect: 'Continue Shopping' and 'Checkout' buttons are both still visible/enabled even with an empty cart

### 2. AC2 - Checkout Information Entry

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CHECKOUT-INFO-001: Checkout Information page displays all mandatory fields

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-001 | Module: Checkout-Information | Priority: Critical | Type: Functional / Smoke | Preconditions: User logged in; 1+ items in cart; user is on /cart.html. Test Data: none. Traceability: AC2
  2. 1. Click 'Checkout' from the cart
    - expect: Redirected to /checkout-step-one.html with heading 'Checkout: Your Information'
  3. 2. Inspect the form
    - expect: A 'First Name' text field is present and empty
    - expect: A 'Last Name' text field is present and empty
    - expect: A 'Zip/Postal Code' text field is present and empty
    - expect: 'Cancel' and 'Continue' buttons are both visible and enabled

#### 2.2. TC-CHECKOUT-INFO-002: Valid First Name, Last Name, and Zip proceeds to Overview page

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-002 | Module: Checkout-Information | Priority: Critical | Type: Functional / Smoke | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name='John', Last Name='Doe', Zip='12345'. Traceability: AC2, AC3, Key Workflow #1
  2. 1. Enter 'John' in First Name, 'Doe' in Last Name, '12345' in Zip/Postal Code
    - expect: Each field reflects the typed value
  3. 2. Click 'Continue'
    - expect: No error message is shown
    - expect: Browser navigates to /checkout-step-two.html with heading 'Checkout: Overview'

#### 2.3. TC-CHECKOUT-INFO-003-EmptyFirstName: Leaving First Name empty blocks progression and shows required-field error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-003-EmptyFirstName | Module: Checkout-Information | Priority: Critical | Type: Negative | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html with all fields empty. Test Data: First Name='' (empty), Last Name='Doe', Zip='12345'. Traceability: AC2, AC5, Business Rule 1
  2. 1. Leave First Name empty; enter 'Doe' in Last Name and '12345' in Zip
    - expect: Fields reflect entered/empty state as specified
  3. 2. Click 'Continue'
    - expect: Page remains on /checkout-step-one.html (no navigation occurs)
    - expect: An error banner is displayed reading exactly 'Error: First Name is required'
    - expect: The First Name field is visually flagged (red outline/icon)
  4. 3. Click the 'x' dismiss icon on the error banner
    - expect: The error banner is dismissed/hidden

#### 2.4. TC-CHECKOUT-INFO-004-EmptyLastName: Leaving Last Name empty blocks progression and shows required-field error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-004-EmptyLastName | Module: Checkout-Information | Priority: Critical | Type: Negative | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name='John', Last Name='' (empty), Zip='12345'. Traceability: AC2, AC5, Business Rule 1
  2. 1. Enter 'John' in First Name, leave Last Name empty, enter '12345' in Zip
    - expect: Fields reflect entered/empty state as specified
  3. 2. Click 'Continue'
    - expect: Page remains on /checkout-step-one.html (no navigation occurs)
    - expect: An error banner is displayed reading exactly 'Error: Last Name is required'

#### 2.5. TC-CHECKOUT-INFO-005-EmptyZip: Leaving Zip/Postal Code empty blocks progression and shows required-field error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-005-EmptyZip | Module: Checkout-Information | Priority: Critical | Type: Negative | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name='John', Last Name='Doe', Zip='' (empty). Traceability: AC2, AC5, Business Rule 1
  2. 1. Enter 'John' in First Name, 'Doe' in Last Name, leave Zip/Postal Code empty
    - expect: Fields reflect entered/empty state as specified
  3. 2. Click 'Continue'
    - expect: Page remains on /checkout-step-one.html (no navigation occurs)
    - expect: An error banner is displayed reading exactly 'Error: Postal Code is required'

#### 2.6. TC-CHECKOUT-INFO-006-AllFieldsEmpty: Submitting a completely blank form shows the First Name error first

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-006-AllFieldsEmpty | Module: Checkout-Information | Priority: High | Type: Negative / Boundary | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html with all fields blank. Test Data: all fields empty. Traceability: AC2, AC5, Business Rule 1
  2. 1. Without entering any data, click 'Continue' immediately
    - expect: Page remains on /checkout-step-one.html
    - expect: Error banner reads 'Error: First Name is required' (validation stops at the first empty required field, in First Name -> Last Name -> Zip order)
  3. 2. Fill only First Name with 'A' and click 'Continue' again
    - expect: Error banner updates to 'Error: Last Name is required'

#### 2.7. TC-CHECKOUT-INFO-007: Checkout information page requires an active login session

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-007 | Module: Checkout-Information | Priority: Critical | Type: Negative / Security | Preconditions: No active session (logged out; cookies/local storage cleared). Test Data: direct URL https://www.saucedemo.com/checkout-step-one.html. Traceability: AC2, Business Rule 2
  2. 1. Without logging in, navigate directly to https://www.saucedemo.com/checkout-step-one.html
    - expect: Browser is redirected to the login page (/)
    - expect: An error banner is shown reading "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 2.8. TC-CHECKOUT-INFO-008-EmptyCart: Reaching checkout information with an empty cart does not block the form (flag if strict blocking is required)

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-008-EmptyCart | Module: Checkout-Information | Priority: Medium | Type: Negative / Boundary | Preconditions: User logged in; cart is empty. Test Data: direct URL /checkout-step-one.html. Traceability: AC2, Business Rule 3
  2. 1. With an empty cart, navigate directly to /checkout-step-one.html
    - expect: Current observed behavior: the Your Information form still renders normally (no cart-empty block/redirect). Record as a defect/flag if SCRUM-101 requires the app to block checkout entry entirely when the cart is empty.

### 3. AC3 - Order Overview

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CHECKOUT-OVERVIEW-001: Overview page shows correct item summary for a single-item cart

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-OVERVIEW-001 | Module: Checkout-Overview | Priority: Critical | Type: Functional / Smoke | Preconditions: User logged in; cart contains 'Sauce Labs Backpack' ($29.99); valid info submitted on Step One. Test Data: First Name='Alice', Last Name='Wonder', Zip='54321'. Traceability: AC3, Key Workflow #1
  2. 1. Complete checkout information with the given test data and click 'Continue'
    - expect: Redirected to /checkout-step-two.html, heading 'Checkout: Overview'
  3. 2. Verify the item summary table
    - expect: QTY '1' shown for 'Sauce Labs Backpack'
    - expect: Product name, description, and price '$29.99' match the cart contents exactly
  4. 3. Verify Payment and Shipping Information blocks
    - expect: 'Payment Information:' section shows 'SauceCard #31337'
    - expect: 'Shipping Information:' section shows 'Free Pony Express Delivery!'
  5. 4. Verify Price Total block
    - expect: 'Item total: $29.99'
    - expect: 'Tax: $2.40'
    - expect: 'Total: $32.39' (Item total + Tax, arithmetically correct)
  6. 5. Verify page actions
    - expect: 'Cancel' and 'Finish' buttons are both visible and enabled

#### 3.2. TC-CHECKOUT-OVERVIEW-002: Overview page totals recalculate correctly for a multi-item cart

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-OVERVIEW-002 | Module: Checkout-Overview | Priority: Critical | Type: Functional / Regression | Preconditions: User logged in; cart contains 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99); valid info submitted. Test Data: First Name='John', Last Name='Doe', Zip='12345'. Traceability: AC3, AC1, Key Workflow #1
  2. 1. Reach /checkout-step-two.html with both items in cart
    - expect: Two rows appear in the item summary, one per product, each with correct QTY '1', name, description, and unit price
  3. 2. Verify Price Total block
    - expect: 'Item total: $39.98' (29.99 + 9.99)
    - expect: 'Tax: $3.20'
    - expect: 'Total: $43.18' (Item total + Tax)

#### 3.3. TC-CHECKOUT-OVERVIEW-003: 'Cancel' on Overview page returns to Products page (not Cart)

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-OVERVIEW-003 | Module: Checkout-Overview | Priority: High | Type: Functional / Navigation | Preconditions: User logged in; on /checkout-step-two.html with 1+ items and valid info submitted. Test Data: any valid info. Traceability: AC3, Business Rule 5
  2. 1. Click 'Cancel' on the Overview page
    - expect: Browser navigates to /inventory.html (Products page) — note this differs from Step One's Cancel, which returns to /cart.html
  3. 2. Verify cart state is unaffected by cancelling
    - expect: Header cart badge still reflects the same item count as before cancelling (order was not placed, cart not cleared)

#### 3.4. TC-CHECKOUT-OVERVIEW-004-EmptyCart: Overview page with an empty cart shows zeroed totals and an empty item table

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-OVERVIEW-004-EmptyCart | Module: Checkout-Overview | Priority: Medium | Type: Negative / Boundary | Preconditions: User logged in; cart is empty; user forces navigation through Step One with an empty cart. Test Data: First Name='Jane', Last Name='Smith', Zip='99999'. Traceability: AC3, Business Rule 3
  2. 1. With an empty cart, submit valid info on /checkout-step-one.html and click 'Continue'
    - expect: Redirected to /checkout-step-two.html
  3. 2. Verify item table and totals
    - expect: No item rows are shown in the QTY/Description table
    - expect: 'Item total: $0'
    - expect: 'Tax: $0.00'
    - expect: 'Total: $0.00'
    - expect: 'Finish' button remains enabled — record as a defect/flag if SCRUM-101 requires blocking order completion for an empty cart

### 4. AC4 - Order Completion

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-CHECKOUT-COMPLETE-001: Clicking Finish completes the order and shows the confirmation page

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-COMPLETE-001 | Module: Checkout-Complete | Priority: Critical | Type: Functional / Smoke | Preconditions: User logged in; 1+ items in cart; valid info submitted; user is on /checkout-step-two.html. Test Data: any valid cart + info combination. Traceability: AC4, Key Workflow #1
  2. 1. Click 'Finish' on the Overview page
    - expect: Browser navigates to /checkout-complete.html with heading 'Checkout: Complete!'
  3. 2. Verify confirmation content
    - expect: A pony/success image is displayed
    - expect: Heading 'Thank you for your order!' is visible
    - expect: A confirmation/dispatch message is displayed
    - expect: A 'Back Home' button is visible and enabled

#### 4.2. TC-CHECKOUT-COMPLETE-002: Order completion clears the cart

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-COMPLETE-002 | Module: Checkout-Complete | Priority: Critical | Type: Functional / Regression | Preconditions: User logged in; cart had 2 items prior to completing checkout. Test Data: 'Sauce Labs Backpack', 'Sauce Labs Bike Light'. Traceability: AC4, Business Rule 4
  2. 1. Complete a full checkout (info -> overview -> Finish) with 2 items in the cart
    - expect: Order completes and /checkout-complete.html is shown
  3. 2. Verify the header cart badge on the confirmation page
    - expect: No cart badge/count is displayed (cart is empty)
  4. 3. Navigate to /cart.html directly
    - expect: Cart page shows no line items
  5. 4. Navigate directly to /checkout-step-two.html
    - expect: Item table is empty and totals show 'Item total: $0', 'Tax: $0.00', 'Total: $0.00', confirming the cart remains cleared

#### 4.3. TC-CHECKOUT-COMPLETE-003: 'Back Home' returns to the Products page

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-COMPLETE-003 | Module: Checkout-Complete | Priority: High | Type: Functional / Navigation | Preconditions: User logged in; on /checkout-complete.html after a completed order. Test Data: none. Traceability: AC4
  2. 1. Click 'Back Home'
    - expect: Browser navigates to /inventory.html
    - expect: Products grid is displayed with all 'Add to cart' buttons reset (no items pre-added, since cart was cleared)

#### 4.4. TC-CHECKOUT-COMPLETE-004: Browser back button after order completion does not restore the purchased cart

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-COMPLETE-004 | Module: Checkout-Complete | Priority: High | Type: Negative / Navigation | Preconditions: User logged in; order just completed via Finish; browser is on /checkout-complete.html. Test Data: any completed order. Traceability: AC4, Business Rule 4
  2. 1. Click the browser's Back button
    - expect: Browser navigates back to /checkout-step-two.html (cached history entry)
  3. 2. Verify the content of this back-navigated Overview page
    - expect: Item table is empty and Price Total shows 'Item total: $0', 'Tax: $0.00', 'Total: $0.00' — the already-completed order's items are NOT re-shown/re-purchasable, confirming the cart-clear persisted through back navigation

### 5. AC5 - Error Handling and Edge Cases

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-CHECKOUT-INFO-009-SpecialCharacters: Special characters and markup in Name fields are accepted (no format validation)

**File:** `tests/checkout/checkout-error-handling.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-009-SpecialCharacters | Module: Checkout-Information | Priority: High | Type: Negative / Security | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name='<script>alert(1)</script>!@#$%', Last Name="O'Brien-Smith", Zip='abc!@#'. Traceability: AC5
  2. 1. Enter the special-character/markup test data into First Name, Last Name, and Zip/Postal Code respectively
    - expect: Fields accept and display the entered text without truncation or client-side rejection
  3. 2. Click 'Continue'
    - expect: No 'required' validation error is shown (all fields were non-empty)
    - expect: Browser navigates to /checkout-step-two.html
    - expect: No JavaScript alert/dialog is triggered (the script-like input is not executed) — confirm no unexpected dialog appears
  4. 3. Note for reporting
    - expect: Current behavior does NOT reject special characters or enforce numeric-only Zip; if SCRUM-101 requires stricter input validation (e.g., numeric zip, character whitelist), record this as a defect against AC5

#### 5.2. TC-CHECKOUT-INFO-010-WhitespaceOnly: Whitespace-only input in a required field is treated as non-empty (accepted)

**File:** `tests/checkout/checkout-error-handling.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-010-WhitespaceOnly | Module: Checkout-Information | Priority: Medium | Type: Boundary / Negative | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name='   ' (3 spaces), Last Name='Doe', Zip='12345'. Traceability: AC5, AC2
  2. 1. Enter '   ' (spaces only) into First Name; fill Last Name and Zip with valid data
    - expect: Field shows the whitespace content (may appear visually empty)
  3. 2. Click 'Continue'
    - expect: Document actual behavior: verify whether the app treats whitespace-only input as satisfying the 'required' check (navigates to Step Two) or rejects it with 'Error: First Name is required'. Flag a mismatch against expected behavior if whitespace-only should be rejected as effectively empty.

#### 5.3. TC-CHECKOUT-INFO-011-LongInput: Very long input values are accepted in all three fields

**File:** `tests/checkout/checkout-error-handling.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-011-LongInput | Module: Checkout-Information | Priority: Medium | Type: Boundary | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name = 300-character alphabetic string, Last Name = 300-character alphabetic string, Zip = 100-character numeric string. Traceability: AC5
  2. 1. Enter the 300-character string into First Name and Last Name, and the 100-character string into Zip/Postal Code
    - expect: Each field accepts the full input with no visible max-length truncation (or note the actual max-length if the browser/app enforces one)
  3. 2. Click 'Continue'
    - expect: No required-field error is shown
    - expect: Browser navigates to /checkout-step-two.html without error or layout breakage
  4. 3. Visually inspect the Overview page layout
    - expect: Page renders without overflow/clipping issues that would hide the Price Total or Finish button (UI robustness check)

#### 5.4. TC-CHECKOUT-INFO-012-SingleCharacter: Minimum boundary — single-character values in each field are accepted

**File:** `tests/checkout/checkout-error-handling.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-012-SingleCharacter | Module: Checkout-Information | Priority: Low | Type: Boundary | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: First Name='A', Last Name='B', Zip='1'. Traceability: AC5
  2. 1. Enter 'A' in First Name, 'B' in Last Name, '1' in Zip/Postal Code
    - expect: Fields accept the single-character values
  3. 2. Click 'Continue'
    - expect: No required-field error is shown
    - expect: Browser navigates to /checkout-step-two.html successfully

#### 5.5. TC-CHECKOUT-INFO-013-ReSubmitAfterError: Correcting a flagged field and resubmitting clears the error and proceeds

**File:** `tests/checkout/checkout-error-handling.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-INFO-013-ReSubmitAfterError | Module: Checkout-Information | Priority: High | Type: Negative then Functional | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html. Test Data: Step 1 — all fields empty; Step 2 — First Name='John', Last Name='Doe', Zip='12345'. Traceability: AC5, AC2
  2. 1. Click 'Continue' with all fields empty
    - expect: Error banner 'Error: First Name is required' is shown; page stays on /checkout-step-one.html
  3. 2. Fill in First Name='John', Last Name='Doe', Zip='12345' and click 'Continue' again
    - expect: The error banner is no longer shown
    - expect: Browser successfully navigates to /checkout-step-two.html

### 6. Navigation Flow and Cross-Cutting Tests

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-CHECKOUT-NAV-001: 'Cancel' on Checkout Information returns to the Cart page with cart intact

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-NAV-001 | Module: Checkout-Information | Priority: High | Type: Functional / Navigation | Preconditions: User logged in; 1+ items in cart; on /checkout-step-one.html (fields may be partially filled). Test Data: any partial or empty field values. Traceability: AC2, Business Rule 5
  2. 1. Optionally enter partial data into First Name/Last Name/Zip, then click 'Cancel'
    - expect: Browser navigates to /cart.html
  3. 2. Verify cart contents are unaffected by cancelling
    - expect: All previously added items are still present in the cart with correct qty/price
    - expect: Header cart badge count is unchanged from before entering checkout

#### 6.2. TC-CHECKOUT-NAV-002: End-to-end cancel-and-resume — cancelling at Overview and re-entering checkout preserves cart and requires re-entry of info

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-NAV-002 | Module: Checkout-Overview | Priority: Medium | Type: Functional / Navigation | Preconditions: User logged in; 1 item in cart; valid info previously submitted, user is on /checkout-step-two.html. Test Data: First Name='John', Last Name='Doe', Zip='12345'. Traceability: AC3, Business Rule 5
  2. 1. Click 'Cancel' on the Overview page
    - expect: Browser navigates to /inventory.html
    - expect: Header cart badge still shows the original item count (order not placed)
  3. 2. Re-open the cart and click 'Checkout' again
    - expect: Browser returns to /checkout-step-one.html
    - expect: First Name, Last Name, and Zip fields are empty again (previously entered info is not retained/pre-filled)

#### 6.3. TC-CHECKOUT-NAV-003: Browser Back button from Checkout Information returns to Cart without data loss

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-NAV-003 | Module: Checkout-Information | Priority: Medium | Type: Functional / Navigation | Preconditions: User logged in; 1+ items in cart; navigated from /cart.html to /checkout-step-one.html via the Checkout button. Test Data: none. Traceability: AC2
  2. 1. Use the browser's Back button (not the in-page Cancel link) while on /checkout-step-one.html
    - expect: Browser navigates back to /cart.html
  3. 2. Verify cart contents
    - expect: All items previously in the cart are still listed with correct details

#### 6.4. TC-CHECKOUT-NAV-004: Browser Back button from Checkout Overview returns to Checkout Information with fields cleared

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-NAV-004 | Module: Checkout-Overview | Priority: Medium | Type: Functional / Navigation | Preconditions: User logged in; 1+ items in cart; valid info submitted; currently on /checkout-step-two.html. Test Data: First Name='John', Last Name='Doe', Zip='12345'. Traceability: AC3, AC2
  2. 1. Use the browser's Back button while on /checkout-step-two.html
    - expect: Browser navigates back to /checkout-step-one.html
  3. 2. Inspect the First Name, Last Name, and Zip fields
    - expect: Document actual behavior: fields may render empty (form not repopulated from history) — verify and record whether this matches expected UX; if fields are empty, submitting 'Continue' again immediately will show a required-field error rather than silently reusing prior values

#### 6.5. TC-CHECKOUT-NAV-005: Full guest-to-confirmation happy path in a single continuous run

**File:** `tests/checkout/checkout-navigation.spec.ts`

**Steps:**
  1. Test Case ID: TC-CHECKOUT-NAV-005 | Module: Cart / Checkout-Information / Checkout-Overview / Checkout-Complete | Priority: Critical | Type: Smoke / Regression | Preconditions: Fresh login, empty cart. Test Data: username='standard_user', password='secret_sauce'; products = 'Sauce Labs Backpack' ($29.99) + 'Sauce Labs Bike Light' ($9.99); info = First Name='John', Last Name='Doe', Zip='12345'. Traceability: AC1, AC2, AC3, AC4, Key Workflow #1 (primary revenue path)
  2. 1. Login with standard_user/secret_sauce
    - expect: Redirected to /inventory.html
  3. 2. Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart
    - expect: Cart badge shows '2'
  4. 3. Open the cart and verify both items are listed correctly, then click 'Checkout'
    - expect: Redirected to /checkout-step-one.html
  5. 4. Enter First Name='John', Last Name='Doe', Zip='12345' and click 'Continue'
    - expect: Redirected to /checkout-step-two.html with Item total $39.98, Tax $3.20, Total $43.18
  6. 5. Click 'Finish'
    - expect: Redirected to /checkout-complete.html with 'Thank you for your order!' and a 'Back Home' button
  7. 6. Click 'Back Home'
    - expect: Redirected to /inventory.html with no cart badge shown (cart cleared)
