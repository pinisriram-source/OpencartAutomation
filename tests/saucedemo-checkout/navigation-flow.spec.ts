// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, testData } from './fixtures/saucedemo.fixture';

const { products, totals, validCheckoutInfo, navigationCheckoutInfo } = testData;

test.describe('Navigation Flow & Cancel Behavior', () => {
  // TC-NAV-001: Repeated Cancel-then-reenter cycles at Checkout Information never retain previously entered field values
  test('TC-NAV-001 Repeated Cancel-then-reenter cycles at Checkout Information never retain previously entered field values', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await loginAsStandardUser();
    await inventoryPage.addMultipleToCart([products.backpack.slug, products.bikeLight.slug]);
    await inventoryPage.header.openCart();

    // 1. From Cart (2 items) click Checkout, enter First Name = "Temp", then click Cancel
    await cartPage.checkout();
    await checkoutStepOnePage.fill({ firstName: 'Temp' });
    await checkoutStepOnePage.cancel();
    await expect(cartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.cartItems).toHaveCount(2);

    // 2. Click Checkout again to re-open /checkout-step-one.html
    await cartPage.checkout();
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });

  // TC-NAV-002: Cancel at Checkout Overview returns to Products page and leaves cart contents unchanged
  test('TC-NAV-002 Cancel at Checkout Overview returns to Products page and leaves cart contents unchanged', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await loginAsStandardUser();
    await inventoryPage.addMultipleToCart([products.backpack.slug, products.bikeLight.slug]);
    await inventoryPage.header.openCart();

    // 1. From Cart (2 items) -> Checkout -> fill valid info -> Continue -> arrive at Overview -> click Cancel
    await cartPage.checkout();
    await checkoutStepOnePage.fillAndContinue(validCheckoutInfo);
    await checkoutStepTwoPage.cancel();
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);

    // 2. Navigate to /cart.html
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(2);
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(products.backpack.price);
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(products.bikeLight.price);
  });

  // TC-NAV-003: Browser Back from Overview to Checkout Information clears previously entered field values
  test('TC-NAV-003 Browser Back from Overview to Checkout Information clears previously entered field values', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.header.openCart();
    await cartPage.checkout();

    // 1. Fill valid checkout info and click Continue to reach the Overview page
    await checkoutStepOnePage.fillAndContinue(navigationCheckoutInfo.backNavCheck);
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    // 2. Click the browser Back button
    await checkoutStepTwoPage.page.goBack();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.firstNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.lastNameInput).toHaveValue('');
    await expect(checkoutStepOnePage.postalCodeInput).toHaveValue('');
  });

  // TC-NAV-004: Browser Back from Checkout Information returns to the Cart page
  test('TC-NAV-004 Browser Back from Checkout Information returns to the Cart page', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);
    await inventoryPage.header.openCart();

    // 1. From Cart, click Checkout to reach /checkout-step-one.html, then click the browser Back button
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await checkoutStepOnePage.page.goBack();

    await expect(cartPage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.itemRow(products.backpack.name)).toBeVisible();
  });

  // TC-NAV-005: Repeated Continue -> Cancel -> Continue cycles do not duplicate cart items or corrupt totals
  test('TC-NAV-005 Repeated Continue -> Cancel -> Continue cycles do not duplicate cart items or corrupt totals', async ({
    loginAsStandardUser,
    inventoryPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
  }) => {
    await loginAsStandardUser();
    await inventoryPage.addToCart(products.backpack.slug);

    // 1. Cart(1 item) -> Checkout -> fill valid info -> Continue -> Overview -> Cancel (back to Products)
    //    -> open Cart -> Checkout again -> fill valid info -> Continue -> arrive at Overview
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutStepOnePage.fillAndContinue(validCheckoutInfo);
    await checkoutStepTwoPage.cancel();
    await expect(inventoryPage.page).toHaveURL(/\/inventory\.html$/);

    await cartPage.open();
    await cartPage.checkout();
    await checkoutStepOnePage.fillAndContinue(validCheckoutInfo);

    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(1);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.singleBackpack.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.singleBackpack.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);
  });
});
