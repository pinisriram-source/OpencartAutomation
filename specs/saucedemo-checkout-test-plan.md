# SauceDemo Checkout Process Test Plan (SCRUM-101)

## Application Overview

This test plan covers the end-to-end checkout workflow of the SauceDemo application (https://www.saucedemo.com) for user story SCRUM-101 (E-commerce Checkout Process). It was derived from live, hands-on exploration of the application on 2026-07-20 using the `standard_user` / `secret_sauce` test account against the six demo products (Sauce Labs Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99).

Workflow covered: Login -> Products/Inventory -> Cart (/cart.html) -> Checkout: Your Information (/checkout-step-one.html) -> Checkout: Overview (/checkout-step-two.html) -> Checkout: Complete (/checkout-complete.html).

Confirmed application behavior used as the oracle for expected results throughout this plan:
- Cart line items show QTY (always "1" per line; there is no quantity stepper anywhere in the app, on the product page or the cart), product name (linked), description, price, and a "Remove" button; the cart page footer has "Continue Shopping" and "Checkout" buttons.
- Checkout Information page (/checkout-step-one.html) has three mandatory fields: First Name, Last Name, Zip/Postal Code. Validation is client-side and sequential/short-circuit: the first empty field (checked in First Name -> Last Name -> Zip order) produces exactly one red error banner reading "Error: First Name is required" / "Error: Last Name is required" / "Error: Postal Code is required" respectively, dismissible via an "X" icon. Validation only checks for a non-empty string -- it does not trim whitespace, restrict character sets, or enforce a numeric postal code, and no max-length limit was observed.
- Checkout Overview page (/checkout-step-two.html) repeats the cart's item list read-only (no Remove buttons), a static "Payment Information: SauceCard #31337" block, a static "Shipping Information: Free Pony Express Delivery!" block, and a Price Total block showing "Item total", "Tax" (8%, rounded to 2 decimals) and "Total" (item total + tax), plus Cancel/Finish buttons.
- Checkout Complete page (/checkout-complete.html) shows a "Checkout: Complete!" heading, a "Thank you for your order!" message, supporting text, and "Back Home" plus "Generate PDF order" buttons. Completing an order clears the cart (badge disappears, cart page becomes empty).
- All storefront checkout-related routes (/cart.html, /checkout-step-one.html, /checkout-step-two.html, /checkout-complete.html) are guarded server-side: an unauthenticated direct navigation redirects to the login page ("/") and shows an error banner of the exact form "Epic sadface: You can only access '&lt;path&gt;' when you are logged in."

Three notable deviations from the stated business rules were discovered during exploration and are captured as explicit negative/edge test cases rather than assumed away:
1. Business Rule 3 ("cart cannot be empty when proceeding to checkout") is NOT enforced -- Checkout can be reached and completed with an empty cart, showing $0.00 totals.
2. Business Rule 5 ("users can cancel checkout at any step and return to cart") only holds on the Information step (Cancel -> /cart.html); Cancel on the Overview step instead returns to /inventory.html (Products page), not the cart.
3. Required-field validation on the Information page accepts whitespace-only input as satisfying the "required" rule (e.g., a First Name of three spaces passes validation).

These are documented as test cases so that a reader can confirm whether they are intended behavior or defects against the acceptance criteria.

## Test Scenarios

### 1. Cart Review (AC1)

**Seed:** `tests/checkout/seed.spec.ts`

#### 1.1. TC-CHECKOUT-001: Cart displays a single item with correct name, description, price and quantity

**File:** `tests/checkout/cart.spec.ts`

**Steps:**
  1. [Metadata] Module: Cart | Priority: Critical | Type: Functional/Smoke | Preconditions: Valid SauceDemo account exists; user starts logged out with a fresh/empty cart | Test Data: username=standard_user, password=secret_sauce, product=Sauce Labs Backpack ($29.99) | Traceability: AC1, Key Workflow #1
    - expect: Metadata recorded for traceability; no UI action performed in this step
  2. 1. Navigate to https://www.saucedemo.com
    - expect: Login page is displayed with Username field, Password field, and a Login button
  3. 2. Enter username 'standard_user' and password 'secret_sauce', then click Login
    - expect: User is redirected to /inventory.html and the Products page is displayed with the six demo products
  4. 3. Click the 'Add to cart' button on the Sauce Labs Backpack tile
    - expect: The button label changes to 'Remove'; the cart badge in the header shows '1'
  5. 4. Click the cart icon in the header
    - expect: User is redirected to /cart.html; the 'Your Cart' heading is displayed
  6. 5. Inspect the single cart line item
    - expect: Row shows QTY '1', product name 'Sauce Labs Backpack' (as a link), the full description text, and price '$29.99'; 'Continue Shopping' and 'Checkout' buttons are visible below the list
  7. Postconditions: none required (read-only verification); cart retains 1 item for any chained test
    - expect: No cleanup necessary

#### 1.2. TC-CHECKOUT-002: Cart displays multiple items with correct details and an accurate badge count

**File:** `tests/checkout/cart.spec.ts`

**Steps:**
  1. [Metadata] Priority: High | Type: Functional | Preconditions: Logged in as standard_user; cart empty | Test Data: Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99) | Traceability: AC1
    - expect: Metadata recorded
  2. 1. Log in as standard_user and land on /inventory.html
    - expect: Products page displayed, no cart badge visible (cart empty)
  3. 2. Click 'Add to cart' for Sauce Labs Backpack
    - expect: Cart badge shows '1'; button changes to 'Remove'
  4. 3. Click 'Add to cart' for Sauce Labs Bike Light
    - expect: Cart badge shows '2'; both buttons now read 'Remove'
  5. 4. Open the cart page (/cart.html)
    - expect: Both items are listed, each with QTY '1', correct name, correct description, and correct price ($29.99 and $9.99 respectively); no duplicate or missing rows
  6. Postconditions: none
    - expect: Cart left with 2 items; no cleanup required

#### 1.3. TC-CHECKOUT-003: 'Continue Shopping' button returns the user to the Products page and preserves cart contents

**File:** `tests/checkout/cart.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Functional | Preconditions: Logged in; at least 1 item already in cart | Test Data: any single product | Traceability: AC1
    - expect: Metadata recorded
  2. 1. From /cart.html, click 'Continue Shopping'
    - expect: User is redirected to /inventory.html; Products heading is visible
  3. 2. Observe the previously added product's button and the cart badge
    - expect: Product button still reads 'Remove' and the cart badge still reflects the prior count -- cart contents are preserved, not cleared, by Continue Shopping
  4. Postconditions: none
    - expect: No cleanup required

#### 1.4. TC-CHECKOUT-004: 'Remove' button removes an item from the cart and decrements the badge

**File:** `tests/checkout/cart.spec.ts`

**Steps:**
  1. [Metadata] Priority: High | Type: Functional | Preconditions: Logged in; cart contains 2 items (Backpack, Bike Light) | Test Data: Sauce Labs Backpack, Sauce Labs Bike Light | Traceability: AC1, cart data integrity
    - expect: Metadata recorded
  2. 1. On /cart.html, click 'Remove' under the Sauce Labs Bike Light row
    - expect: The Bike Light row disappears from the list; cart badge decrements from '2' to '1'; only Sauce Labs Backpack remains
  3. Postconditions: Cart left containing exactly 1 item (Sauce Labs Backpack)
    - expect: State confirmed for downstream tests

#### 1.5. TC-CHECKOUT-005: 'Checkout' button navigates from Cart to the Checkout Information page

**File:** `tests/checkout/cart.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional/Smoke | Preconditions: Logged in; cart has 1+ items | Test Data: any product | Traceability: AC1 -> AC2 transition, Key Workflow #1
    - expect: Metadata recorded
  2. 1. On /cart.html, click 'Checkout'
    - expect: User is redirected to /checkout-step-one.html; heading 'Checkout: Your Information' is shown; First Name, Last Name and Zip/Postal Code fields plus Cancel/Continue buttons are visible
  3. Postconditions: none
    - expect: No cleanup required

#### 1.6. TC-CHECKOUT-006-EmptyCart: Clicking 'Checkout' with an empty cart is not blocked (edge case / Business Rule 3 deviation)

**File:** `tests/checkout/cart.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Negative/Edge | Preconditions: Logged in; cart explicitly emptied via Remove or 'Reset App State' menu action | Test Data: none | Traceability: AC1, Business Rule 3 (documented deviation)
    - expect: Metadata recorded
  2. 1. Navigate to /cart.html with 0 items in the cart
    - expect: Only the QTY/Description header row is shown; no product rows; no cart badge in the header
  3. 2. Click 'Checkout'
    - expect: ACTUAL BEHAVIOR: user is allowed through to /checkout-step-one.html with no warning that the cart is empty. This contradicts Business Rule 3 ('cart cannot be empty when proceeding to checkout'). Record as a confirmed defect/gap unless product owner confirms this is intended, and file accordingly.
  4. Postconditions: none
    - expect: No cleanup required

### 2. Checkout Information Entry (AC2)

**Seed:** `tests/checkout/seed.spec.ts`

#### 2.1. TC-CHECKOUT-007: Valid checkout information (all fields filled) proceeds to Overview

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional/Smoke | Preconditions: Logged in; cart has >=1 item; user is on /checkout-step-one.html | Test Data: First Name='John', Last Name='Doe', Zip='12345' | Traceability: AC2, Key Workflow #1
    - expect: Metadata recorded
  2. 1. Enter 'John' in the First Name field
    - expect: Value is accepted, no error shown
  3. 2. Enter 'Doe' in the Last Name field
    - expect: Value is accepted, no error shown
  4. 3. Enter '12345' in the Zip/Postal Code field
    - expect: Value is accepted, no error shown
  5. 4. Click 'Continue'
    - expect: User is redirected to /checkout-step-two.html; heading 'Checkout: Overview' is displayed; no error banner is present
  6. Postconditions: none
    - expect: No cleanup required

#### 2.2. TC-CHECKOUT-008-EmptyFirstName: Empty First Name (all fields blank) shows 'First Name is required' error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Negative/Boundary | Preconditions: On /checkout-step-one.html; all fields empty | Test Data: First Name='', Last Name='', Zip='' | Traceability: AC2, Business Rule 1 (all fields mandatory)
    - expect: Metadata recorded
  2. 1. Leave First Name, Last Name and Zip/Postal Code all blank
    - expect: Fields remain empty
  3. 2. Click 'Continue'
    - expect: Page remains on /checkout-step-one.html; a red error banner reading exactly 'Error: First Name is required' appears above the form; the First Name input is highlighted with a red border
  4. Postconditions: none
    - expect: No cleanup required

#### 2.3. TC-CHECKOUT-009-EmptyLastName: Empty Last Name (First Name provided) shows 'Last Name is required' error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Negative/Boundary | Preconditions: On /checkout-step-one.html | Test Data: First Name='John', Last Name='', Zip='' | Traceability: AC2, Business Rule 1
    - expect: Metadata recorded
  2. 1. Enter 'John' in First Name; leave Last Name and Zip/Postal Code blank
    - expect: First Name populated, other two fields empty
  3. 2. Click 'Continue'
    - expect: Page remains on /checkout-step-one.html; error banner reads exactly 'Error: Last Name is required'; Last Name input highlighted red
  4. Postconditions: none
    - expect: No cleanup required

#### 2.4. TC-CHECKOUT-010-EmptyZip: Empty Zip/Postal Code (First+Last provided) shows 'Postal Code is required' error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Negative/Boundary | Preconditions: On /checkout-step-one.html | Test Data: First Name='John', Last Name='Doe', Zip='' | Traceability: AC2, Business Rule 1
    - expect: Metadata recorded
  2. 1. Enter 'John' in First Name and 'Doe' in Last Name; leave Zip/Postal Code blank
    - expect: Both name fields populated, Zip empty
  3. 2. Click 'Continue'
    - expect: Page remains on /checkout-step-one.html; error banner reads exactly 'Error: Postal Code is required'; Zip input highlighted red
  4. Postconditions: none
    - expect: No cleanup required

#### 2.5. TC-CHECKOUT-011-AllFieldsEmpty: Submitting with all three fields empty surfaces only the First Name error (short-circuit validation)

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Negative/Edge | Preconditions: On /checkout-step-one.html; all fields empty | Test Data: none | Traceability: AC2, UI validation behavior
    - expect: Metadata recorded
  2. 1. With all three fields empty, click 'Continue'
    - expect: Exactly one error banner is shown: 'Error: First Name is required'. Errors for Last Name and Postal Code are NOT shown simultaneously -- validation short-circuits on the first invalid field rather than aggregating all failures
  3. Postconditions: none
    - expect: No cleanup required

#### 2.6. TC-CHECKOUT-012: Error banner can be dismissed via its close ('X') icon

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Low | Type: UI Validation | Preconditions: On /checkout-step-one.html | Test Data: none | Traceability: AC2, UI element validation
    - expect: Metadata recorded
  2. 1. Click 'Continue' with all fields empty to trigger 'Error: First Name is required'
    - expect: Error banner is displayed
  3. 2. Click the 'X' close icon on the error banner
    - expect: Error banner is dismissed/hidden; the First Name, Last Name and Zip fields and the Continue button remain visible and usable
  4. Postconditions: none
    - expect: No cleanup required

#### 2.7. TC-CHECKOUT-013-LongInput: Very long input (300+ characters) in First Name is accepted without a length validation error (boundary)

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Boundary | Preconditions: On /checkout-step-one.html | Test Data: First Name = 300-character alphabetic string, Last Name='Doe', Zip='12345' | Traceability: AC5 (boundary condition)
    - expect: Metadata recorded
  2. 1. Enter a 300-character alphabetic string into First Name
    - expect: Full string is accepted in the field with no truncation or inline error
  3. 2. Enter 'Doe' into Last Name and '12345' into Zip/Postal Code
    - expect: Values accepted
  4. 3. Click 'Continue'
    - expect: No length-related validation error occurs; user proceeds to /checkout-step-two.html -- the field imposes no observed client-side max-length restriction
  5. Postconditions: none
    - expect: No cleanup required

#### 2.8. TC-CHECKOUT-014-SpecialChars: Special characters and script tags in Name fields are accepted as literal text with no script execution and no reflected output

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: High | Type: Negative/Security | Preconditions: On /checkout-step-one.html | Test Data: First Name='<script>alert(1)</script>!@#$%^&*()', Last Name="O'Brien-Smith", Zip='12345' | Traceability: AC5, cross-cutting negative (injection/XSS safety per CLAUDE.md)
    - expect: Metadata recorded
  2. 1. Enter the script/special-character string into First Name, "O'Brien-Smith" into Last Name, '12345' into Zip
    - expect: Values are accepted verbatim as text in the inputs; no JavaScript alert dialog fires while typing
  3. 2. Click 'Continue'
    - expect: No validation error occurs; user proceeds to /checkout-step-two.html; no alert dialog fires on navigation
  4. 3. Inspect the Checkout Overview page and, after finishing, the Checkout Complete page
    - expect: Neither page renders or echoes the entered First Name / Last Name / Zip values anywhere on screen, so there is no reflected-XSS surface via these two pages for this input
  5. Postconditions: none
    - expect: No cleanup required

#### 2.9. TC-CHECKOUT-015-WhitespaceOnly: Whitespace-only First Name bypasses required-field validation (documented validation gap)

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Negative/Edge | Preconditions: On /checkout-step-one.html | Test Data: First Name='   ' (3 spaces), Last Name='Test', Zip='12345' | Traceability: AC2, AC5 (negative/edge -- validation gap)
    - expect: Metadata recorded
  2. 1. Enter three spaces into First Name, 'Test' into Last Name, '12345' into Zip
    - expect: Fields show the entered values (First Name appears blank visually but contains spaces)
  3. 2. Click 'Continue'
    - expect: ACTUAL BEHAVIOR: no 'First Name is required' error is raised; user proceeds to /checkout-step-two.html despite First Name having no meaningful trimmed content. This documents that required-field validation checks only for empty string length, not trimmed/whitespace-only content -- flag for product-owner confirmation.
  4. Postconditions: none
    - expect: No cleanup required

#### 2.10. TC-CHECKOUT-016-NonNumericZip: Non-numeric / alphanumeric Zip/Postal Code is accepted without format validation

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Negative/Edge | Preconditions: On /checkout-step-one.html | Test Data: First Name='Jane', Last Name='Smith', Zip='ABC-123' | Traceability: AC2, AC5 (negative/edge)
    - expect: Metadata recorded
  2. 1. Enter 'Jane' in First Name, 'Smith' in Last Name, 'ABC-123' in Zip/Postal Code
    - expect: Values accepted, no inline error
  3. 2. Click 'Continue'
    - expect: No format-specific validation error occurs; user proceeds to /checkout-step-two.html -- the Zip field is treated as free text and is not validated as a numeric postal code
  4. Postconditions: none
    - expect: No cleanup required

#### 2.11. TC-CHECKOUT-017: 'Cancel' button on Checkout Information returns the user to the Cart page

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Functional | Preconditions: On /checkout-step-one.html with items in the cart | Test Data: none | Traceability: AC2, Business Rule 5 (cancel returns to cart)
    - expect: Metadata recorded
  2. 1. Click the 'Cancel' button (regardless of whether fields are filled)
    - expect: User is redirected to /cart.html; 'Your Cart' heading and the previously added items are displayed unchanged
  3. Postconditions: none
    - expect: No cleanup required

#### 2.12. TC-CHECKOUT-018-Unauthenticated: Direct navigation to /checkout-step-one.html while logged out redirects to Login with an explicit error

**File:** `tests/checkout/checkout-information.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Negative/Security | Preconditions: No active session (logged out, e.g. via the sidebar Logout link or a fresh browser context) | Test Data: none | Traceability: AC2, Business Rule 2 (must be logged in to access checkout)
    - expect: Metadata recorded
  2. 1. Confirm no active session by using Logout from the sidebar menu if currently logged in
    - expect: User lands on the Login page ('/')
  3. 2. Directly navigate the browser to https://www.saucedemo.com/checkout-step-one.html
    - expect: User is redirected back to '/' (Login page); a red error banner reads exactly: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
  4. Postconditions: none
    - expect: No cleanup required

### 3. Order Overview (AC3)

**Seed:** `tests/checkout/seed.spec.ts`

#### 3.1. TC-CHECKOUT-019: Overview page shows correct item summary for a single item

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional | Preconditions: Logged in; cart has exactly 1 item (Sauce Labs Backpack); valid checkout info ready to submit | Test Data: Sauce Labs Backpack $29.99, First Name='John', Last Name='Doe', Zip='12345' | Traceability: AC3
    - expect: Metadata recorded
  2. 1. With Sauce Labs Backpack in the cart, complete checkout info (John/Doe/12345) and click Continue
    - expect: User lands on /checkout-step-two.html
  3. 2. Inspect the item row in the Overview list
    - expect: Row shows QTY '1', name 'Sauce Labs Backpack', the full description text, and price '$29.99', matching the cart exactly
  4. Postconditions: none
    - expect: No cleanup required

#### 3.2. TC-CHECKOUT-020: Overview page shows correct item summary for multiple items

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: High | Type: Functional | Preconditions: Cart contains Sauce Labs Backpack ($29.99) and Sauce Labs Bike Light ($9.99); valid checkout info ready | Test Data: same two products, First Name='John', Last Name='Doe', Zip='12345' | Traceability: AC3
    - expect: Metadata recorded
  2. 1. Add both items to the cart, proceed to checkout, submit valid info
    - expect: User lands on /checkout-step-two.html
  3. 2. Inspect both item rows in the Overview list
    - expect: Both line items appear, each with QTY '1', correct names, descriptions, and prices, in the same order as they appeared in the cart
  4. Postconditions: none
    - expect: No cleanup required

#### 3.3. TC-CHECKOUT-021: Overview page displays static Payment Information and Shipping Information

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Functional | Preconditions: On /checkout-step-two.html with any cart contents | Test Data: none | Traceability: AC3
    - expect: Metadata recorded
  2. 1. Locate the 'Payment Information:' section
    - expect: Displays value 'SauceCard #31337'
  3. 2. Locate the 'Shipping Information:' section
    - expect: Displays value 'Free Pony Express Delivery!'
  4. Postconditions: none
    - expect: No cleanup required

#### 3.4. TC-CHECKOUT-022: Item total, Tax and Total calculate correctly for a single item

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional (data integrity) | Preconditions: Cart contains only Sauce Labs Backpack | Test Data: Sauce Labs Backpack = $29.99, expected 8% tax | Traceability: AC3, cart total recomputation correctness
    - expect: Metadata recorded
  2. 1. Add only Sauce Labs Backpack to cart, complete checkout info, reach Overview
    - expect: Overview page loaded
  3. 2. Verify 'Item total'
    - expect: Displays 'Item total: $29.99'
  4. 3. Verify 'Tax'
    - expect: Displays 'Tax: $2.40' (8% of $29.99 = $2.3992, rounded to 2 decimals)
  5. 4. Verify 'Total'
    - expect: Displays 'Total: $32.39' (Item total + Tax)
  6. Postconditions: none
    - expect: No cleanup required

#### 3.5. TC-CHECKOUT-023: Item total, Tax and Total calculate correctly for multiple items

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional (data integrity) | Preconditions: Cart contains Sauce Labs Backpack and Sauce Labs Bike Light | Test Data: $29.99 + $9.99 = $39.98, expected 8% tax | Traceability: AC3, cart total recomputation correctness
    - expect: Metadata recorded
  2. 1. Add both items to cart, complete checkout info, reach Overview
    - expect: Overview page loaded with 2 line items
  3. 2. Verify 'Item total'
    - expect: Displays 'Item total: $39.98'
  4. 3. Verify 'Tax'
    - expect: Displays 'Tax: $3.20' (8% of $39.98 = $3.1984, rounded to 2 decimals)
  5. 4. Verify 'Total'
    - expect: Displays 'Total: $43.18'
  6. Postconditions: none
    - expect: No cleanup required

#### 3.6. TC-CHECKOUT-024: 'Cancel' on the Overview page navigates to the Products page, not the Cart (documented Business Rule 5 deviation)

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Functional/Negative | Preconditions: On /checkout-step-two.html | Test Data: none | Traceability: AC3, Business Rule 5 (documented deviation)
    - expect: Metadata recorded
  2. 1. Click 'Cancel' on the Overview page
    - expect: ACTUAL BEHAVIOR: user is redirected to /inventory.html (Products page), NOT to /cart.html. This differs from Cancel on the Information step (which does return to /cart.html) and appears to deviate from Business Rule 5 ('users can cancel checkout at any step and return to cart'). Record as a UX/spec inconsistency for stakeholder confirmation rather than assuming it is a defect.
  3. Postconditions: none
    - expect: No cleanup required

#### 3.7. TC-CHECKOUT-025-SkipStepOne: Direct navigation to /checkout-step-two.html without completing the Information step still renders the Overview (edge case)

**File:** `tests/checkout/checkout-overview.spec.ts`

**Steps:**
  1. [Metadata] Priority: Low | Type: Negative/Edge | Preconditions: Logged in; cart has items; user has NOT filled in checkout info during the current navigation | Test Data: none | Traceability: AC3, AC2 (workflow integrity edge case)
    - expect: Metadata recorded
  2. 1. While logged in with items in cart, navigate directly to https://www.saucedemo.com/checkout-step-two.html without visiting /checkout-step-one.html first
    - expect: ACTUAL BEHAVIOR: the Overview page loads successfully showing the cart's items and totals, with the Finish button enabled -- there is no server-side guard forcing the Information step to be completed first in the current session. Record as an edge case worth product-owner confirmation.
  3. Postconditions: none
    - expect: No cleanup required

### 4. Order Completion (AC4)

**Seed:** `tests/checkout/seed.spec.ts`

#### 4.1. TC-CHECKOUT-026: 'Finish' completes the order and shows a success message with a 'Back Home' button

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional/Smoke | Preconditions: On /checkout-step-two.html with a valid cart and checkout info already submitted | Test Data: any valid cart/info combination | Traceability: AC4, Key Workflow #1
    - expect: Metadata recorded
  2. 1. Click 'Finish'
    - expect: User is redirected to /checkout-complete.html
  3. 2. Verify the heading and success message
    - expect: Heading 'Checkout: Complete!' is shown; message 'Thank you for your order!' is displayed
  4. 3. Verify the supporting text
    - expect: Text reads 'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
  5. 4. Verify the action buttons
    - expect: 'Back Home' button and 'Generate PDF order' button are both present and enabled
  6. Postconditions: order flow completed; cart is cleared (verified separately in TC-CHECKOUT-027)
    - expect: State confirmed

#### 4.2. TC-CHECKOUT-027: Completing an order clears the cart (Business Rule 4)

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Functional (data integrity) | Preconditions: Cart had 2 items before completing the order per TC-CHECKOUT-026 | Test Data: Sauce Labs Backpack, Sauce Labs Bike Light | Traceability: AC4, Business Rule 4 (order confirmation clears the cart)
    - expect: Metadata recorded
  2. 1. After reaching /checkout-complete.html, observe the header cart badge
    - expect: Cart badge is no longer displayed (0 items)
  3. 2. Navigate to /cart.html
    - expect: Cart shows no line items (only the QTY/Description header row); the 'Checkout' button is still present but the cart itself is empty
  4. 3. Navigate to /inventory.html and check product tiles
    - expect: All product 'Add to cart' buttons have reset from 'Remove' back to 'Add to cart', confirming the cart state was fully cleared
  5. Postconditions: none
    - expect: No cleanup required -- cart is already empty

#### 4.3. TC-CHECKOUT-028: 'Back Home' button navigates to the Products page

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Functional | Preconditions: On /checkout-complete.html after a completed order | Test Data: none | Traceability: AC4
    - expect: Metadata recorded
  2. 1. Click 'Back Home'
    - expect: User is redirected to /inventory.html; Products page is displayed with all product 'Add to cart' buttons reset (no items in cart)
  3. Postconditions: none
    - expect: No cleanup required

#### 4.4. TC-CHECKOUT-029-BrowserBack: Browser Back after order completion returns to a cached Overview page; re-clicking Finish is idempotent

**File:** `tests/checkout/checkout-complete.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Negative/Edge (navigation) | Preconditions: An order was just completed; user is on /checkout-complete.html | Test Data: none | Traceability: AC4, navigation flow / browser back button behavior
    - expect: Metadata recorded
  2. 1. Click the browser's Back button
    - expect: Browser navigates back to /checkout-step-two.html; the cached view still shows the original items/totals and an active 'Finish' button (the browser serves this from cache/history, it is not a fresh authoritative order state)
  3. 2. Click 'Finish' again
    - expect: User is redirected to /checkout-complete.html again with the same success message; no error page and no explicit duplicate-order warning is shown
  4. Postconditions: none
    - expect: No cleanup required; note for product owner: absence of a duplicate-order warning may be worth confirming as intended for a demo app

### 5. End-to-End and Cross-Cutting (Navigation / Access Control / Business Rules)

**Seed:** `tests/checkout/seed.spec.ts`

#### 5.1. TC-CHECKOUT-030: Full happy-path checkout with a single item (smoke test)

**File:** `tests/checkout/checkout-e2e.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Smoke | Preconditions: Valid account exists, starts logged out, cart empty | Test Data: username=standard_user/secret_sauce, Sauce Labs Backpack $29.99, First Name='John', Last Name='Doe', Zip='12345' | Traceability: Key Workflow #1, AC1-AC4
    - expect: Metadata recorded
  2. 1. Log in with standard_user / secret_sauce
    - expect: Products page (/inventory.html) is displayed
  3. 2. Add Sauce Labs Backpack to the cart and open the cart
    - expect: Cart shows 1 item, name/description/price/QTY correct; 'Continue Shopping' and 'Checkout' buttons visible
  4. 3. Click 'Checkout' and fill First Name='John', Last Name='Doe', Zip='12345', then click 'Continue'
    - expect: No validation errors; user reaches /checkout-step-two.html
  5. 4. Verify Overview summary and totals, then click 'Finish'
    - expect: Item total $29.99, Tax $2.40, Total $32.39 shown; clicking Finish redirects to /checkout-complete.html
  6. 5. Verify confirmation page
    - expect: 'Checkout: Complete!' heading and 'Thank you for your order!' message with 'Back Home' button are shown; cart badge is cleared
  7. Postconditions: cart is empty at end of test
    - expect: State confirmed

#### 5.2. TC-CHECKOUT-031: Full checkout with multiple items validates end-to-end total correctness

**File:** `tests/checkout/checkout-e2e.spec.ts`

**Steps:**
  1. [Metadata] Priority: High | Type: Functional/Regression | Preconditions: Logged in; cart empty at start | Test Data: Sauce Labs Backpack $29.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99 (sum $95.97), First Name='Alice', Last Name='Wong', Zip='90210' | Traceability: AC1, AC3, AC4, data integrity
    - expect: Metadata recorded
  2. 1. Log in and add Sauce Labs Backpack, Sauce Labs Bolt T-Shirt, and Sauce Labs Fleece Jacket to the cart
    - expect: Cart badge shows '3'
  3. 2. Open the cart and verify all 3 items with correct individual prices
    - expect: All 3 rows show QTY '1' and correct prices ($29.99, $15.99, $49.99)
  4. 3. Click Checkout, fill in First Name='Alice', Last Name='Wong', Zip='90210', click Continue
    - expect: User reaches /checkout-step-two.html with all 3 items listed
  5. 4. Verify Item total, Tax and Total
    - expect: Item total: $95.97; Tax: $7.68 (8% of 95.97 = 7.6776, rounded); Total: $103.65
  6. 5. Click 'Finish' and verify confirmation
    - expect: Redirected to /checkout-complete.html with success message; cart is cleared afterward
  7. Postconditions: cart is empty at end of test
    - expect: State confirmed

#### 5.3. TC-CHECKOUT-032: Zero-item (empty cart) checkout completes with $0.00 totals (Business Rule 3 deviation, full flow)

**File:** `tests/checkout/checkout-e2e.spec.ts`

**Steps:**
  1. [Metadata] Priority: Medium | Type: Negative/Edge | Preconditions: Logged in; cart explicitly emptied | Test Data: First Name='Zero', Last Name='Cart', Zip='00000' | Traceability: Business Rule 3 (documented deviation), AC3, AC4
    - expect: Metadata recorded
  2. 1. Ensure the cart is empty, then click 'Checkout' from /cart.html
    - expect: User reaches /checkout-step-one.html despite the empty cart (per TC-CHECKOUT-006)
  3. 2. Fill in First Name='Zero', Last Name='Cart', Zip='00000', click 'Continue'
    - expect: User reaches /checkout-step-two.html with an empty item list
  4. 3. Verify totals on Overview
    - expect: 'Item total: $0', 'Tax: $0.00', 'Total: $0.00' are displayed
  5. 4. Click 'Finish'
    - expect: ACTUAL BEHAVIOR: user still reaches /checkout-complete.html with the standard success message despite purchasing zero items. Flag as a business-rule violation for stakeholder review if empty-cart orders should be blocked end-to-end.
  6. Postconditions: none
    - expect: No cleanup required

#### 5.4. TC-CHECKOUT-033: A logged-out user cannot reach any checkout-related route directly (access control matrix)

**File:** `tests/checkout/checkout-e2e.spec.ts`

**Steps:**
  1. [Metadata] Priority: Critical | Type: Negative/Security | Preconditions: No active session | Test Data: routes /cart.html, /checkout-step-one.html, /checkout-step-two.html, /checkout-complete.html | Traceability: Business Rule 2, AC2, security/access control
    - expect: Metadata recorded
  2. 1. Ensure logged out (use Logout from the sidebar menu)
    - expect: User is on the Login page ('/')
  3. 2. Navigate directly to /cart.html
    - expect: Redirected to '/'; error banner reads: "Epic sadface: You can only access '/cart.html' when you are logged in."
  4. 3. Navigate directly to /checkout-step-one.html
    - expect: Redirected to '/'; error banner reads: "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
  5. 4. Navigate directly to /checkout-step-two.html
    - expect: Redirected to '/'; error banner reads: "Epic sadface: You can only access '/checkout-step-two.html' when you are logged in."
  6. 5. Navigate directly to /checkout-complete.html
    - expect: Redirected to '/'; error banner reads: "Epic sadface: You can only access '/checkout-complete.html' when you are logged in."
  7. Postconditions: none
    - expect: No cleanup required
