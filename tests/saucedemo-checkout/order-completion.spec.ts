// spec: specs/saucedemo-checkout-test-plan.md (Suite 4: Order Completion)
// seed: tests/seed.spec.ts
import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';
import messages from './test-data/messages.json';

test.describe('Order Completion', () => {
  test('TC-CHECKOUT-COMPLETE-001 Clicking Finish completes the order and shows the confirmation page', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: log in, add an item, complete Checkout Information, reach the Overview page.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Click 'Finish'.
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.title).toHaveText('Checkout: Complete!');
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.orderCompleteHeader);
    await expect(checkoutCompletePage.completeText).toHaveText(messages.orderCompleteText);
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
    await expect(checkoutCompletePage.backHomeButton).toBeEnabled();
  });

  test('TC-CHECKOUT-COMPLETE-002 Order completion clears the cart (business rule 4)', async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: log in, add 2 items, complete the full checkout flow through to /checkout-complete.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug]);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.cartBadge).toHaveCount(0);

    // 2. Navigate directly to /cart.html.
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('TC-CHECKOUT-COMPLETE-003 Back Home button returns to the Products page', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: complete an order, arriving at /checkout-complete.html.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await checkoutOverviewPage.clickFinish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 2. Click 'Back Home'.
    await checkoutCompletePage.clickBackHome();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
    for (const product of Object.values(products)) {
      await expect(inventoryPage.addToCartButton(product.slug)).toBeVisible();
    }
  });

  test('TC-CHECKOUT-COMPLETE-004-DirectAccess Confirmation page is reachable by direct URL without completing Steps One/Two (confirmed gap)', async ({
    loginPage,
    inventoryPage,
    checkoutCompletePage,
  }) => {
    // 1. Preconditions: log in, add an item to the cart, but do NOT proceed through Checkout Information or Overview.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    // 2. Navigate directly to /checkout-complete.html, bypassing Steps One and Two entirely.
    await checkoutCompletePage.open();
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.orderCompleteHeader);
    await expect(checkoutCompletePage.completeText).toHaveText(messages.orderCompleteText);
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    // Confirmed live: the cart is NOT cleared by this direct-access path, unlike a genuine Finish.
    await expect(checkoutCompletePage.cartBadge).toHaveText('1');
    // Confirmed live: no "Generate PDF order" button appears — no order object was actually created.
    await expect(checkoutCompletePage.generatePdfButton).toHaveCount(0);
  });
});
