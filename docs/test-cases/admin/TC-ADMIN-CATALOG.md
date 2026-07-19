# Test Cases — Admin Catalog

Module: Admin / Catalog (Products, Categories, Manufacturers, Options)

---

```
Test Case ID:      TC-ADMIN-CAT-001
Title:              Admin can log in with valid credentials
Module:             Admin / Login
Priority:           Critical
Type:               Smoke
Preconditions:      Admin account exists
Test Data:          username: admin, password: admin
Steps:              1. Navigate to the admin login page.
                     2. Enter valid credentials.
                     3. Submit.
Expected Result:    Redirected to the Dashboard; URL contains a
                     `user_token` query parameter.
Postconditions:     None
Traceability:       Workflow 5 / Workflow 6 (Admin workflows) prerequisite
```

```
Test Case ID:      TC-ADMIN-CAT-002-InvalidLogin
Title:              Admin login rejects invalid credentials
Module:             Admin / Login
Priority:           High
Type:               Negative
Preconditions:      None
Test Data:          username: admin, password: wrongpassword
Steps:              1. Navigate to the admin login page.
                     2. Enter an incorrect password.
                     3. Submit.
Expected Result:    Error message shown; user remains on the login page,
                     not authenticated.
Postconditions:     None
Traceability:       CLAUDE.md Admin Test Scenarios — Login & Access Control
```

```
Test Case ID:      TC-ADMIN-CAT-003
Title:              Admin can update a product's price and see it reflected on the storefront
Module:             Admin / Catalog / Products
Priority:           Critical
Type:               Functional
Preconditions:      Logged in as admin; product exists (e.g., MacBook)
Test Data:          New price value
Steps:              1. Navigate to Catalog → Products; open MacBook for
                        edit.
                     2. Go to the Data tab; change the Price field.
                     3. Save.
                     4. On the storefront, open the MacBook product page.
Expected Result:    Save succeeds with a success alert; the storefront PDP
                     shows the updated price (accounting for tax display).
Postconditions:     Revert price to original value.
Traceability:       Workflow 5 (Admin product CRUD → storefront reflects)
```

```
Test Case ID:      TC-ADMIN-CAT-004
Title:              Setting a product's status to Disabled hides it from the storefront
Module:             Admin / Catalog / Products
Priority:           High
Type:               Functional
Preconditions:      Logged in as admin
Test Data:          Product: a non-critical demo product
Steps:              1. Edit the product; set Status to "Disabled" on the
                        Data tab; save.
                     2. Search for the product on the storefront.
Expected Result:    Product no longer appears in storefront search/listing
                     results.
Postconditions:     Re-enable the product's status.
Traceability:       Workflow 5 (Admin product CRUD → storefront reflects)
```

```
Test Case ID:      TC-ADMIN-CAT-005
Title:              Admin can create a new product with required fields
Module:             Admin / Catalog / Products
Priority:           Medium
Type:               Functional
Preconditions:      Logged in as admin
Test Data:          Unique product name/model, price, quantity
Steps:              1. Navigate to Catalog → Products → Add New.
                     2. Fill General tab (Product Name, Meta Tag Title) and
                        Data tab (Model, Price, Quantity).
                     3. Save.
Expected Result:    Success alert shown; new product appears in the
                     product list.
Postconditions:     Delete the created test product.
Traceability:       CLAUDE.md Admin Test Scenarios — Catalog Management
```

```
Test Case ID:      TC-ADMIN-CAT-006
Title:              Admin can delete a product
Module:             Admin / Catalog / Products
Priority:           Medium
Type:               Functional
Preconditions:      A test product exists (not referenced by existing orders)
Test Data:          Test product created in TC-ADMIN-CAT-005
Steps:              1. In the product list, select the test product's
                        checkbox.
                     2. Click Delete; confirm.
Expected Result:    Product removed from the list; no longer retrievable
                     by name on the storefront.
Postconditions:     None
Traceability:       CLAUDE.md Admin Test Scenarios — Catalog Management
```

```
Test Case ID:      TC-ADMIN-CAT-007
Title:              A new Category created in admin appears in the storefront top menu
Module:             Admin / Catalog / Categories
Priority:           Medium
Type:               Functional
Preconditions:      Logged in as admin
Test Data:          Unique category name, Top = Yes
Steps:              1. Navigate to Catalog → Categories → Add New.
                     2. Enter a category name; enable "Top".
                     3. Save.
                     4. Refresh the storefront home page.
Expected Result:    New category appears in the storefront top navigation
                     menu.
Postconditions:     Delete the test category.
Traceability:       CLAUDE.md Admin Test Scenarios — Catalog Management
```

```
Test Case ID:      TC-ADMIN-CAT-008
Title:              Product Discount/Special pricing reflects correctly on storefront listing
Module:             Admin / Catalog / Products / Discount & Special
Priority:           Medium
Type:               Functional
Preconditions:      Logged in as admin
Test Data:          Special price lower than base price, active date range
                     including today
Steps:              1. Edit a product; on the Special tab, add a Special
                        price with a date range covering today; save.
                     2. View the product on the storefront category listing
                        and product page.
Expected Result:    Storefront shows the special (discounted) price with
                     strike-through original price in both places.
Postconditions:     Remove the test Special entry.
Traceability:       Workflow 5 (Admin product CRUD → storefront reflects)
```
