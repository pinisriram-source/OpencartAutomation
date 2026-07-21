// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, totals } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('AC4 - Order Completion', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CHECKOUT-COMPLETE-001 clicking Finish completes the order and shows the confirmation page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    // 1. Click 'Finish' on the Overview page
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.title).toHaveText('Checkout: Complete!');

    // 2. Verify confirmation content
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.completeText).not.toBeEmpty();
    await expect(checkoutCompletePage.backHomeButton).toBeEnabled();
  });

  test('TC-CHECKOUT-COMPLETE-002 order completion clears the cart', async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    // 1. Complete a full checkout (info -> overview -> Finish) with 2 items in the cart
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 2. Verify the header cart badge on the confirmation page
    await expect(checkoutCompletePage.page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 3. Navigate to /cart.html directly
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);

    // 4. Navigate directly to /checkout-step-two.html
    await checkoutStepTwoPage.open();
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.empty.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.empty.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.empty.total);
  });

  test('TC-CHECKOUT-COMPLETE-003 back home returns to the Products page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();

    // 1. Click 'Back Home'
    await checkoutCompletePage.backHome();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.addToCartButton(backpack.name)).toHaveText('Add to cart');
  });

  test('TC-CHECKOUT-COMPLETE-004 browser back button after order completion does not restore the purchased cart', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 1. Click the browser's Back button
    await page.goBack();
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Verify the content of this back-navigated Overview page
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.empty.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.empty.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.empty.total);
  });
});
