// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';
import type { InventoryPage } from './pages/inventory.page';
import type { CartPage } from './pages/cart.page';
import type { CheckoutStepOnePage } from './pages/checkout-step-one.page';

const { products, messages, totals, validCheckoutInfo } = testData;
const allProductSlugs = Object.values(products).map((p) => p.slug);

/** Logs in, adds the given products, completes Checkout Information with valid data, and lands on Overview. */
async function goToOverview(
  loginAsStandardUser: () => Promise<void>,
  inventoryPage: InventoryPage,
  cartPage: CartPage,
  checkoutStepOnePage: CheckoutStepOnePage,
  slugs: string[],
): Promise<void> {
  await loginAsStandardUser();
  await inventoryPage.addMultipleToCart(slugs);
  await inventoryPage.header.openCart();
  await cartPage.checkout();
  await checkoutStepOnePage.fillAndContinue(validCheckoutInfo);
}

test.describe('Checkout Overview (AC3)', () => {
  // TC-CHECKOUT-OVERVIEW-001: Overview lists correct item summary for a single-item cart
  test('TC-CHECKOUT-OVERVIEW-001 Overview lists correct item summary for a single-item cart', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Complete Cart -> Checkout Information (valid data) -> arrive at /checkout-step-two.html
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [products.backpack.slug]);

    await expect(checkoutStepTwoPage.itemQuantity(products.backpack.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.itemNameLink(products.backpack.name)).toBeVisible();
    await expect(checkoutStepTwoPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(checkoutStepTwoPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
  });

  // TC-CHECKOUT-OVERVIEW-002: Overview lists correct item summary for a multi-item cart
  test('TC-CHECKOUT-OVERVIEW-002 Overview lists correct item summary for a multi-item cart', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Add both items, complete Checkout Information, arrive at Overview
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [
      products.backpack.slug,
      products.bikeLight.slug,
    ]);

    await expect(checkoutStepTwoPage.cartItems).toHaveCount(2);
    await expect(checkoutStepTwoPage.itemQuantity(products.backpack.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.itemDescription(products.backpack.name)).toHaveText(products.backpack.description);
    await expect(checkoutStepTwoPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(checkoutStepTwoPage.itemQuantity(products.bikeLight.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.itemDescription(products.bikeLight.name)).toHaveText(products.bikeLight.description);
    await expect(checkoutStepTwoPage.itemPrice(products.bikeLight.name)).toHaveText(products.bikeLight.price);

    // Order of items on Overview matches order shown on Cart page (Backpack was added, then added Bike Light).
    const rowTexts = await checkoutStepTwoPage.cartItems.allTextContents();
    expect(rowTexts[0]).toContain(products.backpack.name);
    expect(rowTexts[1]).toContain(products.bikeLight.name);
  });

  // TC-CHECKOUT-OVERVIEW-003: Payment Information section displays the default payment method
  test('TC-CHECKOUT-OVERVIEW-003 Payment Information section displays the default payment method', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Reach the Overview page with any cart contents
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [products.backpack.slug]);

    await expect(checkoutStepTwoPage.paymentInfoLabel).toHaveText('Payment Information:');
    await expect(checkoutStepTwoPage.paymentInfoValue).toHaveText(messages.paymentInfo);
  });

  // TC-CHECKOUT-OVERVIEW-004: Shipping Information section displays the default shipping method
  test('TC-CHECKOUT-OVERVIEW-004 Shipping Information section displays the default shipping method', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Reach the Overview page with any cart contents
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [products.backpack.slug]);

    await expect(checkoutStepTwoPage.shippingInfoLabel).toHaveText('Shipping Information:');
    await expect(checkoutStepTwoPage.shippingInfoValue).toHaveText(messages.shippingInfo);
  });

  // TC-CHECKOUT-OVERVIEW-005: Price Total block calculates Item total, Tax and Total correctly for a single item
  test('TC-CHECKOUT-OVERVIEW-005 Price Total block calculates Item total, Tax and Total correctly for a single item', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Reach Overview with only Sauce Labs Backpack ($29.99) in the cart
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [products.backpack.slug]);

    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.singleBackpack.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.singleBackpack.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);
  });

  // TC-CHECKOUT-OVERVIEW-006: Price Total block calculates correctly for two items
  test('TC-CHECKOUT-OVERVIEW-006 Price Total block calculates correctly for two items', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Reach Overview with Backpack + Bike Light in the cart
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [
      products.backpack.slug,
      products.bikeLight.slug,
    ]);

    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.twoItems.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.twoItems.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.twoItems.total);
  });

  // TC-CHECKOUT-OVERVIEW-007: Price Total block calculates correctly for all 6 catalog items (boundary/max cart size)
  test('TC-CHECKOUT-OVERVIEW-007 Price Total block calculates correctly for all 6 catalog items', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Add all 6 available products to the cart, complete Checkout Information, reach Overview
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, allProductSlugs);

    await expect(checkoutStepTwoPage.cartItems).toHaveCount(6);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.allSixItems.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.allSixItems.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.allSixItems.total);
  });

  // TC-CHECKOUT-OVERVIEW-008: Cancel button on Overview returns to Products page (not Cart), cart contents unchanged
  test('TC-CHECKOUT-OVERVIEW-008 Cancel button on Overview returns to Products page, cart contents unchanged', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. From the Overview page, click "Cancel"
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [
      products.backpack.slug,
      products.bikeLight.slug,
    ]);
    const badgeBefore = await checkoutStepTwoPage.header.cartBadge.textContent();
    await checkoutStepTwoPage.cancel();

    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.header.cartBadge).toHaveText(badgeBefore ?? '2');

    // 2. Navigate to /cart.html to confirm cart state
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(products.bikeLight.price);
  });

  // TC-CHECKOUT-OVERVIEW-009: Finish and Cancel buttons are both present and enabled on Overview
  test('TC-CHECKOUT-OVERVIEW-009 Finish and Cancel buttons are both present and enabled on Overview', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Reach the Overview page with at least 1 item in the cart
    await goToOverview(loginAsStandardUser, inventoryPage, cartPage, checkoutStepOnePage, [products.backpack.slug]);

    await expect(checkoutStepTwoPage.finishButton).toBeVisible();
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
    await expect(checkoutStepTwoPage.cancelButton).toBeVisible();
    await expect(checkoutStepTwoPage.cancelButton).toBeEnabled();
  });
});
