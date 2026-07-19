// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';

const { products, messages, totals, e2eCheckoutInfo } = testData;

test.describe('End-to-End Smoke Tests', () => {
  // TC-CHECKOUT-E2E-001: Full happy-path checkout with a single item (Critical smoke test)
  test('TC-CHECKOUT-E2E-001 Full happy-path checkout with a single item', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. Log in with standard_user / secret_sauce
    await loginAsStandardUser();
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);

    // 2. Add "Sauce Labs Backpack" to the cart
    await inventoryPage.addToCart(products.backpack.slug);
    await expect(inventoryPage.header.cartBadge).toHaveText('1');

    // 3. Open the Cart page and verify the item, then click "Checkout"
    await inventoryPage.header.openCart();
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 4. Fill First Name, Last Name, Zip with valid data and click "Continue"
    await checkoutStepOnePage.fillAndContinue(e2eCheckoutInfo.singleItem);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    // 5. Verify the Overview page item summary and totals, then click "Finish"
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.singleBackpack.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.singleBackpack.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);

    // 6. Verify the confirmation page, then click "Back Home"
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.completeHeader);
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await checkoutCompletePage.backHome();

    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.addToCartButton(products.backpack.slug)).toHaveText('Add to cart');
    await expect(inventoryPage.header.cartBadge).toHaveCount(0);
  });

  // TC-CHECKOUT-E2E-002: Full happy-path checkout with multiple items (Critical smoke test)
  test('TC-CHECKOUT-E2E-002 Full happy-path checkout with multiple items', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. Log in and add all 3 specified products to the cart
    await loginAsStandardUser();
    await inventoryPage.addMultipleToCart([products.backpack.slug, products.bikeLight.slug, products.boltTShirt.slug]);
    await expect(inventoryPage.header.cartBadge).toHaveText('3');

    // 2. Open Cart, verify all 3 items listed correctly, click Checkout
    await inventoryPage.header.openCart();
    await expect(cartPage.cartItems).toHaveCount(3);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(products.bikeLight.price);
    await expect(cartPage.itemPrice(products.boltTShirt.name)).toHaveText(products.boltTShirt.price);
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);

    // 3. Fill valid checkout information and click Continue
    await checkoutStepOnePage.fillAndContinue(e2eCheckoutInfo.multiItem);
    await expect(checkoutStepOnePage.errorBanner).toHaveCount(0);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    // 4. Verify Overview lists all 3 items and correct totals, then click Finish
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(3);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.threeItemsE2E.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.threeItemsE2E.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.threeItemsE2E.total);
    await checkoutStepTwoPage.finish();

    // 5. Verify success message and that the cart is cleared
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.completeHeader);
    await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);

    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
  });
});
