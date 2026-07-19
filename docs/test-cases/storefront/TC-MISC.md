# Test Cases — Specials, Manufacturer/Brands, Gift Vouchers, Currency

Module: Storefront / Specials, Manufacturer, Vouchers, Currency

---

```
Test Case ID:      TC-SPECIAL-001
Title:              Specials page lists only products with an active discount
Module:             Storefront / Specials
Priority:           Medium
Type:               Functional
Preconditions:      At least one product has an active Special price
Test Data:          N/A
Steps:              1. Navigate to the "Specials" page (footer → Extras →
                        Specials).
Expected Result:    Every listed product shows a strike-through original
                     price and a lower special price.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Specials/Manufacturer
```

```
Test Case ID:      TC-MANUFACTURER-002
Title:              Brand page filters products to the selected manufacturer
Module:             Storefront / Manufacturer
Priority:           Medium
Type:               Functional
Preconditions:      Products are assigned to manufacturers in demo data
Test Data:          Manufacturer: Apple
Steps:              1. Navigate to "Brands" (footer → Extras → Brands).
                     2. Select "Apple".
Expected Result:    All returned products are assigned to the Apple
                     manufacturer.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Specials/Manufacturer
```

```
Test Case ID:      TC-VOUCHER-003
Title:              Gift voucher purchase flow completes successfully
Module:             Storefront / Gift Vouchers
Priority:           Low
Type:               Functional
Preconditions:      None
Test Data:          Recipient name/email, amount, message, payment: Cash
                     on Delivery
Steps:              1. Navigate to Account → Gift Certificates (footer →
                        Extras → Gift Certificates).
                     2. Fill recipient details and amount.
                     3. Complete the purchase checkout flow.
Expected Result:    Confirmation shown; voucher order appears in Admin →
                     Sales → Orders (or Gift Voucher list).
Postconditions:     None
Traceability:       Workflow 4 (Coupon/voucher checkout) — voucher purchase
                     documented only, not automated in this pass
```

```
Test Case ID:      TC-CURRENCY-004
Title:              Currency selection persists across navigation and affects checkout total
Module:             Storefront / Currency
Priority:           Low
Type:               Functional
Preconditions:      Multiple currencies configured (EUR, GBP, USD)
Test Data:          Switch to GBP
Steps:              1. Switch currency to GBP on the home page.
                     2. Add a product to cart.
                     3. Proceed to the cart/checkout page.
Expected Result:    All prices, including the cart/checkout total, display
                     in GBP-formatted values.
Postconditions:     Reset currency to default.
Traceability:       CLAUDE.md Storefront Test Scenarios — Currency Switching
```
