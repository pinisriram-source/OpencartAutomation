// spec: specs/saucedemo-checkout-test-plan.md (section 6. Navigation Flow: Cancel and Browser Back Button)
// seed: tests/seed.spec.ts

import { test, expect } from './fixtures/saucedemo.fixture';
import products from './test-data/products.json';
import customer from './test-data/customer.json';

test.describe('Navigation Flow: Cancel and Browser Back Button', () => {
  test('TC-CHECKOUT-NAV-001 - Cancel on Checkout Step One returns to the Cart page', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Click the 'Cancel' button (without entering any data).
    await checkoutStepOnePage.cancel();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.itemNameLink(products.backpack.name)).toBeVisible();
  });

  test('TC-CHECKOUT-NAV-002 - Cancel on Checkout Overview returns to the Products page (not the Cart)', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: add an item to cart, complete Step One with valid data, reach /checkout-step-two.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(1);

    // 1. Click the 'Cancel' button.
    // Confirmed asymmetry vs. Step One: Cancel here lands on /inventory.html, NOT /cart.html.
    await checkoutStepTwoPage.cancel();
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/inventory\.html$/);

    // 2. Navigate to /cart.html to check cart state.
    await cartPage.goto();
    await expect(cartPage.itemNameLink(products.backpack.name)).toBeVisible();
  });

  test('TC-CHECKOUT-NAV-003 - Browser Back button from Step Two returns to Step One with cleared form fields', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage }) => {
    // Preconditions: add an item to cart, fill valid info on Step One, click Continue to reach Overview.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);

    // 1. Click the browser's Back button.
    await checkoutStepTwoPage.page.goBack();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    // The SPA does not persist form state in browser history, so all three fields are empty again.
    await expect(checkoutStepOnePage.firstNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.lastNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.postalCodeInput).toBeEmpty();
  });

  test('TC-CHECKOUT-NAV-004 - Browser Back button after order completion shows a stale, zeroed-out Overview page', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: add one item to cart, complete the full checkout flow through Finish.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);

    // 1. Click the browser's Back button.
    await checkoutCompletePage.page.goBack();
    await expect(checkoutStepTwoPage.page).toHaveURL(/\/checkout-step-two\.html$/);
    // Stale view: the cart was already cleared by the completed order.
    await expect(checkoutStepTwoPage.cartItems).toHaveCount(0);
    await expect(checkoutStepTwoPage.subtotalLabel).toHaveText('Item total: $0');
    await expect(checkoutStepTwoPage.taxLabel).toHaveText('Tax: $0.00');
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $0.00');
  });

  test('TC-CHECKOUT-NAV-005-DuplicateFinish - Clicking Finish again on the stale post-completion Overview page does not block a second confirmation', async ({ loggedInPage, cartPage, checkoutStepOnePage, checkoutStepTwoPage, checkoutCompletePage }) => {
    // Preconditions: reach the stale /checkout-step-two.html with $0 totals after using Back post-order.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.fillInfo(customer.valid.firstName, customer.valid.lastName, customer.valid.postalCode);
    await checkoutStepOnePage.continueToOverview();
    await checkoutStepTwoPage.finish();
    await checkoutCompletePage.page.goBack();
    await expect(checkoutStepTwoPage.totalLabel).toHaveText('Total: $0.00');

    // 1. Click 'Finish' again.
    // Documents a potential duplicate-submission edge case: the app allows re-finishing a stale/empty
    // checkout and shows the same confirmation again, with no server-side guard against resubmission.
    await checkoutStepTwoPage.finish();
    await expect(checkoutCompletePage.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutCompletePage.completeHeader).toBeVisible();
  });

  test('TC-CHECKOUT-NAV-006 - Browser Back button from Step One (after Cancel) does not resurrect a cleared cart state incorrectly', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add an item to cart, navigate to Step One, click Cancel to land on /cart.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutStepOnePage.cancel();
    await expect(cartPage.page).toHaveURL(/\/cart\.html$/);
    const badgeCountBefore = await loggedInPage.cartBadge.textContent();

    // 1. Click the browser's Back button.
    await cartPage.page.goBack();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/checkout-step-one\.html$/);
    await expect(checkoutStepOnePage.firstNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.lastNameInput).toBeEmpty();
    await expect(checkoutStepOnePage.postalCodeInput).toBeEmpty();
    await expect(loggedInPage.cartBadge).toHaveText(badgeCountBefore ?? '1');
  });

  test('TC-CHECKOUT-NAV-007 - Cancel from Step One when cart has multiple items preserves all items', async ({ loggedInPage, cartPage, checkoutStepOnePage }) => {
    // Preconditions: add 3 different items to the cart, click Checkout to reach /checkout-step-one.html.
    await loggedInPage.addProductToCart(products.backpack.id);
    await loggedInPage.addProductToCart(products.bikeLight.id);
    await loggedInPage.addProductToCart(products.boltTShirt.id);
    await expect(loggedInPage.cartBadge).toHaveText('3');
    await loggedInPage.goToCart();
    await cartPage.proceedToCheckout();

    // 1. Click 'Cancel'.
    await checkoutStepOnePage.cancel();
    await expect(checkoutStepOnePage.page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.cartItems).toHaveCount(3);
    await expect(cartPage.itemQty(products.backpack.name)).toHaveText('1');
    await expect(cartPage.itemPrice(products.backpack.name)).toHaveText(`$${products.backpack.price}`);
    await expect(cartPage.itemQty(products.bikeLight.name)).toHaveText('1');
    await expect(cartPage.itemPrice(products.bikeLight.name)).toHaveText(`$${products.bikeLight.price}`);
    await expect(cartPage.itemQty(products.boltTShirt.name)).toHaveText('1');
    await expect(cartPage.itemPrice(products.boltTShirt.name)).toHaveText(`$${products.boltTShirt.price}`);
  });
});
