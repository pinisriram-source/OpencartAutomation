# Test Cases — Product Detail

Module: Storefront / Product Detail Page

---

```
Test Case ID:      TC-PDP-001
Title:              Product detail page displays core product information
Module:             Storefront / Product Detail
Priority:           Critical
Type:               Smoke
Preconditions:      None
Test Data:          Product: MacBook
Steps:              1. Navigate to the MacBook product detail page (via
                        search or category navigation).
Expected Result:    Page shows product name, price (with Ex Tax line),
                     availability ("In Stock"), image, and Description/
                     Specification/Reviews tabs.
Postconditions:     None
Traceability:       Workflow 1 (Guest checkout smoke path)
```

```
Test Case ID:      TC-PDP-002
Title:              Add to Cart is blocked until a required Select option is chosen
Module:             Storefront / Product Detail / Options
Priority:           High
Type:               Negative
Preconditions:      None
Test Data:          Product: Apple Cinema 30" (has a required Select option)
Steps:              1. Navigate to the Apple Cinema 30" product page.
                     2. Leave the "Select" option (e.g., color) unset.
                     3. Click "Add to Cart".
Expected Result:    A validation error is shown for the missing required
                     option and the item is not added to the cart.
Postconditions:     None
Traceability:       Workflow 3 (Product options → cart pricing)
```

```
Test Case ID:      TC-PDP-003
Title:              Radio option selection is captured on Add to Cart
Module:             Storefront / Product Detail / Options
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          Product: Apple Cinema 30", radio option group (id 218)
Steps:              1. Navigate to the Apple Cinema 30" product page.
                     2. Select one radio option value.
                     3. Fill any other required options.
                     4. Click "Add to Cart".
Expected Result:    Item added successfully; the cart line item reflects the
                     chosen radio option (and its price delta, if any).
Postconditions:     Clear cart.
Traceability:       Workflow 3 (Product options → cart pricing)
```

```
Test Case ID:      TC-PDP-004
Title:              Checkbox options allow multiple selections and each affects price
Module:             Storefront / Product Detail / Options
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          Product: Apple Cinema 30", checkbox option group (id 223),
                     select 2 of the available checkboxes
Steps:              1. Navigate to the product page.
                     2. Select 2 checkbox option values plus other required
                        options.
                     3. Add to Cart.
Expected Result:    Cart line item price reflects the base price plus both
                     checkbox option deltas.
Postconditions:     Clear cart.
Traceability:       Workflow 3 (Product options → cart pricing)
```

```
Test Case ID:      TC-PDP-005
Title:              Text and Textarea option input is echoed in the cart line item
Module:             Storefront / Product Detail / Options
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Product: Apple Cinema 30", Text option value: "Engrave: QA"
Steps:              1. Navigate to the product page.
                     2. Enter text into the Text option field, plus other
                        required options.
                     3. Add to Cart, then open the cart page.
Expected Result:    Cart line item detail shows the entered text value
                     against the Text option label.
Postconditions:     Clear cart.
Traceability:       Workflow 3 (Product options → cart pricing)
```

```
Test Case ID:      TC-PDP-006-BlankRequiredText
Title:              Required Text option blocks Add to Cart when left blank
Module:             Storefront / Product Detail / Options
Priority:           Medium
Type:               Negative
Preconditions:      Text option on the product is marked required
Test Data:          Product: Apple Cinema 30"
Steps:              1. Navigate to the product page.
                     2. Leave the required Text option blank; fill others.
                     3. Click "Add to Cart".
Expected Result:    Validation error shown for the Text option; item not
                     added.
Postconditions:     None
Traceability:       Workflow 3 (Product options → cart pricing)
```

```
Test Case ID:      TC-PDP-007
Title:              Quantity field controls the number of units added
Module:             Storefront / Product Detail
Priority:           Medium
Type:               Boundary
Preconditions:      None
Test Data:          Product: MacBook, quantity: 3
Steps:              1. Navigate to the MacBook page.
                     2. Set quantity to 3.
                     3. Add to Cart.
Expected Result:    Cart shows quantity 3 for MacBook and a line total of
                     3 × unit price.
Postconditions:     Clear cart.
Traceability:       CLAUDE.md Storefront Test Scenarios — Product Detail
```

```
Test Case ID:      TC-PDP-008
Title:              Add to Wishlist requires login and redirects a guest
Module:             Storefront / Product Detail / Wishlist
Priority:           Medium
Type:               Negative
Preconditions:      Not logged in
Test Data:          Product: MacBook
Steps:              1. Navigate to the MacBook page as a guest.
                     2. Click the "Add to Wish List" icon.
Expected Result:    Guest is redirected to (or prompted toward) the login
                     page; item is not added until authenticated.
Postconditions:     None
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-PDP-009
Title:              Add to Compare adds the product to the comparison list
Module:             Storefront / Product Detail / Compare
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Product: Apple Cinema 30"
Steps:              1. Navigate to the product page.
                     2. Click "Compare this Product".
                     3. Navigate to the Compare page.
Expected Result:    Success notification appears in step 2; the Compare
                     page lists the product with its attributes.
Postconditions:     Remove product from compare list.
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-PDP-010
Title:              Submitting a product review requires rating and text
Module:             Storefront / Product Detail / Reviews
Priority:           Low
Type:               Negative
Preconditions:      None
Test Data:          Empty review form
Steps:              1. Navigate to a product page, open the Reviews tab.
                     2. Click "Continue"/submit without entering a name,
                        review text, or rating.
Expected Result:    Validation errors are shown for the missing required
                     fields; review is not submitted.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Product Detail
```

```
Test Case ID:      TC-PDP-011
Title:              Special/discounted price displays with strike-through original price
Module:             Storefront / Product Detail / Pricing
Priority:           Medium
Type:               Functional
Preconditions:      Product has an active Special price configured in admin
Test Data:          Product: Apple Cinema 30" or Canon EOS 5D (demo data
                     ships with active specials)
Steps:              1. Navigate to the product page.
Expected Result:    Page shows the discounted price alongside a
                     strike-through original price.
Postconditions:     None
Traceability:       Workflow 5 (Admin product CRUD → storefront reflects)
```
