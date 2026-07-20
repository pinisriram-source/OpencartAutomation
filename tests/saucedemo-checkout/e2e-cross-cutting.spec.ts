// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/checkout/seed.spec.ts

import { test, expect, loginAsStandardUser, unauthenticatedErrorMessage } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';

test.describe('End-to-End and Cross-Cutting (Navigation / Access Control / Business Rules)', () => {
  test('TC-CHECKOUT-030 full happy-path checkout with a single item (smoke test)', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. Log in with standard_user / secret_sauce
    await loginAsStandardUser(loginPage);
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Add Sauce Labs Backpack to the cart and open the cart
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await expect(
      cartPage.itemByName(products.sauceLabsBackpack.name).locator('[data-test="inventory-item-price"]'),
    ).toHaveText(`$${products.sauceLabsBackpack.price}`);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();

    // 3. Click 'Checkout' and fill valid info, then click 'Continue'
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 4. Verify Overview summary and totals, then click 'Finish'
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $29.99');
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $2.40');
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $32.39');
    await checkoutStepTwoPage.finish();

    // 5. Verify confirmation page
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.pageTitle).toHaveText('Checkout: Complete!');
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);
  });

  test('TC-CHECKOUT-031 full checkout with multiple items validates end-to-end total correctness', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await loginAsStandardUser(loginPage);

    // 1. Log in and add Sauce Labs Backpack, Bolt T-Shirt and Fleece Jacket to the cart
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.addToCart(products.sauceLabsBoltTShirt.slug);
    await inventoryPage.addToCart(products.sauceLabsFleeceJacket.slug);
    await expect(inventoryPage.header.cartBadge).toHaveText('3');

    // 2. Open the cart and verify all 3 items with correct individual prices
    await inventoryPage.header.goToCart();
    await expect(cartPage.cartItems).toHaveCount(3);
    await expect(
      cartPage.itemByName(products.sauceLabsBackpack.name).locator('[data-test="inventory-item-price"]'),
    ).toHaveText(`$${products.sauceLabsBackpack.price}`);
    await expect(
      cartPage.itemByName(products.sauceLabsBoltTShirt.name).locator('[data-test="inventory-item-price"]'),
    ).toHaveText(`$${products.sauceLabsBoltTShirt.price}`);
    await expect(
      cartPage.itemByName(products.sauceLabsFleeceJacket.name).locator('[data-test="inventory-item-price"]'),
    ).toHaveText(`$${products.sauceLabsFleeceJacket.price}`);

    // 3. Click Checkout, fill in valid info, click Continue
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.validAlice);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(3);

    // 4. Verify Item total, Tax and Total ($29.99 + $15.99 + $49.99 = $95.97; 8% tax = $7.6776 rounded)
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $95.97');
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $7.68');
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $103.65');

    // 5. Click 'Finish' and verify confirmation
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);
  });

  test('TC-CHECKOUT-032 zero-item (empty cart) checkout completes with $0.00 totals (Business Rule 3 deviation, full flow)', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await loginAsStandardUser(loginPage);

    // 1. Ensure the cart is empty, then click 'Checkout' from /cart.html
    await inventoryPage.header.goToCart();
    await expect(cartPage.cartItems).toHaveCount(0);
    await cartPage.checkoutButton.click();

    // Per TC-CHECKOUT-006: the empty cart is allowed through to the Information step
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);

    // 2. Fill in valid info, click 'Continue'
    await checkoutStepOnePage.submit(checkoutInfo.zeroCart);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);

    // 3. Verify totals on Overview
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $0');
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $0.00');
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $0.00');

    // 4. Click 'Finish'
    await checkoutStepTwoPage.finish();

    // ACTUAL BEHAVIOR: the order still completes despite purchasing zero items -- flagged as a
    // business-rule violation for stakeholder review.
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('TC-CHECKOUT-033 a logged-out user cannot reach any checkout-related route directly (access control matrix)', async ({
    page,
    loginPage,
  }) => {
    // 1. Ensure logged out (a fresh test context has no active session by default)
    await loginPage.open();

    const guardedRoutes = ['/cart.html', '/checkout-step-one.html', '/checkout-step-two.html', '/checkout-complete.html'];

    for (const route of guardedRoutes) {
      // 2-5. Navigate directly to each guarded route
      await page.goto(`https://www.saucedemo.com${route}`);

      await expect(loginPage.page).toHaveURL('https://www.saucedemo.com/');
      await expect(loginPage.errorBanner).toHaveText(unauthenticatedErrorMessage(route));
    }
  });
});
