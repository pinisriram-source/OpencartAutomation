# OpenCart QA Automation — Project Guide

## Project Context

This repository holds test automation for the **TutorialsNinja** hosted demo,
a public **OpenCart**-based e-commerce reference application running at:

```
https://tutorialsninja.com/demo/          (Storefront)
https://tutorialsninja.com/demo/admin/    (Admin Panel, if applicable)
```

The base URLs are externalized via `.env` (`STOREFRONT_BASE_URL` /
`ADMIN_BASE_URL`) — always resolve the application URL from there rather
than hardcoding it, since the target may change per environment.

The install is the stock OpenCart 3.x demo store (default "Your Store" branding,
default Apple/Canon/HTC/Palm demo catalog under categories Desktops, Laptops &
Notebooks, Components, Tablets, Software, Phones & PDAs, Cameras, MP3 Players).
Treat this as the system under test (SUT) for all automation designed here.

This CLAUDE.md is the source of truth for scope, structure, and conventions.
Any test suite, page object, or test case generated in this repo should align
with the modules, objectives, and formats defined below.

## Application Type

- **Type**: Open-source PHP e-commerce platform (OpenCart), MVC(L) architecture.
- **Two distinct applications under one codebase**:
  1. **Storefront** (`index.php?route=...`) — public-facing customer site.
  2. **Admin Panel** (`admin/index.php?route=...`) — authenticated back-office.
- **Rendering**: Server-rendered HTML (Bootstrap 3 + jQuery), form posts and
  some AJAX (cart, wishlist, compare, currency switch, checkout steps).
- **Session/state**: PHP sessions; cart and wishlist persist per session/customer.
- **No public REST/GraphQL API is exposed by default** — automation interacts
  via the rendered UI (and can drop to HTTP/form-post level where useful for
  API-style checks, e.g. `route=product/product&product_id=`).

## Modules

### Storefront

| Module | Key Routes / Pages | Functionality |
|---|---|---|
| Home | `common/home` | Slideshow banner, Featured products, brand carousel |
| Category & Navigation | `product/category` | Top nav with dropdown subcategories, left category list with product counts, breadcrumb |
| Product Listing | `product/category`, `product/search` | Grid/List toggle, sort (name/price/rating/model), items-per-page, pagination, add to cart/wishlist/compare from listing |
| Product Detail | `product/product&product_id=` | Images, price/tax/reward points, stock/availability, **Options** (radio, checkbox, select, text, textarea, file, date), quantity, Add to Cart/Wishlist/Compare, tabs: Description / Specification / Reviews, related products |
| Search | `product/search` | Keyword search, search-in-description toggle, category filter, price filter |
| Cart | `checkout/cart` | Update qty, remove line item, apply Coupon / Gift Voucher / Reward Points, shipping estimate |
| Checkout | `checkout/checkout` (guest or registered), `checkout/confirm` | Multi-step: address (payment/shipping), shipping method, payment method, order comment, T&C agreement, order confirmation |
| Customer Account | `account/register`, `account/login`, `account/account`, `account/edit`, `account/password`, `account/address`, `account/order`, `account/download`, `account/reward`, `account/transaction`, `account/newsletter`, `account/return/add` | Registration (with Customer Group, newsletter opt-in), login, edit profile, address book (add/edit/delete/default), order history & detail, downloadable products, reward points, transaction history, newsletter subscribe/unsubscribe, product return request |
| Wishlist | `account/wishlist` | Add/remove, add-all-to-cart, requires login |
| Compare Products | `product/compare` | Side-by-side attribute comparison, add/remove |
| Manufacturer/Brands | `product/manufacturer` | Brand listing and brand-specific product listing |
| Specials | `product/special` | Discounted products listing |
| Information Pages | `information/information`, `information/contact`, `information/sitemap` | About Us, Delivery Information, Privacy Policy, Terms & Conditions, Contact form, Sitemap |
| Affiliate | `affiliate/login`, `affiliate/register` | Affiliate registration/login, commission tracking |
| Gift Vouchers | `account/voucher` | Purchase gift certificate/voucher |
| Currency & Language | header controls | Switch currency (EUR/GBP/USD), language if enabled |

### Admin Panel (`admin/`)

| Module | Functionality |
|---|---|
| Dashboard | Sales/order/customer summary widgets, charts, online visitors |
| Catalog | Products (CRUD, options, attributes, discounts/specials, SEO, links to categories/manufacturers), Categories, Filters, Manufacturers, Attributes/Attribute Groups, Options/Option Groups, Product Reviews, Downloads |
| Sales | Orders (view/edit status, invoice, shipping label), Returns (RMA processing), Order Status management |
| Customers | Customer CRUD, Customer Groups, Customer Approvals, Custom Fields, Online (active session list) |
| Marketing | Marketing Tracking codes, Coupons (CRUD, restrictions, usage), Mail (bulk mailer) |
| System | Settings (store config, per-store), Users (Users/User Groups/permissions), Localisation (Languages, Currencies, Stock Statuses, Order Statuses, Returns Statuses/Actions/Reasons, Countries/Zones, Geo Zones, Taxes: classes/rates, Length/Weight classes), Maintenance (Backup/Restore, Error Log), Design (Layout, Banners, SEO URL), Tools (Uploads) |
| Reports | Sales, Products, Customers, Marketing reports (viewed/purchased products, coupon usage, tax reports) |
| Extensions | Modules (payment, shipping, feeds/OCMOD, totals, shipping methods), Theme editor |

## Testing Objective

Build and maintain an automated regression suite that:

1. **Validates core shopping and account workflows end-to-end** on the
   storefront, protecting the customer-facing revenue path from regressions.
2. **Validates admin back-office operations** that support the storefront
   (catalog upkeep, order fulfillment, customer/coupon management).
3. **Covers functional correctness, data integrity, and UI state
   consistency** (e.g., cart totals recompute correctly, stock/availability
   reflects reality, order status transitions are valid) — not performance
   or load testing.
4. **Catches regressions early** by running against critical business
   workflows first (see below), then broadening to edge cases and negative
   paths.
5. Prioritize **high-traffic, high-business-impact modules first**: Product
   Search/Browse → Product Detail → Cart → Checkout → Order Confirmation →
   Account/Order History, followed by Admin Catalog and Order management.

Out of scope unless explicitly requested: performance/load testing, security
penetration testing, visual/pixel-diff regression, payment gateway sandbox
integrations beyond default OpenCart offline methods, third-party OCMOD
extensions not part of the base install.

## Test Scenarios to Focus On

### Storefront
- **Browse & Navigate**: top menu categories/subcategories render and route
  correctly; breadcrumbs match navigation path; category product counts match
  listing results.
- **Search**: keyword search returns relevant results; empty/no-match search
  shows appropriate message; category + price filter narrows results
  correctly; "search in description" toggle changes result set.
- **Product Listing**: sort by Name/Price/Rating/Model (asc/desc) reorders
  correctly; grid/list view toggle renders correctly; pagination and
  items-per-page selector work; add-to-cart/wishlist/compare from listing.
- **Product Detail**: correct price/tax/discount/special price display;
  required options block Add to Cart until selected; each option type (radio,
  checkbox, select, text, textarea, file upload, date/datetime) is captured
  and reflected in cart line item and price; quantity input respects
  min/max/stock; out-of-stock behavior (allowed/disallowed per config);
  review submission (guest vs logged-in, rating required); related products
  display.
- **Cart**: add/update/remove line items recalculates subtotal, tax, and
  total correctly; multiple products with different tax classes; applying a
  valid/invalid/expired Coupon; applying a Gift Voucher; redeeming Reward
  Points; shipping estimate by country/zone; cart persists across
  navigation/session for logged-in users.
- **Checkout — Guest**: address entry validation (required fields, email
  format, telephone format); shipping method selection changes shipping
  cost/total; payment method selection (default: offline methods — Cash on
  Delivery / Bank Transfer / Cheque); order comment field; Terms & Conditions
  checkbox gating order submission; order confirmation page and confirmation
  email trigger (if mail configured); order appears correctly in
  Admin → Sales → Orders.
- **Checkout — Registered Customer**: reuse saved address book entries;
  reward points redemption at checkout; order tied to customer account and
  visible in Order History.
- **Account Management**: registration field validation (required fields,
  password confirm mismatch, duplicate email, agree-to-terms requirement,
  Customer Group selection); login with valid/invalid credentials; password
  reset/forgotten password flow; edit profile; address book CRUD and default
  address selection; order history detail matches placed order; download
  products only after order status marks them available; return request
  submission and validation; newsletter subscribe/unsubscribe persists.
- **Wishlist**: requires login (guest redirected to login); add/remove;
  add-all-to-cart moves items and clears list.
- **Compare Products**: add up to limit, side-by-side attributes correct,
  remove product from comparison.
- **Vouchers/Specials/Manufacturer pages**: gift voucher purchase flow;
  specials listing shows only discounted items with correct strike-through
  pricing; manufacturer/brand page filters products correctly.
- **Currency Switching**: switching currency updates displayed prices
  storefront-wide and persists across navigation.
- **Cross-cutting negative/edge cases**: SQL/script injection attempts in
  search and form fields render as literal text (no XSS/SQL execution);
  boundary values for quantity/price fields; session/cart behavior after
  logout; concurrent stock depletion (last item in stock) blocking further
  add-to-cart.

### Admin
- **Login & Access Control**: valid/invalid login; user group permission
  enforcement (a restricted user cannot access disallowed menus/actions).
- **Catalog Management**: create/edit/delete Product with all tabs (General,
  Data, Links, Attribute, Option, Discount, Special, Image, Reward Points,
  SEO); create Category/Manufacturer/Attribute/Option and confirm they appear
  correctly on storefront; product Special/Discount pricing reflects on
  storefront listing and detail pages.
- **Order Management**: locate order placed via storefront; change order
  status (e.g., Pending → Processing → Shipped → Complete) and verify status
  history log and any triggered customer notification; add order comment;
  process a Return (RMA) end-to-end.
- **Customer Management**: create/edit/delete customer; assign Customer
  Group; approve/disable a customer account; verify storefront login
  reflects admin changes.
- **Marketing**: create a Coupon (fixed/percentage, min amount, date range,
  usage limit) and validate it applies correctly (and rejects invalidly) at
  storefront checkout/cart.
- **System/Localisation**: add/edit a Tax Class & Rate and confirm price
  calculations update on storefront; add/edit Order Status / Return Status
  and confirm it's selectable in Sales workflows; Geo Zone/Country/Zone setup
  used by shipping/tax.
- **Reports**: sales/orders/customers reports return data consistent with
  actions taken in the suite (e.g., an order placed in a test appears in the
  Sales report for that date range).

## Key Business Workflows (Priority Order)

1. **Guest — Search/Browse → Product Detail → Add to Cart → Guest Checkout →
   Order Confirmation** (the primary revenue path; must always pass).
2. **New Customer Registration → Login → Add to Cart → Checkout as
   Registered Customer → Order History verification.**
3. **Add Product with Options/Variants → Cart price recalculation →
   Checkout → verify option data appears on Admin order detail.**
4. **Apply Coupon/Voucher/Reward Points during Checkout → verify discounted
   total → verify in Admin Order detail.**
5. **Admin: Create/Update Product → verify storefront reflects change
   (price, stock, visibility, special/discount).**
6. **Admin: Process an Order lifecycle** — locate order → update status →
   verify customer-visible order history reflects new status.
7. **Customer Return Request** — submit return from Account → verify appears
   in Admin → Sales → Returns → process return status.
8. **Wishlist/Compare → Move to Cart → Checkout.**
9. **Account maintenance** — edit address book, change password, manage
   newsletter subscription — verify persistence across sessions.
10. **Admin access control** — restricted user group cannot perform
    out-of-scope actions (negative test).

Automation should be able to run workflow 1 and 2 as smoke tests independent
of the rest of the suite (fastest signal on build health).

## Test Case Format

Use a consistent, table-driven test case design so cases are readable outside
the automation code and map 1:1 to automated test methods. Every test case
authored (in specs, in test-plan docs, or as scaffolding comments above an
automated test) should follow this structure:

```
Test Case ID:      TC-<MODULE>-<NNN>          e.g. TC-CHECKOUT-014
Title:              Short, action-oriented summary
Module:             Storefront / Admin sub-module name
Priority:           Critical / High / Medium / Low
Type:               Functional / Negative / Boundary / Regression / Smoke
Preconditions:      State required before test starts (e.g., "Customer account exists", "Product X has stock = 1")
Test Data:          Concrete input values used (or reference to a data file/fixture)
Steps:              Numbered, single-action steps ("1. Navigate to X", "2. Enter Y", "3. Click Z")
Expected Result:    Per-step or final expected outcome, stated as an observable, verifiable assertion
Postconditions:     Any cleanup/state to reset (e.g., "delete test order", "restore stock qty")
Traceability:       Linked business workflow # (from Key Business Workflows) or requirement/module row above
```

Conventions:
- **One behavior per test case.** Don't combine unrelated assertions (e.g.,
  don't fold "coupon applies" and "coupon expires" into one case).
- **IDs are stable** — once assigned, don't renumber; append new cases.
- **Negative and boundary cases are named explicitly** (e.g.,
  `TC-REGISTER-009-DuplicateEmail`, `TC-CART-005-QtyExceedsStock`) so failures
  are self-describing in CI output.
- **Test data is externalized** (fixtures/JSON/CSV or a data-provider),
  never hardcoded inline in step text, so the same case can run across
  currencies/customer groups/tax zones.
- **Automated test method names should mirror the Test Case ID** (e.g.,
  `TC_CHECKOUT_014_GuestCheckoutWithValidCouponAppliesDiscount`) so a failing
  CI run maps directly back to this document.
- Prefer **Page Object Model** (or equivalent) separating locators/actions
  from assertions, regardless of the automation framework/language chosen —
  keeps storefront vs. admin object repositories cleanly separated given
  they are two distinct UIs.

## Notes for Future Automation Work

- This directory is currently empty — no automation framework, language, or
  test runner has been chosen yet. When scaffolding begins, keep storefront
  and admin test suites/page-objects in separate top-level folders since they
  share no UI components.
- The demo catalog data (product IDs, stock counts, category paths referenced
  above) reflects the *default* OpenCart demo dataset at the time this file
  was written (2026-07-17). If the store data is reset or reseeded, re-verify
  product IDs/stock/category paths referenced in fixtures before trusting
  cached values.
- No public API was detected; do not assume REST endpoints exist beyond
  standard `index.php?route=` form-driven pages.
