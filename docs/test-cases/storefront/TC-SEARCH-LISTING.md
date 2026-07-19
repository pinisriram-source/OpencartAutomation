# Test Cases — Search & Product Listing

Module: Storefront / Search, Category & Search Result Listing

---

```
Test Case ID:      TC-SEARCH-001
Title:              Keyword search returns relevant results
Module:             Storefront / Search
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          Keyword: "Camera"
Steps:              1. Navigate to the search page (or use header search).
                     2. Enter "Camera" and submit.
Expected Result:    Result list contains only products whose name/description
                     relates to "Camera" (e.g., Canon EOS 5D); result count
                     matches the number of listed products.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Search
```

```
Test Case ID:      TC-SEARCH-002-NoMatch
Title:              Search with no matching products shows an empty-result message
Module:             Storefront / Search
Priority:           Medium
Type:               Negative
Preconditions:      None
Test Data:          Keyword: "zzzznotaproductzzzz"
Steps:              1. Navigate to search.
                     2. Enter a keyword guaranteed not to match any product.
                     3. Submit.
Expected Result:    Page displays a "no products" message; no product tiles
                     render.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Search
```

```
Test Case ID:      TC-SEARCH-003
Title:              "Search in description" toggle broadens result set
Module:             Storefront / Search
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Keyword: a word known to appear only in a product
                     description, not in any product name
Steps:              1. Navigate to search; enter the keyword with
                        "Search in description" unchecked; submit; note
                        result count.
                     2. Repeat with the toggle checked.
Expected Result:    Result count with the toggle checked is greater than or
                     equal to the count without it.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Search
```

```
Test Case ID:      TC-SEARCH-004
Title:              Category filter narrows search results
Module:             Storefront / Search
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Keyword: "a" (broad match), Category: "Cameras"
Steps:              1. Navigate to search.
                     2. Enter a broad keyword and select "Cameras" as the
                        category filter.
                     3. Submit.
Expected Result:    All returned results belong to the Cameras category.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Search
```

```
Test Case ID:      TC-LISTING-005
Title:              Sorting a category listing by Price (Low > High) reorders products
Module:             Storefront / Product Listing
Priority:           High
Type:               Functional
Preconditions:      Category has 2+ products with differing prices
Test Data:          Category: Desktops
Steps:              1. Navigate to the Desktops category listing.
                     2. Select "Price (Low > High)" from the sort dropdown.
Expected Result:    Products render in ascending price order.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Product Listing
```

```
Test Case ID:      TC-LISTING-006
Title:              Grid/List view toggle changes listing layout
Module:             Storefront / Product Listing
Priority:           Low
Type:               Functional
Preconditions:      None
Test Data:          Category: Laptops & Notebooks
Steps:              1. Navigate to a category listing in default (grid) view.
                     2. Click the "List" view icon.
Expected Result:    Product tiles re-render in a single-column list layout
                     with the same product set.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Product Listing
```

```
Test Case ID:      TC-LISTING-007
Title:              Changing items-per-page updates the number of products shown
Module:             Storefront / Product Listing
Priority:           Low
Type:               Boundary
Preconditions:      Category has more products than the smallest page-size option
Test Data:          Category: Desktops, page size: 25 then 100
Steps:              1. Navigate to Desktops listing.
                     2. Select a smaller items-per-page value; note count.
                     3. Select a larger items-per-page value.
Expected Result:    Number of rendered product tiles matches (or is capped
                     by total available products for) the selected page size.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Product Listing
```

```
Test Case ID:      TC-LISTING-008
Title:              Add to Cart from the listing page adds the correct product
Module:             Storefront / Product Listing
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          Product: MacBook (no required options)
Steps:              1. Navigate to a listing containing "MacBook".
                     2. Click "Add to Cart" on the MacBook tile.
Expected Result:    Header cart total increments by 1 and reflects MacBook's
                     price; a success notification appears.
Postconditions:     Clear cart.
Traceability:       Workflow 1 (Guest checkout smoke path)
```

```
Test Case ID:      TC-LISTING-009
Title:              Pagination navigates between result pages without duplication
Module:             Storefront / Product Listing
Priority:           Medium
Type:               Boundary
Preconditions:      Category/search has enough results to span 2+ pages
Test Data:          Small items-per-page value forcing pagination
Steps:              1. Navigate to a listing with pagination controls visible.
                     2. Note the products on page 1.
                     3. Click page 2.
Expected Result:    Page 2 shows a different, non-overlapping set of products;
                     the "Showing X of Y" text updates accordingly.
Postconditions:     None
Traceability:       CLAUDE.md Storefront Test Scenarios — Product Listing
```
