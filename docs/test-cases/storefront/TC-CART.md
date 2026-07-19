# Test Cases — Cart

Module: Storefront / Shopping Cart

---

```
Test Case ID:      TC-CART-001
Title:              Adding a product creates a cart line item with correct totals
Module:             Storefront / Cart
Priority:           Critical
Type:               Smoke
Preconditions:      Cart empty
Test Data:          Product: MacBook, qty 1
Steps:              1. Add MacBook to cart from its product page.
                     2. Navigate to the cart page.
Expected Result:    One line item for MacBook at qty 1; sub-total, tax (if
                     applicable), and total match the product's listed price.
Postconditions:     Clear cart.
Traceability:       Workflow 1 (Guest checkout smoke path)
```

```
Test Case ID:      TC-CART-002
Title:              Updating quantity recalculates the line and cart totals
Module:             Storefront / Cart
Priority:           High
Type:               Functional
Preconditions:      MacBook already in cart at qty 1
Test Data:          New quantity: 2
Steps:              1. On the cart page, change MacBook's quantity to 2.
                     2. Click Update.
Expected Result:    Line total doubles; cart subtotal/total recompute
                     correctly.
Postconditions:     Clear cart.
Traceability:       Workflow 3 (Product options → cart pricing)
```

```
Test Case ID:      TC-CART-003
Title:              Removing a line item updates totals and empties the cart when last item
Module:             Storefront / Cart
Priority:           High
Type:               Functional
Preconditions:      One product in cart
Test Data:          Product: MacBook
Steps:              1. On the cart page, click Remove on the MacBook line.
Expected Result:    Line item disappears; cart shows an empty-cart state;
                     header cart total resets to "0 item(s) - $0.00".
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Cart
```

```
Test Case ID:      TC-CART-004
Title:              Applying a valid coupon reduces the cart total
Module:             Storefront / Cart
Priority:           High
Type:               Functional
Preconditions:      Cart has a product whose subtotal meets the coupon's
                     minimum total requirement; a valid, active coupon code
                     exists (created via Admin → Marketing → Coupons)
Test Data:          Coupon code created by the automated coupon test
                     (e.g., 10% off, no minimum)
Steps:              1. On the cart page, enter the coupon code in "Enter
                        your coupon here".
                     2. Click "Apply Coupon".
Expected Result:    Success message shown; order total line reflects the
                     coupon discount.
Postconditions:     None
Traceability:       Workflow 4 (Coupon/voucher checkout)
```

```
Test Case ID:      TC-CART-005-InvalidCoupon
Title:              Applying an invalid/expired coupon shows an error and does not discount
Module:             Storefront / Cart
Priority:           Medium
Type:               Negative
Preconditions:      Cart has at least one product
Test Data:          Coupon code: "NOTAREALCODE123"
Steps:              1. Enter the invalid code.
                     2. Click "Apply Coupon".
Expected Result:    Error message ("Coupon is either invalid, or has
                     expired...") is shown; total is unchanged.
Postconditions:     None
Traceability:       Workflow 4 (Coupon/voucher checkout)
```

```
Test Case ID:      TC-CART-006
Title:              Cart persists across page navigation within the same session
Module:             Storefront / Cart
Priority:           Medium
Type:               Functional
Preconditions:      Product added to cart
Test Data:          Product: MacBook
Steps:              1. Add MacBook to cart.
                     2. Navigate to a category page, then back to home.
Expected Result:    Header cart total still shows 1 item(s) throughout
                     navigation.
Postconditions:     Clear cart.
Traceability:       CLAUDE.md Storefront Test Scenarios — Cart
```

```
Test Case ID:      TC-CART-007
Title:              Multiple products with different tax classes compute combined tax correctly
Module:             Storefront / Cart
Priority:           Low
Type:               Functional
Preconditions:      Two products with differing tax classes available
Test Data:          Two distinct products
Steps:              1. Add both products to the cart.
                     2. Open the cart page.
Expected Result:    Displayed tax total equals the sum of each line's
                     individually-computed tax.
Postconditions:     Clear cart.
Traceability:       CLAUDE.md Storefront Test Scenarios — Cart
```

```
Test Case ID:      TC-CART-008-ZeroQuantity
Title:              Setting quantity to 0 removes the item on Update
Module:             Storefront / Cart
Priority:           Low
Type:               Boundary
Preconditions:      One product in cart
Test Data:          Quantity: 0
Steps:              1. Set the line item quantity to 0.
                     2. Click Update.
Expected Result:    Item is removed from the cart (OpenCart treats qty 0 on
                     update as a removal).
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Cart
```
