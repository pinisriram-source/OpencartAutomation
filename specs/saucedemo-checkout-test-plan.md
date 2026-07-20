# SauceDemo E-commerce Checkout Process Test Plan (SCRUM-101)

## Application Overview

This plan covers the end-to-end checkout workflow of the SauceDemo storefront (https://www.saucedemo.com): Login -> Products/Inventory -> Cart Review -> Checkout Information (Step One) -> Checkout Overview (Step Two) -> Checkout Complete. All scenarios were derived from live exploration against the app using standard_user/secret_sauce (2026-07-20), not assumptions. Key confirmed behaviors driving this plan: checkout routes require an active login session (unauthenticated direct access redirects to '/' with an "Epic sadface" error); Checkout Information enforces only non-empty ("required") validation field-by-field (First Name, then Last Name, then Postal Code) with no format/pattern checks — special characters, digits-in-name, whitespace-only values, and very long strings (250 chars, no maxlength attribute) are all accepted; the Overview page computes Item total as the sum of unit prices, Tax as ~8% of item total (rounded to 2 decimals), and Total as their sum (verified for 1, 2, and 6-item carts: $29.99/$2.40/$32.39, $39.98/$3.20/$43.18, $129.94/$10.40/$140.34); Cancel on Step One returns to /cart.html while Cancel on Step Two returns to /inventory.html (a confirmed navigational asymmetry); Finish clears the cart and shows a "Thank you for your order!" confirmation with a "Back Home" button; and the app does NOT enforce the stated business rule that "cart cannot be empty when proceeding to checkout" — an empty cart can be walked all the way through to a $0.00 confirmed order, and /checkout-complete.html can even be reached by direct URL navigation without completing steps one/two at all, both flagged below as confirmed product/business-rule gaps for stakeholder review rather than defects in the test plan.

## Test Scenarios

### 1. Cart Review (AC1)

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CART-001 [Priority: Critical] [Type: Functional] [Module: Cart] - Cart displays a single item with full details

**File:** `tests/cart/TC-CART-001.spec.ts`

**Steps:**
  1. Preconditions: Fresh browser session. Navigate to https://www.saucedemo.com and log in with username 'standard_user' / password 'secret_sauce'. Test Data: product = Sauce Labs Backpack, unit price $29.99.
    - expect: User lands on /inventory.html (Products page) with the full 6-product grid rendered.
  2. On the Products page, click 'Add to cart' for 'Sauce Labs Backpack'.
    - expect: The button label changes from 'Add to cart' to 'Remove'.
    - expect: The cart icon badge in the header shows '1'.
  3. Click the cart icon in the header to navigate to /cart.html.
    - expect: Page heading reads 'Your Cart'.
    - expect: Column headers 'QTY' and 'Description' are visible above the item list.
  4. Verify the Sauce Labs Backpack line item in detail.
    - expect: QTY column shows '1'.
    - expect: Item name 'Sauce Labs Backpack' renders as a clickable link.
    - expect: The full product description text is displayed beneath the name.
    - expect: Unit price '$29.99' is displayed.
    - expect: A 'Remove' button is present on the row.
  5. Verify page-level controls below the item list.
    - expect: 'Continue Shopping' button is present and enabled.
    - expect: 'Checkout' button is present and enabled.
    - expect: Postconditions: no cleanup required; cart state is scoped to this session and not shared with other scenarios.

#### 1.2. TC-CART-002 [Priority: High] [Type: Functional] [Module: Cart] - Cart displays multiple items with correct details for each

**File:** `tests/cart/TC-CART-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart. Test Data: Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99).
    - expect: User is on /inventory.html with no cart badge shown.
  2. Add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to the cart from the Products page.
    - expect: Cart badge shows '2'.
  3. Navigate to /cart.html.
    - expect: Exactly two line items are listed, one per row, under the QTY/Description headers.
  4. Verify each row independently.
    - expect: Row for Sauce Labs Backpack: QTY '1', correct description, price '$29.99', Remove button present.
    - expect: Row for Sauce Labs Bike Light: QTY '1', correct description, price '$9.99', Remove button present.
    - expect: Item order matches the order the products were added in.
    - expect: Postconditions: no cleanup required.

#### 1.3. TC-CART-003 [Priority: Medium] [Type: Functional] [Module: Cart] - Continue Shopping returns to Products page and preserves cart

**File:** `tests/cart/TC-CART-003.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add one item to the cart, navigate to /cart.html.
    - expect: Cart page shows 1 item.
  2. Click the 'Continue Shopping' button.
    - expect: User is redirected to /inventory.html.
    - expect: The cart badge count is unchanged, confirming Continue Shopping does not mutate cart contents.
    - expect: Postconditions: none; cart item remains for the duration of the test only.

#### 1.4. TC-CART-004 [Priority: Critical] [Type: Functional] [Module: Cart] - Checkout button navigates to Checkout Information with cart intact

**File:** `tests/cart/TC-CART-004.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add at least one item to the cart, navigate to /cart.html.
    - expect: Cart shows at least 1 item.
  2. Click the 'Checkout' button.
    - expect: User is redirected to /checkout-step-one.html.
    - expect: Page heading reads 'Checkout: Your Information'.
    - expect: The cart badge count is unchanged (items remain reserved in the cart, not yet finalized).
    - expect: Postconditions: none.

#### 1.5. TC-CART-005 [Priority: High] [Type: Functional] [Module: Cart] - Removing an item updates the list and badge

**File:** `tests/cart/TC-CART-005.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to cart, navigate to /cart.html.
    - expect: Both items listed; cart badge shows '2'.
  2. Click 'Remove' on the Sauce Labs Backpack row.
    - expect: The Sauce Labs Backpack row disappears from the cart list.
    - expect: The Sauce Labs Bike Light row remains with unchanged qty/price.
    - expect: The cart badge updates to '1'.
    - expect: Postconditions: none.

#### 1.6. TC-CART-006-EmptyCart [Priority: Medium] [Type: Boundary] [Module: Cart] - Cart page with zero items retains action buttons

**File:** `tests/cart/TC-CART-006-EmptyCart.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with a cart that has never had items added (or all items removed). Confirmed live: no cart badge is rendered when the cart is empty.
    - expect: Cart badge is not shown in the header.
  2. Navigate to /cart.html.
    - expect: 'QTY' and 'Description' column headers are shown with zero item rows beneath them.
    - expect: 'Continue Shopping' button is present and enabled.
    - expect: 'Checkout' button is present and enabled/clickable even though the cart is empty (confirmed live) — see TC-CHECKOUT-ERROR-004 for the downstream consequence of proceeding with zero items, which conflicts with stated business rule 3.
    - expect: Postconditions: none.

### 2. Checkout Information Entry (AC2)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CHECKOUT-INFO-001 [Priority: Critical] [Type: Functional] [Module: Checkout-Information] - Page displays all required fields and controls

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, click 'Checkout' from the cart page.
    - expect: User is on /checkout-step-one.html.
  2. Inspect the form (confirmed live via accessibility snapshot: three empty textboxes labelled First Name, Last Name, Zip/Postal Code plus Cancel and Continue buttons).
    - expect: Page heading reads 'Checkout: Your Information'.
    - expect: A 'First Name' text field is present and empty.
    - expect: A 'Last Name' text field is present and empty.
    - expect: A 'Zip/Postal Code' text field is present and empty.
    - expect: A 'Cancel' button and a 'Continue' button are both present.
    - expect: Postconditions: none.

#### 2.2. TC-CHECKOUT-INFO-002 [Priority: Critical] [Type: Functional] [Module: Checkout-Information] - Valid data in all fields proceeds to Overview

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html. Test Data: First Name='John', Last Name='Doe', Zip='12345'.
    - expect: Form is displayed with all three fields empty.
  2. Enter First Name='John', Last Name='Doe', Zip/Postal Code='12345', then click 'Continue'.
    - expect: User is redirected to /checkout-step-two.html.
    - expect: No error message is shown.
    - expect: Page heading reads 'Checkout: Overview'.
    - expect: Postconditions: none.

#### 2.3. TC-CHECKOUT-INFO-003-EmptyFirstName [Priority: Critical] [Type: Negative] [Module: Checkout-Information] - Empty First Name blocks Continue with the correct error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-003-EmptyFirstName.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. Leave First Name empty. Enter Last Name='Doe' and Zip='12345', then click 'Continue'.
    - expect: User remains on /checkout-step-one.html (URL unchanged).
    - expect: An error banner reading exactly 'Error: First Name is required' is displayed (confirmed exact text live).
    - expect: First Name and Last Name/Zip inputs show a red error outline/icon.
    - expect: Postconditions: none.

#### 2.4. TC-CHECKOUT-INFO-004-EmptyLastName [Priority: Critical] [Type: Negative] [Module: Checkout-Information] - Empty Last Name blocks Continue with the correct error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-004-EmptyLastName.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. Enter First Name='John'. Leave Last Name empty. Enter Zip='12345', then click 'Continue'.
    - expect: User remains on /checkout-step-one.html.
    - expect: An error banner reading exactly 'Error: Last Name is required' is displayed.
    - expect: Postconditions: none.

#### 2.5. TC-CHECKOUT-INFO-005-EmptyZip [Priority: Critical] [Type: Negative] [Module: Checkout-Information] - Empty Zip/Postal Code blocks Continue with the correct error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-005-EmptyZip.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. Enter First Name='John' and Last Name='Doe'. Leave Zip/Postal Code empty, then click 'Continue'.
    - expect: User remains on /checkout-step-one.html.
    - expect: An error banner reading exactly 'Error: Postal Code is required' is displayed.
    - expect: Postconditions: none.

#### 2.6. TC-CHECKOUT-INFO-006-AllFieldsEmpty [Priority: High] [Type: Negative] [Module: Checkout-Information] - Clicking Continue with all fields empty enforces sequential field-by-field validation

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-006-AllFieldsEmpty.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All three fields are empty.
  2. Without entering any data, click 'Continue' (confirmed live).
    - expect: User remains on /checkout-step-one.html.
    - expect: Error banner reads exactly 'Error: First Name is required' — only the first unmet required field is reported at a time, not a combined multi-field message.
  3. Fill only First Name, leaving Last Name/Zip empty, and click 'Continue' again.
    - expect: Error banner now updates to 'Error: Last Name is required', confirming sequential validation order First Name -> Last Name -> Postal Code.
    - expect: Postconditions: none.

#### 2.7. TC-CHECKOUT-INFO-007 [Priority: Low] [Type: Functional] [Module: Checkout-Information] - Error banner can be dismissed without losing entered data

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-007.spec.ts`

**Steps:**
  1. Preconditions: Trigger the 'Error: First Name is required' banner per TC-CHECKOUT-INFO-003 (Last Name='Doe', Zip='12345' already filled).
    - expect: Error banner is visible with a close ('X') control (confirmed present in the DOM as a button inside the error heading).
  2. Click the close icon on the error banner.
    - expect: Error banner is dismissed/hidden.
    - expect: Last Name and Zip field values remain as previously entered (not cleared by dismissing the banner).
    - expect: Postconditions: none.

#### 2.8. TC-CHECKOUT-INFO-008-WhitespaceOnly [Priority: Medium] [Type: Boundary] [Module: Checkout-Information] - Whitespace-only First Name satisfies the required-field check

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-008-WhitespaceOnly.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html. Test Data: First Name=' ' (single space), Last Name='Doe', Zip='12345'.
    - expect: All fields empty before entry.
  2. Enter a single space character into First Name, a valid Last Name and Zip, then click 'Continue'.
    - expect: Confirmed live: the app treats the whitespace-only value as satisfying the 'required' rule and the user is redirected to /checkout-step-two.html — no 'Error: First Name is required' is shown. This is a real gap versus a robust required-field validator (a value of only whitespace is effectively empty from a data-quality standpoint) and should be flagged for product review.
    - expect: Postconditions: none.

#### 2.9. TC-CHECKOUT-INFO-009-VeryLongInput [Priority: Low] [Type: Boundary] [Module: Checkout-Information] - Very long field values are accepted without truncation

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-009-VeryLongInput.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html. Test Data: a 250-character string of the letter 'A' for First Name.
    - expect: All fields empty before entry.
  2. Enter the 250-character string into First Name (confirmed live: no 'maxlength' attribute exists on the field and the full 250 characters are retained in the input value with no truncation). Repeat similarly for Last Name (250 chars) and Zip/Postal Code (100-char alphanumeric string).
    - expect: All three fields accept the full input length without client-side truncation.
  3. Click 'Continue'.
    - expect: No new JavaScript console errors appear.
    - expect: User is redirected to /checkout-step-two.html and the Overview page renders normally with no layout break, even with the long values feeding into the summary.
    - expect: Postconditions: none.

#### 2.10. TC-CHECKOUT-INFO-010-SpecialCharacters [Priority: High] [Type: Negative] [Module: Checkout-Information] - Special characters and script-like input are accepted as literal text with no XSS execution

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-010-SpecialCharacters.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html. Test Data: First Name='<script>alert(1)</script>@@##$$%%', Last Name="O'Brien-Smith Jr. 123", Zip='!!!###' (all confirmed live to be accepted with no dialog firing).
    - expect: All fields empty before entry.
  2. Enter the special-character/script-like test data into First Name, Last Name, and Zip respectively.
    - expect: Each value is accepted into its field as-is; no JavaScript alert dialog fires while typing (confirmed no dialog appeared during live exploration).
  3. Click 'Continue'.
    - expect: No 'required' validation error appears (fields are non-empty).
    - expect: No JavaScript alert/dialog is triggered on navigation, confirming no stored XSS execution.
    - expect: User is redirected to /checkout-step-two.html and the Overview page renders normally with no layout corruption.
    - expect: Postconditions: none.

#### 2.11. TC-CHECKOUT-INFO-011-NumericFirstName [Priority: Low] [Type: Boundary] [Module: Checkout-Information] - Numeric names and alphabetic postal codes are accepted (no format validation)

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-011-NumericFirstName.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html. Test Data: First Name='12345', Last Name='67890', Zip='ABCDE'.
    - expect: All fields empty before entry.
  2. Enter the numeric/alphabetic test data as specified, then click 'Continue'.
    - expect: All values are accepted into their fields (letters allowed in Zip, numbers allowed in Name fields), confirming the app enforces no field-specific format/pattern validation.
    - expect: User proceeds to /checkout-step-two.html without any validation error.
    - expect: Postconditions: none.

#### 2.12. TC-CHECKOUT-INFO-012-NotLoggedIn [Priority: Critical] [Type: Negative/Security] [Module: Checkout-Information] - Direct navigation to checkout while logged out redirects to login with an error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-012-NotLoggedIn.spec.ts`

**Steps:**
  1. Preconditions: Ensure no active session (clear cookies, or open a fresh browser context). Do not log in.
    - expect: User is not authenticated.
  2. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: User is redirected to the login page (https://www.saucedemo.com/) — confirmed live.
    - expect: An error banner is shown reading exactly "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in." (confirmed exact text live).
    - expect: Username and Password fields are present and empty for login.
    - expect: Postconditions: none; enforces business rule 2 (users must be logged in to access checkout).

### 3. Order Overview (AC3)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CHECKOUT-OVERVIEW-001 [Priority: Critical] [Type: Functional] [Module: Checkout-Overview] - Item summary matches cart contents exactly

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to cart. Proceed to Checkout, enter valid First Name/Last Name/Zip, click Continue.
    - expect: User is redirected to /checkout-step-two.html.
  2. Verify the page heading and item rows.
    - expect: Heading reads 'Checkout: Overview'.
    - expect: Exactly two item rows are shown, matching the items/qty/price seen on the cart page (Backpack qty 1 @ $29.99, Bike Light qty 1 @ $9.99).
    - expect: Product names and descriptions match exactly what was seen on the cart page (no data loss/mutation between cart and overview).
    - expect: Postconditions: none.

#### 3.2. TC-CHECKOUT-OVERVIEW-002 [Priority: High] [Type: Functional] [Module: Checkout-Overview] - Payment and Shipping Information sections are shown with correct static values

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-002.spec.ts`

**Steps:**
  1. Preconditions: Reach /checkout-step-two.html with at least one item in cart (per happy-path steps).
    - expect: Overview page is displayed.
  2. Locate the Payment Information section (confirmed live).
    - expect: Label 'Payment Information:' is shown with value 'SauceCard #31337'.
  3. Locate the Shipping Information section (confirmed live).
    - expect: Label 'Shipping Information:' is shown with value 'Free Pony Express Delivery!'.
    - expect: Postconditions: none.

#### 3.3. TC-CHECKOUT-OVERVIEW-003 [Priority: Critical] [Type: Functional] [Module: Checkout-Overview] - Price Total block computes correctly for a single item

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-003.spec.ts`

**Steps:**
  1. Preconditions: Log in, add only 'Sauce Labs Backpack' ($29.99) to the cart, proceed through checkout info with valid data to reach /checkout-step-two.html.
    - expect: Overview page shows one line item at $29.99.
  2. Read the 'Item total', 'Tax', and 'Total' values.
    - expect: Item total equals '$29.99' (sum of the single line item price).
    - expect: Tax equals '$2.40' (8% of item total, rounded to 2 decimals).
    - expect: Total equals '$32.39' (Item total + Tax).
    - expect: Postconditions: none.

#### 3.4. TC-CHECKOUT-OVERVIEW-004 [Priority: Critical] [Type: Functional] [Module: Checkout-Overview] - Price Total block computes correctly for two items (confirmed live)

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-004.spec.ts`

**Steps:**
  1. Preconditions: Log in, add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to cart, proceed through checkout info with valid data to reach /checkout-step-two.html.
    - expect: Overview page shows two line items.
  2. Read the 'Item total', 'Tax', and 'Total' values (confirmed live).
    - expect: Item total equals '$39.98' (29.99 + 9.99).
    - expect: Tax equals '$3.20' (8% of $39.98, rounded).
    - expect: Total equals '$43.18' (Item total + Tax).
    - expect: Postconditions: none.

#### 3.5. TC-CHECKOUT-OVERVIEW-005 [Priority: High] [Type: Functional] [Module: Checkout-Overview] - Overview page presents Cancel and Finish options

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-005.spec.ts`

**Steps:**
  1. Preconditions: Reach /checkout-step-two.html with at least one item in cart.
    - expect: Overview page is displayed.
  2. Verify action buttons.
    - expect: A 'Cancel' button is visible and enabled.
    - expect: A 'Finish' button is visible and enabled.
    - expect: Postconditions: none.

#### 3.6. TC-CHECKOUT-OVERVIEW-006-AllProducts [Priority: Medium] [Type: Boundary] [Module: Checkout-Overview] - Overview correctly totals the maximum available product set (6 items, confirmed live)

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-006-AllProducts.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart.
    - expect: Cart badge not shown.
  2. From the Products page, click 'Add to cart' for all 6 available products (Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99).
    - expect: Cart badge shows '6'.
  3. Proceed to Checkout, enter valid First Name/Last Name/Zip, click Continue to reach the Overview page.
    - expect: All 6 line items are listed with correct name/description/price and qty=1 each.
  4. Verify totals (confirmed live: Item total $129.94, Tax $10.40, Total $140.34).
    - expect: Item total equals '$129.94' (sum of all 6 unit prices).
    - expect: Tax equals '$10.40' (8% of item total, rounded).
    - expect: Total equals '$140.34' (Item total + Tax), with no rounding errors and no UI truncation of the 6-row list.
    - expect: Postconditions: none.

### 4. Order Completion (AC4)

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-CHECKOUT-COMPLETE-001 [Priority: Critical] [Type: Functional] [Module: Checkout-Complete] - Clicking Finish completes the order and shows the confirmation page

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add at least one item to cart, complete Checkout Information with valid data, reach /checkout-step-two.html.
    - expect: Overview page is displayed with correct totals.
  2. Click 'Finish'.
    - expect: User is redirected to /checkout-complete.html.
    - expect: Page heading reads 'Checkout: Complete!'.
    - expect: A success heading 'Thank you for your order!' is displayed.
    - expect: A confirming sentence 'Your order has been dispatched, and will arrive just as fast as the pony can get there!' is shown (confirmed exact text live).
    - expect: A Pony Express image is displayed.
    - expect: A 'Back Home' button is present and enabled.
    - expect: Postconditions: none — order completion is the terminal, expected state for this flow.

#### 4.2. TC-CHECKOUT-COMPLETE-002 [Priority: Critical] [Type: Functional] [Module: Checkout-Complete] - Order completion clears the cart (business rule 4)

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add 2 items to cart, complete the full checkout flow through to /checkout-complete.html (per TC-CHECKOUT-COMPLETE-001).
    - expect: Order confirmation page is displayed; the cart icon badge is no longer visible on the header (confirmed live).
  2. Navigate directly to /cart.html.
    - expect: Cart page shows zero line items (no QTY/Description rows).
    - expect: 'Continue Shopping' and 'Checkout' buttons are still present but the cart itself is empty, confirming the cart was cleared by order completion.
    - expect: Postconditions: none.

#### 4.3. TC-CHECKOUT-COMPLETE-003 [Priority: High] [Type: Functional] [Module: Checkout-Complete] - Back Home button returns to the Products page

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-003.spec.ts`

**Steps:**
  1. Preconditions: Complete an order per TC-CHECKOUT-COMPLETE-001, arriving at /checkout-complete.html.
    - expect: Confirmation page displayed.
  2. Click 'Back Home'.
    - expect: User is redirected to /inventory.html (Products page).
    - expect: Product grid is fully rendered with all 'Add to cart' buttons available (none pre-selected, since the cart was cleared).
    - expect: Postconditions: none.

#### 4.4. TC-CHECKOUT-COMPLETE-004-EdgeCase-DirectAccess [Priority: Medium] [Type: Negative/Boundary] [Module: Checkout-Complete] - Confirmation page is reachable by direct URL without completing Steps One/Two (confirmed gap)

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-004-DirectAccess.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add one or more items to the cart, but do NOT proceed through Checkout Information or Overview.
    - expect: User is on /inventory.html with the cart badge showing the added item count.
  2. Navigate directly to /checkout-complete.html by URL, bypassing Steps One and Two entirely.
    - expect: Confirmed live: the app renders the full 'Checkout: Complete!' confirmation page (Pony Express image, 'Thank you for your order!' heading, dispatch sentence, 'Back Home' button) with no block/redirect, even though no checkout information was ever submitted and no Finish action was taken.
    - expect: Confirmed live: the cart is NOT cleared by this direct-access path (the cart badge from step 1 remains visible), unlike the real Finish flow in TC-CHECKOUT-COMPLETE-002 — this is a functional inconsistency worth flagging for product/defect review since it means the 'order confirmation' page carries no guarantee an order was actually placed.
    - expect: Confirmed live: the 'Generate PDF order' button that appears after a genuine Finish action is NOT present on this directly-navigated page, evidencing that no order object was actually created server/client-side.
    - expect: Postconditions: navigate away or reset session; no real order was created so no cleanup of order data is required.

### 5. Error Handling and Field Validation (AC5)

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-CHECKOUT-ERROR-001 [Priority: Critical] [Type: Functional] [Module: Checkout-Information] - User cannot proceed past Step One until all three fields are non-empty

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Form fields empty.
  2. Click Continue with all fields empty.
    - expect: Blocked with 'Error: First Name is required'; URL remains /checkout-step-one.html.
  3. Fill only First Name, click Continue.
    - expect: Blocked with 'Error: Last Name is required'; URL remains /checkout-step-one.html.
  4. Fill Last Name also, click Continue.
    - expect: Blocked with 'Error: Postal Code is required'; URL remains /checkout-step-one.html.
  5. Fill Zip/Postal Code also, click Continue.
    - expect: User successfully proceeds to /checkout-step-two.html, confirming all three fields are enforced as mandatory (business rule 1) and cannot be bypassed at any stage.
    - expect: Postconditions: none.

#### 5.2. TC-CHECKOUT-ERROR-002 [Priority: High] [Type: Functional] [Module: Checkout-Information] - Error banner text and visual treatment are correct and specific per missing field

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Fields empty.
  2. Trigger each of the three required-field errors independently, one at a time (per TC-CHECKOUT-INFO-003/004/005).
    - expect: Each error message text is exact: 'Error: First Name is required', 'Error: Last Name is required', 'Error: Postal Code is required' respectively.
    - expect: Each error banner is rendered as a heading element with a red-styled container and includes a dismiss (X) control.
    - expect: The offending input field(s) show a red error outline/icon.
    - expect: Postconditions: none.

#### 5.3. TC-CHECKOUT-ERROR-003 [Priority: High] [Type: Functional] [Module: Checkout-Information] - Fixing the invalid field and resubmitting clears the error and proceeds

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-003.spec.ts`

**Steps:**
  1. Preconditions: Trigger 'Error: Postal Code is required' (First Name and Last Name filled, Zip empty), per TC-CHECKOUT-INFO-005.
    - expect: Error banner visible.
  2. Enter a valid Zip/Postal Code value (e.g. '12345').
    - expect: Field now contains valid data.
  3. Click 'Continue' again.
    - expect: Error banner is no longer shown.
    - expect: User is redirected to /checkout-step-two.html.
    - expect: Postconditions: none.

#### 5.4. TC-CHECKOUT-ERROR-004-EdgeCase-EmptyCartThroughCheckout [Priority: High] [Type: Negative/Boundary] [Module: Checkout-Information/Overview/Complete] - Proceeding through checkout with an empty cart is not blocked (confirmed business-rule gap vs. rule 3)

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-004-EmptyCartThroughCheckout.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart (no items added, or all items removed/consumed by a prior completed order).
    - expect: Cart badge not shown; /cart.html shows zero items.
  2. From the empty cart page, click 'Checkout'.
    - expect: Confirmed live: the user IS allowed to reach /checkout-step-one.html despite the empty cart, with no blocking message — this conflicts with stated business rule 3 ('Cart cannot be empty when proceeding to checkout') and should be flagged for stakeholder/product decision rather than treated as an automatic pass.
  3. Enter valid First Name/Last Name/Zip and click Continue.
    - expect: User reaches /checkout-step-two.html showing zero item rows, Item total '$0', Tax '$0.00', Total '$0.00' (confirmed live).
  4. Click 'Finish'.
    - expect: User reaches /checkout-complete.html with the standard 'Thank you for your order!' confirmation despite no items ever being purchased (confirmed live). Record as a confirmed gap for defect tracking / product decision.
    - expect: Postconditions: no real product order exists; no data cleanup required, but flag for product owner review.

### 6. Navigation Flow: Cancel and Browser Back Button

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-CHECKOUT-NAV-001 [Priority: Critical] [Type: Functional] [Module: Checkout-Information] - Cancel on Step One returns to the Cart page (business rule 5)

**File:** `tests/navigation/TC-CHECKOUT-NAV-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Step One form displayed.
  2. Click the 'Cancel' button without entering any data.
    - expect: User is redirected to /cart.html.
    - expect: The item added earlier is still present in the cart, confirming Cancel does not clear the cart (business rule 5: user can cancel and return to cart).
    - expect: Postconditions: none.

#### 6.2. TC-CHECKOUT-NAV-002 [Priority: High] [Type: Functional] [Module: Checkout-Overview] - Cancel on Overview returns to the Products page, not the Cart (confirmed asymmetry)

**File:** `tests/navigation/TC-CHECKOUT-NAV-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, complete Step One with valid data, reach /checkout-step-two.html.
    - expect: Overview page displayed with 1 item and correct totals.
  2. Click the 'Cancel' button.
    - expect: Confirmed live: user is redirected to /inventory.html (Products page), NOT to /cart.html — a real, confirmed asymmetry versus Cancel on Step One that should be called out explicitly if the product intent for business rule 5 ('cancel and return to cart at every step') was for Cancel to always land on the cart.
  3. Navigate to /cart.html to check cart state.
    - expect: The item that was in the cart before Cancel is still present, confirming Cancel changes navigation destination only and never mutates cart contents.
    - expect: Postconditions: none.

#### 6.3. TC-CHECKOUT-NAV-003 [Priority: Medium] [Type: Functional] [Module: Checkout-Information] - Browser Back from Step Two returns to Step One with cleared form fields

**File:** `tests/navigation/TC-CHECKOUT-NAV-003.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, fill valid First Name/Last Name/Zip on Step One, click Continue to reach /checkout-step-two.html.
    - expect: Overview page displayed.
  2. Click the browser's Back button.
    - expect: Browser navigates back to /checkout-step-one.html.
    - expect: First Name, Last Name, and Zip/Postal Code fields are EMPTY (previously entered values are not restored), since the SPA does not persist form state in browser history.
    - expect: Postconditions: none.

#### 6.4. TC-CHECKOUT-NAV-004 [Priority: Medium] [Type: Negative/Boundary] [Module: Checkout-Overview] - Browser Back after order completion shows a stale, zeroed-out Overview page

**File:** `tests/navigation/TC-CHECKOUT-NAV-004.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add one item to cart, complete the full checkout flow through Finish to reach /checkout-complete.html.
    - expect: Order confirmation page displayed; cart is cleared.
  2. Click the browser's Back button.
    - expect: Confirmed live: browser navigates to /checkout-step-two.html, but since the cart was already cleared by the completed order, the page shows zero item rows, Item total '$0', Tax '$0.00', Total '$0.00' — a stale view of an already-finalized/emptied cart.
    - expect: Postconditions: none.

#### 6.5. TC-CHECKOUT-NAV-005-EdgeCase-DuplicateFinish [Priority: Medium] [Type: Negative/Boundary] [Module: Checkout-Overview/Complete] - Clicking Finish again on the stale post-completion Overview page is not blocked

**File:** `tests/navigation/TC-CHECKOUT-NAV-005-DuplicateFinish.spec.ts`

**Steps:**
  1. Preconditions: Complete TC-CHECKOUT-NAV-004 so the browser is showing the stale /checkout-step-two.html with $0 totals after using Back post-order.
    - expect: Stale Overview page displayed with $0 totals.
  2. Click 'Finish' again.
    - expect: Confirmed observed behavior: the app allows navigation back to /checkout-complete.html again, showing the same 'Thank you for your order!' confirmation, even though no real order/cart content exists at this point. Record as a potential duplicate-submission edge case for defect tracking, since a real order-processing system would be expected to prevent re-finishing a stale/empty checkout.
    - expect: Postconditions: none; no real duplicate order data is created since the cart was already empty.

#### 6.6. TC-CHECKOUT-NAV-006 [Priority: Low] [Type: Functional] [Module: Checkout-Information] - Browser Back after Cancel from Step One shows an empty form with cart state unchanged

**File:** `tests/navigation/TC-CHECKOUT-NAV-006.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html, click Cancel to land on /cart.html.
    - expect: Cart shows the item; user is on /cart.html.
  2. Click the browser's Back button.
    - expect: Browser navigates back to /checkout-step-one.html.
    - expect: Form is shown with empty fields (no residual data).
    - expect: The cart item count/badge is unchanged from before Cancel was clicked.
    - expect: Postconditions: none.

#### 6.7. TC-CHECKOUT-NAV-007 [Priority: Medium] [Type: Functional] [Module: Checkout-Information] - Cancel from Step One with multiple cart items preserves all items

**File:** `tests/navigation/TC-CHECKOUT-NAV-007.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add 3 different items to the cart, click Checkout to reach /checkout-step-one.html.
    - expect: Cart badge shows '3' before proceeding.
  2. Click 'Cancel'.
    - expect: User is redirected to /cart.html.
    - expect: All 3 items are still present with correct qty/name/price for each, confirming Cancel never mutates cart contents regardless of cart size.
    - expect: Postconditions: none.

### 7. Full End-to-End Happy Path (Cross-cutting Smoke Tests)

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-CHECKOUT-E2E-001 [Priority: Critical] [Type: Smoke] [Module: Cart/Checkout-Information/Checkout-Overview/Checkout-Complete] - Complete a single-item checkout from login to confirmation

**File:** `tests/e2e/TC-CHECKOUT-E2E-001.spec.ts`

**Steps:**
  1. Preconditions: Fresh browser session, not logged in. Test Data: username='standard_user', password='secret_sauce', First Name='John', Last Name='Doe', Zip='12345'.
    - expect: Login page displayed at https://www.saucedemo.com.
  2. Log in with username 'standard_user' and password 'secret_sauce'.
    - expect: User lands on /inventory.html.
  3. Click 'Add to cart' for 'Sauce Labs Backpack'.
    - expect: Cart badge shows '1'; button changes to 'Remove'.
  4. Click the cart icon to go to /cart.html.
    - expect: Sauce Labs Backpack listed with qty 1, price $29.99.
  5. Click 'Checkout'.
    - expect: User lands on /checkout-step-one.html.
  6. Enter First Name='John', Last Name='Doe', Zip='12345', click 'Continue'.
    - expect: User lands on /checkout-step-two.html showing 1 item, Item total $29.99, Tax $2.40, Total $32.39.
  7. Click 'Finish'.
    - expect: User lands on /checkout-complete.html with 'Thank you for your order!' message and a 'Back Home' button.
  8. Click 'Back Home'.
    - expect: User returns to /inventory.html; cart badge is no longer shown, confirming the cart was cleared by the completed order.
    - expect: Postconditions: none — this is the primary smoke path and should run independently of all other scenarios.

#### 7.2. TC-CHECKOUT-E2E-002 [Priority: Critical] [Type: Smoke] [Module: Cart/Checkout-Information/Checkout-Overview/Checkout-Complete] - Complete a multi-item checkout and verify math end-to-end

**File:** `tests/e2e/TC-CHECKOUT-E2E-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart. Test Data: Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99), Sauce Labs Bolt T-Shirt ($15.99).
    - expect: User on /inventory.html.
  2. Add 'Sauce Labs Backpack', 'Sauce Labs Bike Light', and 'Sauce Labs Bolt T-Shirt' to the cart.
    - expect: Cart badge shows '3'.
  3. Navigate to /cart.html and verify all 3 items with correct names/descriptions/prices/qty.
    - expect: All 3 rows correct; 'Checkout' button enabled.
  4. Click 'Checkout', enter valid First Name/Last Name/Zip, click 'Continue'.
    - expect: Overview page shows all 3 items; Item total = $55.97 (29.99+9.99+15.99); Tax = 8% rounded = $4.48; Total = $60.45.
  5. Click 'Finish'.
    - expect: Order confirmation page displayed with success message.
  6. Navigate to /cart.html.
    - expect: Cart is empty (0 items), confirming all 3 items were cleared after order completion.
    - expect: Postconditions: none — independent smoke path.
