# SauceDemo E-commerce Checkout Process Test Plan (SCRUM-101)

## Application Overview

## Application Under Test
SauceDemo (https://www.saucedemo.com) — a demo e-commerce storefront used to validate a Playwright-based
QA automation suite for user story **SCRUM-101 (E-commerce Checkout Process)**.

Test credentials: username `standard_user`, password `secret_sauce` (password is shared across all demo
accounts: `standard_user`, `locked_out_user`, `problem_user`, `performance_glitch_user`, `error_user`, `visual_user`).

## Checkout Workflow (as verified by exploration)
1. **Login** (`/`) → **Inventory/Products** (`/inventory.html`) — 6 products, each with "Add to cart" / "Remove" toggle button, no quantity selector anywhere in the UI (every add-to-cart action always adds exactly qty = 1; there is no stepper/increment control on the inventory, product-detail, or cart pages).
2. **Cart** (`/cart.html`) — lists QTY / Description (name, description, price) per line item, a "Remove" button per line, footer controls "Continue Shopping" (→ Products) and "Checkout" (→ Checkout Information). There is no visible subtotal/total on the Cart page itself — totals only appear on the Overview page.
3. **Checkout Step One – Information** (`/checkout-step-one.html`) — First Name, Last Name, Zip/Postal Code text fields, all mandatory. Submitting with a field blank shows a dismissible red error banner "Error: `<Field>` is required" (checked in order: First Name → Last Name → Postal Code) plus a red outline/icon on the offending field. "Cancel" returns to `/cart.html`; "Continue" (with all fields non-empty) proceeds to Overview.
4. **Checkout Step Two – Overview** (`/checkout-step-two.html`) — item summary table (QTY, name, description, price), "Payment Information: SauceCard #31337", "Shipping Information: Free Pony Express Delivery!", and a Price Total block: "Item total", "Tax" (8% of item total, rounded to 2dp), "Total" (item total + tax). "Cancel" returns to `/inventory.html` (NOT to `/cart.html`). "Finish" completes the order.
5. **Checkout Complete** (`/checkout-complete.html`) — "Checkout: Complete!" header, "Thank you for your order!" heading, dispatch message, "Back Home" button (returns to `/inventory.html`) and a "Generate PDF order" button. The cart is cleared as part of completing the order (badge disappears, cart page/inventory buttons reset to "Add to cart").

## Notable Actual-Behavior Findings (informing negative/edge test design)
- All 4 checkout-flow pages (`cart.html`, `checkout-step-one.html`, `checkout-step-two.html`, `checkout-complete.html`) enforce **login only** — direct URL navigation while logged out redirects to `/` with error "Epic sadface: You can only access '&lt;path&gt;' when you are logged in." There is otherwise **no server-side step-sequence enforcement**: a logged-in user can navigate directly to any checkout URL (including `checkout-complete.html`) regardless of cart contents or whether prior steps were completed.
- The app currently does **not** block proceeding to/through checkout when the cart is empty — Checkout Information and Overview both render normally with an empty cart, and Overview shows Item total $0 / Tax $0.00 / Total $0.00; Finish still completes to the success page. This is tested explicitly against Business Rule 3 and should be confirmed with the product owner as expected vs. a gap.
- Field validation on Checkout Information is presence-only ("required"), not format-based: special characters, an apostrophe/hyphen/digits mix, non-numeric Zip values, and whitespace-only values are all currently accepted and let the user proceed. These are documented as explicit test cases so a future tightening of validation is caught as a spec/behavior change.
- Browser back-button after finishing an order lands back on the Overview page but reflects the real (now-empty) cart state ($0 totals), not a stale snapshot of the completed order.

## Business Rules Under Test
1. All checkout form fields (First Name, Last Name, Zip/Postal Code) are mandatory.
2. Users must be logged in to access any Cart/Checkout page.
3. Cart is not expected to be empty when proceeding to checkout (verify actual enforcement).
4. Order confirmation clears the cart.
5. Users can cancel checkout at each step (verify actual return destination per step).

## Scope
In scope: Cart review, Checkout Information entry & validation, Checkout Overview summary/totals, Order completion, navigation/cancel flows, browser back-button behavior, access control, boundary/edge input handling.
Out of scope: payment gateway integration (SauceDemo uses a fixed mock "SauceCard"), performance/load testing, visual/pixel-diff regression, the "Generate PDF order" feature's file content, and the six demo user personas' distinct quirks (`locked_out_user`, `problem_user`, etc.) beyond `standard_user`, unless separately requested.


## Test Scenarios

### 1. Cart Review (AC1)

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CART-001: Cart displays a single added item with correct name, description, price and quantity

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Module: Cart | Priority: Critical | Type: Functional/Smoke | Preconditions: standard_user account exists; user starts logged out with an empty cart | Test Data: username=standard_user, password=secret_sauce, product="Sauce Labs Backpack" ($29.99) | Postconditions: remove item from cart / reset app state | Traceability: AC1
    - expect: Reference only — no action performed
  2. 1. Navigate to https://www.saucedemo.com and log in with standard_user / secret_sauce
    - expect: User is redirected to /inventory.html
    - expect: Products grid with 6 items is visible
  3. 2. Click "Add to cart" on Sauce Labs Backpack
    - expect: Button label changes from "Add to cart" to "Remove"
    - expect: Header cart badge shows "1"
  4. 3. Click the shopping cart icon in the header
    - expect: User is navigated to /cart.html
    - expect: Page heading shows "Your Cart"
  5. 4. Inspect the single cart line item
    - expect: QTY column shows "1"
    - expect: Item name "Sauce Labs Backpack" is displayed as a link
    - expect: Description text matches the product's listing description
    - expect: Price shows "$29.99"
    - expect: A "Remove" button is present for the line item

#### 1.2. TC-CART-002: Cart displays multiple items each with correct independent details

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional | Preconditions: logged in as standard_user; empty cart | Test Data: Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99) | Postconditions: reset app state | Traceability: AC1
    - expect: Reference only
  2. 1. Log in and add "Sauce Labs Backpack" then "Sauce Labs Bike Light" to the cart from the Products page
    - expect: Cart badge shows "2"
  3. 2. Open the Cart page
    - expect: Both items are listed as separate rows
    - expect: Each row shows QTY=1, its own name, description and price ($29.99 and $9.99 respectively)
    - expect: Each row has its own independent "Remove" button

#### 1.3. TC-CART-003: Continue Shopping button returns to the Products page and preserves cart contents

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Functional | Preconditions: logged in; 1 item in cart | Test Data: Sauce Labs Backpack | Traceability: AC1
    - expect: Reference only
  2. 1. Add Sauce Labs Backpack to cart and open /cart.html
    - expect: Item is listed
  3. 2. Click "Continue Shopping"
    - expect: User is navigated back to /inventory.html
    - expect: Cart badge still shows "1" (item retained)

#### 1.4. TC-CART-004: Checkout button on Cart page navigates to Checkout Information page

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional/Smoke | Preconditions: logged in; at least 1 item in cart | Traceability: AC1, AC2
    - expect: Reference only
  2. 1. With >=1 item in the cart, open /cart.html and click "Checkout"
    - expect: User is navigated to /checkout-step-one.html
    - expect: Header shows "Checkout: Your Information"
    - expect: First Name, Last Name and Zip/Postal Code fields are visible and empty

#### 1.5. TC-CART-005: Removing one item from a multi-item cart updates the badge count and removes only that row

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional | Preconditions: logged in; 2 items in cart | Test Data: Sauce Labs Backpack, Sauce Labs Bike Light | Traceability: AC1
    - expect: Reference only
  2. 1. Add 2 items to the cart and open /cart.html
    - expect: Both rows are listed, badge shows "2"
  3. 2. Click "Remove" on the Sauce Labs Bike Light row
    - expect: That row is removed from the page without a full reload
    - expect: Cart badge decrements to "1"
    - expect: Sauce Labs Backpack row remains with unchanged qty/description/price

#### 1.6. TC-CART-006: Removing all items empties the cart and clears the badge

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Functional/Boundary | Preconditions: logged in; 1 item in cart | Traceability: AC1
    - expect: Reference only
  2. 1. Add 1 item to cart, open /cart.html, click "Remove" on that item
    - expect: Row is removed
    - expect: Header cart badge is no longer displayed (or shows no count)
    - expect: "Continue Shopping" and "Checkout" buttons remain visible

#### 1.7. TC-CART-007: Cart page with zero items still renders its standard layout and controls (boundary: zero items)

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Boundary | Preconditions: logged in; cart is empty | Traceability: AC1, Business Rule 3
    - expect: Reference only
  2. 1. With an empty cart, navigate directly to /cart.html
    - expect: "Your Cart" header is shown
    - expect: No item rows are present
    - expect: "Continue Shopping" and "Checkout" buttons are both visible and enabled
  3. 2. Note actual behavior for later cross-reference with Business Rule 3
    - expect: Checkout button is clickable even though the cart has zero items (see TC-ACCESS-002 for the full downstream flow) — record this as an observed behavior for product-owner confirmation

#### 1.8. TC-CART-008: Unauthenticated user cannot access the Cart page directly (negative, access control)

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Negative | Preconditions: user is logged out (fresh/incognito session) | Traceability: AC1, Business Rule 2
    - expect: Reference only
  2. 1. Without logging in, navigate directly to https://www.saucedemo.com/cart.html
    - expect: User is redirected to the login page (URL "/")
    - expect: Error banner reads "Epic sadface: You can only access '/cart.html' when you are logged in."

#### 1.9. TC-CART-009: Cart line items have no quantity increment/decrement controls (UI validation)

**File:** `tests/saucedemo/cart-review.spec.ts`

**Steps:**
  1. METADATA — Priority: Low | Type: Functional/UI | Preconditions: logged in; 1 item in cart | Traceability: AC1
    - expect: Reference only
  2. 1. Add 1 item to the cart and open /cart.html
    - expect: QTY column displays a static value "1" with no +/- stepper, dropdown, or editable input
    - expect: There is no in-cart mechanism to change quantity of an existing line item; the only line-level action is "Remove"

### 2. Checkout Information Entry (AC2)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CHECKOUT-INFO-001: Checkout Information page displays all three mandatory fields and action buttons

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional | Preconditions: logged in; >=1 item in cart | Traceability: AC2
    - expect: Reference only
  2. 1. From Cart with 1 item, click "Checkout"
    - expect: User lands on /checkout-step-one.html
    - expect: First Name textbox is present and empty
    - expect: Last Name textbox is present and empty
    - expect: Zip/Postal Code textbox is present and empty
    - expect: "Cancel" and "Continue" buttons are visible

#### 2.2. TC-CHECKOUT-INFO-002: Submitting with all fields empty shows "First Name is required" error

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Negative | Preconditions: on /checkout-step-one.html, all fields blank | Test Data: firstName="", lastName="", zip="" | Traceability: AC2, Business Rule 1
    - expect: Reference only
  2. 1. Leave First Name, Last Name and Zip/Postal Code empty and click "Continue"
    - expect: User remains on /checkout-step-one.html
    - expect: A red error banner reads "Error: First Name is required"
    - expect: First Name field shows a red outline/error icon

#### 2.3. TC-CHECKOUT-INFO-003: Submitting with only First Name filled shows "Last Name is required" error

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Negative | Test Data: firstName="John", lastName="", zip="" | Traceability: AC2, Business Rule 1
    - expect: Reference only
  2. 1. Fill First Name = "John"; leave Last Name and Zip empty; click "Continue"
    - expect: Error banner reads "Error: Last Name is required"
    - expect: First Name value "John" remains populated in the field

#### 2.4. TC-CHECKOUT-INFO-004: Submitting with First and Last Name filled, Zip empty shows "Postal Code is required" error

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Negative | Test Data: firstName="John", lastName="Doe", zip="" | Traceability: AC2, Business Rule 1
    - expect: Reference only
  2. 1. Fill First Name = "John", Last Name = "Doe"; leave Zip empty; click "Continue"
    - expect: Error banner reads "Error: Postal Code is required"
    - expect: Both First Name and Last Name values remain populated

#### 2.5. TC-CHECKOUT-INFO-005: Submitting all three valid fields proceeds to the Overview page (happy path)

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional/Smoke | Test Data: firstName="John", lastName="Doe", zip="12345" | Traceability: AC2, AC3, Key Workflow (happy path)
    - expect: Reference only
  2. 1. Fill First Name = "John", Last Name = "Doe", Zip = "12345"; click "Continue"
    - expect: No error banner is shown
    - expect: User is navigated to /checkout-step-two.html
    - expect: Header reads "Checkout: Overview"

#### 2.6. TC-CHECKOUT-INFO-006: Dismissing the validation error banner via its close (X) icon

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Functional/UI | Traceability: AC2, AC5
    - expect: Reference only
  2. 1. Click "Continue" with all fields empty to trigger the "First Name is required" error
    - expect: Error banner is visible with a close (X) button
  3. 2. Click the close (X) icon on the error banner
    - expect: The error banner is dismissed/hidden
    - expect: The First Name / Last Name / Zip field values (if any were entered) remain unchanged

#### 2.7. TC-CHECKOUT-INFO-007: Cancel button on Checkout Information returns to Cart with items intact

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional | Preconditions: 2 items in cart | Traceability: AC2, Business Rule 5
    - expect: Reference only
  2. 1. From Cart (2 items) click "Checkout" to reach /checkout-step-one.html
    - expect: Checkout Information page is shown
  3. 2. Click "Cancel"
    - expect: User is navigated to /cart.html
    - expect: Both original items are still listed with unchanged qty/price
    - expect: Cart badge count is unchanged

#### 2.8. TC-CHECKOUT-INFO-008: Unauthenticated user cannot access Checkout Information page directly (negative, access control)

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Negative | Preconditions: user logged out | Traceability: AC2, Business Rule 2
    - expect: Reference only
  2. 1. Without logging in, navigate directly to https://www.saucedemo.com/checkout-step-one.html
    - expect: User is redirected to the login page ("/")
    - expect: Error banner reads "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."

#### 2.9. TC-CHECKOUT-INFO-009: Field-required errors surface one at a time in First Name -> Last Name -> Postal Code order

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Regression/Functional | Traceability: AC2, AC5
    - expect: Reference only
  2. 1. On a blank form, click Continue
    - expect: Only "Error: First Name is required" is shown (no other field errors simultaneously)
  3. 2. Fill First Name only, click Continue
    - expect: Error changes to "Error: Last Name is required"
  4. 3. Fill Last Name, click Continue
    - expect: Error changes to "Error: Postal Code is required"
  5. 4. Fill Zip/Postal Code, click Continue
    - expect: No error is shown; user proceeds to /checkout-step-two.html

#### 2.10. TC-CHECKOUT-INFO-010: Whitespace-only value in First Name incorrectly satisfies the "required" check (edge case / data-quality gap)

**File:** `tests/saucedemo/checkout-information.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Negative/Edge | Test Data: firstName="   " (3 spaces), lastName="Doe", zip="12345" | Traceability: AC2, AC5, Business Rule 1
    - expect: Reference only
  2. 1. Enter three space characters into First Name, valid Last Name and Zip, click Continue
    - expect: Per current app behavior: no "First Name is required" error is raised and the user proceeds to /checkout-step-two.html
    - expect: Flag this as a gap to raise with the product owner: a whitespace-only value should arguably not satisfy a mandatory-field rule

### 3. Error Handling & Boundary Validation (AC5)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CHECKOUT-EDGE-001: Special characters in First Name / Last Name are accepted without a validation error

**File:** `tests/saucedemo/checkout-validation-edge-cases.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Negative/Edge | Test Data: firstName="!@#$%^&*()_+{}:\"<>?", lastName="O'Brien-Doe123", zip="12345" | Traceability: AC5
    - expect: Reference only
  2. 1. Enter the special-character test data into First Name and Last Name, valid Zip, click Continue
    - expect: Per current app behavior: no validation error is raised
    - expect: User proceeds to /checkout-step-two.html with the entered values accepted as-is
    - expect: Record this as a behavior confirmation; if alphabetic-only validation is a desired business rule, raise as a product gap

#### 3.2. TC-CHECKOUT-EDGE-002: Non-numeric characters in the Zip/Postal Code field are accepted without a validation error

**File:** `tests/saucedemo/checkout-validation-edge-cases.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Negative/Edge | Test Data: firstName="John", lastName="Doe", zip="abc!@#" | Traceability: AC5
    - expect: Reference only
  2. 1. Enter valid First/Last Name, Zip = "abc!@#", click Continue
    - expect: No zip-format validation error is shown
    - expect: User proceeds to /checkout-step-two.html

#### 3.3. TC-CHECKOUT-EDGE-003: Very long input (500+ characters) in First Name is accepted without breaking the page

**File:** `tests/saucedemo/checkout-validation-edge-cases.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Boundary | Test Data: firstName = 500-character repeating alphabetic string, lastName="Doe", zip="12345" | Traceability: AC5
    - expect: Reference only
  2. 1. Enter the 500-character string into First Name, valid Last Name and Zip, click Continue
    - expect: No client-side max-length error blocks submission (verify actual truncation vs. full acceptance)
    - expect: No JavaScript console error is thrown
    - expect: User proceeds to /checkout-step-two.html without layout breakage

#### 3.4. TC-CHECKOUT-EDGE-004: Zip/Postal Code boundary values (single digit, all zeros, 12-digit) are all accepted

**File:** `tests/saucedemo/checkout-validation-edge-cases.spec.ts`

**Steps:**
  1. METADATA — Priority: Low | Type: Boundary | Test Data set: zip="1"; zip="00000"; zip="123456789012" | Traceability: AC5
    - expect: Reference only
  2. 1. For each Zip test-data value above, fill valid First/Last Name plus that Zip and click Continue (repeat as 3 sub-cases)
    - expect: Each of the three values proceeds to /checkout-step-two.html without a Zip-specific validation error, confirming no min/max length constraint is currently enforced

#### 3.5. TC-CHECKOUT-EDGE-005: Leading/trailing whitespace around otherwise valid values is accepted as-is (no trim)

**File:** `tests/saucedemo/checkout-validation-edge-cases.spec.ts`

**Steps:**
  1. METADATA — Priority: Low | Type: Edge | Test Data: firstName="  John  ", lastName="Doe", zip="12345" | Traceability: AC5
    - expect: Reference only
  2. 1. Enter "  John  " (leading/trailing spaces) into First Name, valid Last Name/Zip, click Continue
    - expect: No validation error is raised
    - expect: User proceeds to Overview (confirms the app does not require or perform trimming before validating)

### 4. Checkout Overview (AC3)

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-CHECKOUT-OVERVIEW-001: Overview lists correct item summary for a single-item cart

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional | Preconditions: only Sauce Labs Backpack in cart, valid checkout info submitted | Traceability: AC3
    - expect: Reference only
  2. 1. Complete Cart -> Checkout Information (valid data) -> arrive at /checkout-step-two.html
    - expect: Item row shows QTY=1, name "Sauce Labs Backpack" (link), matching product description, price "$29.99"

#### 4.2. TC-CHECKOUT-OVERVIEW-002: Overview lists correct item summary for a multi-item cart

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional | Preconditions: Sauce Labs Backpack + Sauce Labs Bike Light in cart | Traceability: AC3
    - expect: Reference only
  2. 1. Add both items, complete Checkout Information, arrive at Overview
    - expect: Both items appear as separate rows with correct qty (1 each), description and price ($29.99 and $9.99)
    - expect: Order of items on Overview matches order shown on Cart page

#### 4.3. TC-CHECKOUT-OVERVIEW-003: Payment Information section displays the default payment method

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Functional | Traceability: AC3
    - expect: Reference only
  2. 1. Reach the Overview page with any cart contents
    - expect: "Payment Information:" label is shown
    - expect: Value reads "SauceCard #31337"

#### 4.4. TC-CHECKOUT-OVERVIEW-004: Shipping Information section displays the default shipping method

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Functional | Traceability: AC3
    - expect: Reference only
  2. 1. Reach the Overview page with any cart contents
    - expect: "Shipping Information:" label is shown
    - expect: Value reads "Free Pony Express Delivery!"

#### 4.5. TC-CHECKOUT-OVERVIEW-005: Price Total block calculates Item total, Tax and Total correctly for a single item

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional/Boundary | Test Data: Sauce Labs Backpack $29.99 | Traceability: AC3
    - expect: Reference only
  2. 1. Reach Overview with only Sauce Labs Backpack ($29.99) in the cart
    - expect: "Item total: $29.99"
    - expect: "Tax: $2.40" (8% of item total, rounded to 2 decimal places)
    - expect: "Total: $32.39" (item total + tax)

#### 4.6. TC-CHECKOUT-OVERVIEW-006: Price Total block calculates correctly for two items

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional | Test Data: Backpack $29.99 + Bike Light $9.99 = $39.98 | Traceability: AC3
    - expect: Reference only
  2. 1. Reach Overview with Backpack + Bike Light in the cart
    - expect: "Item total: $39.98"
    - expect: "Tax: $3.20"
    - expect: "Total: $43.18"

#### 4.7. TC-CHECKOUT-OVERVIEW-007: Price Total block calculates correctly for all 6 catalog items (boundary/max cart size)

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Boundary | Test Data: all 6 products, sum = $129.94 | Traceability: AC3
    - expect: Reference only
  2. 1. Add all 6 available products to the cart, complete Checkout Information, reach Overview
    - expect: All 6 items are listed
    - expect: "Item total: $129.94"
    - expect: "Tax: $10.40"
    - expect: "Total: $140.34"

#### 4.8. TC-CHECKOUT-OVERVIEW-008: Cancel button on Overview returns to Products page (not Cart), cart contents unchanged

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional | Preconditions: 2 items in cart, on Overview page | Traceability: AC3, Business Rule 5 (verifies actual return destination differs per step)
    - expect: Reference only
  2. 1. From the Overview page, click "Cancel"
    - expect: User is navigated to /inventory.html (Products page) — NOT /cart.html
    - expect: Header cart badge count is unchanged from before Cancel was clicked
  3. 2. Navigate to /cart.html to confirm cart state
    - expect: The same 2 items are still present with unchanged qty/price (items were not removed by cancelling)

#### 4.9. TC-CHECKOUT-OVERVIEW-009: Finish and Cancel buttons are both present and enabled on Overview

**File:** `tests/saucedemo/checkout-overview.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Functional/UI | Traceability: AC3
    - expect: Reference only
  2. 1. Reach the Overview page with at least 1 item in the cart
    - expect: "Finish" button is visible and enabled
    - expect: "Cancel" button is visible and enabled

### 5. Order Completion (AC4)

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-CHECKOUT-COMPLETE-001: Clicking Finish redirects to the Order Confirmation page with a success message and Back Home button

**File:** `tests/saucedemo/checkout-complete.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional/Smoke | Preconditions: user on Overview page with >=1 item, valid checkout info already submitted | Traceability: AC4, Key Workflow (happy path)
    - expect: Reference only
  2. 1. From the Overview page, click "Finish"
    - expect: User is navigated to /checkout-complete.html
    - expect: Header reads "Checkout: Complete!"
    - expect: Heading "Thank you for your order!" is displayed
    - expect: Body text confirms dispatch ("Your order has been dispatched, and will arrive just as fast as the pony can get there!")
    - expect: "Back Home" button is present and enabled

#### 5.2. TC-CHECKOUT-COMPLETE-002: Cart is cleared after order completion (Business Rule 4)

**File:** `tests/saucedemo/checkout-complete.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Functional | Preconditions: order just completed with >=1 item | Traceability: AC4, Business Rule 4
    - expect: Reference only
  2. 1. After Finish, inspect the header cart icon on /checkout-complete.html
    - expect: No cart badge/count is shown
  3. 2. Navigate directly to /cart.html
    - expect: No item rows are present in the cart

#### 5.3. TC-CHECKOUT-COMPLETE-003: "Back Home" button navigates to the Products page and reflects an empty cart

**File:** `tests/saucedemo/checkout-complete.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional | Traceability: AC4
    - expect: Reference only
  2. 1. On the Complete page, click "Back Home"
    - expect: User is navigated to /inventory.html
    - expect: Every product tile shows "Add to cart" (none show "Remove"), confirming the cart is empty

#### 5.4. TC-CHECKOUT-COMPLETE-004: Browser Back button from the Complete page shows the Overview with $0 totals (cart already cleared)

**File:** `tests/saucedemo/checkout-complete.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Navigation/Edge | Traceability: AC4, cross-cutting navigation
    - expect: Reference only
  2. 1. Complete an order (Finish clicked, on /checkout-complete.html), then click the browser Back button
    - expect: Browser navigates to /checkout-step-two.html
    - expect: No item rows are shown in the summary table
    - expect: "Item total: $0", "Tax: $0.00", "Total: $0.00" are displayed
    - expect: This confirms the page reflects live (now-empty) cart state rather than a stale cached snapshot of the completed order

#### 5.5. TC-CHECKOUT-COMPLETE-005: Direct URL navigation to checkout-complete.html without completing prior steps (negative/workflow-integrity edge case)

**File:** `tests/saucedemo/checkout-complete.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Negative/Edge | Preconditions: user logged in; cart in any state (including empty) | Traceability: AC4, Business Rule 2/3 cross-check
    - expect: Reference only
  2. 1. While logged in, without visiting /checkout-step-one.html or /checkout-step-two.html first, navigate directly to https://www.saucedemo.com/checkout-complete.html
    - expect: Per current app behavior: the page loads successfully and shows the standard success message, with no server-side check that prior steps were completed
    - expect: Flag this as a workflow-integrity gap for product-owner confirmation (should completing checkout require passing through Information and Overview first?)

### 6. Navigation Flow & Cancel Behavior

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-NAV-001: Repeated Cancel-then-reenter cycles at Checkout Information never retain previously entered field values

**File:** `tests/saucedemo/checkout-navigation.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Regression/Navigation | Preconditions: 2 items in cart | Traceability: Business Rule 5
    - expect: Reference only
  2. 1. From Cart (2 items) click Checkout, enter First Name = "Temp", then click Cancel
    - expect: User returns to /cart.html with both items still listed
  3. 2. Click Checkout again to re-open /checkout-step-one.html
    - expect: First Name, Last Name and Zip fields are all empty (previous "Temp" entry was not remembered)

#### 6.2. TC-NAV-002: Cancel at Checkout Overview returns to Products page and leaves cart contents unchanged

**File:** `tests/saucedemo/checkout-navigation.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Functional/Navigation | Preconditions: 2 items in cart | Traceability: Business Rule 5
    - expect: Reference only
  2. 1. From Cart (2 items) -> Checkout -> fill valid info -> Continue -> arrive at Overview -> click Cancel
    - expect: User lands on /inventory.html
  3. 2. Navigate to /cart.html
    - expect: The same 2 original items are present with original qty/price; nothing was added, removed, or duplicated by the cancel

#### 6.3. TC-NAV-003: Browser Back from Overview to Checkout Information clears previously entered field values

**File:** `tests/saucedemo/checkout-navigation.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Navigation | Test Data: firstName="Alex", lastName="Turner", zip="99999" | Traceability: AC2, cross-cutting navigation
    - expect: Reference only
  2. 1. Fill valid checkout info and click Continue to reach the Overview page
    - expect: User is on /checkout-step-two.html
  3. 2. Click the browser Back button
    - expect: Browser navigates to /checkout-step-one.html
    - expect: First Name, Last Name and Zip fields are all empty (not pre-filled with the previously entered values)

#### 6.4. TC-NAV-004: Browser Back from Checkout Information returns to the Cart page

**File:** `tests/saucedemo/checkout-navigation.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Navigation | Traceability: cross-cutting navigation
    - expect: Reference only
  2. 1. From Cart, click Checkout to reach /checkout-step-one.html, then click the browser Back button
    - expect: Browser navigates to /cart.html
    - expect: Cart items are still listed as before

#### 6.5. TC-NAV-005: Repeated Continue -> Cancel -> Continue cycles do not duplicate cart items or corrupt totals

**File:** `tests/saucedemo/checkout-navigation.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Regression | Preconditions: 1 item (Sauce Labs Backpack) in cart | Traceability: AC1, AC3
    - expect: Reference only
  2. 1. Cart(1 item) -> Checkout -> fill valid info -> Continue -> Overview -> Cancel (back to Products) -> open Cart -> Checkout again -> fill valid info -> Continue -> arrive at Overview
    - expect: Cart/Overview still shows exactly 1 item (Sauce Labs Backpack)
    - expect: Item total is still $29.99, Tax $2.40, Total $32.39 (no duplication or drift from repeated navigation)

### 7. Access Control & Business Rule Enforcement

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-ACCESS-001: Login is required to reach any Cart/Checkout page (Business Rule 2)

**File:** `tests/saucedemo/checkout-access-control.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Negative | Preconditions: user logged out | Traceability: Business Rule 2
    - expect: Reference only
  2. 1. While logged out, navigate directly to /cart.html
    - expect: Redirected to "/" with error "Epic sadface: You can only access '/cart.html' when you are logged in."
  3. 2. While logged out, navigate directly to /checkout-step-one.html
    - expect: Redirected to "/" with error "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
  4. 3. While logged out, navigate directly to /checkout-step-two.html
    - expect: Redirected to "/" with error "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."
  5. 4. While logged out, navigate directly to /checkout-complete.html
    - expect: Redirected to "/" with error "Epic sadface: You can only access '/checkout-complete.html' when you are logged in."

#### 7.2. TC-ACCESS-002: Proceeding through checkout with an empty cart is currently allowed (negative / Business Rule 3 gap)

**File:** `tests/saucedemo/checkout-access-control.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Negative/Edge | Preconditions: logged in; cart empty | Test Data: firstName="Jane", lastName="Smith", zip="54321" | Traceability: Business Rule 3
    - expect: Reference only
  2. 1. With an empty cart, navigate to /checkout-step-one.html and fill in valid First Name / Last Name / Zip, click Continue
    - expect: User proceeds to /checkout-step-two.html without any "cart is empty" warning
  3. 2. Observe the Overview page's item table and Price Total block
    - expect: No item rows are shown
    - expect: "Item total: $0", "Tax: $0.00", "Total: $0.00"
  4. 3. Click "Finish"
    - expect: Per current app behavior: the order completes successfully and /checkout-complete.html shows the standard success message even though 0 items were purchased
    - expect: Flag as a discrepancy against Business Rule 3 ("Cart cannot be empty when proceeding to checkout") for product-owner review

#### 7.3. TC-ACCESS-003: Completing an order clears the cart so a subsequent checkout only reflects newly added items (Business Rule 4 regression)

**File:** `tests/saucedemo/checkout-access-control.spec.ts`

**Steps:**
  1. METADATA — Priority: High | Type: Regression | Preconditions: logged in | Test Data: first order = 3 items (Backpack, Bike Light, Bolt T-Shirt); second order = 1 new item (Onesie) | Traceability: Business Rule 4
    - expect: Reference only
  2. 1. Add 3 items, complete the full checkout flow through Finish
    - expect: Order completes; cart is cleared (per TC-CHECKOUT-COMPLETE-002)
  3. 2. Click Back Home, then add a different single item (Sauce Labs Onesie) and go through checkout again to the Overview page
    - expect: Overview shows only the newly added Onesie item (qty 1, $7.99)
    - expect: No residual items from the first completed order appear
    - expect: Item total reads "$7.99" (not a sum including the previous order's items)

#### 7.4. TC-ACCESS-004: Logging out mid-checkout blocks resuming the checkout URL directly

**File:** `tests/saucedemo/checkout-access-control.spec.ts`

**Steps:**
  1. METADATA — Priority: Medium | Type: Negative | Preconditions: logged in with items in cart, mid checkout | Traceability: Business Rule 2
    - expect: Reference only
  2. 1. With cart items present, navigate to /checkout-step-one.html, then open the hamburger menu and click "Logout"
    - expect: User is redirected to the login page ("/")
  3. 2. Attempt to navigate directly back to /checkout-step-one.html while still logged out
    - expect: Redirected again to "/" with the access-denied error for that path
  4. 3. Log back in as standard_user
    - expect: User lands on /inventory.html (not resumed at the checkout step)
    - expect: Verify and record whether the previously added cart items persisted across the logout/login cycle

### 8. End-to-End Smoke Tests

**Seed:** `tests/seed.spec.ts`

#### 8.1. TC-CHECKOUT-E2E-001: Full happy-path checkout with a single item (Critical smoke test)

**File:** `tests/saucedemo/checkout-e2e-smoke.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Smoke | Preconditions: fresh session, logged out | Test Data: username=standard_user, password=secret_sauce, product=Sauce Labs Backpack ($29.99), firstName="John", lastName="Doe", zip="12345" | Postconditions: none (order naturally clears cart) | Traceability: AC1-AC4, Key Workflow (primary revenue path)
    - expect: Reference only
  2. 1. Log in with standard_user / secret_sauce
    - expect: Redirected to /inventory.html
  3. 2. Add "Sauce Labs Backpack" to the cart
    - expect: Cart badge shows "1"
  4. 3. Open the Cart page and verify the item, then click "Checkout"
    - expect: Item name/description/price correct; navigates to /checkout-step-one.html
  5. 4. Fill First Name, Last Name, Zip with valid data and click "Continue"
    - expect: Navigates to /checkout-step-two.html with no validation errors
  6. 5. Verify the Overview page item summary and totals, then click "Finish"
    - expect: Item total $29.99, Tax $2.40, Total $32.39 shown; clicking Finish navigates to /checkout-complete.html
  7. 6. Verify the confirmation page, then click "Back Home"
    - expect: "Thank you for your order!" success message and "Back Home" button are shown
    - expect: Clicking Back Home returns to /inventory.html with the cart empty (Add to cart buttons restored, no badge)

#### 8.2. TC-CHECKOUT-E2E-002: Full happy-path checkout with multiple items (Critical smoke test)

**File:** `tests/saucedemo/checkout-e2e-smoke.spec.ts`

**Steps:**
  1. METADATA — Priority: Critical | Type: Smoke | Test Data: 3 products (Sauce Labs Backpack $29.99, Sauce Labs Bike Light $9.99, Sauce Labs Bolt T-Shirt $15.99 = $55.97 subtotal), firstName="Max", lastName="Items", zip="11111" | Traceability: AC1-AC4, Key Workflow
    - expect: Reference only
  2. 1. Log in and add all 3 specified products to the cart
    - expect: Cart badge shows "3"
  3. 2. Open Cart, verify all 3 items listed correctly, click Checkout
    - expect: All 3 rows correct; navigates to Checkout Information
  4. 3. Fill valid checkout information and click Continue
    - expect: Navigates to Overview with no errors
  5. 4. Verify Overview lists all 3 items and correct totals, then click Finish
    - expect: Item total $55.97, Tax $4.48, Total $60.45; Finish navigates to /checkout-complete.html
  6. 5. Verify success message and that the cart is cleared
    - expect: Confirmation page shown; cart badge absent; /cart.html shows no items afterward
