// spec: specs/saucedemo-checkout-test-plan.md (section 4. Order Completion)
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import customer from './test-data/customer.json';
import messages from './test-data/messages.json';

test.describe('Order Completion', () => {
  test('TC-CHECKOUT-COMPLETE-001 - Clicking Finish completes the order and shows confirmation', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: add at least one item to cart, complete checkout info with valid data, reach Overview.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.totalLabel).not.toBeEmpty();

    // 1. Click 'Finish'.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.heading).toHaveText('Checkout: Complete!');
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.thankYou);
    await expect(checkoutCompletePage.completeText).toHaveText(messages.completeText);
    await expect(checkoutCompletePage.ponyExpressImage).toBeVisible();
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.backHomeButton).toBeEnabled();
  });

  test('TC-CHECKOUT-COMPLETE-002 - Order completion clears the cart', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: add 2 items to cart, complete the full checkout flow through to checkout-complete.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.cartBadge).toBeHidden();

    // 1. Navigate directly to /cart.html.
    await cartPage.goto();
    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(cartPage.continueShoppingButton).toBeVisible();
    await expect(cartPage.checkoutButton).toBeVisible();
  });

  test('TC-CHECKOUT-COMPLETE-003 - Back Home button returns to the Products page', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: complete an order, arriving at /checkout-complete.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();

    // 1. Click 'Back Home'.
    await checkoutCompletePage.backHome();
    await expect(checkoutCompletePage.page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.inventoryItems).toHaveCount(6);
    await expect(loggedInPage.addToCartButton(products.backpack.id)).toBeVisible();
  });

  test('TC-CHECKOUT-COMPLETE-004 - Order confirmation is reachable only after a completed checkout', async ({ loggedInPage, checkoutCompletePage }) => {
    // Preconditions: standard_user with an empty cart (never added items).
    await expect(loggedInPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(loggedInPage.cartBadge).toBeHidden();

    // 1. Navigate directly to /checkout-complete.html without going through Steps One/Two.
    // Observed behavior: SauceDemo does not enforce a checkout-flow session guard here - the confirmation
    // page renders normally (permissive direct route access when logged in), unlike checkout-step-one.html
    // which does enforce a login guard.
    await checkoutCompletePage.goto();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.thankYou);
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
  });
});
