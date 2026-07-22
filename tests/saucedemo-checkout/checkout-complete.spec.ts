// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('4. Order Completion', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-COMPLETE-001: Finish displays the order confirmation success message', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Complete the full checkout flow (cart -> info -> overview -> Finish)
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();

    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.completeText).toHaveText(
      'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
    );
  });

  test('TC-COMPLETE-002: Pony Express confirmation image is displayed', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Reach the Order Confirmation page
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
  });

  test('TC-COMPLETE-003: \'Back Home\' button is present and navigates to the Products page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. On the Order Confirmation page, click 'Back Home'
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();

    await checkoutCompletePage.backHome();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  test('TC-COMPLETE-004: Cart is cleared immediately after order completion (business rule 4)', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Complete checkout for 2 items and reach the Order Confirmation page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);

    // 2. Click 'Back Home' to return to the Products page
    await checkoutCompletePage.backHome();
    await expect(inventoryPage.addToCartButton(backpack.name)).toHaveText('Add to cart');
    await expect(inventoryPage.addToCartButton(bikeLight.name)).toHaveText('Add to cart');
    await expect(inventoryPage.removeButton(backpack.name)).toHaveCount(0);
    await expect(inventoryPage.removeButton(bikeLight.name)).toHaveCount(0);
  });

  test('TC-COMPLETE-005: Cart remains empty after returning to Products page post-completion', async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. After completing an order and clicking Back Home, navigate to /cart.html directly
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await checkoutCompletePage.backHome();

    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
  });

  test('TC-COMPLETE-006: \'Generate PDF order\' button is present on the confirmation page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Reach the Order Confirmation page
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.generatePdfButton).toBeVisible();
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
  });

  test('TC-COMPLETE-007-RefreshConfirmation: Refreshing the confirmation page preserves the completion state', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. On the Order Confirmation page, refresh the browser
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();

    await page.reload();
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });

  test('TC-COMPLETE-008: Header shows no cart badge on the confirmation page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Reach the Order Confirmation page after checking out with items
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page.locator('[data-test="shopping-cart-badge"]')).toHaveCount(0);
  });
});
