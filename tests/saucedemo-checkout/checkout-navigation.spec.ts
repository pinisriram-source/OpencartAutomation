// spec: specs/saucedemo-checkout-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import testData from './test-data/checkout-data.json';

const { credentials, products, customers, totals, messages } = testData;
const backpack = products.backpack;
const bikeLight = products.bikeLight;

test.describe('6. Navigation Flow / Cross-Cutting', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(credentials.standardUser.username, credentials.standardUser.password);
  });

  test('TC-NAV-001-HappyPathE2E: Full end-to-end checkout smoke path', async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Login as standard_user/secret_sauce (performed in beforeEach)
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Add 'Sauce Labs Backpack' to cart and open the Cart page
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);

    // 3. Click Checkout, fill First Name/Last Name/Zip with valid data, click Continue
    await cartPage.checkout();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(checkoutStepTwoPage.paymentInfoValue).not.toBeEmpty();
    await expect(checkoutStepTwoPage.shippingInfoValue).not.toBeEmpty();
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);

    // 4. Click Finish
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');

    // 5. Click 'Back Home'
    await checkoutCompletePage.backHome();
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.cartBadge).toHaveCount(0);
    await expect(inventoryPage.addToCartButton(backpack.name)).toHaveText('Add to cart');
  });

  test('TC-NAV-002-CancelFromInfoToCart: Cancel on Checkout Information returns to Cart with items intact', async ({ inventoryPage, cartPage, checkoutStepOnePage }) => {
    // 1. Add 2 items to cart, proceed to Checkout Information, click Cancel
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.clickCancel();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(cartPage.lineItem(bikeLight.name)).toHaveCount(1);
  });

  test('TC-NAV-003-CancelFromOverviewToProducts: Cancel on Overview returns to Products page, cart intact', async ({ inventoryPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Add items to cart, complete Checkout Information, reach Overview, click Cancel
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.cancel();
    // Redirected to /inventory.html (Products), not /cart.html - the actual redirect target for
    // business rule 5 at this step.
    await expect(inventoryPage.page).toHaveURL(/inventory\.html/);

    // 2. Open the Cart page afterward
    await inventoryPage.openCart();
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
  });

  test('TC-NAV-004-BrowserBackAfterCompletion: Browser Back after order completion shows a stale, empty Overview page', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Complete a full checkout to reach the Order Confirmation page
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);

    // 2. Press the browser Back button
    await page.goBack();
    // Actual behavior: browser navigates to /checkout-step-two.html again, but it now shows an
    // empty item list with zeroed totals (since the cart was already cleared), while the Finish
    // button remains active.
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.empty.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.empty.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.empty.total);
    await expect(checkoutStepTwoPage.finishButton).toBeEnabled();
  });

  test('TC-NAV-005-ReFinishStaleOverview: Clicking Finish again from the stale post-completion Overview page still submits', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Reach the stale, empty Overview page via Back after a completed order (see TC-NAV-004).
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await checkoutStepTwoPage.finish();
    await page.goBack();
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);

    // 1. From the stale, empty Overview page, click 'Finish' again
    await checkoutStepTwoPage.finish();
    // Actual behavior: the app navigates to /checkout-complete.html and shows the thank-you
    // message again, despite the cart/order being empty - the app does not guard against
    // re-submitting a stale/completed order.
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('TC-NAV-006-BrowserBackFromCheckoutInfo: Browser Back from Checkout Information returns to Cart page', async ({ page, inventoryPage, cartPage, checkoutStepOnePage }) => {
    // 1. Add an item to cart, navigate Cart -> Checkout Information, then press the browser Back button
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await expect(checkoutStepOnePage.page).toHaveURL(/checkout-step-one\.html/);

    await page.goBack();
    await expect(cartPage.page).toHaveURL(/cart\.html/);
    await expect(cartPage.lineItem(backpack.name)).toHaveCount(1);
  });

  test('TC-NAV-007-DirectSkipToOverview: User can skip the mandatory Checkout Information step via direct URL', async ({ inventoryPage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // 1. Login, add an item to cart, and navigate directly to /checkout-step-two.html (skipping /checkout-step-one.html entirely)
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepTwoPage.open();
    // Actual behavior: the Overview page renders fully with correct item/price/tax/total data.
    await expect(checkoutStepTwoPage.title).toHaveText('Checkout: Overview');
    await expect(checkoutStepTwoPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);

    // Clicking Finish successfully completes the order - confirming First Name/Last Name/Zip
    // entry can be bypassed altogether, a gap vs business rule 1.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('TC-NAV-008-LogoutMidCheckout: Logging out mid-checkout redirects to Login and blocks further checkout access', async ({ page, inventoryPage, checkoutStepOnePage, loginPage }) => {
    // 1. Login, add an item to cart, reach the Checkout Information page, then open the side menu and click 'Logout'
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await inventoryPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // 2. Attempt to navigate back to /checkout-step-one.html directly
    await page.goto('https://www.saucedemo.com/checkout-step-one.html');
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorBanner).toHaveText(messages.loginRequiredForCheckoutStepOne);
  });

  test('TC-NAV-009-RefreshOverviewPage: Refreshing the Overview page (before completion) preserves order summary data', async ({ page, inventoryPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // 1. Add an item to cart, complete Checkout Information, reach the Overview page, then refresh the browser
    await inventoryPage.addToCart(backpack.name);
    await checkoutStepOnePage.open();
    await checkoutStepOnePage.submitInformation(customers.johnDoe);
    await expect(checkoutStepTwoPage.page).toHaveURL(/checkout-step-two\.html/);

    await page.reload();
    await expect(checkoutStepTwoPage.lineItem(backpack.name)).toHaveCount(1);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText(totals.singleBackpack.itemTotal);
    await expect(checkoutStepTwoPage.taxLabel).toHaveText(totals.singleBackpack.tax);
    await expect(checkoutStepTwoPage.totalLabel).toHaveText(totals.singleBackpack.total);
  });

  test('TC-NAV-010-ResetAppState: \'Reset App State\' menu option clears the cart', async ({ inventoryPage, cartPage }) => {
    // 1. Login and add 2 items to cart, then open the side menu and click 'Reset App State'
    await inventoryPage.addToCart(backpack.name);
    await inventoryPage.addToCart(bikeLight.name);
    await expect(inventoryPage.cartBadge).toHaveText('2');

    await inventoryPage.resetAppState();
    await expect(inventoryPage.cartBadge).toHaveCount(0);

    // 2. Open the Cart page
    await cartPage.open();
    await expect(cartPage.cartItems).toHaveCount(0);
  });
});
