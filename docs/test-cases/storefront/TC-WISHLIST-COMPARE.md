# Test Cases — Wishlist & Compare

Module: Storefront / Wishlist, Compare Products

---

```
Test Case ID:      TC-WISH-001
Title:              Logged-in customer can add a product to the wishlist
Module:             Storefront / Wishlist
Priority:           High
Type:               Functional
Preconditions:      Logged in
Test Data:          Product: MacBook
Steps:              1. Navigate to the MacBook product page.
                     2. Click "Add to Wish List".
                     3. Navigate to Account → Wish List.
Expected Result:    Success notification on step 2; MacBook appears in the
                     Wish List page in step 3.
Postconditions:     Remove item from wishlist.
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-WISH-002
Title:              Customer can remove an item from the wishlist
Module:             Storefront / Wishlist
Priority:           Medium
Type:               Functional
Preconditions:      Item already in wishlist
Test Data:          Product: MacBook
Steps:              1. Navigate to Wish List.
                     2. Click Remove on the MacBook entry.
Expected Result:    Item no longer appears in the wishlist.
Postconditions:     None
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-WISH-003
Title:              Adding a wishlist item to cart moves it into the shopping cart
Module:             Storefront / Wishlist
Priority:           High
Type:               Functional
Preconditions:      Item in wishlist
Test Data:          Product: MacBook
Steps:              1. Navigate to Wish List.
                     2. Click "Add to Cart" for the MacBook entry.
                     3. Open the cart page.
Expected Result:    Cart contains MacBook with correct price/quantity.
Postconditions:     Clear cart and wishlist.
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-COMPARE-004
Title:              Adding products to Compare shows them side-by-side
Module:             Storefront / Compare
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Products: Apple Cinema 30", Canon EOS 5D
Steps:              1. Add both products to Compare from their product
                        pages.
                     2. Navigate to the Compare page.
Expected Result:    Both products render as columns with matching
                     attribute rows (price, availability, etc.) for
                     comparison.
Postconditions:     Clear compare list.
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```

```
Test Case ID:      TC-COMPARE-005
Title:              Removing a product from the Compare page updates the comparison
Module:             Storefront / Compare
Priority:           Low
Type:               Functional
Preconditions:      2+ products in compare list
Test Data:          Same as TC-COMPARE-004
Steps:              1. On the Compare page, click Remove on one product.
Expected Result:    That product's column disappears; remaining product(s)
                     still display correctly.
Postconditions:     Clear compare list.
Traceability:       Workflow 8 (Wishlist/Compare → cart)
```
