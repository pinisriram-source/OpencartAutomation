// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';

const { products, messages, accessControlCheckoutInfo } = testData;

test.describe('Access Control & Business Rule Enforcement', () => {
  // TC-ACCESS-001: Login is required to reach any Cart/Checkout page (Business Rule 2)
  test('TC-ACCESS-001 Login is required to reach any Cart/Checkout page', async ({
    loginPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. While logged out, navigate directly to /cart.html
    await cartPage.open();
    await expect(loginPage.page).toHaveURL(loginPage.url);
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequired.cart);

    // 2. While logged out, navigate directly to /checkout-step-one.html
    await checkoutStepOnePage.open();
    await expect(loginPage.page).toHaveURL(loginPage.url);
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequired.checkoutStepOne);

    // 3. While logged out, navigate directly to /checkout-step-two.html
    await checkoutStepTwoPage.open();
    await expect(loginPage.page).toHaveURL(loginPage.url);
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequired.checkoutStepTwo);

    // 4. While logged out, navigate directly to /checkout-complete.html
    await checkoutCompletePage.open();
    await expect(loginPage.page).toHaveURL(loginPage.url);
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequired.checkoutComplete);
  });

  // TC-ACCESS-002: Proceeding through checkout with an empty cart is currently allowed (negative / Business Rule 3 gap)
  test('TC-ACCESS-002 Proceeding through checkout with an empty cart is currently allowed', async ({
    loginAsStandardUser,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. With an empty cart, navigate to /checkout-step-one.html and fill in valid info, click Continue
    await loginAsStandardUser();
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.fillAndContinue(accessControlCheckoutInfo.emptyCart);

    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    // 2. Observe the Overview page's item table and Price Total block
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(testData.totals.empty.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(testData.totals.empty.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(testData.totals.empty.total);

    // 3. Click "Finish" — per current app behavior the order completes despite 0 items purchased.
    // Flagged as a discrepancy against Business Rule 3 for product-owner review.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.completeHeader);
  });

  // TC-ACCESS-003: Completing an order clears the cart so a subsequent checkout only reflects newly added items (Business Rule 4 regression)
  test('TC-ACCESS-003 Completing an order clears the cart so a subsequent checkout only reflects newly added items', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. Add 3 items, complete the full checkout flow through Finish
    await loginAsStandardUser();
    await inventoryPage.addMultipleToCart([products.backpack.slug, products.bikeLight.slug, products.boltTShirt.slug]);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillAndContinue(testData.validCheckoutInfo);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);

    // 2. Click Back Home, then add a different single item (Sauce Labs Onesie) and go through checkout again
    await checkoutCompletePage.backHome();
    await inventoryPage.addToCart(products.onesie.slug);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillAndContinue(testData.validCheckoutInfo);

    await expect(checkoutStepTwoPage.cartItems).toHaveCount(1);
    await expect(checkoutStepTwoPage.itemQuantity(products.onesie.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.itemPrice(products.onesie.name)).toHaveText(products.onesie.price);
    await expect(checkoutStepTwoPage.itemRow(products.backpack.name)).toHaveCount(0);
    await expect(checkoutStepTwoPage.itemRow(products.bikeLight.name)).toHaveCount(0);
    await expect(checkoutStepTwoPage.itemRow(products.boltTShirt.name)).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(`Item total: ${products.onesie.price}`);
  });

  // TC-ACCESS-004: Logging out mid-checkout blocks resuming the checkout URL directly
  test('TC-ACCESS-004 Logging out mid-checkout blocks resuming the checkout URL directly', async ({
    loginAsStandardUser,
    inventoryPage,
    checkoutStepOnePage,
    loginPage,
  }) => {
    // 1. With cart items present, navigate to /checkout-step-one.html, then open the hamburger menu and click "Logout"
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.header.logout();
    await expect(loginPage.page).toHaveURL(loginPage.url);

    // 2. Attempt to navigate directly back to /checkout-step-one.html while still logged out
    await checkoutStepOnePage.open();
    await expect(loginPage.page).toHaveURL(loginPage.url);
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequired.checkoutStepOne);

    // 3. Log back in as standard_user
    await loginAsStandardUser();
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    // Record whether the previously added cart item persisted across the logout/login cycle.
    await expect(inventoryPage.header.cartBadge).toHaveText('1');
  });
});
