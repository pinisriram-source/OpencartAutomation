// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, totals, paymentInfo, shippingInfo } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;
const fleeceJacket = products.fleeceJacket;
const onesie = products.onesie;

test.describe('3. Order Overview', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-OVERVIEW-001: Overview page lists all cart items with qty, name, description, price', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Login, add 2 items to cart, complete Checkout Information with valid data, arrive at Overview page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    await expect(checkoutStepTwoPage.quantity(backpack.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.name(backpack.name)).toHaveText(backpack.name);
    await expect(checkoutStepTwoPage.description(backpack.name)).not.toBeEmpty();
    await expect(checkoutStepTwoPage.price(backpack.name)).toHaveText(backpack.price);

    await expect(checkoutStepTwoPage.quantity(bikeLight.name)).toHaveText('1');
    await expect(checkoutStepTwoPage.name(bikeLight.name)).toHaveText(bikeLight.name);
    await expect(checkoutStepTwoPage.description(bikeLight.name)).not.toBeEmpty();
    await expect(checkoutStepTwoPage.price(bikeLight.name)).toHaveText(bikeLight.price);
  });

  test('TC-OVERVIEW-002: Payment Information section is displayed', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Reach the Overview page with valid checkout info
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.paymentInfoValue).toHaveText(paymentInfo);
  });

  test('TC-OVERVIEW-003: Shipping Information section is displayed', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Reach the Overview page with valid checkout info
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.shippingInfoValue).toHaveText(shippingInfo);
  });

  test('TC-OVERVIEW-004: Item Total equals the sum of individual item prices', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Add 'Sauce Labs Backpack' ($29.99) and 'Sauce Labs Bike Light' ($9.99) to cart, proceed to Overview
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.backpackAndBikeLight.itemTotal);
  });

  test('TC-OVERVIEW-005: Tax and Total amounts are displayed and Total = Item Total + Tax', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. With Item total of $39.98 on the Overview page, read the Tax and Total lines
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.backpackAndBikeLight.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toBeVisible();
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.backpackAndBikeLight.tax);
    await expect(checkoutStepTwoPage.totalLabel).toBeVisible();
    // Total value equals Item total + Tax value ($39.98 + $3.20 = $43.18).
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.backpackAndBikeLight.total);
  });

  test('TC-OVERVIEW-006: Cancel and Finish buttons are both present and enabled', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Reach the Overview page
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.cancelButton).toBeVisible();
    await expect(checkoutStepTwoPage.cancelButton).toBeEnabled();
    await expect(checkoutStepTwoPage.finishButton).toBeVisible();
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
  });

  test('TC-OVERVIEW-007: Cancel button on Overview redirects to Products page (actual behavior)', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. From the Overview page (with items in cart), click 'Cancel'
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.cancel();
    // Actual behavior: redirected to /inventory.html (Products page), NOT back to /cart.html - a
    // discrepancy vs the literal wording of business rule 5; cart contents remain intact.
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('TC-OVERVIEW-008: Finish button navigates to the Order Confirmation page', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. From the Overview page, click 'Finish'
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.title).toHaveText('Checkout: Complete!');
  });

  test('TC-OVERVIEW-009-MultipleItems: Totals recalculate correctly with 3+ differently priced items', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Add 'Sauce Labs Backpack' ($29.99), 'Sauce Labs Fleece Jacket' ($49.99), and 'Sauce Labs Onesie' ($7.99) to cart, proceed to Overview
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(fleeceJacket.name);
    await inventoryPage.addToCart(onesie.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.threeItems.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.threeItems.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.threeItems.total);
  });

  test('TC-OVERVIEW-010-SingleItem: Totals are correct with exactly one item in cart', async ({ inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Add only 'Sauce Labs Onesie' ($7.99) to cart, proceed to Overview
    await inventoryPage.addToCart(onesie.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);

    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.onesieOnly.itemTotal);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.onesieOnly.total);
  });

  test('TC-OVERVIEW-011-SkipInformationPage: Overview page is directly reachable, bypassing Checkout Information entirely', async ({ inventoryPage, checkoutStepTwoPage }) => {
    // 1. Login, add an item to cart, then navigate directly to /checkout-step-two.html without ever visiting /checkout-step-one.html
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepTwoPage.open();
    // Actual behavior: the full Order Overview page renders normally with item list,
    // payment/shipping info, and correct totals - First Name/Last Name/Zip were never required, a
    // gap vs AC2/business rule 1 ('all checkout form fields are mandatory').
    await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutStepTwoPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(checkoutStepTwoPage.paymentInfoValue).toHaveText(paymentInfo);
    await expect(checkoutStepTwoPage.shippingInfoValue).toHaveText(shippingInfo);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.singleBackpack.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.singleBackpack.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);
  });
});
