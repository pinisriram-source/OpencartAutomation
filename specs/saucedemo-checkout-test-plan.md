# SauceDemo E-commerce Checkout Process Test Plan (SCRUM-101)

## Application Overview

This test plan covers the end-to-end checkout workflow of the SauceDemo storefront (https://www.saucedemo.com), a demo e-commerce application used for automation practice. The workflow under test spans: Login -> Products/Inventory page -> Cart Review -> Checkout Step One (Your Information) -> Checkout Step Two (Overview) -> Checkout Complete (Order Confirmation).

Live exploration was performed against the application (standard_user / secret_sauce) to validate actual behavior before authoring test cases. Key observed behaviors that inform this plan:
- Login is required to reach any checkout-* route; direct navigation while logged out redirects to the login page with the error "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
- Cart page (cart.html) lists each line item with qty (always 1 per click; no qty selector on cart page), name, description, and unit price, plus "Continue Shopping" and "Checkout" buttons. It does NOT show a running total.
- Checkout Step One (checkout-step-one.html) has First Name, Last Name, and Zip/Postal Code text fields (data-test="firstName"/"lastName"/"postalCode"), plus Cancel and Continue buttons. Leaving First Name blank and clicking Continue shows "Error: First Name is required"; the same pattern applies sequentially to Last Name ("Error: Last Name is required") and Postal Code ("Error: Postal Code is required") - only the first unmet required field's error is shown at a time. No format/pattern validation was observed - special characters, symbols, and script-injection-style strings are all accepted as long as the field is non-empty (no XSS execution occurred; injected text rendered as inert text on the following pages).
- Checkout Step Two (checkout-step-two.html, "Checkout: Overview") lists each cart item (qty, name, description, price), Payment Information ("SauceCard #31337"), Shipping Information ("Free Pony Express Delivery!"), and a Price Total block showing Item total, Tax, and Total, plus Cancel and Finish buttons. Math verified: Item total = sum of unit prices (qty 1 each); Tax computed at ~8% of item total; Total = Item total + Tax.
- Clicking Cancel on Step One returns to cart.html. Clicking Cancel on Step Two returns to inventory.html (Products page), NOT to the cart - this is a real, confirmed asymmetry in navigation behavior worth explicitly testing.
- Clicking Finish on Step Two navigates to checkout-complete.html ("Checkout: Complete!") showing a Pony Express image, "Thank you for your order!" heading, a confirmation sentence, a "Back Home" button, and (in the current build) an additional "Generate PDF order" button. After Finish, the cart is cleared (cart badge disappears; cart.html shows 0 items).
- "Back Home" returns to inventory.html (Products page).
- The app currently does NOT block proceeding through checkout with an empty cart: clicking Checkout on an empty cart still opens Step One, and Step One/Two can be completed with $0 item total, $0 tax, $0 total, ultimately reaching checkout-complete.html. This contradicts the stated business rule "Cart cannot be empty when proceeding to checkout" and is flagged as an explicit test case to confirm/track actual vs. expected behavior.
- Using the browser Back button after reaching checkout-complete.html returns to checkout-step-two.html but with a stale/cleared cart ($0 totals); clicking Finish again from this stale page is NOT blocked and re-navigates to checkout-complete.html - a potential duplicate-submission edge case worth covering.
- Using the browser Back button from Step Two to Step One shows the Step One form with previously entered values cleared (fields blank again).

## Test Scenarios

### 1. Cart Review (AC1)

**Seed:** `tests/seed.spec.ts`

#### 1.1. TC-CART-001 - Cart displays single item with full details

**File:** `tests/cart/TC-CART-001.spec.ts`

**Steps:**
  1. Preconditions: Navigate to https://www.saucedemo.com, log in as standard_user/secret_sauce.
    - expect: User lands on /inventory.html (Products page).
  2. 1. On the Products page, click 'Add to cart' for 'Sauce Labs Backpack'.
    - expect: Button label changes to 'Remove'.
    - expect: Cart icon badge shows '1'.
  3. 2. Click the cart icon to navigate to the cart page (/cart.html).
    - expect: Page heading reads 'Your Cart'.
    - expect: Column headers 'QTY' and 'Description' are visible.
  4. 3. Verify the line item for Sauce Labs Backpack.
    - expect: QTY column shows '1'.
    - expect: Item name 'Sauce Labs Backpack' is a clickable link.
    - expect: Full product description text is displayed.
    - expect: Unit price '$29.99' is displayed.
    - expect: A 'Remove' button is present for the item.
  5. 4. Verify page-level controls.
    - expect: 'Continue Shopping' button is present and enabled.
    - expect: 'Checkout' button is present and enabled.

#### 1.2. TC-CART-002 - Cart displays multiple items with correct details for each

**File:** `tests/cart/TC-CART-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user. Cart is empty.
    - expect: User is on /inventory.html.
  2. 1. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to the cart from the Products page.
    - expect: Cart badge shows '2'.
  3. 2. Navigate to the cart page.
    - expect: Two line items are listed, one per row.
  4. 3. Verify each row independently.
    - expect: Row 1: QTY '1', name 'Sauce Labs Backpack', correct description, price '$29.99', Remove button.
    - expect: Row 2: QTY '1', name 'Sauce Labs Bike Light', correct description, price '$9.99', Remove button.
    - expect: Item order matches the order products were added (or a documented deterministic order).

#### 1.3. TC-CART-003 - Continue Shopping returns user to Products page

**File:** `tests/cart/TC-CART-003.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add at least one item to the cart, navigate to /cart.html.
    - expect: Cart page shows 1 item.
  2. 1. Click the 'Continue Shopping' button.
    - expect: User is redirected to /inventory.html.
    - expect: Previously added item(s) remain in the cart (badge count unchanged).

#### 1.4. TC-CART-004 - Proceed to Checkout from cart with items present

**File:** `tests/cart/TC-CART-004.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add at least one item to the cart, navigate to /cart.html.
    - expect: Cart shows at least 1 item.
  2. 1. Click the 'Checkout' button.
    - expect: User is redirected to /checkout-step-one.html.
    - expect: Page heading reads 'Checkout: Your Information'.
    - expect: Cart badge count is unchanged (items are still in cart, not yet finalized).

#### 1.5. TC-CART-005 - Removing an item from the cart updates the list

**File:** `tests/cart/TC-CART-005.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add 'Sauce Labs Backpack' and 'Sauce Labs Bike Light' to cart, navigate to /cart.html.
    - expect: Both items listed, cart badge shows '2'.
  2. 1. Click 'Remove' on the Sauce Labs Backpack row.
    - expect: Sauce Labs Backpack row disappears from the cart list.
    - expect: Sauce Labs Bike Light row remains with unchanged qty/price.
    - expect: Cart badge updates to '1' (or disappears if it was the only item).

#### 1.6. TC-CART-006-EmptyCart - Cart page with zero items shows no line items but retains action buttons

**File:** `tests/cart/TC-CART-006-EmptyCart.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with a cart that has never had items added (or all items removed).
    - expect: Cart badge is not shown.
  2. 1. Navigate to /cart.html.
    - expect: 'QTY' and 'Description' column headers are shown with no item rows beneath them.
    - expect: 'Continue Shopping' button is present.
    - expect: 'Checkout' button is present and clickable (document actual behavior - see TC-CHECKOUT-EDGE-001 for downstream consequences of proceeding with an empty cart).

### 2. Checkout Information Entry (AC2, Negative & Edge Cases)

**Seed:** `tests/seed.spec.ts`

#### 2.1. TC-CHECKOUT-INFO-001 - Checkout Information page displays required fields

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, click Checkout from the cart page.
    - expect: User is on /checkout-step-one.html.
  2. 1. Inspect the form.
    - expect: Page heading reads 'Checkout: Your Information'.
    - expect: A 'First Name' text field is present and empty.
    - expect: A 'Last Name' text field is present and empty.
    - expect: A 'Zip/Postal Code' text field is present and empty.
    - expect: A 'Cancel' button and a 'Continue' button are present.

#### 2.2. TC-CHECKOUT-INFO-002 - Valid data in all fields allows proceeding to Overview

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Form is displayed with empty fields.
  2. 1. Enter First Name = 'John'.
    - expect: Text is accepted into the field.
  3. 2. Enter Last Name = 'Doe'.
    - expect: Text is accepted into the field.
  4. 3. Enter Zip/Postal Code = '12345'.
    - expect: Text is accepted into the field.
  5. 4. Click 'Continue'.
    - expect: User is redirected to /checkout-step-two.html.
    - expect: No error message is shown.
    - expect: Page heading reads 'Checkout: Overview'.

#### 2.3. TC-CHECKOUT-INFO-003-EmptyFirstName - Leaving First Name empty blocks Continue with correct error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-003-EmptyFirstName.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Leave First Name empty. Enter Last Name = 'Doe' and Zip = '12345'.
    - expect: Only First Name field remains empty.
  3. 2. Click 'Continue'.
    - expect: User remains on /checkout-step-one.html.
    - expect: An error banner reading exactly 'Error: First Name is required' is displayed.
    - expect: First Name and any other invalid field are visually flagged (red outline/icon).

#### 2.4. TC-CHECKOUT-INFO-004-EmptyLastName - Leaving Last Name empty blocks Continue with correct error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-004-EmptyLastName.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Enter First Name = 'John'. Leave Last Name empty. Enter Zip = '12345'.
    - expect: Only Last Name field remains empty.
  3. 2. Click 'Continue'.
    - expect: User remains on /checkout-step-one.html.
    - expect: An error banner reading exactly 'Error: Last Name is required' is displayed.

#### 2.5. TC-CHECKOUT-INFO-005-EmptyZip - Leaving Zip/Postal Code empty blocks Continue with correct error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-005-EmptyZip.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Enter First Name = 'John' and Last Name = 'Doe'. Leave Zip/Postal Code empty.
    - expect: Only Zip field remains empty.
  3. 2. Click 'Continue'.
    - expect: User remains on /checkout-step-one.html.
    - expect: An error banner reading exactly 'Error: Postal Code is required' is displayed.

#### 2.6. TC-CHECKOUT-INFO-006-AllFieldsEmpty - Clicking Continue with all fields empty shows First Name error first

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-006-AllFieldsEmpty.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All three fields are empty.
  2. 1. Without entering any data, click 'Continue'.
    - expect: User remains on /checkout-step-one.html.
    - expect: Error banner reads 'Error: First Name is required' (validated field-by-field, First Name checked first).
  3. 2. Fill First Name and click Continue again (leaving Last Name/Zip empty).
    - expect: Error banner now updates to 'Error: Last Name is required', confirming sequential field validation order First Name -> Last Name -> Postal Code.

#### 2.7. TC-CHECKOUT-INFO-007 - Error message can be dismissed

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-007.spec.ts`

**Steps:**
  1. Preconditions: Trigger the 'Error: First Name is required' banner per TC-CHECKOUT-INFO-003.
    - expect: Error banner is visible with a close ('X') control.
  2. 1. Click the close icon on the error banner.
    - expect: Error banner is dismissed/hidden.
    - expect: Form fields remain as previously entered (not cleared).

#### 2.8. TC-CHECKOUT-INFO-008-Boundary-WhitespaceOnly - Whitespace-only input is evaluated for required-field validation

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-008-WhitespaceOnly.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Enter a single space character ' ' into First Name, a valid Last Name 'Doe', and a valid Zip '12345'.
    - expect: Space character is accepted into the field visually.
  3. 2. Click 'Continue'.
    - expect: Document actual behavior: either (a) the app treats whitespace as satisfying 'required' and proceeds to /checkout-step-two.html, or (b) the app still shows 'Error: First Name is required'. Record which behavior is observed as this is a boundary condition with no explicit spec coverage.

#### 2.9. TC-CHECKOUT-INFO-009-Boundary-VeryLongInput - Very long values in each field are accepted without truncation or crash

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-009-VeryLongInput.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Enter a 250-character string of letters into First Name, a 250-character string into Last Name, and a 100-character alphanumeric string into Zip/Postal Code.
    - expect: All three fields accept the full input without client-side truncation (or note the actual max-length enforced, if any).
  3. 2. Click 'Continue'.
    - expect: No JavaScript error occurs (verify no new console errors).
    - expect: User is redirected to /checkout-step-two.html with the overview page rendering normally (no layout break).

#### 2.10. TC-CHECKOUT-INFO-010-SpecialCharacters - Special characters and script-like input are accepted as literal text (no validation, no XSS execution)

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-010-SpecialCharacters.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Enter First Name = '<script>alert(1)</script>@@##$$%%'.
    - expect: Text is accepted into the field as-is; no JavaScript alert dialog fires while typing.
  3. 2. Enter Last Name = "O'Brien-Smith Jr. 123".
    - expect: Text is accepted including apostrophe, hyphen, and digits.
  4. 3. Enter Zip/Postal Code = '!!!###'.
    - expect: Text is accepted.
  5. 4. Click 'Continue'.
    - expect: No 'required' validation error appears (fields are non-empty, so required-field check passes).
    - expect: No JavaScript alert/dialog is triggered (confirms no script execution / stored XSS).
    - expect: User is redirected to /checkout-step-two.html and the overview page renders normally with no layout corruption.

#### 2.11. TC-CHECKOUT-INFO-011-NumericFirstName - Numeric/non-alphabetic values in Name fields are accepted (no format validation)

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-011-NumericFirstName.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: All fields empty.
  2. 1. Enter First Name = '12345', Last Name = '67890', Zip = 'ABCDE'.
    - expect: All values accepted into their fields (letters allowed in zip, numbers allowed in name - confirms no field-specific format/pattern validation is enforced).
  3. 2. Click 'Continue'.
    - expect: User proceeds to /checkout-step-two.html without any validation error, confirming the app only checks for 'required' (non-empty), not format.

#### 2.12. TC-CHECKOUT-INFO-012-NotLoggedIn - Direct navigation to checkout page while logged out redirects to login with an error

**File:** `tests/checkout-information/TC-CHECKOUT-INFO-012-NotLoggedIn.spec.ts`

**Steps:**
  1. Preconditions: Ensure no active session (clear cookies/local storage, or open a fresh browser context). Do not log in.
    - expect: User is not authenticated.
  2. 1. Navigate directly to https://www.saucedemo.com/checkout-step-one.html.
    - expect: User is redirected to the login page (https://www.saucedemo.com/).
    - expect: An error banner is shown reading "Epic sadface: You can only access '/checkout-step-one.html' when you are logged in."
    - expect: Username and Password fields are empty/available for login.

### 3. Order Overview (AC3)

**Seed:** `tests/seed.spec.ts`

#### 3.1. TC-CHECKOUT-OVERVIEW-001 - Overview page shows item summary matching cart contents

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to cart. Proceed to Checkout, enter valid First Name/Last Name/Zip, click Continue.
    - expect: User is redirected to /checkout-step-two.html.
  2. 1. Verify page heading and item rows.
    - expect: Heading reads 'Checkout: Overview'.
    - expect: Two item rows are shown, matching exactly the items/qty/price that were in the cart (Backpack qty 1 @ $29.99, Bike Light qty 1 @ $9.99).
    - expect: Product names, descriptions, and prices match what was seen on the cart page (no data loss/mutation between cart and overview).

#### 3.2. TC-CHECKOUT-OVERVIEW-002 - Overview page shows Payment and Shipping Information sections

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-002.spec.ts`

**Steps:**
  1. Preconditions: Reach /checkout-step-two.html with at least one item in cart (per happy path).
    - expect: Overview page is displayed.
  2. 1. Locate the Payment Information section.
    - expect: Label 'Payment Information:' is shown with value 'SauceCard #31337'.
  3. 2. Locate the Shipping Information section.
    - expect: Label 'Shipping Information:' is shown with value 'Free Pony Express Delivery!'.

#### 3.3. TC-CHECKOUT-OVERVIEW-003 - Price Total block computes Item total, Tax, and Total correctly for a single item

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-003.spec.ts`

**Steps:**
  1. Preconditions: Log in, add only 'Sauce Labs Backpack' ($29.99) to the cart, proceed through checkout info with valid data to reach /checkout-step-two.html.
    - expect: Overview page shows one line item at $29.99.
  2. 1. Read the 'Item total' value.
    - expect: Item total equals '$29.99' (sum of line item prices).
  3. 2. Read the 'Tax' value.
    - expect: Tax equals '$2.40' (~8% of item total, confirm exact tax rate/rounding used by the app).
  4. 3. Read the 'Total' value.
    - expect: Total equals Item total + Tax = '$32.39'.

#### 3.4. TC-CHECKOUT-OVERVIEW-004 - Price Total block computes correctly for multiple items

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-004.spec.ts`

**Steps:**
  1. Preconditions: Log in, add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to cart, proceed through checkout info with valid data to reach /checkout-step-two.html.
    - expect: Overview page shows two line items.
  2. 1. Read the 'Item total' value.
    - expect: Item total equals '$39.98' (29.99 + 9.99).
  3. 2. Read the 'Tax' value.
    - expect: Tax equals '$3.20' (~8% of $39.98, rounded per app logic).
  4. 3. Read the 'Total' value.
    - expect: Total equals '$43.18' (Item total + Tax).

#### 3.5. TC-CHECKOUT-OVERVIEW-005 - Overview page presents Cancel and Finish options

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-005.spec.ts`

**Steps:**
  1. Preconditions: Reach /checkout-step-two.html with at least one item in cart.
    - expect: Overview page is displayed.
  2. 1. Verify action buttons.
    - expect: A 'Cancel' button is visible and enabled.
    - expect: A 'Finish' button is visible and enabled.

#### 3.6. TC-CHECKOUT-OVERVIEW-006-Boundary-AllProducts - Overview correctly totals the maximum available product set (6 items)

**File:** `tests/checkout-overview/TC-CHECKOUT-OVERVIEW-006-AllProducts.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart.
    - expect: Cart badge not shown.
  2. 1. From the Products page, click 'Add to cart' for all 6 available products (Backpack $29.99, Bike Light $9.99, Bolt T-Shirt $15.99, Fleece Jacket $49.99, Onesie $7.99, Test.allTheThings() T-Shirt (Red) $15.99).
    - expect: Cart badge shows '6'.
  3. 2. Proceed to Checkout, enter valid info, click Continue to reach the Overview page.
    - expect: All 6 line items are listed with correct name/description/price/qty=1 each.
  4. 3. Verify totals.
    - expect: Item total equals the sum of all 6 prices ($129.94).
    - expect: Tax is ~8% of item total.
    - expect: Total equals Item total + Tax, with no rounding/calculation errors and no UI truncation of the list.

### 4. Order Completion (AC4)

**Seed:** `tests/seed.spec.ts`

#### 4.1. TC-CHECKOUT-COMPLETE-001 - Clicking Finish completes the order and shows confirmation

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add at least one item to cart, complete checkout info with valid data, reach /checkout-step-two.html.
    - expect: Overview page is displayed with correct totals.
  2. 1. Click 'Finish'.
    - expect: User is redirected to /checkout-complete.html.
    - expect: Page heading reads 'Checkout: Complete!'.
    - expect: A success message 'Thank you for your order!' is displayed.
    - expect: A confirming sentence about dispatch/delivery is shown.
    - expect: A Pony Express image/icon is displayed.
    - expect: A 'Back Home' button is present and enabled.

#### 4.2. TC-CHECKOUT-COMPLETE-002 - Order completion clears the cart

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add 2 items to cart, complete the full checkout flow through to /checkout-complete.html (per TC-CHECKOUT-COMPLETE-001).
    - expect: Order confirmation page is displayed; cart icon badge is no longer visible on the header.
  2. 1. Navigate directly to /cart.html.
    - expect: Cart page shows zero line items (no QTY/Description rows).
    - expect: 'Continue Shopping' and 'Checkout' buttons are still present but the cart itself is empty, confirming the cart was cleared by order completion.

#### 4.3. TC-CHECKOUT-COMPLETE-003 - Back Home button returns to the Products page

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-003.spec.ts`

**Steps:**
  1. Preconditions: Complete an order per TC-CHECKOUT-COMPLETE-001, arriving at /checkout-complete.html.
    - expect: Confirmation page displayed.
  2. 1. Click 'Back Home'.
    - expect: User is redirected to /inventory.html (Products page).
    - expect: Product grid is fully rendered with all 'Add to cart' buttons available (none pre-selected, since the cart was cleared).

#### 4.4. TC-CHECKOUT-COMPLETE-004 - Order confirmation is reachable only after a completed checkout (no direct-access shortcut without a session cart flow)

**File:** `tests/checkout-complete/TC-CHECKOUT-COMPLETE-004.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart (never added items).
    - expect: User is on /inventory.html.
  2. 1. Navigate directly to /checkout-complete.html without going through Steps One/Two.
    - expect: Document actual behavior: whether the app blocks direct access (redirect/error) or renders the confirmation page anyway. Record findings, since SauceDemo is known to be permissive about direct route access when logged in.

### 5. Error Handling and Field Validation (AC5)

**Seed:** `tests/seed.spec.ts`

#### 5.1. TC-CHECKOUT-ERROR-001 - User cannot proceed past Step One until all three fields are non-empty

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Form fields empty.
  2. 1. Click Continue with all fields empty.
    - expect: Blocked with 'Error: First Name is required'; URL remains /checkout-step-one.html.
  3. 2. Fill only First Name, click Continue.
    - expect: Blocked with 'Error: Last Name is required'; URL remains /checkout-step-one.html.
  4. 3. Fill Last Name also, click Continue.
    - expect: Blocked with 'Error: Postal Code is required'; URL remains /checkout-step-one.html.
  5. 4. Fill Zip/Postal Code also, click Continue.
    - expect: User successfully proceeds to /checkout-step-two.html, confirming all three fields are enforced as mandatory and the user cannot bypass validation at any stage.

#### 5.2. TC-CHECKOUT-ERROR-002 - Error banner text and visibility are correct and specific per missing field

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Fields empty.
  2. 1. Trigger each of the three required-field errors independently (one at a time, per TC-CHECKOUT-INFO-003/004/005).
    - expect: Each error message text is exact: 'Error: First Name is required', 'Error: Last Name is required', 'Error: Postal Code is required' respectively.
    - expect: Each error banner is visually distinct (e.g., red background/border) and includes a dismiss (X) control.
    - expect: Offending input field(s) are highlighted (e.g., red outline).

#### 5.3. TC-CHECKOUT-ERROR-003 - Re-submitting after fixing the invalid field clears the error and proceeds

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-003.spec.ts`

**Steps:**
  1. Preconditions: Trigger 'Error: Postal Code is required' (First Name and Last Name filled, Zip empty), per TC-CHECKOUT-INFO-005.
    - expect: Error banner visible.
  2. 1. Enter a valid Zip/Postal Code value.
    - expect: Field now contains valid data (error banner may persist until re-submission depending on app behavior - record actual behavior).
  3. 2. Click 'Continue' again.
    - expect: Error banner is no longer shown.
    - expect: User is redirected to /checkout-step-two.html.

#### 5.4. TC-CHECKOUT-ERROR-004-EdgeCase-EmptyCartThroughCheckout - Proceeding through checkout with an empty cart is not blocked by the app (documents a business-rule gap)

**File:** `tests/error-handling/TC-CHECKOUT-ERROR-004-EmptyCartThroughCheckout.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart (no items added, or all items removed/consumed by a prior completed order).
    - expect: Cart badge not shown; /cart.html shows zero items.
  2. 1. From the empty cart page, click 'Checkout'.
    - expect: Actual observed behavior: user IS allowed to reach /checkout-step-one.html despite an empty cart (no blocking message), which conflicts with the stated business rule 'Cart cannot be empty when proceeding to checkout'. Flag as a defect/gap for stakeholder review if a hard block is truly required.
  3. 2. Enter valid First Name/Last Name/Zip and click Continue.
    - expect: User reaches /checkout-step-two.html showing no item rows, Item total '$0', Tax '$0.00', Total '$0.00'.
  4. 3. Click 'Finish'.
    - expect: User reaches /checkout-complete.html with the standard 'Thank you for your order!' confirmation, despite no items ever being purchased. Record this as a confirmed gap versus the stated business rule for defect tracking / product decision.

### 6. Navigation Flow: Cancel and Browser Back Button

**Seed:** `tests/seed.spec.ts`

#### 6.1. TC-CHECKOUT-NAV-001 - Cancel on Checkout Step One returns to the Cart page

**File:** `tests/navigation/TC-CHECKOUT-NAV-001.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html.
    - expect: Step One form displayed.
  2. 1. Click the 'Cancel' button (without entering any data).
    - expect: User is redirected to /cart.html.
    - expect: The item added earlier is still present in the cart (cancel does not clear the cart).

#### 6.2. TC-CHECKOUT-NAV-002 - Cancel on Checkout Overview returns to the Products page (not the Cart)

**File:** `tests/navigation/TC-CHECKOUT-NAV-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, complete Step One with valid data, reach /checkout-step-two.html.
    - expect: Overview page displayed with 1 item and correct totals.
  2. 1. Click the 'Cancel' button.
    - expect: User is redirected to /inventory.html (Products page) - NOT to /cart.html. This is a confirmed asymmetry versus Cancel-on-Step-One and should be explicitly called out if product intent was 'return to cart' at every step.
  3. 2. Navigate to /cart.html to check cart state.
    - expect: The item that was in the cart before cancel is still present (cancel does not clear the cart, it only changes navigation destination).

#### 6.3. TC-CHECKOUT-NAV-003 - Browser Back button from Step Two returns to Step One with cleared form fields

**File:** `tests/navigation/TC-CHECKOUT-NAV-003.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, fill valid First Name/Last Name/Zip on Step One, click Continue to reach /checkout-step-two.html.
    - expect: Overview page displayed.
  2. 1. Click the browser's Back button.
    - expect: Browser navigates back to /checkout-step-one.html.
    - expect: First Name, Last Name, and Zip/Postal Code fields are EMPTY (previously entered values are not restored), since the SPA does not persist form state in browser history.

#### 6.4. TC-CHECKOUT-NAV-004 - Browser Back button after order completion shows a stale, zeroed-out Overview page

**File:** `tests/navigation/TC-CHECKOUT-NAV-004.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add one item to cart, complete the full checkout flow through Finish to reach /checkout-complete.html.
    - expect: Order confirmation page displayed; cart is cleared.
  2. 1. Click the browser's Back button.
    - expect: Browser navigates to /checkout-step-two.html, but since the cart was already cleared by the completed order, the page shows NO item rows, Item total '$0', Tax '$0.00', Total '$0.00' (a stale view of an already-finalized/emptied cart).

#### 6.5. TC-CHECKOUT-NAV-005-EdgeCase-DuplicateFinish - Clicking Finish again on the stale post-completion Overview page does not block a second confirmation

**File:** `tests/navigation/TC-CHECKOUT-NAV-005-DuplicateFinish.spec.ts`

**Steps:**
  1. Preconditions: Complete TC-CHECKOUT-NAV-004 so the browser is showing the stale /checkout-step-two.html with $0 totals after using Back post-order.
    - expect: Stale Overview page displayed with $0 totals.
  2. 1. Click 'Finish' again.
    - expect: Actual observed behavior: the app allows navigation back to /checkout-complete.html again showing the same 'Thank you for your order!' confirmation, even though no real order/cart content exists at this point. Record this as a potential duplicate-submission edge case for defect tracking, since a real order-processing system would be expected to prevent re-finishing a stale/empty checkout.

#### 6.6. TC-CHECKOUT-NAV-006 - Browser Back button from Step One (after Cancel) does not resurrect a cleared cart state incorrectly

**File:** `tests/navigation/TC-CHECKOUT-NAV-006.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add an item to cart, navigate to /checkout-step-one.html, click Cancel to land on /cart.html.
    - expect: Cart shows the item, user on /cart.html.
  2. 1. Click the browser's Back button.
    - expect: Browser navigates back to /checkout-step-one.html.
    - expect: Form is shown with empty fields (no residual data), and the cart item count/badge is unchanged from before Cancel was clicked.

#### 6.7. TC-CHECKOUT-NAV-007 - Cancel from Step One when cart has multiple items preserves all items

**File:** `tests/navigation/TC-CHECKOUT-NAV-007.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user, add 3 different items to the cart, click Checkout to reach /checkout-step-one.html.
    - expect: Cart badge shows '3' before proceeding.
  2. 1. Click 'Cancel'.
    - expect: User is redirected to /cart.html.
    - expect: All 3 items are still present with correct qty/name/price for each, confirming Cancel never mutates cart contents.

### 7. Full End-to-End Happy Path (Cross-cutting Smoke Tests)

**Seed:** `tests/seed.spec.ts`

#### 7.1. TC-CHECKOUT-E2E-001 - Complete guest-style checkout for a single item from login to confirmation (Smoke)

**File:** `tests/e2e/TC-CHECKOUT-E2E-001.spec.ts`

**Steps:**
  1. Preconditions: Fresh browser session, not logged in.
    - expect: Login page displayed at https://www.saucedemo.com.
  2. 1. Log in with username 'standard_user' and password 'secret_sauce'.
    - expect: User lands on /inventory.html.
  3. 2. Click 'Add to cart' for 'Sauce Labs Backpack'.
    - expect: Cart badge shows '1'; button changes to 'Remove'.
  4. 3. Click the cart icon to go to /cart.html.
    - expect: Sauce Labs Backpack listed with qty 1, price $29.99.
  5. 4. Click 'Checkout'.
    - expect: User lands on /checkout-step-one.html.
  6. 5. Enter First Name = 'John', Last Name = 'Doe', Zip = '12345'. Click 'Continue'.
    - expect: User lands on /checkout-step-two.html showing 1 item, Item total $29.99, Tax $2.40, Total $32.39.
  7. 6. Click 'Finish'.
    - expect: User lands on /checkout-complete.html with 'Thank you for your order!' message and a 'Back Home' button.
  8. 7. Click 'Back Home'.
    - expect: User returns to /inventory.html; cart badge is no longer shown, confirming the cart was cleared by the completed order.

#### 7.2. TC-CHECKOUT-E2E-002 - Complete checkout with multiple items and verify math end-to-end (Smoke)

**File:** `tests/e2e/TC-CHECKOUT-E2E-002.spec.ts`

**Steps:**
  1. Preconditions: Log in as standard_user with an empty cart.
    - expect: User on /inventory.html.
  2. 1. Add 'Sauce Labs Backpack' ($29.99), 'Sauce Labs Bike Light' ($9.99), and 'Sauce Labs Bolt T-Shirt' ($15.99) to the cart.
    - expect: Cart badge shows '3'.
  3. 2. Navigate to /cart.html and verify all 3 items with correct names/descriptions/prices/qty.
    - expect: All 3 rows correct; 'Checkout' button enabled.
  4. 3. Click 'Checkout', enter valid First Name/Last Name/Zip, click 'Continue'.
    - expect: Overview page shows all 3 items; Item total = $55.97; Tax = ~8% ($4.48); Total = ~$60.45 (verify against actual app rounding).
  5. 4. Click 'Finish'.
    - expect: Order confirmation page displayed with success message.
  6. 5. Navigate to /cart.html.
    - expect: Cart is empty (0 items), confirming all 3 items were cleared after order completion.
