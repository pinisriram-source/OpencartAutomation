// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, totals, paymentInfo, shippingInfo } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('AC3 - Order Overview', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-CHECKOUT-OVERVIEW-001 overview page shows correct item summary for a single-item cart', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();

    // 1. Complete checkout information with the given test data and click 'Continue'
    await checkoutStepOnePage.submitInformation(customers.aliceWonder);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');

    // 2. Verify the item summary table
    await expect(checkoutStepTwoPage.quantity(backpack.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.name(backpack.name)).toHaveText(backpack.name);
    await expect(checkoutStepTwoPage.description(backpack.name)).not.toBeEmpty();
    await expect(checkoutStepTwoPage.price(backpack.name)).toHaveText(backpack.price);

    // 3. Verify Payment and Shipping Information blocks
    await expect(checkoutStepTwoPage.paymentInfoValue).toHaveText(paymentInfo);
    await expect(checkoutStepTwoPage.shippingInfoValue).toHaveText(shippingInfo);

    // 4. Verify Price Total block
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.singleBackpack.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.singleBackpack.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);

    // 5. Verify page actions
    await expect(checkoutStepTwoPage.cancelButton).toBeEnabled();
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
  });

  test('TC-CHECKOUT-OVERVIEW-002 overview page totals recalculate correctly for a multi-item cart', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    // 1. Reach /checkout-step-two.html with both items in cart
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(2);
    await expect(checkoutStepTwoPage.quantity(backpack.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.price(backpack.name)).toHaveText(backpack.price);
    await expect(checkoutStepTwoPage.quantity(bikeLight.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.price(bikeLight.name)).toHaveText(bikeLight.price);

    // 2. Verify Price Total block
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.backpackAndBikeLight.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.backpackAndBikeLight.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.backpackAndBikeLight.total);
  });

  test('TC-CHECKOUT-OVERVIEW-003 cancel on Overview page returns to Products page (not Cart)', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    // 1. Click 'Cancel' on the Overview page
    // Note: this differs from Step One's Cancel, which returns to /cart.html.
    await checkoutStepTwoPage.cancel();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html$/);

    // 2. Verify cart state is unaffected by cancelling
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC-CHECKOUT-OVERVIEW-004-EmptyCart overview page with an empty cart shows zeroed totals and an empty item table', async ({ checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. With an empty cart, submit valid info on /checkout-step-one.html and click 'Continue'
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.janeSmith);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    // 2. Verify item table and totals
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.empty.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.empty.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.empty.total);
    // 'Finish' button remains enabled - record as a defect/flag if SCRUM-101 requires blocking
    // order completion for an empty cart.
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
  });
});
