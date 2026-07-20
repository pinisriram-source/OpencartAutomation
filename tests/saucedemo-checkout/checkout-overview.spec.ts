// spec: specs/saucedemo-checkout-test-plan.md (Suite 3: Order Overview)
// seed: tests/seed.spec.ts
import { test, expect, loginAsStandardUser } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import checkoutInfo from './test-data/checkout-info.json';
import messages from './test-data/messages.json';
import totals from './test-data/totals.json';

test.describe('Order Overview', () => {
  test('TC-CHECKOUT-OVERVIEW-001 Item summary matches cart contents exactly', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in, add Backpack and Bike Light, proceed to Checkout with valid info.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug]);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Verify the page heading and item rows.
    await expect(checkoutOverviewPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutOverviewPage.cartItems).toHaveCount(2);

    const backpackRow = checkoutOverviewPage.itemRow(products.backpack.name);
    await expect(checkoutOverviewPage.quantity(backpackRow)).toHaveText('1');
    await expect(checkoutOverviewPage.name(backpackRow)).toHaveText(products.backpack.name);
    await expect(checkoutOverviewPage.description(backpackRow)).not.toBeEmpty();
    await expect(checkoutOverviewPage.price(backpackRow)).toHaveText(`$${products.backpack.price}`);

    const bikeLightRow = checkoutOverviewPage.itemRow(products.bikeLight.name);
    await expect(checkoutOverviewPage.quantity(bikeLightRow)).toHaveText('1');
    await expect(checkoutOverviewPage.name(bikeLightRow)).toHaveText(products.bikeLight.name);
    await expect(checkoutOverviewPage.description(bikeLightRow)).not.toBeEmpty();
    await expect(checkoutOverviewPage.price(bikeLightRow)).toHaveText(`$${products.bikeLight.price}`);
  });

  test('TC-CHECKOUT-OVERVIEW-002 Payment and Shipping Information sections are shown with correct static values', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: reach /checkout-step-two.html with at least one item in cart.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);

    // 2. Locate the Payment Information section.
    await expect(checkoutOverviewPage.paymentInfoLabel).toHaveText(messages.paymentInfoLabel);
    await expect(checkoutOverviewPage.paymentInfoValue).toHaveText(messages.paymentInfoValue);

    // 3. Locate the Shipping Information section.
    await expect(checkoutOverviewPage.shippingInfoLabel).toHaveText(messages.shippingInfoLabel);
    await expect(checkoutOverviewPage.shippingInfoValue).toHaveText(messages.shippingInfoValue);
  });

  test('TC-CHECKOUT-OVERVIEW-003 Price Total block computes correctly for a single item', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: add only 'Sauce Labs Backpack', proceed through checkout info with valid data.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(1);

    // 2. Read the 'Item total', 'Tax', and 'Total' values.
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.singleItem.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.singleItem.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.singleItem.total}`);
  });

  test('TC-CHECKOUT-OVERVIEW-004 Price Total block computes correctly for two items', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: add Backpack and Bike Light, proceed through checkout info with valid data.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductsToCart([products.backpack.slug, products.bikeLight.slug]);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(2);

    // 2. Read the 'Item total', 'Tax', and 'Total' values.
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.twoItems.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.twoItems.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.twoItems.total}`);
  });

  test('TC-CHECKOUT-OVERVIEW-005 Overview page presents Cancel and Finish options', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: reach /checkout-step-two.html with at least one item in cart.
    await loginAsStandardUser(loginPage);
    await inventoryPage.addProductToCart(products.backpack.slug);
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);

    // 2. Verify action buttons.
    await expect(checkoutOverviewPage.cancelButton).toBeVisible();
    await expect(checkoutOverviewPage.cancelButton).toBeEnabled();
    await expect(checkoutOverviewPage.finishButton).toBeVisible();
    await expect(checkoutOverviewPage.finishButton).toBeEnabled();
  });

  test('TC-CHECKOUT-OVERVIEW-006-AllProducts Overview correctly totals the maximum available product set (6 items)', async ({
    loginPage,
    inventoryPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    // 1. Preconditions: log in as standard_user with an empty cart.
    await loginAsStandardUser(loginPage);
    await expect(inventoryPage.cartBadge).toHaveCount(0);

    // 2. Add all 6 available products.
    await inventoryPage.addProductsToCart(Object.values(products).map((p) => p.slug));
    await expect(inventoryPage.cartBadge).toHaveText('6');

    // 3. Proceed to Checkout, enter valid data, click Continue to reach the Overview page.
    await inventoryPage.goToCart();
    await checkoutInformationPage.open();
    await checkoutInformationPage.submitInformation(checkoutInfo.valid);
    await expect(checkoutOverviewPage.cartItems).toHaveCount(6);
    for (const product of Object.values(products)) {
      const row = checkoutOverviewPage.itemRow(product.name);
      await expect(checkoutOverviewPage.quantity(row)).toHaveText('1');
      await expect(checkoutOverviewPage.price(row)).toHaveText(`$${product.price}`);
    }

    // 4. Verify totals.
    await expect(checkoutOverviewPage.subtotalLabel).toHaveText(`Item total: ${totals.sixItems.itemTotal}`);
    await expect(checkoutOverviewPage.taxLabel).toHaveText(`Tax: ${totals.sixItems.tax}`);
    await expect(checkoutOverviewPage.totalLabel).toHaveText(`Total: ${totals.sixItems.total}`);
  });
});
