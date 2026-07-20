// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/checkout/seed.spec.ts

import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';

test.describe('Order Completion (AC4)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginAsStandardUser(loginPage);
  });

  test("TC-CHECKOUT-026 'Finish' completes the order and shows a success message with a 'Back Home' button", async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.addToCart(products.sauceLabsBikeLight.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    // 1. Click 'Finish'
    await checkoutStepTwoPage.finish();

    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    // 2. Verify the heading and success message
    await expect(checkoutCompletePage.pageTitle).toHaveText('Checkout: Complete!');
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    // 3. Verify the supporting text
    await expect(checkoutCompletePage.completeText).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
    );
    // 4. Verify the action buttons
    await expect(checkoutCompletePage.backHomeButton).toBeEnabled();
    await expect(checkoutCompletePage.generatePdfButton).toBeEnabled();
  });

  test('TC-CHECKOUT-027 completing an order clears the cart (Business Rule 4)', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.addToCart(products.sauceLabsBikeLight.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 1. After reaching /checkout-complete.html, observe the header cart badge
    await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);

    // 2. Navigate to /cart.html
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.checkoutButton).toBeVisible();

    // 3. Navigate to /inventory.html and check product tiles
    await inventoryPage.open();
    await expect(inventoryPage.addToCartButton(products.sauceLabsBackpack.slug)).toBeVisible();
    await expect(inventoryPage.addToCartButton(products.sauceLabsBikeLight.slug)).toBeVisible();
    await expect(inventoryPage.removeButton(products.sauceLabsBackpack.slug)).toHaveCount(0);
    await expect(inventoryPage.removeButton(products.sauceLabsBikeLight.slug)).toHaveCount(0);
  });

  test("TC-CHECKOUT-028 'Back Home' button navigates to the Products page", async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);
    await checkoutStepTwoPage.finish();

    // 1. Click 'Back Home'
    await checkoutCompletePage.backHome();

    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.addToCartButton(products.sauceLabsBackpack.slug)).toBeVisible();
  });

  test('TC-CHECKOUT-029-BrowserBack browser Back after order completion returns to a cached Overview page; re-clicking Finish is idempotent', async ({
    page,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 1. Click the browser's Back button
    await page.goBack();
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();

    // 2. Click 'Finish' again
    await checkoutStepTwoPage.finish();

    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
  });
});
