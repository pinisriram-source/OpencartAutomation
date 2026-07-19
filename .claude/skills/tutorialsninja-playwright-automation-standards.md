# Playwright Automation Standards -- TutorialsNinja (OpenCart)

## Locator Strategy - Priority Order

1.  data-testid attributes (preferred when available)
2.  ARIA roles and accessible names (`getByRole`, `getByLabel`)
3.  Stable element attributes (`name`, `id`, `placeholder`)
4.  Visible text for user-facing actions
5.  CSS selectors (stable only)
6.  XPath (last resort)

## Assertion Standards - Always Assert Specifically

-   After login: assert URL, page heading, and My Account menu.
-   After registration: assert success message and account page.
-   After search: assert matching product results or "no products"
    message.
-   After Add to Cart: assert success notification, cart count, and cart
    total.
-   After Wishlist action: assert success notification and wishlist
    count.
-   After Compare action: assert comparison success message.
-   After Checkout: assert order success page and order confirmation.
-   Never rely only on `toBeVisible()`---verify exact text, values,
    URLs, or calculations.

## Wait Strategy

-   Use Playwright auto-waiting.
-   Never use `page.waitForTimeout()`.
-   Use `expect(locator).toBeVisible()` for dynamic UI.
-   Use `page.waitForURL()` after navigation.
-   Use `page.waitForResponse()` only when validating API-driven
    updates.

## Stability Rules

-   Tests must be independent.
-   Create required preconditions within each test.
-   Do not depend on execution order.
-   Use unique customer accounts for registration tests.
-   Reset cart state before checkout scenarios.

## Reporting Standards

-   Capture screenshots on failure using `test.afterEach`.
-   Record Playwright traces on retry/failure.
-   Log major business steps.
-   Save artifacts under `/test-results/`.

## Framework Structure

-   Follow Page Object Model.
-   One Page Object per page (`/pages/<feature>.page.ts`).
-   One spec per feature (`/tests/<feature>.spec.ts`).
-   Store reusable test data in `/test-data/`.
-   Keep common fixtures under `/fixtures/`.

## E-Commerce Assertion Rules -- Apply to All Features

-   Login → verify My Account page and authenticated navigation.
-   Registration → verify success confirmation and account creation.
-   Search → verify returned products match search criteria.
-   Product Details → verify name, price, image, availability.
-   Add to Cart → verify success message, quantity, subtotal, and cart
    total.
-   Wishlist → verify product appears in wishlist.
-   Compare → verify selected products appear in comparison page.
-   Checkout → verify billing, shipping, payment, totals, and order
    success.
-   Order History → verify newly placed order is listed.
-   Contact Us → verify confirmation message after submission.

## Calculation Validation

-   Verify subtotal.
-   Verify tax calculation.
-   Verify shipping charges.
-   Verify coupon discounts.
-   Verify grand total after every cart update.

## Negative Assertion Rules

-   Invalid login → verify exact error message.
-   Invalid registration → verify field-level validation.
-   Invalid coupon → verify rejection message.
-   Out-of-stock product → verify purchase restriction.
-   Failed checkout → verify no order is created.

## Automation Principles

-   Prefer reusable page methods over duplicated steps.
-   Keep assertions inside spec files unless reusable.
-   Use descriptive test titles.
-   Avoid hardcoded waits and fragile selectors.
-   Ensure every automated scenario can run repeatedly without manual
    cleanup.
