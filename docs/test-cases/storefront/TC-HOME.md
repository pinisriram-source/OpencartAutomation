# Test Cases — Home & Navigation

Module: Storefront / Home, Header, Top Navigation

---

```
Test Case ID:      TC-HOME-001
Title:              Home page loads with expected sections
Module:             Storefront / Home
Priority:           Critical
Type:               Smoke
Preconditions:      None
Test Data:          N/A
Steps:              1. Navigate to the storefront base URL.
                     2. Observe the page.
Expected Result:    Page title contains "Your Store"; slideshow, "Featured"
                     heading, and footer columns (Information/Customer
                     Service/Extras/My Account) are visible.
Postconditions:     None
Traceability:       Workflow 1 (Guest checkout smoke path)
```

```
Test Case ID:      TC-HOME-002
Title:              Top category menu lists all top-level categories
Module:             Storefront / Top Navigation
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          N/A
Steps:              1. Navigate to home.
                     2. Read the top nav menu items.
Expected Result:    Menu shows Desktops, Laptops & Notebooks, Components,
                     Tablets, Software, Phones & PDAs, Cameras, MP3 Players.
Postconditions:     None
Traceability:       CLAUDE.md Storefront module table — Category & Navigation
```

```
Test Case ID:      TC-HOME-003
Title:              Hovering a top category with subcategories reveals a dropdown
Module:             Storefront / Top Navigation
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Category: Desktops
Steps:              1. Navigate to home.
                     2. Hover/click "Desktops" in the top menu.
Expected Result:    Dropdown shows "PC" and "Mac" sub-links plus a
                     "Show All Desktops" link.
Postconditions:     None
Traceability:       CLAUDE.md Storefront module table — Category & Navigation
```

```
Test Case ID:      TC-HOME-004
Title:              Clicking a category link navigates to its listing page
Module:             Storefront / Top Navigation
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          Category: Laptops & Notebooks
Steps:              1. Navigate to home.
                     2. Click "Laptops & Notebooks" in the top menu.
Expected Result:    URL route is product/category with the corresponding
                     path; breadcrumb shows "Laptops & Notebooks"; left
                     category list highlights it as active.
Postconditions:     None
Traceability:       CLAUDE.md Storefront module table — Category & Navigation
```

```
Test Case ID:      TC-HOME-005
Title:              Currency switcher updates displayed prices storefront-wide
Module:             Storefront / Header
Priority:           Medium
Type:               Functional
Preconditions:      None
Test Data:          Currencies: EUR, GBP, USD
Steps:              1. Navigate to home; note a featured product's price in
                        the default currency.
                     2. Open the currency dropdown and select "Euro".
                     3. Observe the same product's price.
                     4. Navigate to a different page (e.g., a category).
Expected Result:    Price changes to the EUR-formatted amount after step 2;
                     the EUR selection persists to the page visited in
                     step 4.
Postconditions:     Switch currency back to default (or reset session).
Traceability:       CLAUDE.md Storefront Test Scenarios — Currency Switching
```

```
Test Case ID:      TC-HOME-006-EmptyCart
Title:              Cart widget shows empty state when no items added
Module:             Storefront / Header
Priority:           Low
Type:               Negative
Preconditions:      Fresh session, nothing added to cart
Test Data:          N/A
Steps:              1. Navigate to home.
                     2. Click the cart icon/dropdown in the header.
Expected Result:    Dropdown shows "Your shopping cart is empty!" and cart
                     total reads "0 item(s) - $0.00".
Postconditions:     None
Traceability:       CLAUDE.md Storefront module table — Cart
```

```
Test Case ID:      TC-HOME-007
Title:              Footer informational links navigate to the correct pages
Module:             Storefront / Footer / Information Pages
Priority:           Low
Type:               Functional
Preconditions:      None
Test Data:          Links: About Us, Delivery Information, Privacy Policy,
                     Terms & Conditions, Contact Us, Site Map
Steps:              1. Navigate to home.
                     2. Click each footer link in turn.
Expected Result:    Each link loads its corresponding information page with
                     a non-empty content body and matching page heading.
Postconditions:     None
Traceability:       CLAUDE.md Storefront module table — Information Pages
```

```
Test Case ID:      TC-HOME-008
Title:              Search box on home page returns matching products
Module:             Storefront / Header / Search
Priority:           High
Type:               Functional
Preconditions:      None
Test Data:          Keyword: "MacBook"
Steps:              1. Navigate to home.
                     2. Enter "MacBook" in the header search box.
                     3. Submit the search.
Expected Result:    Redirected to product/search results listing at least
                     one product whose name contains "MacBook".
Postconditions:     None
Traceability:       Workflow 1 (Guest checkout smoke path)
```
