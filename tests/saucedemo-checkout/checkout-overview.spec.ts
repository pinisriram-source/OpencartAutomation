// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/checkout/seed.spec.ts

import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';

test.describe('Order Overview (AC3)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginAsStandardUser(loginPage);
  });

  test('TC-CHECKOUT-019 Overview page shows correct item summary for a single item', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. With Sauce Labs Backpack in the cart, complete checkout info and click Continue
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Inspect the item row in the Overview list
    const row = checkoutStepTwoPage.itemByName(products.sauceLabsBackpack.name);
    await expect(row.locator('[data-test="item-quantity"]')).toHaveText('1');
    await expect(row.locator('[data-test="inventory-item-name"]')).toHaveText(products.sauceLabsBackpack.name);
    await expect(row.locator('[data-test="inventory-item-desc"]')).not.toBeEmpty();
    await expect(row.locator('[data-test="inventory-item-price"]')).toHaveText(`$${products.sauceLabsBackpack.price}`);
  });

  test('TC-CHECKOUT-020 Overview page shows correct item summary for multiple items', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Add both items to the cart, proceed to checkout, submit valid info
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.addToCart(products.sauceLabsBikeLight.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Inspect both item rows in the Overview list, in the same order as the cart
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(2);
    const names = await checkoutStepTwoPage.cartItems.locator('[data-test="inventory-item-name"]').allTextContents();
    expect(names).toEqual([products.sauceLabsBackpack.name, products.sauceLabsBikeLight.name]);

    await expect(
      checkoutStepTwoPage.itemByName(products.sauceLabsBackpack.name).locator('[data-test="inventory-item-price"]'),
    ).toHaveText(`$${products.sauceLabsBackpack.price}`);
    await expect(
      checkoutStepTwoPage.itemByName(products.sauceLabsBikeLight.name).locator('[data-test="inventory-item-price"]'),
    ).toHaveText(`$${products.sauceLabsBikeLight.price}`);
  });

  test('TC-CHECKOUT-021 Overview page displays static Payment Information and Shipping Information', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    // 1. Locate the 'Payment Information:' section
    await expect(checkoutStepTwoPage.paymentInfoValue).toHaveText('SauceCard #31337');

    // 2. Locate the 'Shipping Information:' section
    await expect(checkoutStepTwoPage.shippingInfoValue).toHaveText('Free Pony Express Delivery!');
  });

  test('TC-CHECKOUT-022 Item total, Tax and Total calculate correctly for a single item', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Add only Sauce Labs Backpack to cart, complete checkout info, reach Overview
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    // 2. Verify 'Item total'
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $29.99');
    // 3. Verify 'Tax' (8% of $29.99 = $2.3992, rounded to 2 decimals)
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $2.40');
    // 4. Verify 'Total' (Item total + Tax)
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $32.39');
  });

  test('TC-CHECKOUT-023 Item total, Tax and Total calculate correctly for multiple items', async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    // 1. Add both items to cart, complete checkout info, reach Overview
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.addToCart(products.sauceLabsBikeLight.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    await expect(checkoutStepTwoPage.cartItems).toHaveCount(2);

    // 2. Verify 'Item total'
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $39.98');
    // 3. Verify 'Tax' (8% of $39.98 = $3.1984, rounded to 2 decimals)
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $3.20');
    // 4. Verify 'Total'
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $43.18');
  });

  test("TC-CHECKOUT-024 'Cancel' on the Overview page navigates to the Products page, not the Cart (documented Business Rule 5 deviation)", async ({
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);
    await inventoryPage.header.goToCart();
    await cartPage.checkoutButton.click();
    await checkoutStepOnePage.submit(checkoutInfo.valid);

    // 1. Click 'Cancel' on the Overview page
    await checkoutStepTwoPage.cancel();

    // ACTUAL BEHAVIOR (documented Business Rule 5 deviation): redirected to /inventory.html (Products page),
    // NOT to /cart.html, unlike Cancel on the Information step.
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
  });

  test('TC-CHECKOUT-025-SkipStepOne direct navigation to /checkout-step-two.html without completing the Information step still renders the Overview (edge case)', async ({
    page,
    inventoryPage,
    checkoutStepTwoPage,
  }) => {
    await inventoryPage.addToCart(products.sauceLabsBackpack.slug);

    // 1. While logged in with items in cart, navigate directly to /checkout-step-two.html
    await page.goto(checkoutStepTwoPage.url);

    // ACTUAL BEHAVIOR: the Overview page loads successfully with the cart's items/totals and an enabled
    // Finish button -- there is no server-side guard forcing the Information step first.
    await expect(checkoutStepTwoPage.pageTitle).toHaveText('Checkout: Overview');
    await expect(checkoutStepTwoPage.itemByName(products.sauceLabsBackpack.name)).toHaveCount(1);
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
  });
});
