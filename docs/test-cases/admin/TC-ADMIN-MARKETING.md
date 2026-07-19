# Test Cases — Admin Marketing & System (Coupons, Tax, Access Control)

Module: Admin / Marketing (Coupons), System (Localisation), Users

---

```
Test Case ID:      TC-ADMIN-MKT-001
Title:              Admin can create a percentage-discount coupon
Module:             Admin / Marketing / Coupons
Priority:           Critical
Type:               Functional
Preconditions:      Logged in as admin
Test Data:          Unique coupon code, Type: Percentage, Discount: 10,
                     Uses Per Coupon/Customer: unlimited, active date range
                     including today, Status: Enabled
Steps:              1. Navigate to Marketing → Coupons → Add New.
                     2. Fill Coupon Name, Code, Type, Discount, date range,
                        Status.
                     3. Save.
Expected Result:    Success alert; coupon appears in the Coupons list with
                     matching code and discount.
Postconditions:     None (coupon reused by TC-CART-004 / checkout spec)
Traceability:       Workflow 4 (Coupon/voucher checkout)
```

```
Test Case ID:      TC-ADMIN-MKT-002-DuplicateCode
Title:              Coupon creation rejects a duplicate coupon code
Module:             Admin / Marketing / Coupons
Priority:           Medium
Type:               Negative
Preconditions:      A coupon with a known code already exists
Test Data:          The existing coupon's code
Steps:              1. Add New Coupon; enter the same code as an existing
                        coupon.
                     2. Save.
Expected Result:    Validation error indicating the code must be unique;
                     coupon not created.
Postconditions:     None
Traceability:       CLAUDE.md Admin Test Scenarios — Marketing
```

```
Test Case ID:      TC-ADMIN-MKT-003
Title:              A coupon past its Date End is rejected at storefront checkout
Module:             Admin / Marketing / Coupons ↔ Storefront / Cart
Priority:           Medium
Type:               Negative
Preconditions:      A coupon exists with Date End in the past
Test Data:          Expired coupon code
Steps:              1. Add a product to cart on the storefront.
                     2. Apply the expired coupon code.
Expected Result:    Storefront shows an "invalid or expired" error; no
                     discount applied.
Postconditions:     None
Traceability:       Workflow 4 (Coupon/voucher checkout)
```

```
Test Case ID:      TC-ADMIN-MKT-004
Title:              A coupon's minimum total requirement is enforced at checkout
Module:             Admin / Marketing / Coupons ↔ Storefront / Cart
Priority:           Medium
Type:               Negative
Preconditions:      Coupon configured with Total Amount minimum higher than
                     the current cart subtotal
Test Data:          Coupon with Total Amount = $1000
Steps:              1. Add a low-value product to cart.
                     2. Apply the coupon.
Expected Result:    Error indicating the cart total does not meet the
                     coupon's minimum requirement; discount not applied.
Postconditions:     None
Traceability:       Workflow 4 (Coupon/voucher checkout)
```

```
Test Case ID:      TC-ADMIN-TAX-005
Title:              Adding a new Tax Rate updates storefront price calculations
Module:             Admin / System / Localisation / Taxes
Priority:           Low
Type:               Functional
Preconditions:      A product is assigned a taxable Tax Class
Test Data:          New Tax Rate (e.g., 5% "Test Rate") added to the
                     product's Tax Class
Steps:              1. Navigate to System → Localisation → Taxes → Tax
                        Rates → Add New; create the rate.
                     2. Add the rate to the relevant Tax Class.
                     3. View the product's storefront page.
Expected Result:    "Ex Tax" price plus the new tax rate matches the
                     displayed gross price.
Postconditions:     Remove the test tax rate from the class; delete it.
Traceability:       CLAUDE.md Admin Test Scenarios — System/Localisation
```

```
Test Case ID:      TC-ADMIN-ACL-006
Title:              A restricted User Group cannot access a disallowed admin menu
Module:             Admin / System / Users / User Groups
Priority:           Medium
Type:               Negative
Preconditions:      A User Group exists with no permissions on
                     Sales → Orders
Test Data:          A user assigned to the restricted group
Steps:              1. Log in to admin as the restricted user.
                     2. Attempt to navigate directly to Sales → Orders
                        (via URL or menu, if visible).
Expected Result:    "Permission Denied!" page is shown instead of the
                     Orders list.
Postconditions:     None
Traceability:       Workflow 10 (Admin access control) — documented only,
                     not automated in this pass
```

```
Test Case ID:      TC-ADMIN-REPORT-007
Title:              Sales report reflects an order placed during the test run
Module:             Admin / Reports
Priority:           Low
Type:               Functional
Preconditions:      An order was placed today via the storefront
Test Data:          Report date range covering today
Steps:              1. Navigate to Reports → Sales → Orders.
                     2. Set the date range to include today; generate.
Expected Result:    Report includes the test order's total within the
                     aggregated figures for today.
Postconditions:     None
Traceability:       CLAUDE.md Admin Test Scenarios — Reports
```
