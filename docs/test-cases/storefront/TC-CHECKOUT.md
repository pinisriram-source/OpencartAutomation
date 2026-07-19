# Test Cases — Checkout

Module: Storefront / Checkout (Guest & Registered)

---

```
Test Case ID:      TC-CHECKOUT-001
Title:              Guest can complete checkout end-to-end with valid details
Module:             Storefront / Checkout
Priority:           Critical
Type:               Smoke
Preconditions:      Cart contains a shippable product
Test Data:          Guest address: valid firstname/lastname/email/telephone/
                     address/city/postcode/country/zone; payment method:
                     Cash on Delivery; T&C agreed
Steps:              1. From the cart, proceed to Checkout.
                     2. Choose "Checkout as Guest".
                     3. Enter billing address details; continue.
                     4. Select a shipping method; continue.
                     5. Select a payment method; continue.
                     6. Agree to Terms & Conditions; confirm order.
Expected Result:    Order confirmation page is displayed with an order
                     number; order appears in Admin → Sales → Orders with
                     matching customer name and total.
Postconditions:     None (order remains for traceability)
Traceability:       Workflow 1 (Guest checkout smoke path)
```

```
Test Case ID:      TC-CHECKOUT-002-MissingRequiredAddress
Title:              Checkout blocks progression when required address fields are missing
Module:             Storefront / Checkout
Priority:           High
Type:               Negative
Preconditions:      Cart has a product; guest checkout selected
Test Data:          Address form with First Name left blank
Steps:              1. Reach the Billing Details step.
                     2. Leave First Name blank; fill the rest.
                     3. Click Continue.
Expected Result:    Inline validation error on First Name; step does not
                     advance.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Checkout Guest
```

```
Test Case ID:      TC-CHECKOUT-003-InvalidEmail
Title:              Checkout rejects a malformed email address
Module:             Storefront / Checkout
Priority:           Medium
Type:               Negative
Preconditions:      Cart has a product; guest checkout selected
Test Data:          Email: "not-an-email"
Steps:              1. At Billing Details, enter an invalid email format.
                     2. Click Continue.
Expected Result:    Validation error shown for the email field; step does
                     not advance.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Checkout Guest
```

```
Test Case ID:      TC-CHECKOUT-004
Title:              Selecting a different shipping method updates the order total
Module:             Storefront / Checkout
Priority:           High
Type:               Functional
Preconditions:      Cart has a shippable product; billing address entered;
                     2+ shipping methods configured
Test Data:          Two shipping options (e.g., Flat Rate vs. Free Shipping)
Steps:              1. At the Delivery Method step, select the option with
                        a non-zero cost; note the running total.
                     2. Switch to the free-shipping option (if available).
Expected Result:    Order total decreases by the shipping cost difference
                     when switching to the cheaper/free option.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Checkout Guest
```

```
Test Case ID:      TC-CHECKOUT-005
Title:              Order cannot be confirmed without agreeing to Terms & Conditions
Module:             Storefront / Checkout
Priority:           High
Type:               Negative
Preconditions:      All prior checkout steps completed
Test Data:          Terms checkbox left unchecked
Steps:              1. Reach the Confirm Order step.
                     2. Leave the "I have read and agree to the Terms &
                        Conditions" checkbox unchecked.
                     3. Click "Confirm Order".
Expected Result:    Warning shown requiring agreement; order is not placed.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Checkout Guest
```

```
Test Case ID:      TC-CHECKOUT-006
Title:              Order comment entered at checkout appears on the admin order detail
Module:             Storefront / Checkout
Priority:           Low
Type:               Functional
Preconditions:      All prior checkout steps completed
Test Data:          Comment: "Please deliver after 6pm"
Steps:              1. At the Confirm Order step, enter an order comment.
                     2. Confirm the order.
                     3. In Admin → Sales → Orders, open the placed order.
Expected Result:    The comment text appears in the order's history/
                     comment section in admin.
Postconditions:     None
Traceability:       Workflow 6 (Admin order lifecycle)
```

```
Test Case ID:      TC-CHECKOUT-007
Title:              Registered customer can reuse a saved address book entry at checkout
Module:             Storefront / Checkout (Registered)
Priority:           High
Type:               Functional
Preconditions:      Logged-in customer with a saved address in their address
                     book
Test Data:          Existing saved address
Steps:              1. Log in; add a product to cart; proceed to checkout.
                     2. At Billing Details, select the saved address instead
                        of entering a new one.
Expected Result:    Address fields populate from the saved entry; checkout
                     proceeds without re-entering address details.
Postconditions:     None
Traceability:       Workflow 2 (Registration → checkout)
```

```
Test Case ID:      TC-CHECKOUT-008
Title:              Registered customer's order appears in their Order History
Module:             Storefront / Checkout (Registered) / Account
Priority:           Critical
Type:               Smoke
Preconditions:      Logged-in customer completes checkout
Test Data:          Any in-stock product
Steps:              1. Complete checkout while logged in.
                     2. Navigate to Account → Order History.
Expected Result:    The just-placed order appears with matching order ID,
                     date, and total; order detail view matches the items
                     purchased.
Postconditions:     None
Traceability:       Workflow 2 (Registration → checkout)
```
