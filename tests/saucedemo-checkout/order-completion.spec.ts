// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';
import type { InventoryPage } from './pages/inventory.page';
import type { CartPage } from './pages/cart.page';
import type { CheckoutStepOnePage } from './pages/checkout-step-one.page';
import type { CheckoutStepTwoPage } from './pages/checkout-step-two.page';

const { products, messages, totals, validCheckoutInfo } = testData;

/** Logs in, adds the given products, completes valid Checkout Information, and clicks Finish on Overview. */
async function completeOrder(
  loginAsStandardUser: () => Promise<void>,
  inventoryPage: InventoryPage,
  cartPage: CartPage,
  checkoutStepOnePage: CheckoutStepOnePage,
  checkoutStepTwoPage: CheckoutStepTwoPage,
  slugs: string[],
): Promise<void> {
  await loginAsStandardUser();
  await inventoryPage.addMultipleToCart(slugs);
  await inventoryPage.header.openCart();
  await cartPage.checkout();
  await checkoutStepOnePage.fillAndContinue(validCheckoutInfo);
  await checkoutStepTwoPage.finish();
}

test.describe('Order Completion (AC4)', () => {
  // TC-CHECKOUT-COMPLETE-001: Clicking Finish redirects to the Order Confirmation page with a success message and Back Home button
  test('TC-CHECKOUT-COMPLETE-001 Clicking Finish redirects to the Order Confirmation page with a success message', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. From the Overview page, click "Finish"
    await completeOrder(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, [
      products.backpack.slug,
    ]);

    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.pageTitle).toHaveText('Checkout: Complete!');
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.completeHeader);
    await expect(checkoutCompletePage.completeText).toHaveText(messages.completeText);
    await expect(checkoutCompletePage.backHomeButton).toBeVisible();
    await expect(checkoutCompletePage.backHomeButton).toBeEnabled();
  });

  // TC-CHECKOUT-COMPLETE-002: Cart is cleared after order completion (Business Rule 4)
  test('TC-CHECKOUT-COMPLETE-002 Cart is cleared after order completion', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. After Finish, inspect the header cart icon on /checkout-complete.html
    await completeOrder(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, [
      products.backpack.slug,
    ]);
    await expect(checkoutCompletePage.header.cartBadge).toHaveCount(0);

    // 2. Navigate directly to /cart.html
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  // TC-CHECKOUT-COMPLETE-003: "Back Home" button navigates to the Products page and reflects an empty cart
  test('TC-CHECKOUT-COMPLETE-003 "Back Home" button navigates to the Products page and reflects an empty cart', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. On the Complete page, click "Back Home"
    await completeOrder(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, [
      products.backpack.slug,
    ]);
    await checkoutCompletePage.backHome();

    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.addToCartButton(products.backpack.slug)).toHaveText('Add to cart');
    await expect(inventoryPage.page.locator('button[data-test^="remove-"]')).toHaveCount(0);
  });

  // TC-CHECKOUT-COMPLETE-004: Browser Back button from the Complete page shows the Overview with $0 totals (cart already cleared)
  test('TC-CHECKOUT-COMPLETE-004 Browser Back button from the Complete page shows the Overview with $0 totals', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutCompletePage,
  }) => {
    // 1. Complete an order (Finish clicked, on /checkout-complete.html), then click the browser Back button
    await completeOrder(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, [
      products.backpack.slug,
    ]);
    await checkoutCompletePage.page.goBack();

    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.empty.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.empty.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.empty.total);
  });

  // TC-CHECKOUT-COMPLETE-005: Direct URL navigation to checkout-complete.html without completing prior steps (negative/workflow-integrity edge case)
  test('TC-CHECKOUT-COMPLETE-005 Direct URL navigation to checkout-complete.html without completing prior steps', async ({
    loginAsStandardUser,
    checkoutCompletePage,
  }) => {
    // 1. While logged in, without visiting checkout-step-one/two first, navigate directly to checkout-complete.html
    await loginAsStandardUser();
    await checkoutCompletePage.open();

    // Per current app behavior: the page loads successfully with no server-side check that prior
    // steps were completed — flagged as a workflow-integrity gap for product-owner confirmation.
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toHaveText(messages.completeHeader);
  });
});
